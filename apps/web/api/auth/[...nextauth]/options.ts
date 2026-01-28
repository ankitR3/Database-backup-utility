import GoogleProvider from 'next-auth/providers/google';
import { ISODateString, type AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db';

export interface CustomSession {
    user?: CustomUser;
    expires: ISODateString;
}

export interface CustomUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | null;
}

export const authOptions: AuthOptions = {
    pages: {
        signIn: '/'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: CustomUser }) {
            try {
                if (!user.email) {
                    console.log('Email is required');
                    return false;
                }

                const existingUser = await prisma.user.findUnique({
                    where: {
                        email: user.email
                    },
                });

                let myUser;
                    if (existingUser) {
                        myUser = await prisma.user.update({
                            where: {
                                email: user.email
                            },
                            data: {
                                name: user.name!,
                                image: user.image,
                            },
                        });
                    } else {
                        myUser = await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name!,
                                image: user.image,
                            },
                        });
                    }

                    const jwtPayload = {
                        name: myUser.name,
                        email: myUser.email,
                        id: myUser.id.toString(),
                    };

                    const token = jwt.sign(
                        jwtPayload,
                        process.env.NEXTAUTH_SECRET || 'fallback_secret_key',
                        { expiresIn: '365d'}
                    );

                    user.id = myUser.id.toString();
                    user.token = token;

                    console.log('options user: ', user);
                    return true;
            } catch (err) {
                console.error('SignIn failed: ', err);
                return false;
            }
        },

        async jwt({ token, user }) {
            if (user) {
                token.user = user as CustomUser;
            }
            return token;
        },

        async session({ session, token }: { session: CustomSession; token: JWT}) {
            if (token.user) {
                session.user = token.user as CustomUser;
            }
            return session;
        },
    },
};