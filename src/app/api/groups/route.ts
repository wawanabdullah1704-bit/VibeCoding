import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');
    const lecturerId = searchParams.get('lecturerId');

    if (studentId) {
      // Get groups that this student is a member of
      const memberIn = await prisma.groupMember.findMany({
        where: { studentId },
        include: {
          group: {
            include: {
              course: { include: { lecturer: true } },
              assignment: true,
              members: {
                include: { student: true },
              },
            },
          },
        },
      });

      return NextResponse.json(memberIn.map((m) => m.group));
    }

    if (lecturerId) {
      // Get all groups in courses taught by lecturer
      const groups = await prisma.group.findMany({
        where: {
          course: { lecturerId },
        },
        include: {
          course: true,
          assignment: true,
          members: {
            include: { student: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(groups);
    }

    if (courseId) {
      const groups = await prisma.group.findMany({
        where: { courseId },
        include: {
          assignment: true,
          members: {
            include: { student: true },
          },
        },
      });
      return NextResponse.json(groups);
    }

    const groups = await prisma.group.findMany({
      include: {
        course: true,
        assignment: true,
        members: { include: { student: true } },
      },
    });
    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, assignmentId, name, studentIds } = body;

    if (!courseId || !name) {
      return NextResponse.json({ error: 'Missing courseId or group name' }, { status: 400 });
    }

    const newGroup = await prisma.group.create({
      data: {
        courseId,
        assignmentId: assignmentId || null,
        name,
      },
    });

    // Add members
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      await prisma.groupMember.createMany({
        data: studentIds.map((sid: string) => ({
          groupId: newGroup.id,
          studentId: sid,
        })),
      });
    }

    const created = await prisma.group.findUnique({
      where: { id: newGroup.id },
      include: {
        course: true,
        assignment: true,
        members: { include: { student: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
