# Bắt đầu nhanh

## Yêu cầu

- Node.js 18 trở lên
- một bot token hợp lệ từ Zalo Bot

## Cài đặt

```bash
npm install
```

## Tạo `.env`

Tạo file `.env` tại root repo:

```env
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
```

`ZALO_BOT_LANG` hỗ trợ:

- `vi`: log và thông điệp runtime bằng tiếng Việt
- `en`: log và thông điệp runtime bằng tiếng Anh

Nếu không cấu hình, SDK hiện mặc định dùng `vi`.

## Kiểm tra token

```bash
npm run test:token
```

Script này:

- đọc `.env`
- lấy `ZALO_BOT_TOKEN`
- khởi tạo `Bot`
- gọi `getMe()`
- in thông tin bot ra console theo ngôn ngữ được chọn

## Chạy bot test

```bash
npm run test:hello-bot
```

Sau đó nhắn:

- `/start`
- `hello`

để kiểm tra flow cơ bản.

Script test này dùng:

- `ApplicationBuilder` để tạo app polling
- `CommandHandler("start", ...)` cho lệnh `/start`
- `MessageHandler(...)` để phản hồi khi người dùng gửi `hello`

Đây là cách nhanh nhất để xác nhận token, polling, parsing update và reply flow đang hoạt động.

## Khởi động bot bằng code

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào!");
}));

void app.runPolling();
```

## Khi nào nên dùng các script test

- `test:token`: dùng khi bạn chỉ muốn xác nhận token và profile bot
- `test:hello-bot`: dùng khi bạn muốn xác nhận cả polling và flow phản hồi message

## Lưu ý thực tế

- Long polling có thể chờ lâu nếu không có update mới
- Nếu API trả payload phản hồi mỏng, SDK hiện đã có fallback parse cho message gửi đi
- Webhook phù hợp hơn khi bạn đã có server và URL public ổn định
