import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; 
import { signInOrSignUp } from '../../services/authService';

export default async function signInController(req: Request, res: Response) {
    const { user } = req.body;

    if (!user?.email || !user.password) {
        return res.status(400).json({
            message: 'Email and password is required'
        });
    }

    try {
        const myUser = await signInOrSignUp(user);

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                message: 'jwt secret not configured'
            })
        }
        const token = jwt.sign({
            id: myUser.id,
            email: myUser.email
        }, secret, {
            expiresIn: '7d'
        });

        res.json({
            success: true,
            token,
            user: {
                id: myUser.id,
                name: myUser.name,
                email: myUser.email,
                image: myUser.image,
            },
        });
    } catch (err: any) {
        if (err.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        if (err.message === 'NAME_USERNAME_REQUIRED') {
            return res.status(400).json({
                message: 'Name and username required for signup'
            });
        }

        res.status(500).json({
            message: 'Authentication failed'
        });
    }
}