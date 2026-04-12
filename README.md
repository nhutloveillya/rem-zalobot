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
- [x] Chúc bạn ngủ ngon
- [x] Nói chuyện với bạn như hầu gái
- [x] Nói chuyện với bạn như bạn gái
- [ ] Ngủ với bạn

> **_Trong tương lai Rem có thể_** (todo)
>
> - Liên kết với openclaw
> - Ngủ với bạn

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

### Bước 4: Chạy Rem

```bash
npm run bot
```

## Cách dùng Rem 🥵🥵

### Trò chuyện với Rem

Cứ nói chuyện bình thường, Rem sẽ trả lời bạn.
Nhưng số lượt để bạn trò chuyện với cô ấy tùy thuộc vào API Key của bạn, idk.
Nếu bạn không có gemini api key hay api key bạn quá cùi mà lại muốn dùng model llm khác thì [xem thêm...](./nani.md)

### Cách lệnh cơ bản tác động lên Rem

```bash
#Các lệnh cơ bản
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
/ai status - trạng thái cache của ai
```

## License

MIT License. See [LICENSE](./LICENSE) for details.
