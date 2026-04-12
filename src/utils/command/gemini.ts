import { clearAllCache, getCacheStats, resetConversation } from "../ai/bot";
import { Bot } from "../zalobotjs";
import { messages } from "../zalobotjs/i18n/messages";

export const main = (bot: Bot) => {
  const help = `cách lệnh sử dụng lệnh /ai:
  - /ai clean - dọn cache
  - /ai reset - xóa lịch sử trò chuyện
  - /ai status - trạng thái cache của ai`;
  bot.command("ai", async (message, context) => {
    const ctx = context ? context.command.args : undefined; //lay context: du lieu sau lenh duoi dang array
    const ctxraw: any = context ? context.command.argsRaw : undefined; //Lay context duoi dang string
    if (message.admin) {
      if (ctx && ctx.length > 0) {
        //kiem tra xem co contextn hay ko
        const comcxt = ctxraw?.split(ctx[0])[1]?.trim(); //lay context sau subcommand
        if (ctx[0] === "help") {
          //lenh help
          await bot.sendMessage(message.chat.id, help);
        } else if (ctx[0] === "clean") {
          //xoa cache
          try {
            await clearAllCache;
            message.replyText(`# Đã xóa cache`);
            console.log(`da xoa cache`);
          } catch (error) {
            console.error("Error fetching tags:", error);
            await bot.sendMessage(
              message.chat.id,
              "Lỗi khi tìm tag. Vui lòng thử lại.",
            );
          }
        } else if (ctx[0] === "reset") {
          //reset kí ức
          try {
            await resetConversation;
            message.replyText(`# Đã reset kí ức`);
            console.log(`da reset ki uc`);
          } catch (error) {
            console.error("Error fetching tags:", error);
            await bot.sendMessage(
              message.chat.id,
              "Lỗi khi tìm tag. Vui lòng thử lại.",
            );
          }
        } else if (ctx[0] === "status") {
          //hien trang thai cache
          try {
            const status = JSON.stringify(getCacheStats());
            await message.replyText(`# Trạng thái cache:\n${status}`);
            console.log(status);
          } catch (error) {
            console.error("Error fetching tags:", error);
            await bot.sendMessage(
              message.chat.id,
              "Lỗi khi tìm tag. Vui lòng thử lại.",
            );
          }
        } else {
          await bot.sendMessage(message.chat.id, help); //hien danhelp
          return; // QUAN TRỌNG: Dừng xử lý ở đây
        }
      } else {
        message.replyText(help);
      }
    } else {
      message.replyText(
        `Mày không phải là Admin, mày định làm gì Rem của tao?! Cút!!`,
      );
    }
  });
};
