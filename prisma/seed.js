const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CIDOS PMU 2.0 Database...');

  // Clean DB
  await prisma.groupMember.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.group.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Lecturers
  const lecturer1 = await prisma.user.create({
    data: {
      id: 'lecturer-azman',
      name: 'Dr. Azman Bin Rosli',
      email: 'azman@pmu.edu.my',
      codeNo: 'PMU-LECT-0101',
      role: 'LECTURER',
      department: 'JTMK - Jabatan Teknologi Maklumat & Komunikasi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const lecturer2 = await prisma.user.create({
    data: {
      id: 'lecturer-norazlina',
      name: 'Pn. Norazlina Binti Hassan',
      email: 'norazlina@pmu.edu.my',
      codeNo: 'PMU-LECT-0102',
      role: 'LECTURER',
      department: 'JTMK - Jabatan Teknologi Maklumat & Komunikasi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  });

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      id: 'student-hafiz',
      name: 'Ahmad Hafiz Bin Rizwan',
      email: 'hafiz.20dit22f1001@student.pmu.edu.my',
      codeNo: '20DIT22F1001',
      role: 'STUDENT',
      department: 'JTMK - Diploma Teknologi Maklumat (Software)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    }
  });

  const student2 = await prisma.user.create({
    data: {
      id: 'student-aina',
      name: 'Nur Aina Binti Zulkifli',
      email: 'aina.20dit22f1002@student.pmu.edu.my',
      codeNo: '20DIT22F1002',
      role: 'STUDENT',
      department: 'JTMK - Diploma Teknologi Maklumat (Software)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const student3 = await prisma.user.create({
    data: {
      id: 'student-farhan',
      name: 'Mohd Farhan Bin Daniel',
      email: 'farhan.20dit22f1003@student.pmu.edu.my',
      codeNo: '20DIT22F1003',
      role: 'STUDENT',
      department: 'JTMK - Diploma Teknologi Maklumat (Network)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const student4 = await prisma.user.create({
    data: {
      id: 'student-sarah',
      name: 'Siti Sarah Binti Abdullah',
      email: 'sarah.20dit22f1004@student.pmu.edu.my',
      codeNo: '20DIT22F1004',
      role: 'STUDENT',
      department: 'JTMK - Diploma Teknologi Maklumat (Software)',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
    }
  });

  // Create Courses
  const courseWeb = await prisma.course.create({
    data: {
      id: 'course-web-prog',
      code: 'DFC30133',
      name: 'Web Programming & Applications',
      section: 'DNS3A',
      department: 'JTMK',
      lecturerId: lecturer1.id,
    }
  });

  const courseDB = await prisma.course.create({
    data: {
      id: 'course-db-design',
      code: 'DFC30233',
      name: 'Database System & Design',
      section: 'DNS3B',
      department: 'JTMK',
      lecturerId: lecturer2.id,
    }
  });

  const courseMobile = await prisma.course.create({
    data: {
      id: 'course-mobile-dev',
      code: 'DFC40143',
      name: 'Mobile Application Development',
      section: 'DNS4A',
      department: 'JTMK',
      lecturerId: lecturer1.id,
    }
  });

  // Enrollments for Web Programming
  await prisma.enrollment.createMany({
    data: [
      { courseId: courseWeb.id, studentId: student1.id, status: 'APPROVED', approvedAt: new Date() },
      { courseId: courseWeb.id, studentId: student2.id, status: 'APPROVED', approvedAt: new Date() },
      { courseId: courseWeb.id, studentId: student3.id, status: 'PENDING' },
      { courseId: courseWeb.id, studentId: student4.id, status: 'PENDING' },

      // Database course enrollments
      { courseId: courseDB.id, studentId: student1.id, status: 'APPROVED', approvedAt: new Date() },
      { courseId: courseDB.id, studentId: student2.id, status: 'APPROVED', approvedAt: new Date() },
      { courseId: courseDB.id, studentId: student3.id, status: 'APPROVED', approvedAt: new Date() },
      
      // Mobile course
      { courseId: courseMobile.id, studentId: student1.id, status: 'PENDING' }
    ]
  });

  // Notes for Web Programming
  await prisma.note.createMany({
    data: [
      {
        courseId: courseWeb.id,
        title: 'Bab 1: Pengenalan Kepada Next.js & React App Router',
        description: 'Nota asas konsep SSR, SSG, dan struktur fail Next.js 14 App Router.',
        category: 'Nota Kuliah',
        fileUrl: '/uploads/sample_note_web_ch1.pdf',
        fileName: 'Bab1_Pengenalan_NextJS.pdf',
        fileSize: '2.4 MB'
      },
      {
        courseId: courseWeb.id,
        title: 'Bab 2: Asas Tailwind CSS & Responsive Layout',
        description: 'Panduan penggunaan utility classes Tailwind untuk rekabentuk UI responsive.',
        category: 'Nota Kuliah',
        fileUrl: '/uploads/sample_note_web_ch2.pdf',
        fileName: 'Bab2_TailwindCSS_Guide.pdf',
        fileSize: '3.1 MB'
      },
      {
        courseId: courseWeb.id,
        title: 'Silibus Kursus DFC30133 Sesi II 2025/2026',
        description: 'Perancangan pengajaran semester, tugasan, amali, dan pecahan markah penilai.',
        category: 'Silibus',
        fileUrl: '/uploads/silibus_dfc30133.pdf',
        fileName: 'Silibus_DFC30133.pdf',
        fileSize: '850 KB'
      },
      {
        courseId: courseDB.id,
        title: 'Chapter 1: Entity Relationship Diagram (ERD) Fundamentals',
        description: 'Concepts of entities, attributes, relationships and cardinality rules.',
        category: 'Nota Kuliah',
        fileUrl: '/uploads/sample_db_ch1.pdf',
        fileName: 'Chapter1_ERD_Fundamentals.pdf',
        fileSize: '1.8 MB'
      }
    ]
  });

  // Create Assignments
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const assignIndivWeb = await prisma.assignment.create({
    data: {
      courseId: courseWeb.id,
      title: 'Tugasan 1: Pembangunan Portfolio Diri Responsive',
      description: 'Cipta laman web portfolio peribadi menggunakan Next.js dan Tailwind CSS. Sertakan maklumat profil, projek, dan borang perhubungan.',
      startDate: pastThreeDays,
      dueDate: nextWeek,
      maxMarks: 100,
      isGroup: false,
      fileUrl: '/uploads/tugasan1_soalan.pdf',
      fileName: 'Tugasan1_Arahan_Portfolio.pdf'
    }
  });

  const assignGroupWeb = await prisma.assignment.create({
    data: {
      courseId: courseWeb.id,
      title: 'Projek Kumpulan: Sistem Portal Pembelajaran CIDOS PMU 2.0',
      description: 'Setiap kumpulan dikehendaki membangunkan portal LMS yang berfungsi dengan integrasi pangkalan data SQLite/Prisma dan peranan pengguna.',
      startDate: now,
      dueDate: twoWeeksLater,
      maxMarks: 100,
      isGroup: true,
      fileUrl: '/uploads/projek_kumpulan_rubrik.pdf',
      fileName: 'Rubrik_Projek_Kumpulan_LMS.pdf'
    }
  });

  const assignDB = await prisma.assignment.create({
    data: {
      courseId: courseDB.id,
      title: 'Lab Exercise 2: SQL Normalization & Schema Design',
      description: 'Normalize given unnormalized tables into 1NF, 2NF, and 3NF. Write DDL SQL script.',
      startDate: pastThreeDays,
      dueDate: nextWeek,
      maxMarks: 50,
      isGroup: false
    }
  });

  // Groups for Web Project
  const group1 = await prisma.group.create({
    data: {
      courseId: courseWeb.id,
      assignmentId: assignGroupWeb.id,
      name: 'Kumpulan 1 - CyberTech PMU',
    }
  });

  const group2 = await prisma.group.create({
    data: {
      courseId: courseWeb.id,
      assignmentId: assignGroupWeb.id,
      name: 'Kumpulan 2 - CodeCrafters',
    }
  });

  // Group Members
  await prisma.groupMember.createMany({
    data: [
      { groupId: group1.id, studentId: student1.id },
      { groupId: group1.id, studentId: student2.id },
      { groupId: group2.id, studentId: student3.id },
      { groupId: group2.id, studentId: student4.id },
    ]
  });

  // Submissions
  // Student 1 (Hafiz) submitted Tugasan 1 and graded
  await prisma.submission.create({
    data: {
      assignmentId: assignIndivWeb.id,
      studentId: student1.id,
      fileUrl: '/uploads/hafiz_portfolio_submission.zip',
      fileName: '20DIT22F1001_AhmadHafiz_Tugasan1.zip',
      content: 'Laman web portfolio telah disiapkan dengan Next.js & Tailwind CSS. Link demo live: https://hafiz-portfolio.demo',
      submittedAt: pastThreeDays,
      status: 'GRADED',
      mark: 92,
      feedback: 'Hasil kerja yang amat kemas dan reka bentuk responsive yang memuaskan. Syabas Hafiz!'
    }
  });

  // Student 2 (Aina) submitted Tugasan 1 pending grade
  await prisma.submission.create({
    data: {
      assignmentId: assignIndivWeb.id,
      studentId: student2.id,
      fileUrl: '/uploads/aina_portfolio_submission.zip',
      fileName: '20DIT22F1002_NurAina_Tugasan1.zip',
      content: 'Tugasan 1 diserahkan. Saya menggunakan animasi CSS untuk navigasi.',
      submittedAt: now,
      status: 'PENDING_GRADE',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
