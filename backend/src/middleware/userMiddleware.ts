import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { TokenBlacklist } from "../db/tokenBlacklist";

export const userAuthMiddleware = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Authorization header missing"
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            res.status(401).json({
                message: "Token has been invalidated"
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        
        // Type assertion approach - tells TypeScript this property exists
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(403).json({
            message: "Invalid token"
        });
        return;
    }
};