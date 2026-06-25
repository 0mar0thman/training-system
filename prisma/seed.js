const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء عملية seeding احترافية...');

  // 1. حذف البيانات القديمة
  await prisma.enrollment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.trainee.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.trainer.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🗑️ تم مسح البيانات القديمة بنجاح');

  // 2. إنشاء المستخدمين (صلاحيات وأدوار)
  const salt = await bcrypt.genSalt(10);
  const passwordHashAdmin = await bcrypt.hash('admin123', salt);
  const passwordHashFinance = await bcrypt.hash('finance123', salt);
  const passwordHashSales = await bcrypt.hash('sales123', salt);
  const passwordHashTrainer = await bcrypt.hash('trainer123', salt);
  const passwordHashSupervisor = await bcrypt.hash('supervisor123', salt);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        name: 'مدير النظام العام',
        password: passwordHashAdmin,
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        username: 'finance',
        name: 'مسؤول الحسابات والمالية',
        password: passwordHashFinance,
        role: 'FINANCE'
      }
    }),
    prisma.user.create({
      data: {
        username: 'sales',
        name: 'مسؤول الاستقبال والمبيعات',
        password: passwordHashSales,
        role: 'SALES'
      }
    }),
    prisma.user.create({
      data: {
        username: 'trainer',
        name: 'المدرب الرئيسي',
        password: passwordHashTrainer,
        role: 'TRAINER'
      }
    }),
    prisma.user.create({
      data: {
        username: 'supervisor',
        name: 'مشرف التدريب',
        password: passwordHashSupervisor,
        role: 'SUPERVISOR'
      }
    })
  ]);

  console.log(`✅ تم إنشاء ${users.length} مستخدمين بصلاحيات مختلفة`);

  // 3. إنشاء الشركات (العملاء)
  const companies = await Promise.all([
    prisma.company.create({ data: { name: 'أرامكو السعودية (Saudi Aramco)' } }),
    prisma.company.create({ data: { name: 'سابك (SABIC)' } }),
    prisma.company.create({ data: { name: 'نيوم (NEOM)' } }),
    prisma.company.create({ data: { name: 'شركة الاتصالات السعودية (STC)' } }),
    prisma.company.create({ data: { name: 'معادن (Maaden)' } }),
    prisma.company.create({ data: { name: 'أكوا باور (ACWA Power)' } }),
    prisma.company.create({ data: { name: 'مصرف الراجحي (Al Rajhi Bank)' } }),
    prisma.company.create({ data: { name: 'شركة ولف لخدمات حقول النفط' } })
  ]);
  console.log(`✅ تم إنشاء ${companies.length} شركة عميلة`);

  // 4. إنشاء المدربين
  const trainers = await Promise.all([
    prisma.trainer.create({
      data: {
        name: 'د. سارة جينكينز',
        email: 'sarah.j@training.com',
        phone: '+966 501111111',
        specialty: 'السلامة والصحة المهنية'
      }
    }),
    prisma.trainer.create({
      data: {
        name: 'أ. مايكل ثورن',
        email: 'michael.t@training.com',
        phone: '+966 502222222',
        specialty: 'القيادة والإدارة التنفيذية'
      }
    }),
    prisma.trainer.create({
      data: {
        name: 'م. إيلينا رودريغز',
        email: 'elena.r@training.com',
        phone: '+966 503333333',
        specialty: 'تكنولوجيا المعلومات والأنظمة المدمجة'
      }
    }),
    prisma.trainer.create({
      data: {
        name: 'د. عمر الفهد',
        email: 'omar.f@training.com',
        phone: '+966 504444444',
        specialty: 'علم البيانات والذكاء الاصطناعي'
      }
    }),
    prisma.trainer.create({
      data: {
        name: 'أ. أحمد الخالدي',
        email: 'ahmed.k@training.com',
        phone: '+966 505555555',
        specialty: 'إدارة المشاريع والتطوير المهني'
      }
    })
  ]);
  console.log(`✅ تم إنشاء ${trainers.length} مدربين`);

  // 5. إنشاء الكورسات
  const coursesData = [
    {
      corId: 'COR-2026-001',
      eventName: 'تدريب السلامة للربع الأول',
      courseName: 'إجراءات السلامة المتقدمة (OSHA)',
      startDate: new Date('2026-07-01'),
      venue: 'مقر الرياض الرئيسي',
      room: 'القاعة A',
      isRealEvent: true,
      numberOfParticipants: 20,
      numberOfCert: 18,
      trainerName: trainers[0].name,
      trainerId: trainers[0].id,
      companyId: companies[0].id // أرامكو
    },
    {
      corId: 'COR-2026-002',
      eventName: 'قمة القيادة التنفيذية',
      courseName: 'القيادة الإستراتيجية الفعالة',
      startDate: new Date('2026-07-10'),
      venue: 'مركز جدة للتدريب',
      room: 'قاعة الاجتماعات 204',
      isRealEvent: true,
      numberOfParticipants: 12,
      numberOfCert: 12,
      trainerName: trainers[1].name,
      trainerId: trainers[1].id,
      companyId: companies[1].id // سابك
    },
    {
      corId: 'COR-2026-003',
      eventName: 'أسبوع التقنية الحديثة',
      courseName: 'تطبيق أنظمة ERP المتقدمة',
      startDate: new Date('2026-06-15'),
      venue: 'واحة التقنية بالدمام',
      room: 'المختبر الرقمي 3',
      isRealEvent: true,
      numberOfParticipants: 15,
      numberOfCert: 13,
      trainerName: trainers[2].name,
      trainerId: trainers[2].id,
      companyId: companies[2].id // نيوم
    },
    {
      corId: 'COR-2026-004',
      eventName: 'التحول الرقمي 2026',
      courseName: 'تحليل البيانات الضخمة للمدراء',
      startDate: new Date('2026-08-05'),
      venue: 'المدينة الرقمية بالرياض',
      room: 'القاعة التفاعلية 101',
      isRealEvent: true,
      numberOfParticipants: 25,
      numberOfCert: 0,
      trainerName: trainers[3].name,
      trainerId: trainers[3].id,
      companyId: companies[3].id // STC
    },
    {
      corId: 'COR-2026-005',
      eventName: 'إدارة مشاريع التشييد',
      courseName: 'محترفي إدارة المشاريع PMP',
      startDate: new Date('2026-05-20'),
      venue: 'فندق هيلتون الخبر',
      room: 'قاعة اللؤلؤة',
      isRealEvent: true,
      numberOfParticipants: 18,
      numberOfCert: 16,
      trainerName: trainers[4].name,
      trainerId: trainers[4].id,
      companyId: companies[4].id // معادن
    }
  ];

  const courses = [];
  for (const data of coursesData) {
    const course = await prisma.course.create({ data });
    courses.push(course);
  }
  console.log(`✅ تم إنشاء ${courses.length} دورات تدريبية`);

  // 6. إنشاء المتدربين
  const traineesData = [
    { fullName: 'أحمد عبد الوهاب أحمد', idNo: '1000000001', email: 'ahmed.a@aramco.com', phone: '+966 550000001', companyId: companies[0].id },
    { fullName: 'خالد المنصور', idNo: '1000000002', email: 'khalid.m@aramco.com', phone: '+966 550000002', companyId: companies[0].id },
    { fullName: 'نورة الغامدي', idNo: '1000000003', email: 'nora.g@aramco.com', phone: '+966 550000003', companyId: companies[0].id },
    { fullName: 'سلطان العتيبي', idNo: '1000000004', email: 'sultan.o@aramco.com', phone: '+966 550000004', companyId: companies[0].id },
    { fullName: 'فاطمة الزهراء البشير', idNo: '1000000005', email: 'fatima.z@sabic.com', phone: '+966 550000005', companyId: companies[1].id },
    { fullName: 'عمر طارق اليوسف', idNo: '1000000006', email: 'omar.y@sabic.com', phone: '+966 550000006', companyId: companies[1].id },
    { fullName: 'سارة المطيري', idNo: '1000000007', email: 'sara.m@neom.com', phone: '+966 550000007', companyId: companies[2].id },
    { fullName: 'فيصل الدوسري', idNo: '1000000008', email: 'faisal.d@neom.com', phone: '+966 550000008', companyId: companies[2].id },
    { fullName: 'عائشة آل ثاني', idNo: '1000000009', email: 'aisha.t@stc.com', phone: '+966 550000009', companyId: companies[3].id },
    { fullName: 'محمد السويدي', idNo: '1000000010', email: 'mohammed.s@stc.com', phone: '+966 550000010', companyId: companies[3].id },
    { fullName: 'علي الزهراني', idNo: '1000000011', email: 'ali.z@maaden.com', phone: '+966 550000011', companyId: companies[4].id },
    { fullName: 'هدى البكر', idNo: '1000000012', email: 'huda.b@maaden.com', phone: '+966 550000012', companyId: companies[4].id }
  ];

  const trainees = [];
  for (const data of traineesData) {
    const trainee = await prisma.trainee.create({ data });
    trainees.push(trainee);
  }
  console.log(`✅ تم إنشاء ${trainees.length} متدربين`);

  // 7. إنشاء التسجيلات والحضور والشهادات
  const enrollments = [];
  
  const aramcoTrainees = trainees.filter(t => t.companyId === companies[0].id);
  for (const trainee of aramcoTrainees) {
    const isPresent = Math.random() > 0.2;
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: courses[0].id,
        traineeId: trainee.id,
        attendanceStatus: isPresent ? 'PRESENT' : 'ABSENT',
        certificateUrl: isPresent ? `/api/certificates/pdf/CERT-${courses[0].corId}-${trainee.idNo}` : null,
        qrCode: isPresent ? `CERT-${courses[0].corId}-${trainee.idNo}` : null
      }
    });
    enrollments.push(enrollment);
  }

  const sabicTrainees = trainees.filter(t => t.companyId === companies[1].id);
  for (const trainee of sabicTrainees) {
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: courses[1].id,
        traineeId: trainee.id,
        attendanceStatus: 'PRESENT',
        certificateUrl: `/api/certificates/pdf/CERT-${courses[1].corId}-${trainee.idNo}`,
        qrCode: `CERT-${courses[1].corId}-${trainee.idNo}`
      }
    });
    enrollments.push(enrollment);
  }

  const neomTrainees = trainees.filter(t => t.companyId === companies[2].id);
  for (const trainee of neomTrainees) {
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: courses[2].id,
        traineeId: trainee.id,
        attendanceStatus: 'PRESENT',
        certificateUrl: `/api/certificates/pdf/CERT-${courses[2].corId}-${trainee.idNo}`,
        qrCode: `CERT-${courses[2].corId}-${trainee.idNo}`
      }
    });
    enrollments.push(enrollment);
  }

  console.log(`✅ تم إنشاء ${enrollments.length} عمليات تسجيل وحضور وشهادات`);

  // 8. إنشاء الفواتير
  const invoicesData = [
    {
      poNumber: 'PO-2026-001',
      amount: 15000,
      paymentStatus: 'PAID',
      issuedAt: new Date('2026-05-10'),
      paidAt: new Date('2026-05-15'),
      companyId: companies[0].id,
      courseId: courses[0].id
    },
    {
      poNumber: 'PO-2026-002',
      amount: 8500,
      paymentStatus: 'PENDING',
      issuedAt: new Date('2026-06-01'),
      companyId: companies[1].id,
      courseId: courses[1].id
    },
    {
      poNumber: 'PO-2026-003',
      amount: 22000,
      paymentStatus: 'PARTIALLY_PAID',
      issuedAt: new Date('2026-06-05'),
      companyId: companies[2].id,
      courseId: courses[2].id
    },
    {
      poNumber: 'PO-2026-004',
      amount: 12500,
      paymentStatus: 'OVERDUE',
      issuedAt: new Date('2026-04-15'),
      companyId: companies[3].id,
      courseId: courses[3].id
    }
  ];

  for (const data of invoicesData) {
    await prisma.invoice.create({ data });
  }
  console.log(`✅ تم إنشاء الفواتير والمدفوعات`);

  console.log('🎉 تم ملء قاعدة البيانات بالبيانات الاحترافية بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ أثناء seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });