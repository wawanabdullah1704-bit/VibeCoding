import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: true,
        enrollments: {
          include: { student: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
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
        },
        groups: {
          include: {
            members: { include: { student: true } },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak dijumpai' }, { status: 404 });
    }

    // Check enrollment status for student
    const studentEnrollment = userId
      ? course.enrollments.find((e) => e.studentId === userId)
      : null;

    const isEnrolledAndApproved =
      role === 'LECTURER' || (studentEnrollment && studentEnrollment.status === 'APPROVED');

    // Format assignments for student: attach their own submission and group
    const formattedAssignments = course.assignments.map((a) => {
      const userSub = userId
        ? a.submissions.find((s) => s.studentId === userId)
        : null;
      const userGroup = userId
        ? a.groups.find((g) => g.members.some((m) => m.studentId === userId))
        : null;

      return {
        ...a,
        userSubmission: userSub || null,
        userGroup: userGroup || null,
        // Only expose full submissions array to lecturers
        submissions: role === 'LECTURER' ? a.submissions : (userSub ? [userSub] : []),
      };
    });

    return NextResponse.json({
      ...course,
      assignments: formattedAssignments,
      enrollmentStatus: studentEnrollment ? studentEnrollment.status : 'NOT_ENROLLED',
      enrollmentId: studentEnrollment ? studentEnrollment.id : null,
      isEnrolledAndApproved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
