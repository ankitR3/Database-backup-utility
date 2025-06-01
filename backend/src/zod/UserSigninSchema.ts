import { z } from "zod";

export const UserSigninSchema = z.object({
    login: z.string().min(3, "Email or username is required"),
    password: z.string().min(1, "Password is required")
});