import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assignmentId, studentId, fileUrl, fileName, content, groupId } = body;

    if (!assignmentId || !studentId) {
      return NextResponse.json({ error: 'Missing assignmentId or studentId' }, { status: 400 });
    }

    // Upsert submission (if already submitted, update submission)
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      update: {
        fileUrl: fileUrl || '/uploads/student_submission.pdf',
        fileName: fileName || 'Submission_File.pdf',
        content: content || '',
        groupId: groupId || null,
        submittedAt: new Date(),
        status: 'PENDING_GRADE',
      },
      create: {
        assignmentId,
        studentId,
        groupId: groupId || null,
        fileUrl: fileUrl || '/uploads/student_submission.pdf',
        fileName: fileName || 'Submission_File.pdf',
        content: content || '',
        status: 'PENDING_GRADE',
      },
      include: { assignment: true, student: true },
    });

    return NextResponse.json(submission, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, mark, feedback } = body;

    if (!submissionId || mark === undefined) {
      return NextResponse.json({ error: 'Missing submissionId or mark' }, { status: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        mark: Number(mark),
        feedback: feedback || '',
        status: 'GRADED',
      },
      include: { student: true, assignment: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
