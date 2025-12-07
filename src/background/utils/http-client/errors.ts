/**
 * API error classes for UniSat API
 */

// Remove unused import - ApiError interface not needed

/**
 * Base API error class
 */
export class ApiClientError extends Error {
  public readonly code: number;
  public readonly details?: any;

  constructor(message: string, code = -1, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }

  static fromApiError(error: { message: string; code: number; details?: any }): ApiClientError {
    return new ApiClientError(error.message, error.code, error.details);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, -100, details);
    this.name = 'NetworkError';
  }
}

/**
 * HTTP status errors
 */
export class HttpError extends ApiClientError {
  public readonly status: number;
  public readonly statusText: string;

  constructor(status: number, statusText: string, message?: string) {
    super(message || `HTTP ${status}: ${statusText}`, -200, { status, statusText });
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Request timeout errors
 */
export class TimeoutError extends ApiClientError {
  constructor(timeout: number) {
    super(`Request timeout after ${timeout}ms`, -300, { timeout });
    this.name = 'TimeoutError';
  }
}

/**
 * Response parsing errors
 */
export class ParseError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, -400, details);
    this.name = 'ParseError';
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends ApiClientError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, -500, { retryAfter });
    this.name = 'RateLimitError';
    if (retryAfter !== undefined) {
      this.retryAfter = retryAfter;
    }
  }
}

/**
 * Authentication errors
 */
export class AuthError extends ApiClientError {
  constructor(message: string) {
    super(message, -600);
    this.name = 'AuthError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends ApiClientError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, -700, { field });
    this.name = 'ValidationError';
    if (field !== undefined) {
      this.field = field;
    }
  }
}

/**
 * Service unavailable errors
 */
export class ServiceUnavailableError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, -800, details);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ServiceUnavailableError) return true;
  if (error instanceof HttpError) {
    // Retry on 5xx errors and 429 (rate limit)
    return error.status >= 500 || error.status === 429;
  }
  return false;
}

/**
 * Extract retry delay from error
 */
export function getRetryDelay(error: Error, attempt: number): number {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
}
