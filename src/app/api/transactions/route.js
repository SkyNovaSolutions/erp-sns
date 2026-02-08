import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/transactions - List all transactions
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const type = searchParams.get('type');

        const where = {};
        if (companyId) where.companyId = companyId;
        if (type) where.type = type;

        const transactions = await prisma.moneyTransaction.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true, balance: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ transactions });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/transactions - Create a new transaction
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { amount, type, description, companyId } = await request.json();

        if (!amount || !type || !companyId) {
            return errorResponse('Amount, type and company are required', 400);
        }

        if (!['credit', 'debit'].includes(type)) {
            return errorResponse('Type must be credit or debit', 400);
        }

        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return errorResponse('Amount must be a positive number', 400);
        }

        // Get current company balance
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return errorResponse('Company not found', 404);
        }

        // Calculate new balance
        const balanceChange = type === 'credit' ? parsedAmount : -parsedAmount;
        const newBalance = company.balance + balanceChange;

        // Check if debit would result in negative balance
        if (newBalance < 0) {
            return errorResponse('Insufficient balance for this transaction', 400);
        }

        // Create transaction and update balance in a transaction
        const [transaction] = await prisma.$transaction([
            prisma.moneyTransaction.create({
                data: {
                    amount: parsedAmount,
                    type,
                    description,
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
            }),
            prisma.company.update({
                where: { id: companyId },
                data: { balance: newBalance },
            }),
        ]);

        return successResponse({
            transaction,
            newBalance,
            message: `${type === 'credit' ? 'Credit' : 'Debit'} of ${parsedAmount} recorded successfully`,
        }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
