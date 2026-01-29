import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '@repo/db';

export default async function signUpController(req: Request, res: Response) {
    try {
        const { name, email, password, image } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'name, email, password required'
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                image
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
        });

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
            user,
            token
        });

    } catch (err) {
        console.log('Signup Error: ', err);
        return res.status(500).json({
            success: false,
            message: 'Signup failed'
        });
    }
}