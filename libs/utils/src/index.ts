/**
 * @automaker/utils
 * Shared utility functions for AutoMaker
 */

// Error handling
export {
  isAbortError,
  isCancellationError,
  isAuthenticationError,
  classifyError,
  getUserFriendlyErrorMessage,
} from './error-handler.js';

// Conversation utilities
export {
  extractTextFromContent,
  normalizeContentBlocks,
  formatHistoryAsText,
  convertHistoryToMessages,
} from './conversation-utils.js';

// Image handling
export {
  getMimeTypeForImage,
  readImageAsBase64,
  convertImagesToContentBlocks,
  formatImagePathsForPrompt,
} from './image-handler.js';

// Prompt building
export {
  buildPromptWithImages,
  type PromptContent,
  type PromptWithImages,
} from './prompt-builder.js';

// Logger
export {
  createLogger,
  getLogLevel,
  setLogLevel,
  LogLevel,
} from './logger.js';

// File system utilities
export {
  mkdirSafe,
  existsSafe,
} from './fs-utils.js';
