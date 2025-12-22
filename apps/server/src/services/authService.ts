import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';

interface AuthInput {
    name?: string;
    email: string;
    username?: string;
    password: string;
    image?: string;
}

export async function signInOrSignUp(input: AuthInput) {
    const { name, email, username, password, image } = input;

    let user = await prisma.user.findUnique({
        where: {
            email
        },
    });

    if (!user) {
        if (!name || !username) {
            throw new Error('NAME_USERNAME_REQUIRED');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await prisma.user.create({
            data: {
                name,
                email,
                username,
                password: hashedPassword,
                image,
            },
        });

        return user;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('INVALID_CREDENTIALS');
    }

    return user;
}