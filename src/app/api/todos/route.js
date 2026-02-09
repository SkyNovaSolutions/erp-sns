import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/todos - List all todos
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = {};
        if (status) where.status = status;

        const todos = await prisma.todo.findMany({
            where,
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

        const { title, description, status = 'pending', priority = 'medium', assigneeIds = [] } = await request.json();

        if (!title) {
            return errorResponse('Title is required', 400);
        }

        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return errorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Create the todo first
        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                status,
                priority,
                createdById: session.id,
            },
        });

        // Add assignees if provided
        if (assigneeIds && assigneeIds.length > 0) {
            const assigneeData = [];

            for (const assignee of assigneeIds) {
                // assignee format: { type: 'user' | 'employee', id: string }
                if (assignee.type === 'user') {
                    // Verify user exists
                    const user = await prisma.user.findUnique({ where: { id: assignee.id } });
                    if (user) {
                        assigneeData.push({
                            todoId: todo.id,
                            userId: assignee.id,
                        });
                    }
                } else if (assignee.type === 'employee') {
                    // Verify employee exists
                    const employee = await prisma.employee.findUnique({ where: { id: assignee.id } });
                    if (employee) {
                        assigneeData.push({
                            todoId: todo.id,
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

        // Fetch the complete todo with assignees
        const completeTodo = await prisma.todo.findUnique({
            where: { id: todo.id },
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

        return successResponse({ todo: completeTodo }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
