// bot.ts (updated with proper error handling)
import { GeminiService } from './services/gemini.service';
import { BOT_PERSONALITY } from './config/ai-personality';
import * as dotenv from 'dotenv';

dotenv.config();

const geminiService = new GeminiService({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-pro',
  personality: BOT_PERSONALITY,
  enableCache: true,
  enableRateLimit: true
});

export async function handleMessage(
  userId: string, 
  message: string
): Promise<string> {
  try {
    const response = await geminiService.chat(userId, message);
    return response;
    
  } catch (error: any) {
    console.error('Error handling message:', error);
    
    // Xử lý các loại error khác nhau
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      return '⏰ Bạn đang nhắn tin hơi nhanh rồi đó! Chờ 1 phút rồi thử lại nhé 😊';
    }
    
    if (error.message.includes('quota')) {
      return '😅 API quota đã hết rồi. Admin cần nạp thêm credits!';
    }
    
    return 'Xin lỗi, mình đang gặp chút vấn đề kỹ thuật. Thử lại sau nhé! 🙏';
  }
}

export function resetConversation(userId: string): void {
  geminiService.clearHistory(userId);
}

// Thêm các utility functions
export function clearAllCache(): void {
  geminiService.clearCache();
}

export function getCacheStats() {
  return geminiService.getCacheStats();
}