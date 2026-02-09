import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/notes - List all notes
export async function GET(request) {
    try {
        await requireAuth();

        const notes = await prisma.note.findMany({
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ notes });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/notes - Create a new note
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { title, content, color = 'indigo', isPinned = false } = await request.json();

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        if (!content) {
            return errorResponse('Content is required', 400);
        }

        const note = await prisma.note.create({
            data: {
                title,
                content,
                color,
                isPinned,
                createdById: session.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return successResponse({ note }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
