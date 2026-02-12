import { Account, AuthOptions, ISODateString} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import axios from 'axios';
import { LOGIN_URL } from '@/routes/api-routes';

export interface UserType {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    token?: string | null;
}

export interface CustomSession {
    user?: UserType;
    expires: ISODateString;
}

export const authOptions: AuthOptions = {
    pages: {
        signIn: '/',
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === 'development',

    callbacks: {
        async signIn({ user, account }: { user: UserType; account: Account | null}) {
            try {
                if (account?.provider === 'google') {
                    console.log('sign-in url is: ', LOGIN_URL);

                    const response = await axios.post(LOGIN_URL, {
                        user: {
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        },
                    }, {
                        timeout: 10000,
                    });

                    const result = response.data;
                    if (result?.success) {
                        user.id = result.user.id.toString();
                        user.token = result.token;
                        return true;
                    }

                    return false;
                }
                return false;
            } catch (err) {
                console.log('signIn Error: ', err);
                return false;
            }
        },

        async redirect({ url, baseUrl }) {

            if (url === baseUrl || url === '/' || url.includes('api/auth')) {
                return `${baseUrl}/dashboard`;
            }

            if (url.startsWith('/')) {
                return `${baseUrl}${url}`;
            }

            if (new URL(url).origin === baseUrl) {
                return url;
            }
            return baseUrl;
        },

        async jwt({ token, user }) {
            if (user) {
                token.user = user as UserType;
            }
            return token;
        },
        async session({ session, token }: {
            session: CustomSession; token: JWT;
        }) {
            session.user = token.user as UserType;
            return session;
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

            httpOptions: {
                timeout: 10000,
            },

            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ],
};