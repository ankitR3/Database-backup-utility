import { Request, Response } from 'express';


export function healthController(req: Request, res: Response) {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
}