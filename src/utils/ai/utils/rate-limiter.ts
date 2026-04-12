// utils/rate-limiter.ts (improved)
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Cleanup mỗi 5 phút
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Kiểm tra đơn giản (backward compatible)
  canMakeRequest(userId: string): boolean {
    return this.checkLimit(userId).allowed;
  }

  // Kiểm tra chi tiết với thông tin remaining
  checkLimit(userId: string): RateLimitResult {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Lọc các request trong time window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    const remaining = Math.max(0, this.maxRequests - recentRequests.length);
    const allowed = recentRequests.length < this.maxRequests;
    
    if (allowed) {
      recentRequests.push(now);
      this.requests.set(userId, recentRequests);
    }
    
    // Tính thời điểm reset
    const oldestRequest = recentRequests[0] || now;
    const resetAt = new Date(oldestRequest + this.windowMs);
    
    return {
      allowed,
      remaining,
      resetAt
    };
  }

  // Cleanup user cũ
  private cleanup(): void {
    const now = Date.now();
    
    for (const [userId, requests] of this.requests.entries()) {
      const recent = requests.filter(time => now - time < this.windowMs);
      
      if (recent.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, recent);
      }
    }
  }

  // Reset limit cho một user
  resetUser(userId: string): void {
    this.requests.delete(userId);
  }

  // Lấy thống kê
  getStats(): { 
    totalUsers: number; 
    activeUsers: number;
  } {
    const now = Date.now();
    let activeUsers = 0;
    
    for (const requests of this.requests.values()) {
      const recent = requests.filter(time => now - time < this.windowMs);
      if (recent.length > 0) activeUsers++;
    }
    
    return {
      totalUsers: this.requests.size,
      activeUsers
    };
  }
}