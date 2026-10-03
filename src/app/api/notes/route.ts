import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (courseId) {
      const notes = await prisma.note.findMany({
        where: { courseId },
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(notes);
    }

    if (role === 'STUDENT' && userId) {
      // Get notes from courses student is approved in
      const notes = await prisma.note.findMany({
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
        include: { course: { include: { lecturer: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(notes);
    }

    if (role === 'LECTURER' && userId) {
      // Get notes for courses taught by lecturer
      const notes = await prisma.note.findMany({
        where: {
          course: { lecturerId: userId },
        },
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(notes);
    }

    const notes = await prisma.note.findMany({
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, title, description, category, fileUrl, fileName, fileSize } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Missing courseId or title' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        courseId,
        title,
        description: description || '',
        category: category || 'Nota Kuliah',
        fileUrl: fileUrl || '/uploads/sample_note.pdf',
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '1.5 MB',
      },
      include: { course: true },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'Missing note id' }, { status: 400 });
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
