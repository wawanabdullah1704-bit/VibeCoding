import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (role === 'LECTURER' && userId) {
      // Get courses taught by this lecturer
      const courses = await prisma.course.findMany({
        where: { lecturerId: userId },
        include: {
          lecturer: true,
          enrollments: {
            include: { student: true },
          },
          notes: true,
          assignments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(courses);
    }

    if (role === 'STUDENT' && userId) {
      // Get all courses with student's enrollment status
      const allCourses = await prisma.course.findMany({
        include: {
          lecturer: true,
          enrollments: {
            where: { studentId: userId },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = allCourses.map((c) => {
        const studentEnrollment = c.enrollments[0] || null;
        return {
          ...c,
          enrollmentStatus: studentEnrollment ? studentEnrollment.status : 'NOT_ENROLLED',
          enrollmentId: studentEnrollment ? studentEnrollment.id : null,
        };
      });

      return NextResponse.json(formatted);
    }

    // Default: fetch all courses
    const courses = await prisma.course.findMany({
      include: {
        lecturer: true,
        enrollments: true,
      },
    });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, section, department, lecturerId } = body;

    if (!code || !name || !lecturerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        section: section || 'DNS3A',
        department: department || 'JTMK',
        lecturerId,
      },
      include: { lecturer: true },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
