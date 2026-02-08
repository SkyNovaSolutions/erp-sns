import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, getSession } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

export async function POST(request, { params }) {
    try {
        const { action } = await params;
        const body = await request.json();

        switch (action) {
            case 'register': {
                const { name, email, password } = body;

                if (!name || !email || !password) {
                    return errorResponse('Name, email and password are required', 400);
                }

                const hashedPassword = await hashPassword(password);

                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                    },
                    select: { id: true, name: true, email: true, role: true },
                });

                await createSession(user.id);

                return successResponse({ user, message: 'Registered successfully' }, 201);
            }

            case 'login': {
                const { email, password } = body;

                if (!email || !password) {
                    return errorResponse('Email and password are required', 400);
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    return errorResponse('Invalid credentials', 401);
                }

                const isValid = await verifyPassword(password, user.password);

                if (!isValid) {
                    return errorResponse('Invalid credentials', 401);
                }

                await createSession(user.id);

                return successResponse({
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    message: 'Logged in successfully',
                });
            }

            case 'logout': {
                await destroySession();
                return successResponse({ message: 'Logged out successfully' });
            }

            default:
                return errorResponse('Invalid action', 400);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request, { params }) {
    try {
        const { action } = await params;

        if (action === 'session') {
            const session = await getSession();

            if (!session) {
                return errorResponse('Not authenticated', 401);
            }

            return successResponse({ user: session });
        }

        return errorResponse('Invalid action', 400);
    } catch (error) {
        return handleApiError(error);
    }
}
