import {
  Stage,
  Halaqah,
  Student,
  Teacher,
  ActivityQuickPreset,
  AttendanceRecord,
  TeacherAttendanceRecord,
  MessageLog,
} from '../types';

export function formatWhatsAppPhone(phone?: string): string | null {
  const clean = (phone || '').replace(/[^\d+]/g, '').trim();
  if (!clean) return null;
  if (clean.startsWith('05') && clean.length >= 10) {
    return '966' + clean.substring(1);
  }
  if (clean.startsWith('5') && clean.length >= 9) {
    return '966' + clean;
  }
  if (clean.startsWith('0')) {
    return '966' + clean.substring(1);
  }
  if (clean.startsWith('+')) {
    const digits = clean.substring(1).replace(/\D/g, '');
    return digits.length >= 8 ? digits : null;
  }
  const digitsOnly = clean.replace(/\D/g, '');
  return digitsOnly.length >= 8 ? digitsOnly : null;
}

export function hasValidGuardianPhone(phone?: string): boolean {
  return Boolean(phone && phone.trim() !== '' && phone.trim() !== '-');
}

export const STAGES: Stage[] = [
  {
    id: 'primary_early',
    name: 'المرحلة الأولية (الصفوف الأولية)',
    shortName: 'الصفوف الأولية',
    description: 'حلقة الصفوف الأولية (المعلم: مصباح نور الدين)',
    gradeLevels: ['الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي'],
  },
  {
    id: 'primary_upper',
    name: 'المرحلة الابتدائية العليا (الصفوف العليا)',
    shortName: 'الابتدائية العليا',
    description: 'تتفرع وتستقل إلى 3 حلقات منفصلة: الصف الرابع، الصف الخامس، الصف السادس',
    gradeLevels: ['الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي'],
  },
  {
    id: 'intermediate',
    name: 'المرحلة المتوسطة',
    shortName: 'المرحلة المتوسطة',
    description: 'حلقة المرحلة المتوسطة (المعلم: أ. عبدالله العتيبي)',
    gradeLevels: ['الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'],
  },
  {
    id: 'secondary',
    name: 'المرحلة الثانوية',
    shortName: 'المرحلة الثانوية',
    description: 'حلقة المرحلة الثانوية (المعلم: أ. وليد عبدالله العتيبي)',
    gradeLevels: ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'],
  },
];

export const TELEGRAM_BOT_URL = 'https://t.me/DiwanSys_bot';

// الحلقات الحقيقية المعتمدة (6 حلقات حسب الهيكلة الرسمية)
export const INITIAL_HALAQAT: Halaqah[] = [
  {
    id: 'hal_early',
    name: 'حلقة الصفوف الأولية',
    stageId: 'primary_early',
    teacherId: 'teach_1',
    teacherName: 'مصباح نور الدين',
    teacherPhone: '+8801740193245',
    timeSlot: 'after_asr',
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - قاعة الصفوف الأولية',
    roomNumber: 'قاعة 1',
    targetMemorization: 'تلقين قصار السور وأساسيات التجويد والقاعدة النورانية',
    studentCount: 26,
  },
  {
    id: 'hal_grade4',
    name: 'حلقة الصف الرابع الابتدائي',
    stageId: 'primary_upper',
    teacherId: 'teach_2',
    teacherName: 'أ. بندر القحطاني / أبو فيصل القحطاني',
    teacherPhone: '+966551762227',
    timeSlot: 'after_asr',
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - جناح الصفوف العليا (قاعة 1)',
    roomNumber: 'قاعة 2',
    targetMemorization: 'حفظ ومراجعة جزء عم وجزء تبارك والتجويد العملي',
    studentCount: 15,
  },
  {
    id: 'hal_grade5',
    name: 'حلقة الصف الخامس الابتدائي',
    stageId: 'primary_upper',
    teacherId: 'teach_3',
    teacherName: 'أ. بسام البعيجان',
    teacherPhone: '+966508105571',
    timeSlot: 'after_asr',
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - جناح الصفوف العليا (قاعة 2)',
    roomNumber: 'قاعة 3',
    targetMemorization: 'حفظ ومراجعة جزء قد سمع والذاريات والتجويد العملي',
    studentCount: 25,
  },
  {
    id: 'hal_grade6',
    name: 'حلقة الصف السادس الابتدائي',
    stageId: 'primary_upper',
    teacherId: 'teach_4',
    teacherName: 'أ. جابر الشهري',
    teacherPhone: '+966503263150',
    timeSlot: 'after_asr',
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - جناح الصفوف العليا (قاعة 3)',
    roomNumber: 'قاعة 4',
    targetMemorization: 'حفظ الأجزاء من 24 إلى 28 وضبط مخارج الحروف',
    studentCount: 11,
  },
  {
    id: 'hal_intermediate',
    name: 'حلقة المرحلة المتوسطة',
    stageId: 'intermediate',
    teacherId: 'teach_5',
    teacherName: 'أ. عبدالله العتيبي',
    teacherPhone: '+966531816200',
    timeSlot: 'after_asr',
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - الصحن الرئيسي (رواق المحراب)',
    roomNumber: 'حلقة 5',
    targetMemorization: 'حفظ ومراجعة الأجزاء من 10 إلى 20 وضبط المتشابهات اللفظية',
    studentCount: 23,
  },
  {
    id: 'hal_secondary',
    name: 'حلقة المرحلة الثانوية',
    stageId: 'secondary',
    teacherId: 'teach_6',
    teacherName: 'أ. وليد عبدالله العتيبي',
    teacherPhone: '+966501270970',
    timeSlot: 'after_maghrib',
    timeSlotLabel: 'بين المغرب والعشاء',
    location: 'جامع ابن باز - القاعة الكبرى (الجناح الشرقي)',
    roomNumber: 'قاعة 6',
    targetMemorization: 'مسار الإتقان والتثبيت وإجازات السند القرآني المتصل',
    studentCount: 23,
  },
];

// المعلمون الحقيقيون والمشرفون المعتمدون
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teach_1',
    fullName: 'مصباح نور الدين',
    phoneNumber: '+8801740193245',
    role: 'teacher',
    assignedHalaqahId: 'hal_early',
    assignedHalaqahName: 'حلقة الصفوف الأولية',
    specialization: 'تأسيس وقراءات وتلقين',
    status: 'active',
    joinedYear: 2021,
    notes: 'معلم حلقة الصفوف الأولية',
  },
  {
    id: 'teach_2',
    fullName: 'أ. بندر القحطاني / أبو فيصل القحطاني',
    phoneNumber: '+966551762227',
    role: 'teacher',
    assignedHalaqahId: 'hal_grade4',
    assignedHalaqahName: 'حلقة الصف الرابع الابتدائي',
    specialization: 'تجويد عملي وتثبيت جزء عم وتبارك',
    status: 'active',
    joinedYear: 2021,
    notes: 'معلم حلقة الصف الرابع الابتدائي',
  },
  {
    id: 'teach_3',
    fullName: 'أ. بسام البعيجان',
    phoneNumber: '+966508105571',
    role: 'teacher',
    assignedHalaqahId: 'hal_grade5',
    assignedHalaqahName: 'حلقة الصف الخامس الابتدائي',
    specialization: 'حفظ ومراجعة متقدمة وتثبيت',
    status: 'active',
    joinedYear: 2022,
    notes: 'معلم حلقة الصف الخامس الابتدائي',
  },
  {
    id: 'teach_4',
    fullName: 'أ. جابر الشهري',
    phoneNumber: '+966503263150',
    role: 'teacher',
    assignedHalaqahId: 'hal_grade6',
    assignedHalaqahName: 'حلقة الصف السادس الابتدائي',
    specialization: 'ضبط المتشابهات والتجويد العملي',
    status: 'active',
    joinedYear: 2022,
    notes: 'معلم حلقة الصف السادس الابتدائي',
  },
  {
    id: 'teach_5',
    fullName: 'أ. عبدالله العتيبي',
    phoneNumber: '+966531816200',
    role: 'teacher',
    assignedHalaqahId: 'hal_intermediate',
    assignedHalaqahName: 'حلقة المرحلة المتوسطة',
    specialization: 'حفظ وضبط الأجزاء ومتابعة متقدمة',
    status: 'active',
    joinedYear: 2020,
    notes: 'معلم حلقة المرحلة المتوسطة',
  },
  {
    id: 'teach_6',
    fullName: 'أ. وليد عبدالله العتيبي',
    phoneNumber: '+966501270970',
    role: 'teacher',
    assignedHalaqahId: 'hal_secondary',
    assignedHalaqahName: 'حلقة المرحلة الثانوية',
    specialization: 'مسار الإتقان والإجازات بالسند المتصل',
    status: 'active',
    joinedYear: 2019,
    notes: 'معلم حلقة المرحلة الثانوية',
  },
  // المشرفون
  {
    id: 'sup_1',
    fullName: 'الشيخ فهد بن خالد العتيبي',
    phoneNumber: '',
    role: 'supervisor',
    specialization: 'الإشراف العام والمتابعة الميدانية',
    status: 'active',
    joinedYear: 2018,
    notes: 'المشرف العام على حلقات جامع ابن باز',
  },
  {
    id: 'sup_2',
    fullName: 'الشيخ سعد بن ناصر القحطاني',
    phoneNumber: '',
    role: 'supervisor',
    specialization: 'المتابعة الإدارية وشؤون الطلاب',
    status: 'active',
    joinedYear: 2020,
    notes: 'المشرف الإداري وشؤون الطلاب',
  },
  {
    id: 'sup_3',
    fullName: 'الشيخ إبراهيم بن محمد الدوسري',
    phoneNumber: '',
    role: 'supervisor',
    specialization: 'التوجيه التعليمي والبرامج الإيمانية',
    status: 'active',
    joinedYear: 2021,
    notes: 'المشرف التعليمي لحلقات جامع ابن باز',
  },
];

// كشف الطلاب الحقيقي المعتمد بأرقام التواصل الحقيقية من الملف المرفق (123 طالباً)
export const INITIAL_STUDENTS: Student[] = [
  // -------------------------------------------------------------
  // 1. حلقة الصفوف الأولية (المعلم: أ. دين مصباح) - 26 طالباً
  // -------------------------------------------------------------
  { id: 'std_101', halaqahId: 'hal_early', halaqahSerial: 1, fullName: 'سيف مؤمن', guardianName: 'ولي أمر سيف مؤمن', guardianPhone: '0556014049', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_102', halaqahId: 'hal_early', halaqahSerial: 2, fullName: 'عمر العيسى', guardianName: 'ولي أمر عمر العيسى', guardianPhone: '0554250444', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_103', halaqahId: 'hal_early', halaqahSerial: 3, fullName: 'محمد الشهراني', guardianName: 'ولي أمر محمد الشهراني', guardianPhone: '0500100245', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_104', halaqahId: 'hal_early', halaqahSerial: 4, fullName: 'فرحان العنزي', guardianName: 'ولي أمر فرحان العنزي', guardianPhone: '0555965388', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_105', halaqahId: 'hal_early', halaqahSerial: 5, fullName: 'وسام المطيري', guardianName: 'ولي أمر وسام المطيري', guardianPhone: '0508111529', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_106', halaqahId: 'hal_early', halaqahSerial: 6, fullName: 'فهد العتيبي', guardianName: 'ولي أمر فهد العتيبي', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_107', halaqahId: 'hal_early', halaqahSerial: 7, fullName: 'فهد الشمري', guardianName: 'ولي أمر فهد الشمري', guardianPhone: '0558850406', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_108', halaqahId: 'hal_early', halaqahSerial: 8, fullName: 'عبدالله جمال', guardianName: 'ولي أمر عبدالله جمال', guardianPhone: '0502439643', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_109', halaqahId: 'hal_early', halaqahSerial: 9, fullName: 'راكان المطيري', guardianName: 'ولي أمر راكان المطيري', guardianPhone: '0555780797', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_110', halaqahId: 'hal_early', halaqahSerial: 10, fullName: 'محمد الحجوري', guardianName: 'ولي أمر محمد الحجوري', guardianPhone: '0566301332', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_111', halaqahId: 'hal_early', halaqahSerial: 11, fullName: 'نادر العنزي', guardianName: 'ولي أمر نادر العنزي', guardianPhone: '0566657686', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_112', halaqahId: 'hal_early', halaqahSerial: 12, fullName: 'باسل الفيفي', guardianName: 'ولي أمر باسل الفيفي', guardianPhone: '0506485034', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_113', halaqahId: 'hal_early', halaqahSerial: 13, fullName: 'فهد السعدي', guardianName: 'ولي أمر فهد السعدي', guardianPhone: '0509668687', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_114', halaqahId: 'hal_early', halaqahSerial: 14, fullName: 'فهد سلطان الشهري', guardianName: 'ولي أمر فهد سلطان الشهري', guardianPhone: '0555100978', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_115', halaqahId: 'hal_early', halaqahSerial: 15, fullName: 'اياد العنزي', guardianName: 'ولي أمر اياد العنزي', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_116', halaqahId: 'hal_early', halaqahSerial: 16, fullName: 'مؤيد المطيري', guardianName: 'ولي أمر مؤيد المطيري', guardianPhone: '0553552558', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_117', halaqahId: 'hal_early', halaqahSerial: 17, fullName: 'فهد الحربي', guardianName: 'ولي أمر فهد الحربي', guardianPhone: '0555178589', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_118', halaqahId: 'hal_early', halaqahSerial: 18, fullName: 'عبدالرحمن القحطاني', guardianName: 'ولي أمر عبدالرحمن القحطاني', guardianPhone: '0554423398', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_119', halaqahId: 'hal_early', halaqahSerial: 19, fullName: 'لؤي الشهري', guardianName: 'ولي أمر لؤي الشهري', guardianPhone: '0552140721', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_120', halaqahId: 'hal_early', halaqahSerial: 20, fullName: 'سعد الحزيمي', guardianName: 'ولي أمر سعد الحزيمي', guardianPhone: '0541366654', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_121', halaqahId: 'hal_early', halaqahSerial: 21, fullName: 'عبدالملك القرني', guardianName: 'ولي أمر عبدالملك القرني', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_122', halaqahId: 'hal_early', halaqahSerial: 22, fullName: 'محمد الحربي', guardianName: 'ولي أمر محمد الحربي', guardianPhone: '05555689967', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_123', halaqahId: 'hal_early', halaqahSerial: 23, fullName: 'محمد الزهراني', guardianName: 'ولي أمر محمد الزهراني', guardianPhone: '0569632877', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_124', halaqahId: 'hal_early', halaqahSerial: 24, fullName: 'عبدالملك القحطاني', guardianName: 'ولي أمر عبدالملك القحطاني', guardianPhone: '0554116599', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },
  { id: 'std_125', halaqahId: 'hal_early', halaqahSerial: 25, fullName: 'هشام الحارثي', guardianName: 'ولي أمر هشام الحارثي', guardianPhone: '0500352843', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2017, status: 'active' },
  { id: 'std_126', halaqahId: 'hal_early', halaqahSerial: 26, fullName: 'عبدالعزيز الجهني', guardianName: 'ولي أمر عبدالعزيز الجهني', guardianPhone: '0561900111', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_early', currentJuz: 1, birthYear: 2018, status: 'active' },

  // -------------------------------------------------------------
  // 2. حلقة الصف الرابع الابتدائي (المعلم: أ. بندر القحطاني) - 15 طالباً
  // -------------------------------------------------------------
  { id: 'std_201', halaqahId: 'hal_grade4', halaqahSerial: 1, fullName: 'عبدالعزيز الاكلبي', guardianName: 'ولي أمر عبدالعزيز الاكلبي', guardianPhone: '0556117895', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_202', halaqahId: 'hal_grade4', halaqahSerial: 2, fullName: 'احمد مسلط العتيبي', guardianName: 'ولي أمر احمد مسلط العتيبي', guardianPhone: '0549699990', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_203', halaqahId: 'hal_grade4', halaqahSerial: 3, fullName: 'مسعد مسلط العتيبي', guardianName: 'ولي أمر مسعد مسلط العتيبي', guardianPhone: '0549699990', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_204', halaqahId: 'hal_grade4', halaqahSerial: 4, fullName: 'حمدان الحلافي', guardianName: 'ولي أمر حمدان الحلافي', guardianPhone: '0531574763', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_205', halaqahId: 'hal_grade4', halaqahSerial: 5, fullName: 'اياد شراحيلي', guardianName: 'ولي أمر اياد شراحيلي', guardianPhone: '0599665755', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_206', halaqahId: 'hal_grade4', halaqahSerial: 6, fullName: 'سعود المطيري', guardianName: 'ولي أمر سعود المطيري', guardianPhone: '0555916452', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_207', halaqahId: 'hal_grade4', halaqahSerial: 7, fullName: 'تميم البارقي', guardianName: 'ولي أمر تميم البارقي', guardianPhone: '0590464999', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_208', halaqahId: 'hal_grade4', halaqahSerial: 8, fullName: 'نواف الشهراني', guardianName: 'ولي أمر نواف الشهراني', guardianPhone: '0533355457', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_209', halaqahId: 'hal_grade4', halaqahSerial: 9, fullName: 'أسامة عقاقي', guardianName: 'ولي أمر أسامة عقاقي', guardianPhone: '0500157418', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_210', halaqahId: 'hal_grade4', halaqahSerial: 10, fullName: 'فواز الشمري', guardianName: 'ولي أمر فواز الشمري', guardianPhone: '0558850406', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_211', halaqahId: 'hal_grade4', halaqahSerial: 11, fullName: 'نايف العتيبي', guardianName: 'ولي أمر نايف العتيبي', guardianPhone: '0541366654', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_212', halaqahId: 'hal_grade4', halaqahSerial: 12, fullName: 'ريان جبران سلمان', guardianName: 'ولي أمر ريان جبران سلمان', guardianPhone: '0537139951', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_213', halaqahId: 'hal_grade4', halaqahSerial: 13, fullName: 'سلطان العتيبي', guardianName: 'ولي أمر سلطان العتيبي', guardianPhone: '0507449446', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_214', halaqahId: 'hal_grade4', halaqahSerial: 14, fullName: 'راكان عسيري', guardianName: 'ولي أمر راكان عسيري', guardianPhone: '0504411668', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },
  { id: 'std_215', halaqahId: 'hal_grade4', halaqahSerial: 15, fullName: 'تميم القرني', guardianName: 'ولي أمر تميم القرني', guardianPhone: '0556199370', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 2, birthYear: 2015, status: 'active' },

  // -------------------------------------------------------------
  // 3. حلقة الصف الخامس الابتدائي (المعلم: أ. بسام البعيجان) - 25 طالباً
  // -------------------------------------------------------------
  { id: 'std_301', halaqahId: 'hal_grade5', halaqahSerial: 1, fullName: 'حسام المطيري', guardianName: 'ولي أمر حسام المطيري', guardianPhone: '0553552558', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_302', halaqahId: 'hal_grade5', halaqahSerial: 2, fullName: 'تميم حشيم الحربي', guardianName: 'ولي أمر تميم حشيم الحربي', guardianPhone: '0594400181', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_303', halaqahId: 'hal_grade5', halaqahSerial: 3, fullName: 'عمر قالط القحطاني', guardianName: 'ولي أمر عمر قالط القحطاني', guardianPhone: '0554480738', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_304', halaqahId: 'hal_grade5', halaqahSerial: 4, fullName: 'إبراهيم الشهري', guardianName: 'ولي أمر إبراهيم الشهري', guardianPhone: '0560097111', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_305', halaqahId: 'hal_grade5', halaqahSerial: 5, fullName: 'بندر الدلبحي', guardianName: 'ولي أمر بندر الدلبحي', guardianPhone: '0560080552', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_306', halaqahId: 'hal_grade5', halaqahSerial: 6, fullName: 'يامن الحربي', guardianName: 'ولي أمر يامن الحربي', guardianPhone: '0566857063', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_307', halaqahId: 'hal_grade5', halaqahSerial: 7, fullName: 'سعد العلياني', guardianName: 'ولي أمر سعد العلياني', guardianPhone: '0591803652', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_308', halaqahId: 'hal_grade5', halaqahSerial: 8, fullName: 'إبراهيم العنزي', guardianName: 'ولي أمر إبراهيم العنزي', guardianPhone: '0490070684', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_309', halaqahId: 'hal_grade5', halaqahSerial: 9, fullName: 'سلمان القحطاني', guardianName: 'ولي أمر سلمان القحطاني', guardianPhone: '0552580555', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_310', halaqahId: 'hal_grade5', halaqahSerial: 10, fullName: 'محمود مؤمن', guardianName: 'ولي أمر محمود مؤمن', guardianPhone: '0556014049', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_311', halaqahId: 'hal_grade5', halaqahSerial: 11, fullName: 'مالك العتيبي', guardianName: 'ولي أمر مالك العتيبي', guardianPhone: '0550028281', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_312', halaqahId: 'hal_grade5', halaqahSerial: 12, fullName: 'امير القرني', guardianName: 'ولي أمر امير القرني', guardianPhone: '0507660264', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_313', halaqahId: 'hal_grade5', halaqahSerial: 13, fullName: 'وسام القحطاني', guardianName: 'ولي أمر وسام القحطاني', guardianPhone: '0554423398', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_314', halaqahId: 'hal_grade5', halaqahSerial: 14, fullName: 'سعود العنزي', guardianName: 'ولي أمر سعود العنزي', guardianPhone: '0591492009', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_315', halaqahId: 'hal_grade5', halaqahSerial: 15, fullName: 'بدر الذيابي', guardianName: 'ولي أمر بدر الذيابي', guardianPhone: '0500259175', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_316', halaqahId: 'hal_grade5', halaqahSerial: 16, fullName: 'اياد الزهراني', guardianName: 'ولي أمر اياد الزهراني', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_317', halaqahId: 'hal_grade5', halaqahSerial: 17, fullName: 'راكان الشهري', guardianName: 'ولي أمر راكان الشهري', guardianPhone: '0506923644', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_318', halaqahId: 'hal_grade5', halaqahSerial: 18, fullName: 'سلمان الكريديس', guardianName: 'ولي أمر سلمان الكريديس', guardianPhone: '0543333405', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_319', halaqahId: 'hal_grade5', halaqahSerial: 19, fullName: 'سعد مساعد الحربي', guardianName: 'ولي أمر سعد مساعد الحربي', guardianPhone: '0555178589', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_320', halaqahId: 'hal_grade5', halaqahSerial: 20, fullName: 'اديب احمد المطيري', guardianName: 'ولي أمر اديب احمد المطيري', guardianPhone: '0552821594', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_321', halaqahId: 'hal_grade5', halaqahSerial: 21, fullName: 'محمد إبراهيم عسيري', guardianName: 'ولي أمر محمد إبراهيم عسيري', guardianPhone: '0559594963', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_322', halaqahId: 'hal_grade5', halaqahSerial: 22, fullName: 'سلطان البقمي', guardianName: 'ولي أمر سلطان البقمي', guardianPhone: '0552928287', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_323', halaqahId: 'hal_grade5', halaqahSerial: 23, fullName: 'حسن الفيفي', guardianName: 'ولي أمر حسن الفيفي', guardianPhone: '0599153955', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_324', halaqahId: 'hal_grade5', halaqahSerial: 24, fullName: 'هتان الشهراني', guardianName: 'ولي أمر هتان الشهراني', guardianPhone: '0550557044', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },
  { id: 'std_325', halaqahId: 'hal_grade5', halaqahSerial: 25, fullName: 'يزيد القحطاني', guardianName: 'ولي أمر يزيد القحطاني', guardianPhone: '0554116599', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 3, birthYear: 2014, status: 'active' },

  // -------------------------------------------------------------
  // 4. حلقة الصف السادس الابتدائي (المعلم: أ. جابر الشهري) - 11 طالباً
  // -------------------------------------------------------------
  { id: 'std_401', halaqahId: 'hal_grade6', halaqahSerial: 1, fullName: 'عماد الحجوري', guardianName: 'ولي أمر عماد الحجوري', guardianPhone: '0566301332', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_402', halaqahId: 'hal_grade6', halaqahSerial: 2, fullName: 'محمد عامر عسيري', guardianName: 'ولي أمر محمد عامر عسيري', guardianPhone: '0531908228', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_403', halaqahId: 'hal_grade6', halaqahSerial: 3, fullName: 'عمر عبدالعزيز العتيبي', guardianName: 'ولي أمر عمر عبدالعزيز العتيبي', guardianPhone: '0567772773', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_404', halaqahId: 'hal_grade6', halaqahSerial: 4, fullName: 'حسام الشهري', guardianName: 'ولي أمر حسام الشهري', guardianPhone: '0552140721', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_405', halaqahId: 'hal_grade6', halaqahSerial: 5, fullName: 'مازن الاكلبي', guardianName: 'ولي أمر مازن الاكلبي', guardianPhone: '0550064355', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_406', halaqahId: 'hal_grade6', halaqahSerial: 6, fullName: 'محمد مدخلي', guardianName: 'ولي أمر محمد مدخلي', guardianPhone: '0508479620', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_407', halaqahId: 'hal_grade6', halaqahSerial: 7, fullName: 'هيثم الشهري', guardianName: 'ولي أمر هيثم الشهري', guardianPhone: '0560097111', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_408', halaqahId: 'hal_grade6', halaqahSerial: 8, fullName: 'علي كعبي', guardianName: 'ولي أمر علي كعبي', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_409', halaqahId: 'hal_grade6', halaqahSerial: 9, fullName: 'زياد الجهني', guardianName: 'ولي أمر زياد الجهني', guardianPhone: '0540054948', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_410', halaqahId: 'hal_grade6', halaqahSerial: 10, fullName: 'هاني الحارثي', guardianName: 'ولي أمر هاني الحارثي', guardianPhone: '0500352843', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },
  { id: 'std_411', halaqahId: 'hal_grade6', halaqahSerial: 11, fullName: 'فهد العتيبي', guardianName: 'ولي أمر فهد العتيبي', guardianPhone: '0507449446', guardianRelation: 'ولي أمر الطالب', stageId: 'primary_upper', currentJuz: 4, birthYear: 2013, status: 'active' },

  // -------------------------------------------------------------
  // 5. حلقة المرحلة المتوسطة (المعلم: أ. عبد الله العتيبي) - 23 طالباً
  // -------------------------------------------------------------
  { id: 'std_501', halaqahId: 'hal_intermediate', halaqahSerial: 1, fullName: 'بتال المطيري', guardianName: 'ولي أمر بتال المطيري', guardianPhone: '0508111529', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 7, birthYear: 2011, status: 'active' },
  { id: 'std_502', halaqahId: 'hal_intermediate', halaqahSerial: 2, fullName: 'اديب المطيري', guardianName: 'ولي أمر اديب المطيري', guardianPhone: '0508111529', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 7, birthYear: 2011, status: 'active' },
  { id: 'std_503', halaqahId: 'hal_intermediate', halaqahSerial: 3, fullName: 'انس عبدالله الحربي', guardianName: 'ولي أمر انس عبدالله الحربي', guardianPhone: '0555689967', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 8, birthYear: 2012, status: 'active' },
  { id: 'std_504', halaqahId: 'hal_intermediate', halaqahSerial: 4, fullName: 'زعم القثامي', guardianName: 'ولي أمر زعم القثامي', guardianPhone: '0554477835', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 6, birthYear: 2011, status: 'active' },
  { id: 'std_505', halaqahId: 'hal_intermediate', halaqahSerial: 5, fullName: 'فهد الشهراني', guardianName: 'ولي أمر فهد الشهراني', guardianPhone: '0500100245', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 9, birthYear: 2012, status: 'active' },
  { id: 'std_506', halaqahId: 'hal_intermediate', halaqahSerial: 6, fullName: 'عبدالمجيد القحطاني', guardianName: 'ولي أمر عبدالمجيد القحطاني', guardianPhone: '0501914004', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 10, birthYear: 2010, status: 'active' },
  { id: 'std_507', halaqahId: 'hal_intermediate', halaqahSerial: 7, fullName: 'عبدالله العيسى', guardianName: 'ولي أمر عبدالله العيسى', guardianPhone: '0554250444', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 8, birthYear: 2011, status: 'active' },
  { id: 'std_508', halaqahId: 'hal_intermediate', halaqahSerial: 8, fullName: 'زياد المطيري', guardianName: 'ولي أمر زياد المطيري', guardianPhone: '0555916452', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 7, birthYear: 2012, status: 'active' },
  { id: 'std_509', halaqahId: 'hal_intermediate', halaqahSerial: 9, fullName: 'فيصل القحطاني', guardianName: 'ولي أمر فيصل القحطاني', guardianPhone: '0551762227', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 11, birthYear: 2010, status: 'active' },
  { id: 'std_510', halaqahId: 'hal_intermediate', halaqahSerial: 10, fullName: 'باسل المطيري', guardianName: 'ولي أمر باسل المطيري', guardianPhone: '0553552558', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 6, birthYear: 2011, status: 'active' },
  { id: 'std_511', halaqahId: 'hal_intermediate', halaqahSerial: 11, fullName: 'سلمان الروقي', guardianName: 'ولي أمر سلمان الروقي', guardianPhone: '0504625951', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 9, birthYear: 2012, status: 'active' },
  { id: 'std_512', halaqahId: 'hal_intermediate', halaqahSerial: 12, fullName: 'علي هادي طمحان', guardianName: 'ولي أمر علي هادي طمحان', guardianPhone: '0554933287', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 10, birthYear: 2010, status: 'active' },
  { id: 'std_513', halaqahId: 'hal_intermediate', halaqahSerial: 13, fullName: 'غازي الحارثي', guardianName: 'ولي أمر غازي الحارثي', guardianPhone: '0500352843', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 8, birthYear: 2011, status: 'active' },
  { id: 'std_514', halaqahId: 'hal_intermediate', halaqahSerial: 14, fullName: 'سلطان العتيبي', guardianName: 'ولي أمر سلطان العتيبي', guardianPhone: '0567772773', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 7, birthYear: 2012, status: 'active' },
  { id: 'std_515', halaqahId: 'hal_intermediate', halaqahSerial: 15, fullName: 'عبدالله فلاج العتيبي', guardianName: 'ولي أمر عبدالله فلاج العتيبي', guardianPhone: '0502833326', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 9, birthYear: 2011, status: 'active' },
  { id: 'std_516', halaqahId: 'hal_intermediate', halaqahSerial: 16, fullName: 'سيف عسيري', guardianName: 'ولي أمر سيف عسيري', guardianPhone: '0500836213', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 8, birthYear: 2012, status: 'active' },
  { id: 'std_517', halaqahId: 'hal_intermediate', halaqahSerial: 17, fullName: 'ناصر العنزي', guardianName: 'ولي أمر ناصر العنزي', guardianPhone: '0530333321', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 6, birthYear: 2011, status: 'active' },
  { id: 'std_518', halaqahId: 'hal_intermediate', halaqahSerial: 18, fullName: 'يزن الاكلبي', guardianName: 'ولي أمر يزن الاكلبي', guardianPhone: '0550064355', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 7, birthYear: 2012, status: 'active' },
  { id: 'std_519', halaqahId: 'hal_intermediate', halaqahSerial: 19, fullName: 'علي الاكلبي', guardianName: 'ولي أمر علي الاكلبي', guardianPhone: '0556117895', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 9, birthYear: 2010, status: 'active' },
  { id: 'std_520', halaqahId: 'hal_intermediate', halaqahSerial: 20, fullName: 'الوليد العنزي', guardianName: 'ولي أمر الوليد العنزي', guardianPhone: '0530333321', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 10, birthYear: 2011, status: 'active' },
  { id: 'std_521', halaqahId: 'hal_intermediate', halaqahSerial: 21, fullName: 'عمر القحطاني', guardianName: 'ولي أمر عمر القحطاني', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 8, birthYear: 2012, status: 'active' },
  { id: 'std_522', halaqahId: 'hal_intermediate', halaqahSerial: 22, fullName: 'خالد معدي', guardianName: 'ولي أمر خالد معدي', guardianPhone: '0540607938', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 11, birthYear: 2010, status: 'active' },
  { id: 'std_523', halaqahId: 'hal_intermediate', halaqahSerial: 23, fullName: 'رائد العتيبي', guardianName: 'ولي أمر رائد العتيبي', guardianPhone: '0541551020', guardianRelation: 'ولي أمر الطالب', stageId: 'intermediate', currentJuz: 9, birthYear: 2011, status: 'active' },

  // -------------------------------------------------------------
  // 6. حلقة المرحلة الثانوية (المعلم: أ. وليد العتيبي) - 23 طالباً
  // -------------------------------------------------------------
  { id: 'std_601', halaqahId: 'hal_secondary', halaqahSerial: 1, fullName: 'محمد هذال الحربي', guardianName: 'ولي أمر محمد هذال الحربي', guardianPhone: '0543990999', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 18, birthYear: 2008, status: 'active' },
  { id: 'std_602', halaqahId: 'hal_secondary', halaqahSerial: 2, fullName: 'مهند الحربي', guardianName: 'ولي أمر مهند الحربي', guardianPhone: '0554177747', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 20, birthYear: 2008, status: 'active' },
  { id: 'std_603', halaqahId: 'hal_secondary', halaqahSerial: 3, fullName: 'عبدالله الشهري', guardianName: 'ولي أمر عبدالله الشهري', guardianPhone: '0560097111', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 17, birthYear: 2009, status: 'active' },
  { id: 'std_604', halaqahId: 'hal_secondary', halaqahSerial: 4, fullName: 'حسين المحيسن', guardianName: 'ولي أمر حسين المحيسن', guardianPhone: '0500005784', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 22, birthYear: 2007, status: 'active' },
  { id: 'std_605', halaqahId: 'hal_secondary', halaqahSerial: 5, fullName: 'عمر الحربي', guardianName: 'ولي أمر عمر الحربي', guardianPhone: '0563311190', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 16, birthYear: 2009, status: 'active' },
  { id: 'std_606', halaqahId: 'hal_secondary', halaqahSerial: 6, fullName: 'علي الشهراني', guardianName: 'ولي أمر علي الشهراني', guardianPhone: '0550557044', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 25, birthYear: 2008, status: 'active' },
  { id: 'std_607', halaqahId: 'hal_secondary', halaqahSerial: 7, fullName: 'ريان السيد', guardianName: 'ولي أمر ريان السيد', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 19, birthYear: 2008, status: 'active' },
  { id: 'std_608', halaqahId: 'hal_secondary', halaqahSerial: 8, fullName: 'عمر العتيبي', guardianName: 'ولي أمر عمر العتيبي', guardianPhone: '0550028281', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 21, birthYear: 2007, status: 'active' },
  { id: 'std_609', halaqahId: 'hal_secondary', halaqahSerial: 9, fullName: 'عبدالاله قالط القحطاني', guardianName: 'ولي أمر عبدالاله قالط القحطاني', guardianPhone: '0554480738', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 24, birthYear: 2008, status: 'active' },
  { id: 'std_610', halaqahId: 'hal_secondary', halaqahSerial: 10, fullName: 'أسامة القحطاني', guardianName: 'ولي أمر أسامة القحطاني', guardianPhone: '0504114801', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 20, birthYear: 2009, status: 'active' },
  { id: 'std_611', halaqahId: 'hal_secondary', halaqahSerial: 11, fullName: 'إبراهيم العتيبي', guardianName: 'ولي أمر إبراهيم العتيبي', guardianPhone: '0500259175', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 23, birthYear: 2007, status: 'active' },
  { id: 'std_612', halaqahId: 'hal_secondary', halaqahSerial: 12, fullName: 'مشاري الشمراني', guardianName: 'ولي أمر مشاري الشمراني', guardianPhone: '0503059416', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 18, birthYear: 2008, status: 'active' },
  { id: 'std_613', halaqahId: 'hal_secondary', halaqahSerial: 13, fullName: 'محمد تركي الدوسري', guardianName: 'ولي أمر محمد تركي الدوسري', guardianPhone: '0506058300', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 26, birthYear: 2007, status: 'active' },
  { id: 'std_614', halaqahId: 'hal_secondary', halaqahSerial: 14, fullName: 'وليد تركي الدوسري', guardianName: 'ولي أمر وليد تركي الدوسري', guardianPhone: '0506058300', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 27, birthYear: 2007, status: 'active' },
  { id: 'std_615', halaqahId: 'hal_secondary', halaqahSerial: 15, fullName: 'احمد هادي طمحان', guardianName: 'ولي أمر احمد هادي طمحان', guardianPhone: '0554933287', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 22, birthYear: 2008, status: 'active' },
  { id: 'std_616', halaqahId: 'hal_secondary', halaqahSerial: 16, fullName: 'خالد القحطاني', guardianName: 'ولي أمر خالد القحطاني', guardianPhone: '0500157418', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 25, birthYear: 2008, status: 'active' },
  { id: 'std_617', halaqahId: 'hal_secondary', halaqahSerial: 17, fullName: 'احمد نايف عقاقي', guardianName: 'ولي أمر احمد نايف عقاقي', guardianPhone: '0500157418', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 19, birthYear: 2009, status: 'active' },
  { id: 'std_618', halaqahId: 'hal_secondary', halaqahSerial: 18, fullName: 'عبدالله ياسر الحسين', guardianName: 'ولي أمر عبدالله ياسر الحسين', guardianPhone: '0569040827', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 28, birthYear: 2007, status: 'active' },
  { id: 'std_619', halaqahId: 'hal_secondary', halaqahSerial: 19, fullName: 'ايهم شقراني', guardianName: 'ولي أمر ايهم شقراني', guardianPhone: '', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 21, birthYear: 2008, status: 'active' },
  { id: 'std_620', halaqahId: 'hal_secondary', halaqahSerial: 20, fullName: 'خالد عبدالله الحربي', guardianName: 'ولي أمر خالد عبدالله الحربي', guardianPhone: '0555689967', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 29, birthYear: 2007, status: 'active' },
  { id: 'std_621', halaqahId: 'hal_secondary', halaqahSerial: 21, fullName: 'خالد شراحيلي', guardianName: 'ولي أمر خالد شراحيلي', guardianPhone: '0599665755', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 23, birthYear: 2008, status: 'active' },
  { id: 'std_622', halaqahId: 'hal_secondary', halaqahSerial: 22, fullName: 'خالد عايد العتيبي', guardianName: 'ولي أمر خالد عايد العتيبي', guardianPhone: '0506494153', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 30, birthYear: 2007, status: 'active' },
  { id: 'std_623', halaqahId: 'hal_secondary', halaqahSerial: 23, fullName: 'عبدالرحمن الشهري', guardianName: 'ولي أمر عبدالرحمن الشهري', guardianPhone: '0505286304', guardianRelation: 'ولي أمر الطالب', stageId: 'secondary', currentJuz: 30, birthYear: 2006, status: 'active' },
];

export const SAMPLE_STUDENTS_DEMO = INITIAL_STUDENTS;

// أنشطة وبرامج سريعة
export const INITIAL_PRESETS: ActivityQuickPreset[] = [
  {
    id: 'act_sports_match',
    title: 'دوري كرة القدم الشهري لطلاب الحلقات',
    category: 'sports',
    icon: '⚽',
    defaultLocation: 'ملعب مجمع جامع ابن باز الرياضي',
    defaultTime: 'يوم الخميس القادم بعد صلاة العصر',
    templateMessage: `🏆 *إعلان: دوري التحدي الرياضي لطلاب حلقات ابن باز* ⚽

أولياء الأمور الكرام،
يسر إدارة الحلقات دعوة أبنائنا الطلاب الملتزمين بالحفظ للمشاركة في الدوري الرياضي الشهري لكرة القدم:
📍 *المكان:* {location}
⏰ *الموعد:* {time}
نأمل التنسيق مع مشرف الحلقة لتأكيد المشاركة.`,
  },
  {
    id: 'act_quran_competition',
    title: 'مسابقة "الماهر بالقرآن" الفصلية',
    category: 'competition',
    icon: '🏆',
    defaultLocation: 'قاعة المحاضرات بجامع ابن باز',
    defaultTime: 'الأسبوع القادم بين المغرب والعشاء',
    templateMessage: `✨ *انطلاق مسابقة "الماهر بالقرآن الكريم"* 🏆

قال رسول الله ﷺ: «الماهر بالقرآن مع السفرة الكرام البررة».
تعلن إدارة حلقات ابن باز عن بدء اختبارات المسابقة الفصلية لحفظ القرآن الكريم وتجويده:
📍 *المكان:* {location}
⏰ *الوقت:* {time}
جوائز نقدية وتقديرية قيمة للمراكز الثلاثة الأولى في كل مرحلة!`,
  },
  {
    id: 'act_timing_announcement',
    title: 'إشعار تعديل مواعيد الحلقات (التوقيت الشتوي)',
    category: 'announcement',
    icon: '⏰',
    defaultLocation: 'جامع ابن باز',
    defaultTime: 'يبدأ التطبيق من الأحد القادم',
    templateMessage: `📢 *إشعار هام: اعتماد مواعيد الحلقات الشتوية* ⏰

أولياء الأمور الأفاضل،
نود إحاطتكم بأنه تقرر تعديل مواعيد بدء وانصراف الحلقات ليتناسب مع وقت الصلاة:
🕒 *الموعد الجديد:*
  • حلقة العصر: تبدأ فور انتهاء الصلاة وتنتهي قبل أذان المغرب بنصف ساعة.
  • حلقة المغرب: تبدأ بعد الصلاة مباشرة حتى أذان العشاء.
شاكرين لكم تعاونكم الدائم في ضبط حضور أبنائنا.`,
  },
];

// Helper to get today's date YYYY-MM-DD dynamically from local system time
export function getTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date());
  } catch {
    return '2026-11-03';
  }
}

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export function formatArabicDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIdx, day);
    const dayName = ARABIC_DAYS[dateObj.getDay()] || '';
    const monthName = ARABIC_MONTHS[monthIdx] || '';
    return `${dayName}، ${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

export function getTodayFormattedArabic(): string {
  return formatArabicDate(getTodayDateString());
}

// توليد سجلات الحضور التاريخية واليومية للـ 123 طالباً (اليوم، الأمس، والتواريخ السابقة)
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = getTodayDateString();

  const targetDates = [
    { date: today, label: 'اليوم' },
    { date: '2026-11-02', label: 'أمس' },
    { date: '2026-10-29', label: '29 أكتوبر 2026' },
    { date: '2026-10-28', label: 'الأسبوع الماضي' },
    { date: '2026-10-21', label: 'قبل أسبوعين' },
    { date: '2026-10-03', label: 'قبل شهر' },
  ];

  targetDates.forEach(({ date }, dIdx) => {
    INITIAL_STUDENTS.forEach((student, sIdx) => {
      let status: AttendanceRecord['status'] = 'present';
      let recited = true;
      let checkInTime: string | undefined = '04:10 م';
      let latenessMinutes = 0;
      const uniformCompliant = true;
      let notes = 'حضور منتظم';

      if (dIdx === 0) {
        if (student.id === 'std_105' || student.id === 'std_206' || student.id === 'std_308' || student.id === 'std_510') {
          status = 'absent';
          recited = false;
          checkInTime = undefined;
          notes = 'غياب بدون عذر مسبق';
        } else if (student.id === 'std_112' || student.id === 'std_315' || student.id === 'std_605') {
          status = 'late';
          recited = true;
          checkInTime = '04:30 م';
          latenessMinutes = 20;
          notes = 'تأخر 20 دقيقة بسبب زحام السير';
        } else if (student.id === 'std_405' || student.id === 'std_517') {
          status = 'excused';
          recited = false;
          checkInTime = undefined;
          notes = 'استئذان لموعد عائلي بعلم ولي الأمر';
        }
      } else {
        const hash = (sIdx * 3 + dIdx * 7) % 17;
        if (hash === 2) {
          status = 'absent';
          recited = false;
          notes = 'غياب مرصود في الأرشيف';
        } else if (hash === 5) {
          status = 'late';
          recited = true;
          checkInTime = '04:25 م';
          latenessMinutes = 15;
          notes = 'تأخر 15 دقيقة';
        } else if (hash === 9) {
          status = 'excused';
          recited = false;
          notes = 'عذر رسمي معتمد';
        }
      }

      records.push({
        id: `att_${student.id}_${date}`,
        date: date,
        studentId: student.id,
        halaqahId: student.halaqahId,
        status: status,
        recited: recited,
        recitationAmount: recited ? 'المقرر اليومي' : undefined,
        uniformCompliant: uniformCompliant,
        checkInTime: checkInTime,
        latenessMinutes: latenessMinutes,
        recordedAt: `${date}T16:45:00Z`,
        recordedBy: status === 'absent' ? 'telegram_bot' : 'manager',
        notes: notes,
        parentNotified: status === 'absent',
        parentNotifiedAt: status === 'absent' ? `${date}T16:50:00Z` : undefined,
      });
    });
  });

  return records;
}

// توليد سجلات حضور المعلمين والمشرفين
export function generateInitialTeacherAttendance(): TeacherAttendanceRecord[] {
  const records: TeacherAttendanceRecord[] = [];
  const today = getTodayDateString();

  const targetDates = [
    today,
    '2026-11-02',
    '2026-10-29',
    '2026-10-28',
    '2026-10-21',
    '2026-10-03',
  ];

  targetDates.forEach((date, dIdx) => {
    INITIAL_TEACHERS.forEach((teacher, tIdx) => {
      let status: TeacherAttendanceRecord['status'] = 'present';
      let checkInTime: string | undefined = '04:10 م';
      let latenessMinutes = 0;
      let notes = 'حضور منضبط والإشراف على الطلاب';

      if (dIdx === 0) {
        if (teacher.id === 'teach_4') {
          status = 'late';
          checkInTime = '04:25 م';
          latenessMinutes = 15;
          notes = 'تأخر 15 دقيقة بعلم المشرف';
        } else if (teacher.id === 'sup_3') {
          status = 'excused';
          checkInTime = undefined;
          notes = 'مهمة رسمية للإشراف على المسابقة القرآنية';
        }
      } else {
        const hash = (tIdx + dIdx * 3) % 9;
        if (hash === 3) {
          status = 'late';
          checkInTime = '04:20 م';
          latenessMinutes = 10;
          notes = 'تأخر 10 دقائق';
        } else if (hash === 7) {
          status = 'excused';
          checkInTime = undefined;
          notes = 'استئذان رسمي';
        }
      }

      records.push({
        id: `t_att_${teacher.id}_${date}`,
        date,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        role: teacher.role as 'teacher' | 'supervisor',
        status,
        checkInTime,
        latenessMinutes,
        notes,
        recordedAt: `${date}T16:30:00Z`,
      });
    });
  });

  return records;
}

export const INITIAL_LOGS: MessageLog[] = [
  {
    id: 'log_1',
    timestamp: '16:45 اليوم',
    type: 'incoming_teacher',
    recipient: 'بوت تيليجرام الرسمي (@DiwanSys_bot)',
    recipientName: 'مصباح نور الدين (معلم حلقة الصفوف الأولية)',
    text: 'حلقة الصفوف الأولية: الحاضرون 25، الغائبون: [5] وسام المطيري.',
    status: 'delivered',
    halaqahName: 'حلقة الصفوف الأولية',
  },
  {
    id: 'log_2',
    timestamp: '16:46 اليوم',
    type: 'group_broadcast',
    recipient: 'مجموعة حلقات ابن باز (@DiwanSys_bot)',
    recipientName: 'المجموعة العامة لحلقات جامع ابن باز',
    text: '📋 تم اعتماد تقرير حلقة الصفوف الأولية: الحضور (25)، الغياب (1).',
    status: 'delivered',
    halaqahName: 'حلقة الصفوف الأولية',
  },
  {
    id: 'log_3',
    timestamp: '16:47 اليوم',
    type: 'parent_alert',
    recipient: '0508111529',
    recipientName: 'ولي أمر الطالب وسام المطيري',
    text: 'السلام عليكم ورحمة الله، نود إفادتكم بغياب ابنكم وسام عن حلقة الصفوف الأولية اليوم.',
    status: 'delivered',
    studentName: 'وسام المطيري',
  },
];
