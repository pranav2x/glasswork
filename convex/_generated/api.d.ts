/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyses from "../analyses.js";
import type * as analyzeGitHubRepo from "../analyzeGitHubRepo.js";
import type * as analyzeGoogleDoc from "../analyzeGoogleDoc.js";
import type * as auth from "../auth.js";
import type * as generateSummary from "../generateSummary.js";
import type * as googleApi from "../googleApi.js";
import type * as googleDrive from "../googleDrive.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as scoring from "../scoring.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  analyzeGitHubRepo: typeof analyzeGitHubRepo;
  analyzeGoogleDoc: typeof analyzeGoogleDoc;
  auth: typeof auth;
  generateSummary: typeof generateSummary;
  googleApi: typeof googleApi;
  googleDrive: typeof googleDrive;
  http: typeof http;
  notifications: typeof notifications;
  scoring: typeof scoring;
  users: typeof users;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
