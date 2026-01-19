import { Request, Response, NextFunction } from "express";
import { AppError, NotFoundError } from "../utils/error.util";

interface MongooseValidationError extends Error {
    errors: {
        [key: string]: {
            message?: string;
        };
    };
}

interface MongooseCastError extends Error {
    path?: string;
}

interface MongoDuplicateError extends Error {
    code?: number;
    keyValue?: {
        [key: string]: any;
    };
}

interface DefaultError {
    statusCode: number;
    msg: string;
    originalError: string | Error;
}

class ErrorMiddleware {
    static async notFound(
        _req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> {
        next(new NotFoundError(`Route not found : ${_req.url}`));
    }

    static async errorHandlerMiddleware(
        err:
            | Error
            | AppError
            | MongooseValidationError
            | MongooseCastError
            | MongoDuplicateError,
        req: Request,
        res: Response,
        _next: NextFunction,
    ): Promise<void> {
        console.error(`(StackTrace): ${err.stack}`);

        const defaultError: DefaultError = {
            statusCode: (err as AppError).statusCode || 500,
            msg: err.message || "Something went wrong, try again later",
            originalError: (err as AppError).originalError || "Error",
        };

        if (err instanceof AppError) {
            res.status(defaultError.statusCode).json({
                success: false,
                error: true,
                message: defaultError.msg,
                originalError: defaultError.originalError,
                statusCode: defaultError.statusCode,
                timestamp: new Date().toISOString(),
                path: req.originalUrl.replace(/^\/api/, ""),
            });
            return;
        }

        if (err.name === "ValidationError") {
            const validationErr = err as MongooseValidationError;
            defaultError.statusCode = 500;
            defaultError.msg = Object.values(validationErr.errors)
                .map((item) => item?.message)
                .join(",");
        }

        if (err.name === "CastError") {
            const castErr = err as MongooseCastError;
            defaultError.statusCode = 400;
            defaultError.msg = `Resource not found. Invalid: ${castErr.path}`;
        }

        const mongoErr = err as MongoDuplicateError;
        if (mongoErr.code && mongoErr.code === 11000) {
            defaultError.statusCode = 400;
            defaultError.msg = `${Object.keys(
                mongoErr.keyValue || {},
            )} field has to be unique`;
        }

        res.status(defaultError.statusCode).json({
            success: false,
            message: defaultError.msg,
            statusCode: defaultError.statusCode,
            timestamp: new Date().toISOString(),
            path: req.url,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }
}

export default ErrorMiddleware;
