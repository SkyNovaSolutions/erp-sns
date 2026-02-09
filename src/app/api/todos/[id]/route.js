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
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                        employee: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                createdBy: {
                    select: { id: true, name: true },
                },
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
        const { title, description, status, priority, assigneeIds } = await request.json();

        const validStatuses = ['pending', 'in_progress', 'completed'];

        if (status && !validStatuses.includes(status)) {
            return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;

        // Update the todo
        await prisma.todo.update({
            where: { id },
            data: updateData,
        });

        // If assigneeIds is provided, update assignees
        if (assigneeIds !== undefined) {
            // Remove all existing assignees
            await prisma.todoAssignee.deleteMany({
                where: { todoId: id },
            });

            // Add new assignees
            if (assigneeIds && assigneeIds.length > 0) {
                const assigneeData = [];

                for (const assignee of assigneeIds) {
                    if (assignee.type === 'user') {
                        const user = await prisma.user.findUnique({ where: { id: assignee.id } });
                        if (user) {
                            assigneeData.push({
                                todoId: id,
                                userId: assignee.id,
                            });
                        }
                    } else if (assignee.type === 'employee') {
                        const employee = await prisma.employee.findUnique({ where: { id: assignee.id } });
                        if (employee) {
                            assigneeData.push({
                                todoId: id,
                                employeeId: assignee.id,
                            });
                        }
                    }
                }

                if (assigneeData.length > 0) {
                    await prisma.todoAssignee.createMany({
                        data: assigneeData,
                        skipDuplicates: true,
                    });
                }
            }
        }

        // Fetch updated todo with assignees
        const todo = await prisma.todo.findUnique({
            where: { id },
            include: {
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                        employee: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                createdBy: {
                    select: { id: true, name: true },
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
