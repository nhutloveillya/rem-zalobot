# Ví dụ và test

## Polling example

File tham chiếu: `examples/polling.ts`

Dùng khi bạn muốn chạy bot nhanh bằng token và handler cơ bản.

Phù hợp khi:

- bạn đang phát triển local
- bạn chưa có webhook URL
- bạn muốn debug flow nhận/gửi tin nhắn đơn giản

## Webhook example

File tham chiếu: `examples/webhook.ts`

Ví dụ này dùng `node:http` để tạo một webhook server tối giản và gọi `setWebhook()`.

Phù hợp khi:

- bạn đã có server chạy public
- bạn muốn nhận update theo kiểu push thay vì polling
- bạn đang triển khai bot lâu dài

## Token test

File tham chiếu: `test/check-token.ts`

Chạy:

```bash
npm run test:token
```

Script này chỉ tập trung vào xác minh token và profile bot. Đây là bước nên chạy đầu tiên khi bạn vừa cấu hình `.env`.

## Hello bot test

File tham chiếu: `test/hello-bot.ts`

Chạy:

```bash
npm run test:hello-bot
```

Bot sẽ reply với:

- `/start`
- `hello`

Script này hữu ích khi bạn muốn xác nhận cùng lúc:

- token hợp lệ
- polling hoạt động
- handler match đúng
- bot gửi reply thành công

## Các script hữu ích

- `npm run build`
- `npm run check`
- `npm run test`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:preview`

## Gợi ý luồng làm việc

1. cấu hình `.env`
2. chạy `npm run test:token`
3. chạy `npm run test:hello-bot`
4. chuyển sang `examples/polling.ts` hoặc `examples/webhook.ts` để bắt đầu logic riêng của bot
