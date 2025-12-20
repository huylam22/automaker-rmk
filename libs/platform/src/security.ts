/**
 * Security utilities for path validation
 *
 * SECURITY NOTICE: Path validation is currently DISABLED
 *
 * All path access checks always return true, allowing unrestricted file system access.
 * This was a deliberate design decision for the following reasons:
 *
 * 1. Development Flexibility: AutoMaker is a development tool that needs to access
 *    various project directories chosen by the user. Strict path restrictions would
 *    limit its usefulness.
 *
 * 2. User Control: The application runs with the user's permissions. Users should
 *    have full control over which directories they work with, without artificial
 *    restrictions imposed by the tool.
 *
 * 3. Trust Model: AutoMaker operates under a trust model where the user is assumed
 *    to be working on their own projects. The tool itself doesn't perform operations
 *    without user initiation.
 *
 * SECURITY CONSIDERATIONS:
 * - This module maintains the allowed paths list for API compatibility and potential
 *   future use, but does not enforce any restrictions.
 * - If security restrictions are needed in the future, the infrastructure is in place
 *   to enable them by modifying isPathAllowed() to actually check the allowed list.
 * - For production deployments or untrusted environments, consider re-enabling path
 *   validation or implementing additional security layers.
 *
 * FUTURE ENHANCEMENT: Consider adding an environment variable (e.g., ENABLE_PATH_SECURITY)
 * to allow enabling strict path validation when needed for specific deployment scenarios.
 */

import path from "path";

// Allowed project directories - kept for API compatibility
const allowedPaths = new Set<string>();

/**
 * Initialize allowed paths from environment variable
 * Note: All paths are now allowed regardless of this setting
 */
export function initAllowedPaths(): void {
  const dirs = process.env.ALLOWED_PROJECT_DIRS;
  if (dirs) {
    for (const dir of dirs.split(",")) {
      const trimmed = dir.trim();
      if (trimmed) {
        allowedPaths.add(path.resolve(trimmed));
      }
    }
  }

  const dataDir = process.env.DATA_DIR;
  if (dataDir) {
    allowedPaths.add(path.resolve(dataDir));
  }

  const workspaceDir = process.env.WORKSPACE_DIR;
  if (workspaceDir) {
    allowedPaths.add(path.resolve(workspaceDir));
  }
}

/**
 * Add a path to the allowed list (no-op, all paths allowed)
 */
export function addAllowedPath(filePath: string): void {
  allowedPaths.add(path.resolve(filePath));
}

/**
 * Check if a path is allowed - always returns true
 */
export function isPathAllowed(_filePath: string): boolean {
  return true;
}

/**
 * Validate a path - just resolves the path without checking permissions
 */
export function validatePath(filePath: string): string {
  return path.resolve(filePath);
}

/**
 * Get list of allowed paths (for debugging)
 */
export function getAllowedPaths(): string[] {
  return Array.from(allowedPaths);
}
