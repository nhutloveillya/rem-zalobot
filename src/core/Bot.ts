import { BASE_URL, DEFAULT_POLL_TIMEOUT_SECONDS, DEFAULT_RETRY_DELAY_MS } from "../constants";
import { InvalidToken, TimedOut } from "../errors";
import { t } from "../i18n/runtime";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { type ParsedCommand, Update } from "../models/Update";
import { User } from "../models/User";
import { WebhookInfo } from "../models/WebhookInfo";
import { BaseRequest, type RequestPayload } from "../request/BaseRequest";
import { FetchRequest } from "../request/FetchRequest";
import type { JsonObject, RequestOptions } from "../types";

export interface BotConfig {
  token: string;
  baseUrl?: string;
  request?: BaseRequest;
  pollingRequest?: BaseRequest;
  polling?: boolean | PollingOptions;
  logger?: BotLogger;
  onError?: BotErrorHandler;
}

export interface BotConstructorOptions extends Omit<BotConfig, "token"> {}

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowedUpdates?: string[];
}

export interface EventMetadata {
  match?: RegExpExecArray;
  update: Update;
  command?: ParsedCommand;
}

export interface PollingOptions {
  timeoutSeconds?: number;
  retryDelayMs?: number;
  allowedUpdates?: string[];
  onUpdate?: (update: Update) => Promise<void> | void;
  onError?: BotErrorHandler;
}

export type BotEvent =
  | "message"
  | "text"
  | "photo"
  | "sticker"
  | "command";

export type BotEventCallback = (
  message: Message,
  metadata: EventMetadata,
) => Promise<void> | void;

export interface CommandContext {
  command: ParsedCommand;
  update: Update;
}

export type CommandCallback = (
  message: Message,
  context: CommandContext,
) => Promise<void> | void;

export type PollingState = "idle" | "starting" | "running" | "stopping";

export interface BotErrorContext {
  kind: "request_temporary" | "payload_parse" | "listener_user_code";
  source: "polling" | "event_dispatch" | "text_listener" | "command_listener";
  update?: Update;
  event?: BotEvent;
  command?: ParsedCommand;
}

export type BotErrorHandler = (error: unknown, context: BotErrorContext) => Promise<void> | void;

export interface BotLogger {
  error(message: string, error: unknown, context?: BotErrorContext): void;
}

type EventListener = {
  callback: BotEventCallback;
  once: boolean;
};

type TextListener = {
  pattern: RegExp;
  callback: (message: Message, match: RegExpExecArray) => Promise<void> | void;
  once: boolean;
};

type CommandListener = {
  command: string;
  callback: CommandCallback;
};

export class Bot {
  private readonly baseUrl: string;
  private readonly request: [BaseRequest, BaseRequest];
  private initialized = false;
  private botUser?: User;
  private readonly eventListeners = new Map<BotEvent, EventListener[]>();
  private readonly textListeners: TextListener[] = [];
  private readonly commandListeners: CommandListener[] = [];
  private readonly errorHandlers: BotErrorHandler[] = [];
  private readonly logger: BotLogger;
  private pollingState: PollingState = "idle";
  private pollingTask?: Promise<void>;
  private pollingAbortController?: AbortController;
  private nextUpdateOffset?: number;

  private readonly config: BotConfig;

  constructor(token: string, options?: BotConstructorOptions);
  constructor(config: BotConfig);
  constructor(tokenOrConfig: string | BotConfig, options: BotConstructorOptions = {}) {
    const config =
      typeof tokenOrConfig === "string"
        ? { ...options, token: tokenOrConfig }
        : tokenOrConfig;

    this.config = config;

    if (!config.token) {
      throw new InvalidToken(t("error.invalidTokenInput"));
    }

    const rootUrl = config.baseUrl ?? BASE_URL;
    this.baseUrl = `${rootUrl}/bot${config.token}`;
    this.request = [
      config.pollingRequest ?? new FetchRequest(),
      config.request ?? new FetchRequest(),
    ];
    this.logger = config.logger ?? defaultLogger;
    if (config.onError) {
      this.errorHandlers.push(config.onError);
    }

    if (config.polling) {
      const pollingOptions =
        typeof config.polling === "object" ? config.polling : undefined;
      queueMicrotask(() => {
        void this.startPolling(pollingOptions).catch((error) => {
          this.reportError(error, {
            kind: "request_temporary",
            source: "polling",
          });
        });
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Promise.all(this.request.map((transport) => transport.initialize()));

    try {
      await this.getMe();
    } catch (error) {
      if (error instanceof InvalidToken) {
        throw new InvalidToken(t("error.rejectedToken", { token: this.config.token }));
      }
      throw error;
    }

    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await Promise.all(this.request.map((transport) => transport.shutdown()));
    this.initialized = false;
  }

  async getMe(options?: RequestOptions): Promise<User> {
    const result = await this.post("getMe", {}, options);
    const user = User.fromApi(asJsonObject(result));

    if (!user) {
      throw new InvalidToken(t("error.invalidGetMePayload"));
    }

    this.botUser = user;
    return user;
  }

  async getUpdate(
    params: GetUpdatesParams = {},
    options?: RequestOptions,
  ): Promise<Update | undefined> {
    const updates = await this.getUpdates(params, options);
    return updates[0];
  }

  async getUpdates(
    params: GetUpdatesParams = {},
    options?: RequestOptions,
  ): Promise<Update[]> {
    const result = await this.post(
      "getUpdates",
      {
        timeout: params.timeout,
        offset: params.offset,
        limit: params.limit,
        allowed_updates: params.allowedUpdates?.join(","),
      },
      {
        ...options,
        // Long polling must wait slightly longer than the API timeout parameter.
        readTimeout: (params.timeout ?? 0) + 5,
      },
    );

    const payloads = asJsonObjectArray(result);
    return payloads.map((payload) => Update.fromApi(payload, this)).filter(isDefined);
  }

  async sendMessage(
    chatId: string,
    text: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendMessage", {
      chat_id: chatId,
      text,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendPhoto(
    chatId: string,
    caption: string,
    photo: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendPhoto", {
      chat_id: chatId,
      caption,
      photo,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendSticker(
    chatId: string,
    sticker: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendSticker", {
      chat_id: chatId,
      sticker,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendChatAction(chatId: string, action: string, options?: RequestOptions): Promise<boolean> {
    const result = await this.post(
      "sendChatAction",
      {
        chat_id: chatId,
        action,
      },
      options,
    );

    return Boolean(result);
  }

  async setWebhook(url: string, secretToken: string): Promise<boolean> {
    const result = await this.post("setWebhook", {
      url,
      secret_token: secretToken,
    });

    return Boolean(result);
  }

  async deleteWebhook(): Promise<boolean> {
    const result = await this.post("deleteWebhook");
    return Boolean(result);
  }

  async getWebhookInfo(): Promise<WebhookInfo | undefined> {
    const result = await this.post("getWebhookInfo");
    return WebhookInfo.fromApi(asJsonObject(result));
  }

  on(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push({ callback, once: false });
    this.eventListeners.set(event, listeners);
    return this;
  }

  once(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push({ callback, once: true });
    this.eventListeners.set(event, listeners);
    return this;
  }

  off(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event);
    if (!listeners) {
      return this;
    }

    this.eventListeners.set(
      event,
      listeners.filter((listener) => listener.callback !== callback),
    );
    return this;
  }

  onText(
    pattern: RegExp,
    callback: (message: Message, match: RegExpExecArray) => Promise<void> | void,
  ): this {
    this.textListeners.push({ pattern, callback, once: false });
    return this;
  }

  offText(
    pattern: RegExp,
    callback: (message: Message, match: RegExpExecArray) => Promise<void> | void,
  ): this {
    const patternSource = pattern.toString();
    for (let index = this.textListeners.length - 1; index >= 0; index -= 1) {
      const listener = this.textListeners[index];
      if (listener.pattern.toString() === patternSource && listener.callback === callback) {
        this.textListeners.splice(index, 1);
      }
    }
    return this;
  }

  command(command: string, callback: CommandCallback): this {
    const normalized = normalizeCommand(command);
    if (!normalized) {
      throw new Error("Command name must not be empty");
    }

    this.commandListeners.push({
      command: normalized,
      callback,
    });
    return this;
  }

  onError(callback: BotErrorHandler): this {
    this.errorHandlers.push(callback);
    return this;
  }

  async processUpdate(update: Update | JsonObject): Promise<void> {
    const normalizedUpdate = update instanceof Update ? update : Update.fromApi(update, this);
    if (!normalizedUpdate?.message) {
      if (!(update instanceof Update)) {
        await this.reportError(new Error("Unable to parse incoming update payload"), {
          kind: "payload_parse",
          source: "event_dispatch",
        });
      }
      return;
    }

    if (typeof normalizedUpdate.updateId === "number") {
      this.nextUpdateOffset = normalizedUpdate.updateId + 1;
    }

    const metadata: EventMetadata = {
      update: normalizedUpdate,
      command: normalizedUpdate.command,
    };
    for (const eventType of normalizedUpdate.eventTypes) {
      const listeners = [...(this.eventListeners.get(eventType as BotEvent) ?? [])];
      for (const listener of listeners) {
        try {
          await listener.callback(normalizedUpdate.message, metadata);
        } catch (error) {
          await this.reportError(error, {
            kind: "listener_user_code",
            source: "event_dispatch",
            update: normalizedUpdate,
            event: eventType as BotEvent,
            command: normalizedUpdate.command,
          });
        } finally {
          if (listener.once) {
            this.off(eventType as BotEvent, listener.callback);
          }
        }
      }
    }

    if (normalizedUpdate.message.text) {
      for (const listener of [...this.textListeners]) {
        const match = createRegexMatcher(listener.pattern).exec(normalizedUpdate.message.text);
        if (match) {
          try {
            await listener.callback(normalizedUpdate.message, match);
          } catch (error) {
            await this.reportError(error, {
              kind: "listener_user_code",
              source: "text_listener",
              update: normalizedUpdate,
              command: normalizedUpdate.command,
            });
          } finally {
            if (listener.once) {
              this.offText(listener.pattern, listener.callback);
            }
          }
        }
      }
    }

    if (normalizedUpdate.command) {
      for (const listener of this.commandListeners) {
        if (listener.command !== normalizedUpdate.command.name.toLowerCase()) {
          continue;
        }
        try {
          await listener.callback(normalizedUpdate.message, {
            command: normalizedUpdate.command,
            update: normalizedUpdate,
          });
        } catch (error) {
          await this.reportError(error, {
            kind: "listener_user_code",
            source: "command_listener",
            update: normalizedUpdate,
            command: normalizedUpdate.command,
            event: "command",
          });
        }
      }
    }
  }

  startPolling(options: PollingOptions = {}): Promise<void> {
    if (this.pollingTask) {
      return this.pollingTask;
    }

    this.pollingState = "starting";
    this.pollingAbortController = new AbortController();
    this.pollingTask = this.runPolling(options).finally(() => {
      this.pollingState = "idle";
      this.pollingTask = undefined;
      this.pollingAbortController = undefined;
    });

    return this.pollingTask;
  }

  stopPolling(): void {
    if (this.pollingState === "idle") {
      return;
    }
    this.pollingState = "stopping";
    this.pollingAbortController?.abort();
  }

  isPolling(): boolean {
    return this.pollingState !== "idle";
  }

  getPollingState(): PollingState {
    return this.pollingState;
  }

  async setWebHook(url: string, options?: { secret_token?: string }): Promise<boolean> {
    return this.setWebhook(url, options?.secret_token ?? "");
  }

  async deleteWebHook(): Promise<boolean> {
    return this.deleteWebhook();
  }

  async getWebHookInfo(): Promise<WebhookInfo | undefined> {
    return this.getWebhookInfo();
  }

  get cachedUser(): User | undefined {
    return this.botUser;
  }

  private async reportError(
    error: unknown,
    context: BotErrorContext,
    overrideHandler?: BotErrorHandler,
  ): Promise<void> {
    this.logger.error(t("app.pollingFetchError"), error, context);

    const handlers = [
      ...(overrideHandler ? [overrideHandler] : []),
      ...this.errorHandlers,
    ];
    for (const handler of handlers) {
      try {
        await handler(error, context);
      } catch (handlerError) {
        this.logger.error("Unhandled error from bot onError callback", handlerError, context);
      }
    }
  }

  private async runPolling(options: PollingOptions): Promise<void> {
    const timeoutSeconds = options.timeoutSeconds ?? DEFAULT_POLL_TIMEOUT_SECONDS;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    const errorHandler = options.onError;

    await this.initialize();
    if (this.pollingState === "stopping") {
      return;
    }
    this.pollingState = "running";

    try {
      while (this.pollingState === "running") {
        try {
          const updates = await this.getUpdates({
            timeout: timeoutSeconds,
            offset: this.nextUpdateOffset,
            allowedUpdates: options.allowedUpdates,
          }, {
            signal: this.pollingAbortController?.signal,
          });

          if (updates.length > 0) {
            for (const update of updates) {
              if (options.onUpdate) {
                try {
                  await options.onUpdate(update);
                } catch (error) {
                  await this.reportError(
                    error,
                    {
                      kind: "listener_user_code",
                      source: "polling",
                      update,
                    },
                    errorHandler,
                  );
                }
              }
              await this.processUpdate(update);
              if (this.pollingState !== "running") {
                break;
              }
            }
            continue;
          }
        } catch (error) {
          if (!(error instanceof TimedOut) && this.pollingState === "running") {
            await this.reportError(
              error,
              {
                kind: "request_temporary",
                source: "polling",
              },
              errorHandler,
            );
          }
        }

        if (this.pollingState !== "running") {
          break;
        }
        await sleepWithAbort(retryDelayMs, this.pollingAbortController?.signal);
      }
    } finally {
      await this.shutdown();
    }
  }

  private async sendMessageLike(endpoint: string, data: RequestPayload): Promise<Message> {
    const result = await this.post(endpoint, data);
    const rawResult = asJsonObject(result);
    const message = Message.fromApi(rawResult, this);

    if (!message) {
      return this.buildMessageFallback(data, rawResult);
    }

    return message;
  }

  private buildMessageFallback(data: RequestPayload, result?: JsonObject): Message {
    const chatId = typeof data.chat_id === "string" ? data.chat_id : undefined;
    if (!chatId) {
      throw new Error(t("error.invalidMessageWithoutChatContext"));
    }

    const messageIdValue = result?.message_id;
    const timestampValue = result?.date;

    return new Message({
      bot: this,
      messageId:
        typeof messageIdValue === "string"
          ? messageIdValue
          : typeof messageIdValue === "number"
            ? String(messageIdValue)
            : `local-${Date.now()}`,
      date:
        typeof timestampValue === "number"
          ? new Date(timestampValue)
          : new Date(),
      chat: new Chat(chatId, "direct"),
      messageType: "CHAT_MESSAGE",
      text: typeof data.text === "string" ? data.text : undefined,
      sticker: typeof data.sticker === "string" ? data.sticker : undefined,
      photoUrl: typeof data.photo === "string" ? data.photo : undefined,
      raw: result,
    });
  }

  private async post(
    endpoint: string,
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const request = endpoint === "getUpdates" ? this.request[0] : this.request[1];
    return request.post(`${this.baseUrl}/${endpoint}`, compactPayload(data), options);
  }
}

function compactPayload(data?: RequestPayload): RequestPayload {
  if (!data) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null),
  );
}

function asJsonObject(
  value: JsonObject | JsonObject[] | boolean | undefined,
): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value;
}

function asJsonObjectArray(
  value: JsonObject | JsonObject[] | boolean | undefined,
): JsonObject[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonObject => Boolean(item) && typeof item === "object");
  }

  const singleValue = asJsonObject(value);
  return singleValue ? [singleValue] : [];
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function createRegexMatcher(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

function normalizeCommand(command: string): string {
  const normalized = command.trim().replace(/^\//, "");
  return normalized.toLowerCase();
}

const defaultLogger: BotLogger = {
  error(message: string, error: unknown): void {
    console.error(message, error);
  },
};

async function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    await sleep(ms);
    return;
  }
  if (signal.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
