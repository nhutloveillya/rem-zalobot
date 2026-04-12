import { Bot } from "./utils/zalobotjs";
import { config as loadEnv } from "dotenv";
import { main as danbooruMain } from "./utils/command/danbooru";
import { main as nyaa } from "./utils/command/nyaa";
import { clearAllCache, handleMessage, resetConversation } from "./utils/ai/bot";
import { main as aicommand } from "./utils/command/gemini"

async function main() {
  loadEnv();

  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN");
  }
  //tạo bot
  const bot = new Bot({ token });

  //cách lệnh bổ sung
  danbooruMain(bot);
  nyaa(bot);
  aicommand(bot);


  bot.on("message", async (message) => {
    console.log("Received message:", message.text ?? message.messageId);
  });

  bot.onText(/\/start(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    await bot.sendMessage(
      message.chat.id,
      payload
        ? `Chao ${payload}! Toi la bot Zalo viet bang TypeScript.`
        : "Chao ban!",
    );
    return; // QUAN TRỌNG
  });

  bot.onText(/\@ai(?:\s+(.+))?/, async (message, match) => {
    bot.sendChatAction(message.chat.id,"typing");
    const payload = match[1]?.trim();
    const userid : any = message.fromUser?.id;
    const reply = await handleMessage(userid,payload)
    await bot.sendMessage(
      message.chat.id,
      payload
        ? reply
        : "Xin Chào Chủ Nhân!",
    );
    return; // QUAN TRỌNG
  });

  bot.onText(/\/ping/, async (message) => {
    await bot.sendMessage(message.chat.id, "pong");
    return; // QUAN TRỌNG
  });

  bot.onText(/\/help/, async (message) => {
    await bot.sendMessage(
      message.chat.id,
      `Thu lenh nay:
      /start
      /ping
      /help
      /dan
      /nyaa
      /test
      Hoac gui hello de test text handler.`,
    );
    return; // QUAN TRỌNG
  });

  bot.command("photos", async (message) => {
    await bot.sendPhotos(
      message.chat.id,
      [
        "https://wallpaperaccess.com/full/8405958.jpg",
        "https://wallpaperaccess.com/full/8405960.jpg",
        "https://wallpaperaccess.com/full/8405967.jpg",
        "https://wallpaperaccess.com/full/8405978.jpg",
        "https://wallpaperaccess.com/full/8405979.png",
      ],
      "Demo gửi nhiều ảnh cùng caption từ SDK",
    );
    return; // QUAN TRỌNG
  });

  bot.command("test", async (message, context) => {
    await bot.sendMessage(
      message.chat.id,
      context
        ? `Đây là một tin nhắn test. ${context}`
        : "Đây là một tin nhắn test.",
    );
    console.log(
      `Context Command: ${context.command ? JSON.stringify(context.command) : "No command context"}`,
    );
    return; // QUAN TRỌNG
  });

  // Handler chung cho text PHẢI Ở CUỐI và kiểm tra lệnh
  bot.on("text", async (message,metadata) => {
    // Bỏ qua nếu là lệnh (bắt đầu với /)
    if (message.text?.startsWith("/")) {
      return;
    }

    if (message.text?.startsWith("@")) {
      return;
    }

    if (message.text === "hello") {
      await bot.sendMessage(
        message.chat.id,
        `Xin chao! Toi da nhan duoc loi chao cua ban.`,
      );
      console.log(message.fromUser?.id);
      return;
    }

    // Echo tin nhắn thường
    if (message.text) {
      await bot.sendMessage(message.chat.id, `Ban vua noi: ${message.text}`);
      return;
    }
  });

  await bot.startPolling();
}
resetConversation;
clearAllCache;
void main();
