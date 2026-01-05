"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AppError: () => AppError,
  ForbiddenError: () => ForbiddenError,
  NotFoundError: () => NotFoundError,
  PaymentError: () => PaymentError,
  RateLimitError: () => RateLimitError,
  ServiceUnavailableError: () => ServiceUnavailableError,
  UnauthorizedError: () => UnauthorizedError,
  ValidationError: () => ValidationError,
  createErrorHandler: () => createErrorHandler,
  formatErrorResponse: () => formatErrorResponse,
  getErrorStatusCode: () => getErrorStatusCode,
  isOperationalError: () => isOperationalError
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var AppError = class extends Error {
  constructor(message, statusCode = 500, isOperational = true, context) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    Error.captureStackTrace(this);
  }
  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      context: this.context
    };
  }
};
var ValidationError = class _ValidationError extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, 400, true, { details });
    this.details = details;
  }
  /**
   * Create ValidationError from ZodError
   */
  static fromZodError(error) {
    const details = error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
      code: e.code
    }));
    return new _ValidationError("Validation error", details);
  }
  toJSON() {
    return {
      error: this.message,
      details: this.details,
      statusCode: this.statusCode,
      context: this.context
    };
  }
};
var PaymentError = class extends AppError {
  constructor(message, reason, transactionHash, context) {
    super(message, 402, true, context);
    this.reason = reason;
    this.transactionHash = transactionHash;
  }
  toJSON() {
    return {
      error: this.message,
      reason: this.reason,
      transactionHash: this.transactionHash,
      statusCode: this.statusCode,
      context: this.context
    };
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found", context) {
    super(message, 404, true, context);
  }
};
var UnauthorizedError = class extends AppError {
  constructor(message = "Unauthorized", context) {
    super(message, 401, true, context);
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Forbidden", context) {
    super(message, 403, true, context);
  }
};
var RateLimitError = class extends AppError {
  constructor(message = "Rate limit exceeded", retryAfter, context) {
    super(message, 429, true, context);
    this.retryAfter = retryAfter;
  }
  toJSON() {
    return {
      error: this.message,
      retryAfter: this.retryAfter,
      statusCode: this.statusCode,
      context: this.context
    };
  }
};
var ServiceUnavailableError = class extends AppError {
  constructor(message = "Service unavailable", context) {
    super(message, 503, true, context);
  }
};
function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
function formatErrorResponse(error) {
  if (error instanceof import_zod.ZodError) {
    const validationError = ValidationError.fromZodError(error);
    return validationError.toJSON();
  }
  if (error instanceof AppError) {
    return error.toJSON();
  }
  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500
    };
  }
  return {
    error: "Unknown error",
    statusCode: 500
  };
}
function getErrorStatusCode(error) {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  if (error instanceof import_zod.ZodError) {
    return 400;
  }
  return 500;
}
function createErrorHandler(options) {
  return (error) => {
    const response = formatErrorResponse(error);
    const statusCode = getErrorStatusCode(error);
    if (options?.logger && error instanceof Error) {
      options.logger(error, { statusCode });
    }
    if (options?.includeStack && error instanceof Error) {
      response.stack = error.stack;
    }
    return { response, statusCode };
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppError,
  ForbiddenError,
  NotFoundError,
  PaymentError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
  createErrorHandler,
  formatErrorResponse,
  getErrorStatusCode,
  isOperationalError
});
//# sourceMappingURL=index.js.map