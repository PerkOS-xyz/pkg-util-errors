import { ZodError } from 'zod';

/**
 * @perkos/error-handling
 * Error handling utilities and classes for vendor services
 */

/**
 * Base application error class
 * Extends Error with HTTP status code and context
 */
declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly context?: Record<string, any>;
    constructor(message: string, statusCode?: number, isOperational?: boolean, context?: Record<string, any>);
    toJSON(): {
        error: string;
        statusCode: number;
        context: Record<string, any> | undefined;
    };
}
/**
 * Validation error class
 * For request validation failures with Zod integration
 */
declare class ValidationError extends AppError {
    readonly details?: any;
    constructor(message?: string, details?: any);
    /**
     * Create ValidationError from ZodError
     */
    static fromZodError(error: ZodError): ValidationError;
    toJSON(): {
        error: string;
        details: any;
        statusCode: number;
        context: Record<string, any> | undefined;
    };
}
/**
 * Payment error class
 * For x402 payment-related failures
 */
declare class PaymentError extends AppError {
    readonly reason?: string;
    readonly transactionHash?: string;
    constructor(message: string, reason?: string, transactionHash?: string, context?: Record<string, any>);
    toJSON(): {
        error: string;
        reason: string | undefined;
        transactionHash: string | undefined;
        statusCode: number;
        context: Record<string, any> | undefined;
    };
}
/**
 * Not found error class
 */
declare class NotFoundError extends AppError {
    constructor(message?: string, context?: Record<string, any>);
}
/**
 * Unauthorized error class
 */
declare class UnauthorizedError extends AppError {
    constructor(message?: string, context?: Record<string, any>);
}
/**
 * Forbidden error class
 */
declare class ForbiddenError extends AppError {
    constructor(message?: string, context?: Record<string, any>);
}
/**
 * Rate limit error class
 */
declare class RateLimitError extends AppError {
    readonly retryAfter?: number;
    constructor(message?: string, retryAfter?: number, context?: Record<string, any>);
    toJSON(): {
        error: string;
        retryAfter: number | undefined;
        statusCode: number;
        context: Record<string, any> | undefined;
    };
}
/**
 * Service unavailable error class
 */
declare class ServiceUnavailableError extends AppError {
    constructor(message?: string, context?: Record<string, any>);
}
/**
 * Check if error is operational (expected) or programming error
 */
declare function isOperationalError(error: Error): boolean;
/**
 * Error response formatter for API responses
 */
interface ErrorResponse {
    error: string;
    message?: string;
    details?: any;
    statusCode: number;
}
/**
 * Format error for API response
 */
declare function formatErrorResponse(error: unknown): ErrorResponse;
/**
 * Get HTTP status code from error
 */
declare function getErrorStatusCode(error: unknown): number;
/**
 * Create error handler middleware (framework-agnostic)
 */
declare function createErrorHandler(options?: {
    logger?: (error: Error, context?: Record<string, any>) => void;
    includeStack?: boolean;
}): (error: unknown) => {
    response: ErrorResponse;
    statusCode: number;
};

export { AppError, type ErrorResponse, ForbiddenError, NotFoundError, PaymentError, RateLimitError, ServiceUnavailableError, UnauthorizedError, ValidationError, createErrorHandler, formatErrorResponse, getErrorStatusCode, isOperationalError };
