# @perkos/util-errors

Error handling utilities and classes for vendor services with Zod integration.

## Installation

```bash
npm install @perkos/util-errors
```

## Usage

```typescript
import {
  AppError,
  ValidationError,
  PaymentError,
  formatErrorResponse,
  getErrorStatusCode,
} from "@perkos/util-errors";
import { z } from "zod";

// Throw application errors with context
throw new AppError("Something went wrong", 500, true, { userId: "123" });

// Throw validation errors
throw new ValidationError("Invalid input", [{ field: "email", message: "Required" }]);

// Create from Zod errors
try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    throw ValidationError.fromZodError(error);
  }
}

// Payment errors for x402
throw new PaymentError("Payment failed", "Insufficient funds");

// Format errors for API response
const response = formatErrorResponse(error);
const statusCode = getErrorStatusCode(error);
```

## Error Classes

### `AppError`
Base error class with HTTP status code and context.

```typescript
new AppError(message, statusCode?, isOperational?, context?)
```

### `ValidationError`
For request validation failures with Zod integration.

```typescript
new ValidationError(message?, details?)
ValidationError.fromZodError(zodError)
```

### `PaymentError`
For x402 payment-related failures.

```typescript
new PaymentError(message, reason?, transactionHash?, context?)
```

### Other Errors
- `NotFoundError` (404)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `RateLimitError` (429)
- `ServiceUnavailableError` (503)

## Utilities

### `formatErrorResponse(error)`
Format any error for API response.

### `getErrorStatusCode(error)`
Get HTTP status code from any error.

### `isOperationalError(error)`
Check if error is operational (expected) vs programming error.

### `createErrorHandler(options?)`
Create error handler middleware.

## License

MIT
