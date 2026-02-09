import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/notes/:id - Get single note
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!note) {
            return errorResponse('Note not found', 404);
        }

        return successResponse({ note });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/notes/:id - Update note
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { title, content, color, isPinned } = await request.json();

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        if (!content) {
            return errorResponse('Content is required', 400);
        }

        const updateData = { title, content };
        if (color !== undefined) updateData.color = color;
        if (isPinned !== undefined) updateData.isPinned = isPinned;

        const note = await prisma.note.update({
            where: { id },
            data: updateData,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return successResponse({ note });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/notes/:id - Delete note
export async function DELETE(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        await prisma.note.delete({
            where: { id },
        });

        return successResponse({ message: 'Note deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
