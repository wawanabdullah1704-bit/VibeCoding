import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (role === 'STUDENT' && userId) {
      // Get assignments for student's approved courses
      const assignments = await prisma.assignment.findMany({
        where: {
          course: {
            enrollments: {
              some: {
                studentId: userId,
                status: 'APPROVED',
              },
            },
          },
        },
        include: {
          course: { include: { lecturer: true } },
          submissions: {
            where: { studentId: userId },
          },
          groups: {
            include: {
              members: { include: { student: true } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      const formatted = assignments.map((a) => {
        const studentSubmission = a.submissions[0] || null;
        // Find if student belongs to a group for this assignment
        const studentGroup = a.groups.find((g) =>
          g.members.some((m) => m.studentId === userId)
        );

        return {
          ...a,
          userSubmission: studentSubmission,
          userGroup: studentGroup || null,
        };
      });

      return NextResponse.json(formatted);
    }

    if (role === 'LECTURER' && userId) {
      // Get assignments created under lecturer's courses
      const assignments = await prisma.assignment.findMany({
        where: {
          course: { lecturerId: userId },
        },
        include: {
          course: true,
          submissions: {
            include: { student: true },
          },
          groups: {
            include: {
              members: { include: { student: true } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      return NextResponse.json(assignments);
    }

    if (courseId) {
      const assignments = await prisma.assignment.findMany({
        where: { courseId },
        include: {
          course: true,
          submissions: { include: { student: true } },
        },
        orderBy: { dueDate: 'asc' },
      });
      return NextResponse.json(assignments);
    }

    const assignments = await prisma.assignment.findMany({
      include: {
        course: true,
        submissions: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, title, description, startDate, dueDate, maxMarks, isGroup, fileUrl, fileName } = body;

    if (!courseId || !title || !dueDate) {
      return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description: description || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        dueDate: new Date(dueDate),
        maxMarks: Number(maxMarks) || 100,
        isGroup: Boolean(isGroup),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: { course: true },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
