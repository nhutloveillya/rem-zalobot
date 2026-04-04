# zalo-bot-js

Thư viện TypeScript cho Zalo Bot API, tập trung vào trải nghiệm phát triển rõ ràng với Node.js, cấu trúc module gọn, và tài liệu song ngữ Việt/Anh.

[Tài liệu tiếng Việt](docs/vi/index.md) | [English docs](docs/en/index.md)

## Tổng quan

`zalo-bot-js` được xây dựng từ package tham chiếu `python_zalo_bot`, nhưng được tổ chức lại theo hướng TypeScript-native thay vì port máy móc. Mục tiêu của project là cung cấp một nền tảng đơn giản để:

- khởi tạo bot bằng token
- nhận update bằng long polling
- tổ chức command/message handlers rõ ràng
- hỗ trợ webhook helper cơ bản
- kiểm tra bot thật bằng `.env`
- mở rộng dần thành SDK đầy đủ hơn

## Tính năng hiện có

- `Bot.getMe()` để kiểm tra token và lấy thông tin bot
- `Application.runPolling()` để nhận update bằng long polling
- `sendMessage`, `sendPhoto`, `sendSticker`, `sendChatAction`
- `setWebhook`, `deleteWebhook`, `getWebhookInfo`
- routing theo command và filter
- fallback parse cho payload phản hồi mỏng từ API

## Trạng thái hiện tại

Project đang ở giai đoạn usable cho các flow cơ bản, nhưng chưa phải một SDK hoàn chỉnh cho mọi trường hợp của Zalo Bot API. Những phần còn đang giới hạn:

- upload media multipart đầy đủ
- worker queue hoặc updater layer nâng cao
- adapter webhook tách riêng cho từng framework
- bộ test tự động sâu cho toàn bộ endpoint

## Quick start

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Tạo file `.env`

Tạo `.env` từ `.env.example`:

```env
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
```

`ZALO_BOT_LANG` hỗ trợ `vi` hoặc `en`. Nếu không cấu hình, project mặc định dùng tiếng Việt cho log runtime.

### 3. Kiểm tra token

```bash
npm run test:token
```

### 4. Chạy bot thử

```bash
npm run test:hello-bot
```

Sau đó nhắn `/start` hoặc `hello` để test flow cơ bản.

## Ví dụ khởi động bot

```ts
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
} from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào từ zalo-bot-js");
}));

app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update) => {
    await update.message?.replyText(`Bạn vừa nói: ${update.message?.text ?? ""}`);
  }),
);

void app.runPolling();
```

## Cấu trúc mã nguồn

- `src/request`: HTTP transport và API error mapping
- `src/models`: `User`, `Chat`, `Message`, `Update`, `WebhookInfo`
- `src/core`: `Bot`, `Application`, `ApplicationBuilder`, `CallbackContext`
- `src/handlers`: command và message handlers
- `src/filters`: composable filters
- `src/i18n`: runtime messages và helper đổi ngôn ngữ log theo `ZALO_BOT_LANG`
- `examples`: ví dụ polling và webhook
- `test`: script thử token và bot thật bằng `.env`

## Tài liệu

- Tiếng Việt: [docs/vi/index.md](docs/vi/index.md)
- English: [docs/en/index.md](docs/en/index.md)
- GitHub Pages: build từ thư mục `docs/` bằng VitePress

## Scripts

- `npm run build`: build thư viện TypeScript
- `npm run check`: type-check không emit
- `npm run test:token`: đọc token từ `.env` và gọi `getMe()`
- `npm run test:hello-bot`: chạy bot polling để test `/start` và `hello`
- `npm run docs:dev`: chạy docs local bằng VitePress
- `npm run docs:build`: build static docs cho GitHub Pages
- `npm run docs:preview`: preview docs đã build
- `npm test`: chạy check, build và smoke test

## Hướng phát triển tiếp theo

- hoàn thiện message/media payload handling
- mở rộng webhook integration thực dụng hơn
- chuẩn hóa thêm lỗi runtime và instrumentation
- tăng độ phủ tài liệu và test tự động

## English summary

`zalo-bot-js` is a TypeScript SDK for the Zalo Bot API with a practical core: token validation, long polling, webhook helpers, handlers, filters, env-driven test scripts, and bilingual documentation. See [English docs](docs/en/index.md) for full usage and architecture notes.