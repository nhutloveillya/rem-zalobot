import { Bot } from "zalo-bot-js";

async function getNyaa<T = any>(query: string): Promise<T> {
  const url = `https://nyaaapi.onrender.com/nyaa?${query}`;

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
    - /nyaa s <query> tìm torrent theo tên
    - /nyaa sbc <query> tìm torrent theo tên và thể loại, ngăn cách giữa thể loại và tên là dấu , (dấu phẩy)
    ... đang cập nhật thêm`
};