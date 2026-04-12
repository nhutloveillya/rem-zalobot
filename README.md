# Rem - Zalo Bot

![rem](image/rem.webp)

`Rem - Zalo bot` là 1 con zalo bot được [Nhut](https://github.com/nhutloveillya) tạo ra để thỏa màn nhu cầu của mình thông qua tính năng zalo bot mới trên zalo.

- Dự án này được dựa trên [zalo-bot-js](https://kaiyodev.github.io/zalo-bot-js)

## Rem có thể làm gì?

**_Những hiện tại Rem có thể và không thể:_**

- [x] Phản ứng khi nhắn tin (trả lời lại những gì người dùng nhắn)
- [x] Chào người dùng (Hello)
- [x] Có thể gửi ảnh từ [Danbooru](https://danbooru.donmai.us/)
- [x] Có thể tìm kiếm torrent từ [nyaa](https://nyaa.land)
- [ ] Chúc bạn ngủ ngon
- [ ] Ngủ với bạn

> **_Trong tương lai Rem có thể_** (todo)
>
> - Trò chuyện như bạn gái
> - Liên kết với n8n

## Cách cài và chạy Rem trên thiết bị của bạn

### Bước 1: Clone repo này

```bash
git clone https://github.com/nhutloveillya/rem-zalobot.git
```

### Bước 2: Cài đặt các dependencie package

```bash
cd rem-zalobot
npm i
```

### Bước 3: Thêm environment

#### Mẫu .env

```text
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
ZALO_BOT_ADMIN_ID=your_zalo_account_id_here
```

`ZALO_BOT_LANG` hiện hỗ trợ `vi` and `en`.
Bạn có thể tìm hiểu cách lấy Bot TOKEN tại [Trang tài liệu chính thức về Zalo Bot](https://bot.zapps.me/docs/create-bot/)

#### Bước 4: Chạy Rem

```bash
npm run bot
```

## License

MIT License. See [LICENSE](./LICENSE) for details.
