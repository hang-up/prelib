import bcrypt from "bcryptjs";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { backendConfig } from "../lib/config";
import { getDatabase } from "../lib/db";

export type AuthUser = {
  id: number;
  username: string;
};

export type AppBindings = {
  Variables: {
    authUser: AuthUser;
  };
};

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
};

const toAuthUser = (row: Pick<UserRow, "id" | "username">): AuthUser => ({
  id: row.id,
  username: row.username,
});

const findUserByIdStatement = () =>
  getDatabase().prepare(
    "SELECT id, username, password_hash FROM users WHERE id = ?",
  );

const findUserByUsernameStatement = () =>
  getDatabase().prepare(
    "SELECT id, username, password_hash FROM users WHERE username = ?",
  );

export const getCurrentUser = (userId: number): AuthUser | null => {
  const row = findUserByIdStatement().get(userId) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return toAuthUser(row);
};

export const authenticateUser = async (
  username: string,
  password: string,
): Promise<AuthUser | null> => {
  const row = findUserByUsernameStatement().get(username) as UserRow | undefined;

  if (!row) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, row.password_hash);

  if (!isPasswordValid) {
    return null;
  }

  return toAuthUser(row);
};

export const setSessionCookie = (
  headersTarget: Parameters<typeof setCookie>[0],
  userId: number,
) => {
  setCookie(headersTarget, backendConfig.authCookieName, String(userId), {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
  });
};

export const clearSessionCookie = (
  headersTarget: Parameters<typeof deleteCookie>[0],
) => {
  deleteCookie(headersTarget, backendConfig.authCookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
  });
};

export const getSessionUser = () => (c: Context) => {
  const userIdCookie = getCookie(c, backendConfig.authCookieName);
  if (!userIdCookie) {
    return null;
  }

  const userId = Number(userIdCookie);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return getCurrentUser(userId);
};

export const requireAuthenticatedUser: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const currentUser = getSessionUser()(c);

  if (!currentUser) {
    clearSessionCookie(c);
    return c.json({ message: "Authentication required" }, 401);
  }

  c.set("authUser", currentUser);
  await next();
};

export const requireAuth = requireAuthenticatedUser;
