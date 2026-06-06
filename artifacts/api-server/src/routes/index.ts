import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import universitiesRouter from "./universities.js";
import applicationsRouter from "./applications.js";
import paymentsRouter from "./payments.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(universitiesRouter);
router.use(applicationsRouter);
router.use(paymentsRouter);

export default router;
