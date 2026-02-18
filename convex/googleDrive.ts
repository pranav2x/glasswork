"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { googleFetch } from "./googleApi";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export const listRecentDocs = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getUserInternal as any, {
      userId,
    });
    if (!user?.googleAccessToken) {
      throw new Error(
        "No Google access token found. Please re-authenticate with Google."
      );
    }

    const params = new URLSearchParams({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      orderBy: "modifiedTime desc",
      pageSize: "20",
      fields: "files(id,name,modifiedTime)",
    });

    const res = await googleFetch(
      ctx,
      userId,
      user,
      `https://www.googleapis.com/drive/v3/files?${params}`
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Drive API error: ${res.status} ${err}`);
    }

    const data: { files: DriveFile[] } = await res.json();

    return (data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime,
    }));
  },
});
