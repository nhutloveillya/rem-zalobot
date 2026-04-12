import { Bot } from "../zalobotjs";

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
  const danhelp = `cách sử dụng lệnh /dan
    /dan img <tags> - ảnh ngẫu nhiên theo tag đã gửi
    /dan tags <query> - tìm tag theo query
    /dan imgs <tags> - 1 loạt ảnh ngẫu nhiên theo tag`;

  bot.command("dan", async (message, context) => {
    const ctx = context ? context.command.args : undefined; //lay context: du lieu sau lenh duoi dang array
    const ctxraw: any = context ? context.command.argsRaw : undefined;//Lay context duoi dang string
    if (ctx && ctx.length > 0) { //kiem tra xem co contextn hay ko
      const comcxt = ctxraw?.split(ctx[0])[1]?.trim();//lay context sau subcommand
      if (ctx[0] === "help") {//lenh help
        await bot.sendMessage(message.chat.id, danhelp);
      } 
      else if (ctx[0] === "tags") {//tim tag
        bot.sendChatAction(message.chat.id, "typing");
        try {
          const res = await getDan(
            `tags.json?search[name_matches]=${encodeURIComponent(comcxt)}`,
          );
          if (res.length > 0) {
            await bot.sendMessage(
              message.chat.id,
              `Kết quả tìm kiếm tag cho "${comcxt}":\n` +
                res
                  .map((tag: any) => `- ${tag.name} (${tag.post_count} posts)`)
                  .join("\n"),
            );
          } else {
            await bot.sendMessage(
              message.chat.id,
              `Không tìm thấy tag nào khớp với "${comcxt}".`,
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
      else if (ctx[0] === "img") {//tim anh
        bot.sendChatAction(message.chat.id, "typing");
        try {
          const res = await getDan(
            `posts.json?tags=${encodeURIComponent(comcxt.replaceAll(" ", "_"))}`,
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
      else if (ctx[0] === "imgs") {//tim anh so luong lon
        bot.sendChatAction(message.chat.id, "typing");
        try {
          const res = await getDan(
            `posts.json?tags=${encodeURIComponent(comcxt.replaceAll(" ", "_"))}+&page=${getRandomInt(1, 50)}`,
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
      else {
        await message.replyText(//khi chay sai subcommand
          "Không có lệnh nào như vậy cả.\nHãy dùng /dan help để biết thêm chi tiết",
        );
        return; // QUAN TRỌNG: Dừng xử lý ở đây
      }
    } else {
      await bot.sendMessage(message.chat.id, danhelp);//hien danhelp
      return; // QUAN TRỌNG: Dừng xử lý ở đây
    }
  });
};
