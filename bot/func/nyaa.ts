import { Bot, Message } from "zalo-bot-js";

async function getNyaa<T = any>(query: string): Promise<T> {
  const url = `https://nyaaapi.onrender.com/${query}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} - ${response.statusText}`,
    );
  }

  const data: T = await response.json();
  return data;
}

export const main = (bot: Bot): void => {
    const nyaahelp =
    `Cách sử dụng /nyaa - dùng để tra torrent trên nyaa.si hoặc nyaa.land
    - /nyaa search <query> tìm torrent theo tên
    - /nyaa sukebei <query> tìm torrent trên sukebei (18+)
    - /nyaa sbc <query> tìm torrent theo tên và thể loại, ngăn cách giữa thể loại và tên là dấu , (dấu phẩy)
    ... đang cập nhật thêm`

    bot.command('nyaa',async(message, context) => {
    const ctx = context ? context.command.args : undefined; //lay context: du lieu sau lenh duoi dang array
    const ctxraw: any = context ? context.command.argsRaw : undefined;//Lay context duoi dang string

    if (ctx && ctx.length > 0) { //kiem tra xem co contextn hay ko
      const comcxt = ctxraw?.split(ctx[0])[1]?.trim();//lay context sau subcommand
      if (ctx[0] === "help") {//lenh help
        await bot.sendMessage(message.chat.id, nyaahelp);
      }
      else if (ctx[0] === "search") {
        await message.replyAction("typing");
        try{
          const res: any = await getNyaa(`nyaa?q=${encodeURIComponent(comcxt)}`);
          const data = Array.isArray(res?.data) ? res.data : []; //dua data sang 1 bien rieng

          if (data.length === 0) {
            await message.replyText(`Không tìm thấy kết quả cho "${comcxt}"`);
            return;
          }

          await message.replyText(
            `Kết quả tìm kiếm cho "${comcxt}" (${res.count ?? data.length} kết quả):`,
          );

          const limit = Math.min(10, data.length);
          for (let index = 0; index < limit; index++) {
            const tdat = data[index];
            const output = `#${index + 1} ${tdat.title}
- category: ${tdat.category}
- link: ${tdat.link.replaceAll("nyaa.si", "nyaa.land")}
- torrent: ${tdat.torrent.replaceAll("nyaa.si", "nyaa.land")}
- size: ${tdat.size}
- downloads: ${tdat.downloads}`;

            await message.replyText(output);
          }
        } catch (error){
          console.error("Error fetching tags:", error);

        }
      }
      else if (ctx[0] === "sukebei") {
        await message.replyAction("typing");
        try{
          const res: any = await getNyaa(`sukebei?q=${encodeURIComponent(comcxt)}`);
          const data = Array.isArray(res?.data) ? res.data : []; //dua data sang 1 bien rieng

          if (data.length === 0) {
            await message.replyText(`Không tìm thấy kết quả cho "${comcxt}"`);
            return;
          }

          await message.replyText(
            `Kết quả tìm kiếm cho "${comcxt}" (${res.count ?? data.length} kết quả):`,
          );

          const limit = Math.min(10, data.length);
          for (let index = 0; index < limit; index++) {
            const tdat = data[index];
            const output = `#${index + 1} ${tdat.title}
- category: ${tdat.category}
- link: ${tdat.link}
- torrent: ${tdat.torrent}
- size: ${tdat.size}
- downloads: ${tdat.downloads}`;

            await message.replyText(output);
          }
        } catch (error){
          console.error("Error fetching tags:", error);

        }
      }
      else {//khi chay sai subcommand
          await message.replyText(
            "Không có lệnh nào như vậy cả.\nHãy dùng /nyaa help để biết thêm chi tiết",
          );
          return; // QUAN TRỌNG: Dừng xử lý ở đây
        }
      } else {
        await bot.sendMessage(message.chat.id, nyaahelp);//hien help
        return; // QUAN TRỌNG: Dừng xử lý ở đây
      }


    })};
