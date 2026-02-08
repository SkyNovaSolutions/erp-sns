import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-error';

// GET /api/employees - List all employees
export async function GET(request) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');

        const where = companyId ? { companyId } : {};

        const employees = await prisma.employee.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { assignedTodos: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ employees });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/employees - Create a new employee
export async function POST(request) {
    try {
        await requireAuth();

        const { name, email, phone, position, companyId } = await request.json();

        if (!name || !email || !companyId) {
            return errorResponse('Name, email and company are required', 400);
        }

        // Verify company exists
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return errorResponse('Company not found', 404);
        }

        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                phone,
                position,
                companyId,
            },
            include: {
                company: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse({ employee }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
