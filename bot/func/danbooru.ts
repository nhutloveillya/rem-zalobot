import { Bot } from "zalo-bot-js";

async function getDan<T = any>(query: string): Promise<T> {
  const url = `https://danbooru.donmai.us/${query}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} - ${response.statusText}`,
    );
  }

  const data: T = await response.json();
  return data;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const main = (bot: Bot): void => {
    const danhelp = `cách sử dụng /dan
    \n /dan img <tags> - ảnh ngẫu nhiên theo tag đã gửi
    \n /dan tags <query> - tìm tag theo query
    \n /dan imgs <tags> - 1 loạt ảnh ngẫu nhiên theo tag`;

    bot.command("dan", async (message, context) => {
    const ctx = context ? context.command.args : undefined;
    if (ctx && ctx.length > 0) {
        bot.sendChatAction(message.chat.id, "typing");
        if (ctx[0] === "help") {
        await bot.sendMessage(message.chat.id, danhelp);
        }
        if (ctx[0] === "tags") {
        try {
            const res = await getDan(
            `tags.json?search[name_matches]=${encodeURIComponent(ctx[1])}*`,
            );
            if (res.length > 0) {
            await bot.sendMessage(
                message.chat.id,
                `Kết quả tìm kiếm tag cho "${ctx[1]}":\n` +
                res
                    .map((tag: any) => `- ${tag.name} (${tag.post_count} posts)`)
                    .join("\n"),
            );
            } else {
            await bot.sendMessage(
                message.chat.id,
                `Không tìm thấy tag nào khớp với "${ctx[1]}".`,
            );
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            await bot.sendMessage(
            message.chat.id,
            "Lỗi khi tìm tag. Vui lòng thử lại.",
            );
        }
        }
        if (ctx[0] === "img") {
        try {
            const res = await getDan(
            `posts.json?tags=${encodeURIComponent(ctx[1])}`,
            );
            if (res.length === 0) {
            await bot.sendMessage(
                message.chat.id,
                "Không tìm thấy ảnh nào với tag này.",
            );
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
            await bot.sendMessage(
            message.chat.id,
            "Lỗi khi tải ảnh. Vui lòng thử lại.",
            );
        }
        }
        if (ctx[0] === "imgs") {
        try {
            const res = await getDan(
            `posts.json?tags=${encodeURIComponent(ctx[1])}+&page=${getRandomInt(1, 100)}`,
            );
            if (res.length === 0) {
            await bot.sendMessage(
                message.chat.id,
                "Không tìm thấy ảnh nào với tag này.",
            );
            return;
            }
            const danlist = [];
            for (let i = 0; i < Math.min(5, res.length); i++) {
            danlist.push({
                url: res[i]?.file_url,
            });
            }
            await bot.sendPhotos(
            message.chat.id,
            danlist.map((d) => d.url),
            "Loạt ảnh theo tag bạn đã tìm kiếm",
            );
        } catch (error) {
            console.error("Error fetching dans:", error);
            await bot.sendMessage(
            message.chat.id,
            "Lỗi khi tải ảnh. Vui lòng thử lại.",
            );
        }
        }
    } else {
        await bot.sendMessage(message.chat.id, danhelp);
    }
    return; // QUAN TRỌNG: Dừng xử lý ở đây
    });
};