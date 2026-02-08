import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/companies - List all companies
export async function GET() {
    try {
        await requireAuth();

        const companies = await prisma.company.findMany({
            include: {
                _count: {
                    select: { employees: true, orders: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ companies });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/companies - Create a new company
export async function POST(request) {
    try {
        await requireAuth();

        const { name, balance = 0 } = await request.json();

        if (!name) {
            return errorResponse('Company name is required', 400);
        }

        const company = await prisma.company.create({
            data: {
                name,
                balance: parseFloat(balance),
            },
        });

        return successResponse({ company }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
