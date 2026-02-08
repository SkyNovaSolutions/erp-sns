import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/orders - List all orders
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const status = searchParams.get('status');

        const where = {};
        if (companyId) where.companyId = companyId;
        if (status) where.status = status;

        const orders = await prisma.order.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ orders });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/orders - Create a new order
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { title, description, status = 'active', companyId } = await request.json();

        if (!title || !companyId) {
            return errorResponse('Title and company are required', 400);
        }

        const validStatuses = ['active', 'on_hold', 'in_meeting', 'completed'];
        if (!validStatuses.includes(status)) {
            return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Verify company exists
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return errorResponse('Company not found', 404);
        }

        const order = await prisma.order.create({
            data: {
                title,
                description,
                status,
                companyId,
                createdById: session.id,
            },
            include: {
                company: {
                    select: { id: true, name: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ order }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
