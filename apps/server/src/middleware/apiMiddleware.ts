import { Request, Response, NextFunction } from 'express';
import { User, UserType } from '../db/userSchema';

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}

export const apiMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {
    const apiKey = (req.headers['x-api-key'] as string) || req.body?.apikey;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: "API key is required"
      });
      return;
    }

    const user = await User.findOne({ uuid: apiKey, isActive: true });

    if (!user) {
      res.status(403).json({
        success: false,
        message: "Invalid API key"
      });
      return;
    }

    req.user = user;

    next();

  } catch (error) {
    console.error("API middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
