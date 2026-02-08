import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({
            message: 'JWT secret not configured'
        });
    }

    if (!token) {
        res.status(401).json({
            message: 'Token not found',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded as AuthUser;
        next();
    } catch (err) {
        console.log('Auth error: ', err);
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
}