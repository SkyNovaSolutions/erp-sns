import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse } from '@/lib/api-error';

// GET /api/users - List all admin users
export async function GET() {
    try {
        await requireAuth();

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: { name: 'asc' },
        });

        return successResponse({ users });
    } catch (error) {
        return handleApiError(error);
    }
}
