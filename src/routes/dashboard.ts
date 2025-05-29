import express, { Request, Response} from "express";
import { userAuthMiddleware } from "../middleware/userMiddleware";

const router = express.Router();

router.get("/dashboard", userAuthMiddleware, (req: Request, res: Response): void => {
    const user = req.user;
    res.status(200).json({
        message: "Welcome to the dashboard",
    });
});

export default router;