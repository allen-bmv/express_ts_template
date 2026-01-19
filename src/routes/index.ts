import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get(
    "/healthz",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json("ok");
        } catch (error) {
            next(error);
        }
    }
);

export default router;
