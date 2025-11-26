import { Request, Response, NextFunction } from 'express';

/**
 * API Key Authentication Middleware
 * Validates X-API-Key header against configured API keys
 * Returns 401 if invalid or missing API key
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from request header
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized'
        }
      });
    }

    // Get valid API keys from environment
    const validApiKeys = process.env.API_KEYS?.split(',') || [];
    
    if (validApiKeys.length === 0) {
      console.warn('⚠️  No API keys configured. Set API_KEYS environment variable.');
      // Allow requests if no API keys are configured (development mode)
      return next();
    }

    // Validate API key
    const isValidKey = validApiKeys.some(key => key.trim() === apiKey);
    
    if (!isValidKey) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid API key'
        }
      });
    }

    // API key is valid, continue to next middleware
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during API key validation'
      }
    });
  }
};

/**
 * Generate a secure API key
 * Usage: node -e "console.log(require('./src/middleware/apiKey').generateApiKey())"
 */
export const generateApiKey = (): string => {
  const crypto = require('crypto');
  return 'swr_' + crypto.randomBytes(32).toString('hex');
};