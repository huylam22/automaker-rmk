/**
 * POST /switch-branch endpoint - Switch to an existing branch
 * Automatically stashes uncommitted changes and pops them after switching
 */

import type { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { getErrorMessage, logError } from "../common.js";

const execAsync = promisify(exec);

export function createSwitchBranchHandler() {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { worktreePath, branchName } = req.body as {
        worktreePath: string;
        branchName: string;
      };

      if (!worktreePath) {
        res.status(400).json({
          success: false,
          error: "worktreePath required",
        });
        return;
      }

      if (!branchName) {
        res.status(400).json({
          success: false,
          error: "branchName required",
        });
        return;
      }

      // Get current branch for reference
      const { stdout: currentBranchOutput } = await execAsync(
        "git rev-parse --abbrev-ref HEAD",
        { cwd: worktreePath }
      );
      const previousBranch = currentBranchOutput.trim();

      if (previousBranch === branchName) {
        res.json({
          success: true,
          result: {
            previousBranch,
            currentBranch: branchName,
            message: `Already on branch '${branchName}'`,
            stashed: false,
          },
        });
        return;
      }

      // Check if branch exists
      try {
        await execAsync(`git rev-parse --verify ${branchName}`, {
          cwd: worktreePath,
        });
      } catch {
        res.status(400).json({
          success: false,
          error: `Branch '${branchName}' does not exist`,
        });
        return;
      }

      // Check for uncommitted changes
      const { stdout: statusOutput } = await execAsync(
        "git status --porcelain",
        { cwd: worktreePath }
      );

      const hasChanges = statusOutput.trim().length > 0;
      let stashed = false;

      // Stash changes if there are any
      if (hasChanges) {
        await execAsync("git stash push -m \"auto-stash before branch switch\"", {
          cwd: worktreePath,
        });
        stashed = true;
      }

      try {
        // Switch to the branch
        await execAsync(`git checkout ${branchName}`, {
          cwd: worktreePath,
        });

        // Pop the stash if we stashed changes
        if (stashed) {
          try {
            await execAsync("git stash pop", {
              cwd: worktreePath,
            });
          } catch (stashPopError) {
            // Stash pop might fail due to conflicts
            const err = stashPopError as { stderr?: string; message?: string };
            const errorMsg = err.stderr || err.message || "";

            if (errorMsg.includes("CONFLICT") || errorMsg.includes("conflict")) {
              res.json({
                success: true,
                result: {
                  previousBranch,
                  currentBranch: branchName,
                  message: `Switched to '${branchName}' but stash had conflicts. Please resolve manually.`,
                  stashed: true,
                  stashConflict: true,
                },
              });
              return;
            }
            // Re-throw if it's not a conflict error
            throw stashPopError;
          }
        }

        const message = stashed
          ? `Switched to branch '${branchName}' (changes stashed and restored)`
          : `Switched to branch '${branchName}'`;

        res.json({
          success: true,
          result: {
            previousBranch,
            currentBranch: branchName,
            message,
            stashed,
          },
        });
      } catch (checkoutError) {
        // If checkout fails and we stashed, try to restore the stash
        if (stashed) {
          try {
            await execAsync("git stash pop", { cwd: worktreePath });
          } catch {
            // Ignore stash pop errors during recovery
          }
        }
        throw checkoutError;
      }
    } catch (error) {
      logError(error, "Switch branch failed");
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
