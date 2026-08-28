import Fastify from "fastify";
import cors from "@fastify/cors";
import cookiePlugin from "./plugins/cookies.js";
import { authRoutes } from "./modules/auth/auth.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: process.env.WEB_URL ?? "http://localhost:3000",
  credentials: true,
});

await app.register(cookiePlugin);
await app.register(authRoutes);

app.get("/health", async () => {
  return {
    status: "ok",
  };
});

const port = Number(process.env.API_PORT ?? 4000);

await app.listen({
  port,
  host: "0.0.0.0",
});