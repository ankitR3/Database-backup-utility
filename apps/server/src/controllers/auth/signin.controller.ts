import { Request, Response } from 'express';
import prisma from '@repo/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function signInController(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'email and password required'
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user || !user.password) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                message: 'JWT_SECRET missing'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            }, secret,
            {
                expiresIn: '7d'
            }
        );

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image
            },
            token,
        });

    } catch (err) {
        console.log('Signin Error: ', err);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}