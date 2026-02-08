import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/links/[id] - Get single link
export async function GET(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;

        const link = await prisma.companyLink.findUnique({
            where: { id },
            include: {
                company: {
                    select: { id: true, name: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!link) {
            return errorResponse('Link not found', 404);
        }

        return successResponse({ link });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/links/[id] - Update link
export async function PUT(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;
        const { title, url, category, notes } = await request.json();

        const existing = await prisma.companyLink.findUnique({
            where: { id },
        });

        if (!existing) {
            return errorResponse('Link not found', 404);
        }

        if (category) {
            const validCategories = ['website', 'social', 'document', 'other'];
            if (!validCategories.includes(category)) {
                return errorResponse(`Category must be one of: ${validCategories.join(', ')}`, 400);
            }
        }

        const link = await prisma.companyLink.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(url && { url }),
                ...(category && { category }),
                ...(notes !== undefined && { notes }),
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

        return successResponse({ link });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/links/[id] - Delete link
export async function DELETE(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;

        const existing = await prisma.companyLink.findUnique({
            where: { id },
        });

        if (!existing) {
            return errorResponse('Link not found', 404);
        }

        await prisma.companyLink.delete({
            where: { id },
        });

        return successResponse({ message: 'Link deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
