/**
 * POST /list endpoint - List all worktrees
 */

import type { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { isGitRepo, getErrorMessage, logError } from "../common.js";

const execAsync = promisify(exec);

interface WorktreeInfo {
  path: string;
  branch: string;
  isMain: boolean;
  hasChanges?: boolean;
  changedFilesCount?: number;
}

export function createListHandler() {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, includeDetails } = req.body as {
        projectPath: string;
        includeDetails?: boolean;
      };

      if (!projectPath) {
        res.status(400).json({ success: false, error: "projectPath required" });
        return;
      }

      if (!(await isGitRepo(projectPath))) {
        res.json({ success: true, worktrees: [] });
        return;
      }

      const { stdout } = await execAsync("git worktree list --porcelain", {
        cwd: projectPath,
      });

      const worktrees: WorktreeInfo[] = [];
      const lines = stdout.split("\n");
      let current: { path?: string; branch?: string } = {};
      let isFirst = true;

      for (const line of lines) {
        if (line.startsWith("worktree ")) {
          current.path = line.slice(9);
        } else if (line.startsWith("branch ")) {
          current.branch = line.slice(7).replace("refs/heads/", "");
        } else if (line === "") {
          if (current.path && current.branch) {
            // The first worktree in the list is always the main worktree
            worktrees.push({
              path: current.path,
              branch: current.branch,
              isMain: isFirst
            });
            isFirst = false;
          }
          current = {};
        }
      }

      // If includeDetails is requested, fetch change status for each worktree
      if (includeDetails) {
        for (const worktree of worktrees) {
          try {
            const { stdout: statusOutput } = await execAsync(
              "git status --porcelain",
              { cwd: worktree.path }
            );
            const changedFiles = statusOutput.trim().split("\n").filter(line => line.trim());
            worktree.hasChanges = changedFiles.length > 0;
            worktree.changedFilesCount = changedFiles.length;
          } catch {
            // If we can't get status, assume no changes
            worktree.hasChanges = false;
            worktree.changedFilesCount = 0;
          }
        }
      }

      res.json({ success: true, worktrees });
    } catch (error) {
      logError(error, "List worktrees failed");
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
