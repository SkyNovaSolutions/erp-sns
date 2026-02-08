import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/employees/[id] - Get employee details
export async function GET(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                company: true,
                assignedTodos: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!employee) {
            return errorResponse('Employee not found', 404);
        }

        return successResponse({ employee });
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;
        const { name, email, phone, position } = await request.json();

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (position !== undefined) updateData.position = position;

        const employee = await prisma.employee.update({
            where: { id },
            data: updateData,
            include: {
                company: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ employee });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(request, { params }) {
    try {
        await requireAuth();

        const { id } = await params;

        await prisma.employee.delete({
            where: { id },
        });

        return successResponse({ message: 'Employee deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
