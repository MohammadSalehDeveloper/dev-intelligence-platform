import fp from "fastify-plugin";
import cookie from "@fastify/cookie";;
import type { FastifyInstance } from "fastify";

export default fp(async function cookiePlugin(app: FastifyInstance){
    const secret = process.env.COOKIE_SECRET;

    if(!secret || secret.length < 32){
            throw new Error("COOKIE_SECRET must be at least 32 characters long.");
    }

    await app.register(cookie,{
        secret,
        hook: "onRequest",
    });
});