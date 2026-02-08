import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/calendar/[id] - Get single event
export async function GET(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;

        const event = await prisma.calendarEvent.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!event) {
            return errorResponse('Event not found', 404);
        }

        return successResponse({ event });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/calendar/[id] - Update event
export async function PUT(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;
        const { title, description, date, color } = await request.json();

        const existing = await prisma.calendarEvent.findUnique({
            where: { id },
        });

        if (!existing) {
            return errorResponse('Event not found', 404);
        }

        const event = await prisma.calendarEvent.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(date && { date: new Date(date) }),
                ...(color && { color }),
            },
            include: {
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ event });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/calendar/[id] - Delete event
export async function DELETE(request, { params }) {
    try {
        await requireAuth();
        const { id } = await params;

        const existing = await prisma.calendarEvent.findUnique({
            where: { id },
        });

        if (!existing) {
            return errorResponse('Event not found', 404);
        }

        await prisma.calendarEvent.delete({
            where: { id },
        });

        return successResponse({ message: 'Event deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
