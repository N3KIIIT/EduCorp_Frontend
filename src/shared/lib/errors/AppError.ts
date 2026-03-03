export abstract class AppError extends Error {
    abstract readonly code: string;
    abstract readonly statusCode: number;

    constructor(
        message: string,
        public readonly details?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
        };
    }
}

export class ValidationError extends AppError {
    readonly code = 'VALIDATION_ERROR';
    readonly statusCode = 400;

    constructor(message: string, details?: Record<string, unknown>) {
        super(message, details);
    }
}


export class AuthorizationError extends AppError {
    readonly code = 'AUTHENTICATION_ERROR';
    readonly statusCode = 401;

    constructor(message: string = 'Требуется авторизация') {
        super(message);
    }
}

export class NotFoundError extends AppError {
    readonly code = 'NOT_FOUND';
    readonly statusCode = 404;

    constructor(resource: string) {
        super(`${resource} NOT FOUND`);
    }
}

export class NetworkError extends AppError {
    readonly code = 'NETWORK_ERROR';
    readonly statusCode = 0;

    constructor(message: string = 'NETWORK ERROR') {
        super(message);
    }
}

export class ServerError extends AppError {
    readonly code = 'SERVER_ERROR';
    readonly statusCode = 500;

    constructor(message: string = 'SERVER ERROR') {
        super(message);
    }
}
