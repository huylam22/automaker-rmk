/**
 * Worktree routes - HTTP API for git worktree operations
 */

import { Router } from "express";
import { createInfoHandler } from "./routes/info.js";
import { createStatusHandler } from "./routes/status.js";
import { createListHandler } from "./routes/list.js";
import { createDiffsHandler } from "./routes/diffs.js";
import { createFileDiffHandler } from "./routes/file-diff.js";
import { createRevertHandler } from "./routes/revert.js";
import { createMergeHandler } from "./routes/merge.js";
import { createCreateHandler } from "./routes/create.js";
import { createDeleteHandler } from "./routes/delete.js";
import { createCreatePRHandler } from "./routes/create-pr.js";
import { createCommitHandler } from "./routes/commit.js";
import { createPushHandler } from "./routes/push.js";
import { createPullHandler } from "./routes/pull.js";
import { createCheckoutBranchHandler } from "./routes/checkout-branch.js";
import { createListBranchesHandler } from "./routes/list-branches.js";
import { createSwitchBranchHandler } from "./routes/switch-branch.js";

export function createWorktreeRoutes(): Router {
  const router = Router();

  router.post("/info", createInfoHandler());
  router.post("/status", createStatusHandler());
  router.post("/list", createListHandler());
  router.post("/diffs", createDiffsHandler());
  router.post("/file-diff", createFileDiffHandler());
  router.post("/revert", createRevertHandler());
  router.post("/merge", createMergeHandler());
  router.post("/create", createCreateHandler());
  router.post("/delete", createDeleteHandler());
  router.post("/create-pr", createCreatePRHandler());
  router.post("/commit", createCommitHandler());
  router.post("/push", createPushHandler());
  router.post("/pull", createPullHandler());
  router.post("/checkout-branch", createCheckoutBranchHandler());
  router.post("/list-branches", createListBranchesHandler());
  router.post("/switch-branch", createSwitchBranchHandler());

  return router;
}
