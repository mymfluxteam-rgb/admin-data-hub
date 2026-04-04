import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import transactionsRouter from "./transactions";
import hwidsRouter from "./hwids";
import auditLogsRouter from "./auditLogs";
import metricsRouter from "./metrics";
import chartDataRouter from "./chartData";
import registerRouter from "./register";
import sessionsRouter from "./sessions";
import externalRouter from "./external";
import apiKeysRouter from "./apiKeys";
import apiKeyTemplatesRouter from "./apiKeyTemplates";
import settingsRouter from "./settings";
import adminUsersRouter from "./adminUsers";
import userApiKeysRouter from "./userApiKeys";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/register", registerRouter);
router.use("/users", usersRouter);
router.use("/transactions", transactionsRouter);
router.use("/hwids", hwidsRouter);
router.use("/sessions", sessionsRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/metrics", metricsRouter);
router.use("/chart-data", chartDataRouter);
router.use("/v1/external", externalRouter);
router.use("/api-keys", apiKeysRouter);
router.use("/api-key-templates", apiKeyTemplatesRouter);
router.use("/settings", settingsRouter);
router.use("/admin-users", adminUsersRouter);
router.use("/user-api-keys", userApiKeysRouter);

export default router;
