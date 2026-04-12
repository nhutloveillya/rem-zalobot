import { Bot } from "./utils/zalobotjs";
import { config as loadEnv } from "dotenv";
import { main as danbooruMain } from "./utils/command/danbooru";
import { main as nyaa } from "./utils/command/nyaa";
import {
  clearAllCache,
  handleMessage,
  resetConversation,
} from "./utils/ai/bot";
import { main as aicommand } from "./utils/command/gemini";

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

  bot.onText(/\/hi(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    await bot.sendMessage(
      message.chat.id,
      payload
        ? `Chao ${payload}! Toi la bot Zalo viet bang TypeScript.`
        : "Chao ban!",
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
      `#Các lệnh cơ bản
/help - liệt kê danh sách các lệnh bạn nên biết
/hi <yourname> Rem sẽ chào bạn
/ping - pong
/photos - gửi ảnh, ảnh gì thì thử rồi biết
hello - chào bạn

#Danbooru
/dan help - hướng dẫn sử dụng lệnh /dan
/dan img <tags> - ảnh ngẫu nhiên theo tag đã gửi
/dan tags <query> - tìm tag theo query
/dan imgs <tags> - 1 loạt ảnh ngẫu nhiên theo tag\

#Nyaa
/nyaa search <query> tìm torrent theo tên
/nyaa sukebei <query> tìm torrent trên sukebei (18+)

#AI
/ai clean - dọn cache
/ai reset - xóa lịch sử trò chuyện
/ai status - trạng thái cache của ai`,
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
  bot.on("text", async (message) => {
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
      message.replyAction("typing");
      const userid: any = message.fromUser?.id;
      const reply = await handleMessage(userid, message.text);
      await bot.sendMessage(message.chat.id, reply);
      return;
    }
  });

  await bot.startPolling();
}
resetConversation;
clearAllCache;
void main();
