import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/todos/[id] - Get todo details
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const todo = await prisma.todo.findUnique({
            where: { id },
            include: {
                assignee: true,
            },
        });

        if (!todo) {
            return errorResponse('Todo not found', 404);
        }

        return successResponse({ todo });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/todos/[id] - Update todo
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { title, description, status, assigneeId } = await request.json();

        const validStatuses = ['pending', 'in_progress', 'completed'];

        if (status && !validStatuses.includes(status)) {
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

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

        const todo = await prisma.todo.update({
            where: { id },
            data: updateData,
            include: {
                assignee: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return successResponse({ todo });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/todos/[id] - Delete todo
export async function DELETE(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        await prisma.todo.delete({
            where: { id },
        });

        return successResponse({ message: 'Todo deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
