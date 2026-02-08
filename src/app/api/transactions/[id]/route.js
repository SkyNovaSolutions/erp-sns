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
