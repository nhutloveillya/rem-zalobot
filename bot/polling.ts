import { Bot } from "zalo-bot-js";
import { config as loadEnv } from "dotenv";


async function getDan<T = any>(query: string): Promise<T> {
  const url = `https://danbooru.donmai.us/${query}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }

  const data: T = await response.json();
  return data;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  loadEnv();
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN");
  }

  const bot = new Bot({ token });

  bot.on("message", async (message) => {
    console.log("Received message:", message.text ?? message.messageId);
  });

  const danhelp = "cách sử dụng /dan \n /dan <tags> - ảnh ngẫu nhiên theo tag đã gửi\n /dantags <query> - tìm tag theo query\n /dans <tags> - 1 loạt ảnh ngẫu nhiên theo tag";

  // Xử lý các lệnh /dan trước
  bot.onText(/\/dan(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    if (payload) {
      try {
        const res = await getDan(`posts.json?tags=${encodeURIComponent(payload)}`);
        if (res.length === 0) {
          await bot.sendMessage(message.chat.id, "Không tìm thấy ảnh nào với tag này.");
          return;
        }
        const danid = getRandomInt(0, res.length - 1);
        await bot.sendPhoto(
          message.chat.id,
          `Nguồn: ${res[danid]?.source}\nScore: ${res[danid]?.score}\nRating: ${res[danid]?.rating}`,
          res[danid]?.file_url,
        );
      } catch (error) {
        console.error("Error fetching dan:", error);
        await bot.sendMessage(message.chat.id, "Lỗi khi tải ảnh. Vui lòng thử lại.");
      }
    }
    return; // QUAN TRỌNG: Dừng xử lý ở đây
  });

  bot.onText(/\/dans(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    if (payload) {
      try {
        const res = await getDan(`posts.json?tags=${encodeURIComponent(payload)}+&page=${getRandomInt(1, 100)}`);
        if (res.length === 0) {
          await bot.sendMessage(message.chat.id, "Không tìm thấy ảnh nào với tag này.");
          return;
        }
        const danlist = [];
        for (let i = 0; i < Math.min(5, res.length); i++) {
          const danid = getRandomInt(0, res.length - 1);
          danlist.push({
            url: res[danid]?.file_url,
          });
        }
        await bot.sendPhotos(
          message.chat.id,
          danlist.map(d => d.url),
          "Loạt ảnh theo tag bạn đã tìm kiếm",
        );
      } catch (error) {
        console.error("Error fetching dans:", error);
        await bot.sendMessage(message.chat.id, "Lỗi khi tải ảnh. Vui lòng thử lại.");
      }
    }
    return; // QUAN TRỌNG
  });

  bot.onText(/\/dantags(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    if (payload) {
      try {
        const res = await getDan(`tags.json?search[name_matches]=${encodeURIComponent(payload)}*`);
        if (res.length > 0) {
          await bot.sendMessage(message.chat.id, `Kết quả tìm kiếm tag cho "${payload}":\n` + res.map((tag: any) => `- ${tag.name} (${tag.post_count} posts)`).join("\n"));
        } else {
          await bot.sendMessage(message.chat.id, `Không tìm thấy tag nào khớp với "${payload}".`);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        await bot.sendMessage(message.chat.id, "Lỗi khi tìm tag. Vui lòng thử lại.");
      }
    }
    return; // QUAN TRỌNG
  });

  bot.command("danhelp", async (message) => {
    await bot.sendMessage(message.chat.id, danhelp);
    return; // QUAN TRỌNG
  });

  bot.onText(/\/start(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    await bot.sendMessage(
      message.chat.id,
      payload ? `Chao ${payload}! Toi la bot Zalo viet bang TypeScript.` : "Chao ban!",
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
      "Thu lenh nay:\n/start\n/ping\n/help\n/danhelp\nHoac gui hello de test text handler.",
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
        "https://wallpaperaccess.com/full/8405979.png"
      ],
      "Demo gửi nhiều ảnh cùng caption từ SDK",
    );
    return; // QUAN TRỌNG
  });

  // Handler chung cho text PHẢI Ở CUỐI và kiểm tra lệnh
  bot.on("text", async (message) => {
    // Bỏ qua nếu là lệnh (bắt đầu với /)
    if (message.text?.startsWith("/")) {
      return;
    }

    if (message.text === "hello") {
      await bot.sendMessage(message.chat.id, "Xin chao! Toi da nhan duoc loi chao cua ban.");
      return;
    }

    // Echo tin nhắn thường
    if (message.text) {
      await bot.sendMessage(message.chat.id, `Ban vua noi: ${message.text}`);
    }
  });

  await bot.startPolling();
}

void main();
