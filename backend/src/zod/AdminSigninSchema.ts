import { z } from "zod";

export const AdminSigninSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6)
});