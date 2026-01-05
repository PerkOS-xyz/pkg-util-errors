// src/index.ts
import { ZodError } from "zod";
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
  if (error instanceof ZodError) {
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
  if (error instanceof ZodError) {
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
export {
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
};
//# sourceMappingURL=index.mjs.map