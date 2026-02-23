import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Public endpoint for OG share card data
http.route({
  path: "/analysis-og",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const analysisId = url.searchParams.get("id");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    };

    if (!analysisId) {
      return new Response(
        JSON.stringify({ title: "Glasswork Analysis", contributors: [] }),
        { headers: corsHeaders }
      );
    }

    try {
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal,
        { analysisId: analysisId as Id<"analyses"> }
      );

      if (!analysis || analysis.status !== "ready") {
        return new Response(
          JSON.stringify({ title: analysis?.title ?? "Glasswork Analysis", contributors: [] }),
          { headers: corsHeaders }
        );
      }

      const contributors = await ctx.runQuery(
        internal.analyses.getContributorsInternal,
        { analysisId: analysisId as Id<"analyses"> }
      );

      const sorted = [...contributors].sort((a, b) => b.score - a.score);

      return new Response(
        JSON.stringify({
          title: analysis.title,
          sourceType: analysis.sourceType,
          summary: analysis.summary ?? null,
          contributors: sorted.slice(0, 3).map((c) => ({
            name: c.name,
            score: c.score,
            tier: c.tier,
          })),
        }),
        { headers: corsHeaders }
      );
    } catch {
      return new Response(
        JSON.stringify({ title: "Glasswork Analysis", contributors: [] }),
        { headers: corsHeaders }
      );
    }
  }),
});

export default http;
