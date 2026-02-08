import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/companies/[id] - Get company details
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                employees: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!company) {
            return errorResponse('Company not found', 404);
        }

        return successResponse({ company });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/companies/[id] - Update company
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { name, balance } = await request.json();

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (balance !== undefined) updateData.balance = parseFloat(balance);

        const company = await prisma.company.update({
            where: { id },
            data: updateData,
        });

        return successResponse({ company });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        await prisma.company.delete({
            where: { id },
        });

        return successResponse({ message: 'Company deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
