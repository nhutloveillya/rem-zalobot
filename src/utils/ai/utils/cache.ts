// utils/cache.ts (improved)
export class ResponseCache {
  private cache: Map<string, { response: string; timestamp: number }> = new Map();
  private ttl: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
    
    // Auto cleanup mỗi 10 phút
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  get(key: string): string | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.misses++;
      return null;
    }
    
    // Kiểm tra expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return cached.response;
  }

  set(key: string, response: string): void {
    this.cache.set(key, { 
      response, 
      timestamp: Date.now() 
    });
  }

  // Xóa tất cả cache
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Lấy thống kê
  getStats(): { 
    size: number; 
    hits: number; 
    misses: number; 
    hitRate: string;
  } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 
      ? ((this.hits / total) * 100).toFixed(2) 
      : '0.00';
      
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`
    };
  }

  // Xóa cache cũ hơn X phút
  clearOlderThan(minutes: number): number {
    const threshold = Date.now() - (minutes * 60 * 1000);
    let deleted = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < threshold) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    return deleted;
  }
}