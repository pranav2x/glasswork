function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or deployment configuration.`
    );
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_CONVEX_URL: requireEnv("NEXT_PUBLIC_CONVEX_URL"),
} as const;
