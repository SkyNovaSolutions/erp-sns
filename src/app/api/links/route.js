import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/links - List company links
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const category = searchParams.get('category');

        const where = {};
        if (companyId) where.companyId = companyId;
        if (category) where.category = category;

        const links = await prisma.companyLink.findMany({
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

        return successResponse({ links });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/links - Create a new link
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { companyId, title, url, category = 'other', notes } = await request.json();

        if (!companyId || !title || !url) {
            return errorResponse('Company, title, and URL are required', 400);
        }

        const validCategories = ['website', 'social', 'document', 'other'];
        if (!validCategories.includes(category)) {
            return errorResponse(`Category must be one of: ${validCategories.join(', ')}`, 400);
        }

        // Verify company exists
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return errorResponse('Company not found', 404);
        }

        const link = await prisma.companyLink.create({
            data: {
                companyId,
                title,
                url,
                category,
                notes,
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

        return successResponse({ link }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
