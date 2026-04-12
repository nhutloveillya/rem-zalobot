// services/gemini.service.ts (updated)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResponseCache } from '../utils/cache';
import { RateLimiter } from '../utils/rate-limiter';
import crypto from 'crypto';

export interface PersonalityConfig {
  name: string;
  role: string;
  traits: string[];
  background: string;
  communicationStyle: string;
}

interface AIConfig {
  apiKey: string;
  model?: string;
  personality: PersonalityConfig;
  enableCache?: boolean;
  enableRateLimit?: boolean;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private personality: PersonalityConfig;
  private conversationHistory: Map<string, any[]>;
  
  // Cache & Rate Limiter instances
  private cache: ResponseCache;
  private rateLimiter: RateLimiter;
  private enableCache: boolean;
  private enableRateLimit: boolean;

  constructor(config: AIConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model || 'gemini-pro' 
    });
    this.personality = config.personality;
    this.conversationHistory = new Map();
    
    // Khởi tạo cache (TTL 5 phút)
    this.cache = new ResponseCache(5);
    
    // Khởi tạo rate limiter (max 10 requests/phút)
    this.rateLimiter = new RateLimiter(10, 60000);
    
    this.enableCache = config.enableCache ?? true;
    this.enableRateLimit = config.enableRateLimit ?? true;
  }

  // Tạo cache key từ userId và message
  private generateCacheKey(userId: string, message: string): string {
    const normalized = message.toLowerCase().trim();
    return crypto
      .createHash('md5')
      .update(`${userId}:${normalized}`)
      .digest('hex');
  }

  async chat(userId: string, message: string): Promise<string> {
    // 1. KIỂM TRA RATE LIMIT
    if (this.enableRateLimit && !this.rateLimiter.canMakeRequest(userId)) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    // 2. KIỂM TRA CACHE
    if (this.enableCache) {
      const cacheKey = this.generateCacheKey(userId, message);
      const cachedResponse = this.cache.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`[CACHE HIT] ${userId}: ${message.substring(0, 30)}...`);
        return cachedResponse;
      }
    }

    // 3. GỌI API
    try {
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      
      const history = this.conversationHistory.get(userId)!;
      
      const chat = this.model.startChat({
        history: this.formatHistory(history),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const prompt = history.length === 0 
        ? `${this.buildSystemPrompt()}\n\nUser: ${message}`
        : message;

      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      // Lưu vào history
      history.push(
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: response }] }
      );

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      // 4. LƯU VÀO CACHE
      if (this.enableCache) {
        const cacheKey = this.generateCacheKey(userId, message);
        this.cache.set(cacheKey, response);
      }

      return response;
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  private buildSystemPrompt(): string {
    return `Bạn là ${this.personality.name}, ${this.personality.role}.

Tính cách: ${this.personality.traits.join(', ')}
Background: ${this.personality.background}
Phong cách giao tiếp: ${this.personality.communicationStyle}

Hãy luôn giữ đúng nhân diện này trong mọi cuộc trò chuyện.`;
  }

  private formatHistory(history: any[]): any[] {
    return history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  resetAll(): void {
    this.conversationHistory.clear();
  }
  
  // Phương thức quản lý cache
  clearCache(): void {
    this.cache.clear();
  }
  
  getCacheStats(): { size: number } {
    return this.cache.getStats();
  }
}