import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/calendar - List calendar events
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM
        const year = searchParams.get('year');

        let where = {};

        if (month) {
            const [yearPart, monthPart] = month.split('-');
            const startDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1);
            const endDate = new Date(parseInt(yearPart), parseInt(monthPart), 0, 23, 59, 59);

            where = {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            };
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);

            where = {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            };
        }

        const events = await prisma.calendarEvent.findMany({
            where,
            include: {
                createdBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { date: 'asc' },
        });

        return successResponse({ events });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/calendar - Create a new event
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { title, description, date, color = '#3b82f6' } = await request.json();

        if (!title || !date) {
            return errorResponse('Title and date are required', 400);
        }

        const event = await prisma.calendarEvent.create({
            data: {
                title,
                description,
                date: new Date(date),
                color,
                createdById: session.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ event }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
