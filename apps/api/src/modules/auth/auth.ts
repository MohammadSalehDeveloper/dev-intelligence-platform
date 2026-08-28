import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { redis } from "../../lib/redis.js";

// TODO: این import را مطابق package دیتابیس خودت تنظیم کن
// مثال‌های ممکن:
// import { prisma } from "@dev-intelligence/database";
// import { prisma } from "database";
import { prisma } from "@dev-intelligence/database";

type GitHubTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  avatar_url: string | null;
  name: string | null;
  email: string | null;
};

const SESSION_COOKIE_NAME = "dip_sid";
const OAUTH_STATE_COOKIE_NAME = "dip_oauth_state";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/github", async (_request, reply) => {
    const clientId = getRequiredEnv("GITHUB_CLIENT_ID");
    const callbackUrl = getRequiredEnv("GITHUB_CALLBACK_URL");

    const state = createRandomToken();

    reply.setCookie(OAUTH_STATE_COOKIE_NAME, state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      signed: true,
      maxAge: 60 * 10, // 10 minutes
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user user:email repo",
      state,
    });

    return reply.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  });

  app.get("/auth/github/callback", async (request, reply) => {
    const webUrl = getRequiredEnv("WEB_URL");
    const clientId = getRequiredEnv("GITHUB_CLIENT_ID");
    const clientSecret = getRequiredEnv("GITHUB_CLIENT_SECRET");
    const callbackUrl = getRequiredEnv("GITHUB_CALLBACK_URL");

    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
    };

    if (query.error) {
      return reply.redirect(`${webUrl}/login?error=github_oauth_denied`);
    }

    if (!query.code || !query.state) {
      return reply.code(400).send({
        message: "Missing GitHub OAuth code or state.",
      });
    }

    const signedState = request.unsignCookie(request.cookies[OAUTH_STATE_COOKIE_NAME] ?? "");

    if (!signedState.valid || signedState.value !== query.state) {
      return reply.code(400).send({
        message: "Invalid OAuth state.",
      });
    }

    reply.clearCookie(OAUTH_STATE_COOKIE_NAME, {
      path: "/",
    });

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: query.code,
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenResponse.ok) {
      app.log.error({ status: tokenResponse.status }, "GitHub token exchange failed");

      return reply.code(502).send({
        message: "Failed to exchange GitHub OAuth code.",
      });
    }

    const tokenJson = (await tokenResponse.json()) as GitHubTokenResponse;

    if (!tokenJson.access_token) {
      app.log.error({ tokenJson }, "GitHub did not return an access token");

      return reply.code(502).send({
        message: tokenJson.error_description ?? "GitHub did not return access token.",
      });
    }

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "dev-intelligence-platform",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!githubUserResponse.ok) {
      app.log.error(
        { status: githubUserResponse.status },
        "Failed to fetch GitHub user"
      );

      return reply.code(502).send({
        message: "Failed to fetch GitHub user.",
      });
    }

    const githubUser = (await githubUserResponse.json()) as GitHubUserResponse;

    const user = await prisma.user.upsert({
      where: {
        githubId: githubUser.id,
      },
      create: {
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        displayName: githubUser.name,
        accessToken: tokenJson.access_token,
      },
      update: {
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        displayName: githubUser.name,
        accessToken: tokenJson.access_token,
      },
    });

    const sessionId = createRandomToken();

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user.id,
      }),
      "EX",
      SESSION_TTL_SECONDS
    );

    reply.setCookie(SESSION_COOKIE_NAME, sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      signed: true,
      maxAge: SESSION_TTL_SECONDS,
    });

    return reply.redirect(`${webUrl}/dashboard`);
  });

  app.get("/auth/me", async (request, reply) => {
    const rawSessionCookie = request.cookies[SESSION_COOKIE_NAME];

    if (!rawSessionCookie) {
      return reply.code(401).send({
        authenticated: false,
        user: null,
      });
    }

    const signedSession = request.unsignCookie(rawSessionCookie);

    if (!signedSession.valid || !signedSession.value) {
      return reply.code(401).send({
        authenticated: false,
        user: null,
      });
    }

    const sessionJson = await redis.get(`session:${signedSession.value}`);

    if (!sessionJson) {
      return reply.code(401).send({
        authenticated: false,
        user: null,
      });
    }

    const session = JSON.parse(sessionJson) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        githubId: true,
        username: true,
        email: true,
        avatarUrl: true,
        displayName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.code(401).send({
        authenticated: false,
        user: null,
      });
    }

    return reply.send({
      authenticated: true,
      user,
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    const rawSessionCookie = request.cookies[SESSION_COOKIE_NAME];

    if (rawSessionCookie) {
      const signedSession = request.unsignCookie(rawSessionCookie);

      if (signedSession.valid && signedSession.value) {
        await redis.del(`session:${signedSession.value}`);
      }
    }

    reply.clearCookie(SESSION_COOKIE_NAME, {
      path: "/",
    });

    return reply.send({
      success: true,
    });
  });
}