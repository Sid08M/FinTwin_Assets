import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";
import geminiRouter from "./gemini/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);
router.use("/gemini", geminiRouter);

export default router;
