/**
 * @perkos/error-handling
 * Error handling utilities and classes for vendor services
 */

import { ZodError } from "zod";

/**
 * Base application error class
 * Extends Error with HTTP status code and context
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
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
      context: this.context,
    };
  }
}

/**
 * Validation error class
 * For request validation failures with Zod integration
 */
export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string = "Validation failed", details?: any) {
    super(message, 400, true, { details });
    this.details = details;
  }

  /**
   * Create ValidationError from ZodError
   */
  static fromZodError(error: ZodError): ValidationError {
    const details = error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
      code: e.code,
    }));
    return new ValidationError("Validation error", details);
  }

  toJSON() {
    return {
      error: this.message,
      details: this.details,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Payment error class
 * For x402 payment-related failures
 */
export class PaymentError extends AppError {
  public readonly reason?: string;
  public readonly transactionHash?: string;

  constructor(
    message: string,
    reason?: string,
    transactionHash?: string,
    context?: Record<string, any>
  ) {
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
      context: this.context,
    };
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", context?: Record<string, any>) {
    super(message, 404, true, context);
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, 429, true, context);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: this.message,
      retryAfter: this.retryAfter,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Service unavailable error class
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service unavailable", context?: Record<string, any>) {
    super(message, 503, true, context);
  }
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Error response formatter for API responses
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  statusCode: number;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    const validationError = ValidationError.fromZodError(error);
    return validationError.toJSON() as ErrorResponse;
  }

  if (error instanceof AppError) {
    return error.toJSON() as ErrorResponse;
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: "Unknown error",
    statusCode: 500,
  };
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  if (error instanceof ZodError) {
    return 400;
  }
  return 500;
}

/**
 * Create error handler middleware (framework-agnostic)
 */
export function createErrorHandler(options?: {
  logger?: (error: Error, context?: Record<string, any>) => void;
  includeStack?: boolean;
}) {
  return (error: unknown) => {
    const response = formatErrorResponse(error);
    const statusCode = getErrorStatusCode(error);

    if (options?.logger && error instanceof Error) {
      options.logger(error, { statusCode });
    }

    if (options?.includeStack && error instanceof Error) {
      (response as any).stack = error.stack;
    }

    return { response, statusCode };
  };
}
