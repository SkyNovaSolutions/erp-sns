import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/transactions/[id] - Get transaction details
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const transaction = await prisma.moneyTransaction.findUnique({
            where: { id },
            include: {
                company: true,
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!transaction) {
            return errorResponse('Transaction not found', 404);
        }

        return successResponse({ transaction });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/transactions/[id] - Update transaction (except amount)
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { description, orderNumber, type } = await request.json();

        // Only allow updating description, orderNumber, and type (not amount)
        const updateData = {};
        if (description !== undefined) updateData.description = description;
        if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
        if (type !== undefined) {
            if (!['credit', 'debit'].includes(type)) {
                return errorResponse('Type must be credit or debit', 400);
            }
            updateData.type = type;
        }

        const transaction = await prisma.moneyTransaction.update({
            where: { id },
            data: updateData,
            include: {
                company: {
                    select: { id: true, name: true, balance: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ transaction });
    } catch (error) {
        return handleApiError(error);
    }
}
