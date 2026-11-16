export type StageId = 'primary_early' | 'primary_upper' | 'intermediate' | 'secondary';

export interface Stage {
  id: StageId;
  name: string;
  shortName: string;
  description: string;
  gradeLevels: string[];
}

export interface Teacher {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: 'teacher' | 'supervisor' | 'deputy';
  assignedHalaqahId?: string;
  assignedHalaqahName?: string;
  specialization: string; // e.g. 'قراءات وإجازات', 'تجويد وتلقين', 'مراجعة وتثبيت'
  status: 'active' | 'leave' | 'inactive';
  joinedYear: number;
  notes?: string;
}

export interface Halaqah {
  id: string;
  name: string;
  stageId: StageId;
  teacherId?: string;
  teacherName: string;
  teacherPhone: string;
  timeSlot: 'after_asr' | 'after_maghrib' | 'after_isha' | 'after_fajr';
  timeSlotLabel: string;
  location: string;
  roomNumber: string;
  targetMemorization: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  halaqahId: string;
  halaqahSerial: number; // الرقم التسلسلي الفريد داخل الحلقة (1, 2, 3...)
  fullName: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  stageId: StageId;
  currentJuz: number;
  birthYear: number;
  status: 'active' | 'inactive';
  notes?: string;
  isNewStudent?: boolean; // تمييز الطالب الجديد المضاف في هذه الحلقة
  addedVia?: 'web' | 'telegram_bot' | 'ocr';
  addedAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  halaqahId: string;
  status: AttendanceStatus;
  recited?: boolean; // هل سمّع اليوم (true: سمّع، false: لم يُسمّع)
  recitationAmount?: string; // مقدار التسميع (مثال: وجه، وجهان، نصف جزء)
  uniformCompliant?: boolean; // الالتزام بالزي واللبس الرسمي للحلقة (true: ملتزم، false: غير ملتزم)
  checkInTime?: string; // وقت الحضور e.g. 04:15 م
  latenessMinutes?: number; // دقائق التأخير إن وجد
  recordedAt: string;
  recordedBy: string; // 'manager' | 'telegram_bot'
  notes?: string;
  parentNotified?: boolean;
  parentNotifiedAt?: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName: string;
  role: 'teacher' | 'supervisor';
  status: 'present' | 'absent' | 'excused' | 'late';
  checkInTime?: string; // e.g. "04:15 م"
  latenessMinutes?: number; // e.g. 15
  notes?: string;
  recordedAt: string;
}


export interface ActivityQuickPreset {
  id: string;
  title: string;
  category: 'sports' | 'reward' | 'trip' | 'competition' | 'announcement' | 'weather' | 'custom';
  icon: string;
  templateMessage: string;
  defaultLocation?: string;
  defaultTime?: string;
  isCustom?: boolean;
}

export interface MessageLog {
  id: string;
  timestamp: string;
  type: 'group_broadcast' | 'parent_alert' | 'incoming_teacher' | 'system_report';
  recipient: string;
  recipientName: string;
  text: string;
  status: 'sent' | 'delivered' | 'pending' | 'failed';
  halaqahName?: string;
  studentName?: string;
}

export interface BotIncomingSimulation {
  id: string;
  senderName: string;
  senderPhone: string;
  messageText: string;
  timestamp: string;
  parsedHalaqahId?: string;
  parsedAbsentSerials?: number[];
  parsedAbsentNames?: string[];
  status: 'processed' | 'unrecognized';
  responseMessage?: string;
  detectedHalaqahName?: string;
  presentCount?: number;
  absentCount?: number;
  recitedCount?: number;
}

export type UserRole = 'manager';

export interface DispatchPreviewConfig {
  isOpen: boolean;
  title: string;
  recipientLabel: string;
  recipientType: 'group' | 'parent' | 'batch_parents';
  messageText: string;
  initialOriginalText?: string;
  studentName?: string;
  phone?: string;
  batchCount?: number;
  batchData?: Array<{
    studentId: string;
    studentName: string;
    phone: string;
    message: string;
    halaqahName: string;
  }>;
  onConfirm: (finalMessageText: string) => Promise<void>;
}

export interface DeleteConfirmTarget {
  id: string;
  name: string;
  type: 'student' | 'halaqah' | 'teacher' | 'preset' | 'notification' | 'action';
  subtext?: string;
  details?: Record<string, string | number | undefined>;
}

export interface SheikhReportEvent {
  id: string;
  senderPhone: string;
  senderName: string;
  rawText: string;
  timestamp: string;
  detectedHalaqahName: string;
  presentCount: number;
  absentCount: number;
  absentNames: string[];
  absentSerials: number[];
  recitedCount: number;
  didNotReciteCount: number;
  replyText: string;
  source?: 'telegram' | 'simulation';
  chatId?: string | number;
}

export interface TelegramBotSession {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  botId: number;
  botUsername: string;
  botName: string;
  botUrl: string;
  receivedCount: number;
  lastReportAt?: string;
  error?: string | null;
}
export interface RingPreparationStatus {
  ringId: string;
  ringName: string;
  teacherName: string;
  preparedAt: string;
  date: string;
  presentCount: number;
  absentCount: number;
  status: 'completed' | 'pending';
}
