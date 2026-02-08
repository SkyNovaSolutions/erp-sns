import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/orders/[id] - Get order details
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                company: true,
            },
        });

        if (!order) {
            return errorResponse('Order not found', 404);
        }

        return successResponse({ order });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/orders/[id] - Update order
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { title, description, status } = await request.json();

        const validStatuses = ['active', 'on_hold', 'in_meeting', 'completed'];

        if (status && !validStatuses.includes(status)) {
            return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                company: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ order });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        await prisma.order.delete({
            where: { id },
        });

        return successResponse({ message: 'Order deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
