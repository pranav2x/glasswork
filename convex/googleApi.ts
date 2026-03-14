"use node";

import { GenericActionCtx } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import type { DataModel } from "./_generated/dataModel";

export interface GoogleUser {
  googleAccessToken?: string;
  googleRefreshToken?: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured on server");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Failed to refresh Google token: ${res.status} ${err}. Please re-authenticate with Google.`
    );
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Fetches from a Google API endpoint with automatic token refresh on 401.
 * Returns the Response object for the caller to parse.
 */
export async function googleFetch(
  ctx: GenericActionCtx<DataModel>,
  userId: Id<"users">,
  user: GoogleUser,
  url: string,
  init?: RequestInit
): Promise<Response> {
  if (!user.googleAccessToken) {
    throw new Error(
      "No Google access token found. Please re-authenticate with Google."
    );
  }

  const headers = {
    ...((init?.headers as Record<string, string>) ?? {}),
    Authorization: `Bearer ${user.googleAccessToken}`,
  };

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && user.googleRefreshToken) {
    const newToken = await refreshAccessToken(user.googleRefreshToken);
    await ctx.runMutation(internal.users.updateGoogleToken as any, {
      userId,
      googleAccessToken: newToken,
    });
    headers.Authorization = `Bearer ${newToken}`;
    res = await fetch(url, { ...init, headers });
  }

  return res;
}
