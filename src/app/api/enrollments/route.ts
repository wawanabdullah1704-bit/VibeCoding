import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lecturerId = searchParams.get('lecturerId');

    if (lecturerId) {
      // Find all enrollments for courses taught by this lecturer
      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            lecturerId: lecturerId,
          },
        },
        include: {
          student: true,
          course: true,
        },
        orderBy: { requestedAt: 'desc' },
      });
      return NextResponse.json(enrollments);
    }

    const all = await prisma.enrollment.findMany({
      include: { student: true, course: true },
    });
    return NextResponse.json(all);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, studentId } = body;

    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'Missing courseId or studentId' }, { status: 400 });
    }

    // Check if enrollment already exists
    const existing = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId, studentId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Enrollment already requested or active' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId,
        status: 'PENDING',
      },
      include: { course: true, student: true },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentId, status } = body; // status: 'APPROVED' | 'REJECTED'

    if (!enrollmentId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: { student: true, course: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
