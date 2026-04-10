import "zalo-bot-js";

declare module "zalo-bot-js" {
  interface CommandContext {
    command: {
      args: string[];
      argsRaw: string;
    };
  }

  interface Message {
    text?: string;
    messageId?: string;
    chat: {
      id: string;
    };
    replyText(text: string): Promise<Message>;
    replyAction(action: string): Promise<boolean>;
  }

  interface Bot {
    on(
      event: string,
      handler: (message: Message) => void | Promise<void>,
    ): void;
    onText(
      pattern: RegExp,
      handler: (
        message: Message,
        match: RegExpMatchArray,
      ) => void | Promise<void>,
    ): void;
    command(
      command: string,
      handler: (
        message: Message,
        context: CommandContext,
      ) => void | Promise<void>,
    ): void;
    sendPhotos(
      chatId: string,
      photos: string[],
      caption?: string,
      replyToMessageId?: string,
    ): Promise<Message[]>;
    startPolling(): Promise<void>;
  }
}

export {};
