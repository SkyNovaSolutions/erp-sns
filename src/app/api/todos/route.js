import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/todos - List all todos
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');
        const status = searchParams.get('status');

        const where = {};
        if (assigneeId) where.assigneeId = assigneeId;
        if (status) where.status = status;

        const todos = await prisma.todo.findMany({
            where,
            include: {
                assignee: {
                    select: { id: true, name: true, email: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ todos });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/todos - Create a new todo
export async function POST(request) {
    try {
        const session = await requireAuth();

        const { title, description, status = 'pending', assigneeId } = await request.json();

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Verify assignee exists if provided
        if (assigneeId) {
            const employee = await prisma.employee.findUnique({
                where: { id: assigneeId },
            });

            if (!employee) {
                return errorResponse('Assignee not found', 404);
            }
        }

        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                status,
                assigneeId,
                createdById: session.id,
            },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ todo }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
