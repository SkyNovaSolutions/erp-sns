export class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

export function handleApiError(error) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return Response.json(
            { error: error.message },
            { status: error.statusCode }
        );
    }

    if (error.code === 'P2002') {
        return Response.json(
            { error: 'A record with this value already exists' },
            { status: 409 }
        );
    }

    if (error.code === 'P2025') {
        return Response.json(
            { error: 'Record not found' },
            { status: 404 }
        );
    }

    return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}

export function successResponse(data, status = 200) {
    return Response.json(data, { status });
}

export function errorResponse(message, status = 400) {
    return Response.json({ error: message }, { status });
}
