class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public originalError: Error | null;

    constructor(
        message: string,
        statusCode: number = 500,
        originalError: Error | null = null,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.originalError = originalError;

        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(
        message: string = "Validation failed",
        err: Error | null = null,
    ) {
        super(message, 400, err);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

class NotFoundError extends AppError {
    constructor(
        message: string = "Resource not found",
        err: Error | null = null,
    ) {
        super(message, 404, err);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

class UnauthorizedError extends AppError {
    constructor(
        message: string = "Unauthorized access",
        err: Error | null = null,
    ) {
        super(message, 401, err);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

class ForbiddenError extends AppError {
    constructor(
        message: string = "Forbidden access",
        err: Error | null = null,
    ) {
        super(message, 403, err);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

class ConflictError extends AppError {
    constructor(
        message: string = "Resource conflict",
        err: Error | null = null,
    ) {
        super(message, 409, err);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

class RateLimitError extends AppError {
    constructor(message: string = "Rate limit exceeded") {
        super(message, 429);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

class ServiceUnavailableError extends AppError {
    constructor(message: string = "Service temporarily unavailable") {
        super(message, 503);
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}

class QueueTimeoutError extends AppError {
    constructor(message: string = "504 Gateway Timeout") {
        super(message, 504);
        Object.setPrototypeOf(this, QueueTimeoutError.prototype);
    }
}

export {
    AppError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    RateLimitError,
    ServiceUnavailableError,
    QueueTimeoutError,
};
