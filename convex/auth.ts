import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
      profile(googleProfile, tokens) {
        return {
          id: googleProfile.sub,
          name: googleProfile.name,
          email: googleProfile.email,
          image: googleProfile.picture,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.type === "oauth") {
        const patch: Record<string, unknown> = {};
        if (args.profile.googleAccessToken) {
          patch.googleAccessToken = args.profile.googleAccessToken;
        }
        if (args.profile.googleRefreshToken) {
          patch.googleRefreshToken = args.profile.googleRefreshToken;
        }
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(args.userId, patch);
        }
      }
    },
  },
});
