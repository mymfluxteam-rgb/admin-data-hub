import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import authRouter from "./routes/auth";
import { logger } from "./lib/logger";
import { requireAuth } from "./middlewares/requireAuth";

const app = express();
app.use(pinoHttp({
    logger,
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url?.split("?")[0],
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

const PUBLIC_API_PATHS = [
    /^\/api\/v1\/verify/,
    /^\/api\/v1\/public/,
    /^\/api\/health/,
];

app.use("/api", (req, res, next) => {
    const isPublic = PUBLIC_API_PATHS.some((pattern) => pattern.test(req.path));
    if (isPublic) return next();
    requireAuth(req, res, next);
});

app.use("/api", router);
export default app;
