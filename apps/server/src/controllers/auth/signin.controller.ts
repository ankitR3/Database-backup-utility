import { Request, Response } from 'express';
import prisma from '@repo/db';
import jwt from 'jsonwebtoken';

export default async function signInController(req: Request, res: Response) {
    const { user } = req.body;

    if (!user?.email) {
        return res.status(400).json({
            message: 'User email required',
        });
    }

    try {
        let myUser = await prisma.user.findUnique({
            where: {
                email: user.email
            },
        });

        if (!myUser) {
            myUser = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            });
        } else {
            myUser = await prisma.user.update({
                where: {
                    email: user.email
                },
                data: {
                    name: user.name,
                    image: user.image,
                },
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                message: 'JWT_SECRET missing',
            });
        }

        const token = jwt.sign(
            {
                id: myUser.id,
                email: myUser.email,
            },
            secret,
            {
                expiresIn: '7d'
            }
        );

        return res.json({
            success: true,
            user: myUser,
            token,
        });

    } catch (err) {
        console.log('SignIn Error : ', err);
        return res.status(500).json({
            success: false,
            message: 'Authentication Failed'
        })
    }
}