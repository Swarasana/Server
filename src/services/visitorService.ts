import { Request } from 'express';
import crypto from 'crypto';
import { VisitorRepository } from '../repositories/visitorRepository';

export class VisitorService {
  /**
   * Generate a visitor fingerprint for deduplication
   * Uses IP address + User Agent hash for privacy
   */
  static generateVisitorFingerprint(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Create hash for privacy - don't store raw IP/UserAgent
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16); // Use first 16 characters
    
    return fingerprint;
  }

  /**
   * Record a visit to a collection with deduplication
   * Only counts unique visitors per day
   */
  static async recordVisit(
    collectionId: string, 
    req: Request, 
    sessionId?: string,
    userId?: string
  ): Promise<{ isNewVisit: boolean; totalCount: number }> {
    try {
      const fingerprint = this.generateVisitorFingerprint(req);
      
      // Try to create visitor log (will return null if duplicate)
      const visitorLog = await VisitorRepository.createVisitorLog(
        collectionId, 
        fingerprint, 
        sessionId,
        userId
      );

      let isNewVisit = false;
      
      // If log was created, it's a new visit - increment counter
      if (visitorLog) {
        isNewVisit = true;
        await VisitorRepository.incrementVisitorCount(collectionId);
      }
      
      // Get current visitor count
      const totalCount = await VisitorRepository.getVisitorCount(collectionId);

      return {
        isNewVisit,
        totalCount
      };
      
    } catch (error) {
      console.error('Error recording visit:', error);
      
      // Fallback: get current count without recording visit
      const totalCount = await VisitorRepository.getVisitorCount(collectionId);
      
      return {
        isNewVisit: false,
        totalCount
      };
    }
  }

  /**
   * Get visitor count for a collection
   */
  static async getVisitorCount(collectionId: string): Promise<number> {
    return await VisitorRepository.getVisitorCount(collectionId);
  }

  /**
   * Get basic visit analytics for a collection
   */
  static async getVisitAnalytics(collectionId: string): Promise<{
    totalVisits: number;
    uniqueVisitors: number;
    visitsLast7Days: number;
    visitsToday: number;
  }> {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get total visits count
    const totalVisits = await VisitorRepository.getVisitCount(collectionId);

    // Get unique visitors (same as total visits due to deduplication)
    const uniqueVisitors = totalVisits;

    // Get visits in last 7 days
    const visitsLast7Days = await VisitorRepository.getVisitCount(
      collectionId, 
      sevenDaysAgo
    );

    // Get visits today
    const visitsToday = await VisitorRepository.getVisitCount(
      collectionId,
      `${today}T00:00:00Z`,
      `${today}T23:59:59Z`
    );

    return {
      totalVisits,
      uniqueVisitors,
      visitsLast7Days,
      visitsToday
    };
  }

  /**
   * Get trending collections based on recent visits
   */
  static async getTrendingCollections(limit: number = 10): Promise<Array<{
    collection_id: string;
    recent_visits: number;
  }>> {
    return await VisitorRepository.getTrendingCollections(limit, 3);
  }

  /**
   * Get collections visited by a specific user (authenticated users only)
   */
  static async getUserVisitedCollections(
    userId: string,
    limit: number = 50
  ) {
    return await VisitorRepository.getUserVisitedCollections(userId, limit);
  }
}