import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Stage,
  Halaqah,
  Student,
  Teacher,
  AttendanceRecord,
  TeacherAttendanceRecord,
  ActivityQuickPreset,
  MessageLog,
  BotIncomingSimulation,
  UserRole,
  AttendanceStatus,
  StageId,
  DispatchPreviewConfig,
  DeleteConfirmTarget,
  SheikhReportEvent,
  TelegramBotSession,
  RingPreparationStatus,
} from '../types';
import {
  STAGES,
  INITIAL_HALAQAT,
  INITIAL_STUDENTS,
  SAMPLE_STUDENTS_DEMO,
  INITIAL_TEACHERS,
  INITIAL_PRESETS,
  INITIAL_LOGS,
  generateInitialAttendance,
  generateInitialTeacherAttendance,
  getTodayDateString,
  formatArabicDate,
  getTodayFormattedArabic,
  formatWhatsAppPhone,
} from '../data/mockData';
import {
  parseTeacherAttendanceMessage,
  parseStudentCommand,
  generateConsolidatedWhatsAppReport,
  generateParentAlertMessage,
} from '../services/telegramParser';

interface QuickEnrollParams {
  fullName: string;
  halaqahId: string;
  age: number;
  guardianPhone?: string;
  guardianName?: string;
  currentJuz?: number;
}

interface HalaqatContextType {
  stages: Stage[];
  halaqat: Halaqah[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  presets: ActivityQuickPreset[];
  logs: MessageLog[];
  botSimulations: BotIncomingSimulation[];
  selectedDate: string;
  formattedTodayArabic: string;
  formattedSelectedDateArabic: string;
  currentRole: UserRole;
  activeTab: string;
  isQuickEnrollOpen: boolean;
  setIsQuickEnrollOpen: (open: boolean) => void;
  isPaperScannerOpen: boolean;
  setIsPaperScannerOpen: (open: boolean) => void;
  isBulkWhatsAppModalOpen: boolean;
  setIsBulkWhatsAppModalOpen: (open: boolean) => void;
  openBulkWhatsAppModal: () => void;
  closeBulkWhatsAppModal: () => void;
  isLiveReportModalOpen: boolean;
  openLiveReportModal: () => void;
  closeLiveReportModal: () => void;
  handleDownloadTxtReport: () => void;
  todayAbsentsCount: number;
  setActiveTab: (tab: string) => void;
  setSelectedDate: (date: string) => void;
  resetToToday: () => void;
  isDirectorUnlocked: boolean;
  unlockDirector: () => void;
  lockDirector: () => void;
  toggleStudentRecitation: (studentId: string, customAmount?: string) => void;
  setStudentRecitation: (studentId: string, recited: boolean, customAmount?: string) => void;
  toggleStudentUniform: (studentId: string) => void;
  clearAllStudents: () => void;
  restoreDemoStudents: () => void;
  importScannedStudents: (
    scannedList: Array<{
      halaqahSerial?: number;
      fullName: string;
      guardianPhone?: string;
      guardianName?: string;
      stage?: string;
      currentJuz?: number;
      notes?: string;
      attendanceStatus?: AttendanceStatus;
      recited?: boolean;
    }>,
    targetHalaqahId?: string
  ) => number;
  
  // Attendance actions
  setStudentAttendance: (
    studentId: string,
    status: AttendanceStatus,
    notes?: string,
    checkInTime?: string,
    latenessMinutes?: number
  ) => void;
  openDirectWhatsApp: (phone: string, text: string) => void;
  bulkMarkHalaqah: (halaqahId: string, status: AttendanceStatus) => void;
  setTeacherAttendance: (
    teacherId: string,
    status: 'present' | 'absent' | 'excused' | 'late',
    checkInTime?: string,
    latenessMinutes?: number,
    notes?: string
  ) => void;
  bulkMarkTeachers: (status: 'present' | 'absent' | 'excused') => void;
  getStagePartitionedBroadcast: (date?: string) => string;
  
  // Automated Actions & Preview Modal (المعاينة والتعديل قبل الإرسال)
  dispatchPreviewConfig: DispatchPreviewConfig | null;
  openDispatchPreview: (config: Omit<DispatchPreviewConfig, 'isOpen'>) => void;
  closeDispatchPreview: () => void;
  globalNotification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showGlobalNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  dismissGlobalNotification: () => void;

  // Lateness Tolerance Setting (إعدادات فترة السماح واحتساب التأخير)
  latenessToleranceMinutes: number;
  setLatenessToleranceMinutes: (minutes: number) => void;

  // Ring Preparation Status (توثيق حالة الحلقة اليوم)
  ringPreparationStatus: Record<string, RingPreparationStatus>;
  getRingPreparationStatus: (ringId: string) => RingPreparationStatus | undefined;

  // Delete Confirmation Modal
  confirmDeleteTarget: DeleteConfirmTarget | null;
  openDeleteConfirm: (target: DeleteConfirmTarget, onConfirm: () => void) => void;
  closeDeleteConfirm: () => void;
  confirmDeleteAction: () => void;
  isExecutingDelete: boolean;

  // Add Halaqah Modal Trigger
  isAddHalaqahModalOpen: boolean;
  setIsAddHalaqahModalOpen: (open: boolean) => void;
  openAddHalaqahModal: () => void;

  // Direct dispatch & reporting
  sendConsolidatedReportToGroup: (date?: string, customText?: string) => Promise<string>;
  sendActivityBroadcast: (presetId: string, location?: string, time?: string, customText?: string) => Promise<string>;
  sendSingleParentAlert: (studentId: string, customText?: string) => Promise<string>;
  sendAllAbsentParentsAlerts: (customTemplate?: string) => Promise<number>;

  // Preview & Confirm triggers (تفتح شاشة المعاينة والتعديل أولاً)
  requestSendConsolidatedReport: (date?: string) => void;
  requestSendAllAbsentAlerts: () => void;
  requestSendSingleParentAlert: (studentId: string) => void;
  requestSendActivityBroadcast: (presetId: string, location?: string, time?: string) => void;

  processTeacherWhatsAppMessage: (text: string, senderName: string, senderPhone?: string) => Promise<{
    parsedText: string;
    affectedStudents: Student[];
    halaqahName: string;
    reportSent: boolean;
    isStudentAction?: boolean;
    actionMessage?: string;
  }>;
  
  // Full Director Management Actions (صلاحيات المدير الكاملة)
  // 1. Students
  quickEnrollStudent: (data: QuickEnrollParams) => Student;
  addStudent: (student: Omit<Student, 'id' | 'halaqahSerial'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  updateStudentSerial: (studentId: string, newSerial: number) => void;
  transferStudentHalaqah: (studentId: string, newHalaqahId: string) => void;
  autoRenumberHalaqah: (halaqahId: string, method?: 'alphabetical' | 'current' | 'age') => void;

  // 2. Halaqat
  addHalaqah: (halaqah: Omit<Halaqah, 'id'>) => Halaqah;
  updateHalaqah: (halaqah: Halaqah) => void;
  deleteHalaqah: (halaqahId: string) => void;

  // 3. Teachers
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;

  // 4. Activities & Programs
  addPreset: (preset: Omit<ActivityQuickPreset, 'id'>) => void;
  updatePreset: (preset: ActivityQuickPreset) => void;
  deletePreset: (presetId: string) => void;

  // 5. Message Logs Management
  deleteLog: (logId: string) => void;
  clearLogs: (type?: MessageLog['type']) => void;

  // 6. Telegram Bot official session
  telegramSession: TelegramBotSession;
  refreshTelegramStatus: () => Promise<void>;
  simulateTelegramReport: (messageBody?: string, senderName?: string, callbackData?: string) => Promise<any>;
}

const HalaqatContext = createContext<HalaqatContextType | undefined>(undefined);

export const HalaqatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stages] = useState<Stage[]>(STAGES);

  // فحص وترقية النظام للبيانات الحقيقية المعتمدة بأرقام أولياء الأمور والمعلمين الحقيقية (6 حلقات، 123 طالباً، 6 معلمين، 3 مشرفين)
  if (typeof window !== 'undefined') {
    const isRealTeachersSeeded = localStorage.getItem('ibn_baz_official_real_teachers_v3') === 'true';
    if (!isRealTeachersSeeded) {
      localStorage.setItem('ibn_baz_official_real_teachers_v3', 'true');
      localStorage.setItem('halaqat_data', JSON.stringify(INITIAL_HALAQAT));
      localStorage.setItem('teachers_data', JSON.stringify(INITIAL_TEACHERS));
      localStorage.setItem('students_data', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('attendance_data', JSON.stringify(generateInitialAttendance()));
      localStorage.setItem('teacher_attendance_data', JSON.stringify(generateInitialTeacherAttendance()));
      localStorage.setItem('logs_data', JSON.stringify(INITIAL_LOGS));
      localStorage.removeItem('ibn_baz_ring_prep_status');
    }
  }

  const [halaqat, setHalaqat] = useState<Halaqah[]>(() => {
    const saved = localStorage.getItem('halaqat_data');
    return saved ? JSON.parse(saved) : INITIAL_HALAQAT;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers_data');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students_data');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance_data');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : generateInitialAttendance();
  });

  const [teacherAttendance, setTeacherAttendanceState] = useState<TeacherAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('teacher_attendance_data');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : generateInitialTeacherAttendance();
  });

  const [presets, setPresets] = useState<ActivityQuickPreset[]>(() => {
    const saved = localStorage.getItem('presets_data');
    return saved ? JSON.parse(saved) : INITIAL_PRESETS;
  });

  const [logs, setLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('logs_data');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [botSimulations, setBotSimulations] = useState<BotIncomingSimulation[]>([
    {
      id: 'sim_1',
      senderName: 'الشيخ إبراهيم الشنقيطي',
      senderPhone: '+966501112233',
      messageText: 'السلام عليكم، غياب حلقة أبي بن كعب اليوم: 2 و 7',
      timestamp: '16:45',
      parsedHalaqahId: 'hal_ubayy',
      parsedAbsentSerials: [2, 7],
      parsedAbsentNames: ['عبد الله بن فهد الدوسري', 'عمر بن خالد المطيري'],
      status: 'processed',
      responseMessage: '✅ تم رصد غياب الطالب [2] و [7] بحلقة أبي بن كعب، وتم تحديث قاعدة البيانات ونشر التقرير للمجموعة العامة وإشعار أولياء الأمور.',
    },
  ]);

  const [telegramSession, setTelegramSession] = useState<TelegramBotSession>({
    status: 'connected',
    botId: 8782679226,
    botUsername: 'DiwanSys_bot',
    botName: 'حلقات ابن باز',
    botUrl: 'https://t.me/DiwanSys_bot',
    receivedCount: 0,
    lastReportAt: undefined,
  });

  const refreshTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.telegram) {
          setTelegramSession((prev) => ({
            ...prev,
            status: data.telegram.status,
            botId: data.telegram.botId,
            botUsername: data.telegram.botUsername,
            botName: data.telegram.botName,
            botUrl: data.telegram.botUrl,
            receivedCount: data.telegram.receivedCount,
            lastReportAt: data.telegram.lastReportAt,
            error: data.telegram.error,
          }));
        }
      }
    } catch (_) {}
  };

  const simulateTelegramReport = async (messageBody?: string, senderName?: string, callbackData?: string) => {
    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageBody, senderName, callbackData }),
      });
      const data = await res.json();
      if (data.success) {
        showGlobalNotification(data.message || 'تم التفاعل مع بوت تيليجرام بنجاح 🚀', 'success');
        refreshTelegramStatus();
        return data;
      } else {
        showGlobalNotification(data.error || 'تعذر معالجة الطلب', 'error');
        throw new Error(data.error);
      }
    } catch (err: any) {
      showGlobalNotification(err.message || 'فشل التفاعل مع بوت تيليجرام التجريبي', 'error');
      throw err;
    }
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentRole] = useState<UserRole>('manager');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickEnrollOpen, setIsQuickEnrollOpen] = useState<boolean>(false);
  const [isPaperScannerOpen, setIsPaperScannerOpen] = useState<boolean>(false);
  const [isBulkWhatsAppModalOpen, setIsBulkWhatsAppModalOpen] = useState<boolean>(false);
  const openBulkWhatsAppModal = () => setIsBulkWhatsAppModalOpen(true);
  const closeBulkWhatsAppModal = () => setIsBulkWhatsAppModalOpen(false);
  const [isLiveReportModalOpen, setIsLiveReportModalOpen] = useState<boolean>(false);
  const openLiveReportModal = () => setIsLiveReportModalOpen(true);
  const closeLiveReportModal = () => setIsLiveReportModalOpen(false);

  const handleDownloadTxtReport = () => {
    try {
      const a = document.createElement('a');
      a.href = '/api/telegram/download-report';
      a.download = 'التقرير_الختامي_المفصل.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showGlobalNotification('تم بدء تنزيل التقرير الختامي المفصل (.txt) بنجاح 📄', 'success');
    } catch (_) {
      showGlobalNotification('تعذر تنزيل الملف النصي', 'error');
    }
  };

  const todayAbsentsCount = useMemo(() => {
    const absentStudents = attendance.filter((a) => a.date === selectedDate && a.status === 'absent').length;
    const absentTeachers = teacherAttendance.filter((t) => t.date === selectedDate && t.status === 'absent').length;
    return absentStudents + absentTeachers;
  }, [attendance, teacherAttendance, selectedDate]);

  const [isDirectorUnlocked, setIsDirectorUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('ibn_baz_director_unlocked') === 'true';
  });

  // Modal for previewing and editing message before automated dispatch
  const [dispatchPreviewConfig, setDispatchPreviewConfig] = useState<DispatchPreviewConfig | null>(null);

  // Floating notification banner (9 seconds duration with manual dismiss support)
  const [globalNotification, setGlobalNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showGlobalNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setGlobalNotification({ message, type });
    setTimeout(() => {
      setGlobalNotification((prev) => (prev?.message === message ? null : prev));
    }, 9000);
  };

  const dismissGlobalNotification = () => {
    setGlobalNotification(null);
  };

  // Flexible Lateness Tolerance (إعدادات فترة السماح واحتساب التأخير)
  const [latenessToleranceMinutes, setLatenessToleranceMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('ibn_baz_lateness_tolerance');
    return saved ? Number(saved) : 15;
  });

  const setLatenessToleranceMinutes = (minutes: number) => {
    setLatenessToleranceMinutesState(minutes);
    localStorage.setItem('ibn_baz_lateness_tolerance', String(minutes));
    showGlobalNotification(`تم تعديل فترة السماح واحتساب التأخير إلى (${minutes} دقيقة) بنجاح ⏱️`, 'info');
  };

  // Ring Preparation Status tracking (توثيق حالة الحلقة اليوم والمعلم المعتمد)
  const [ringPreparationStatus, setRingPreparationStatus] = useState<Record<string, RingPreparationStatus>>(() => {
    const saved = localStorage.getItem('ibn_baz_ring_prep_status');
    return saved ? JSON.parse(saved) : {
      'hal_early': {
        ringId: 'hal_early',
        ringName: 'حلقة الصفوف الأولية',
        teacherName: 'مصباح نور الدين',
        preparedAt: '04:20 م',
        date: getTodayDateString(),
        presentCount: 24,
        absentCount: 2,
        status: 'completed',
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('ibn_baz_ring_prep_status', JSON.stringify(ringPreparationStatus));
  }, [ringPreparationStatus]);

  const getRingPreparationStatus = (ringId: string): RingPreparationStatus | undefined => {
    return ringPreparationStatus[ringId];
  };

  const openDispatchPreview = (config: Omit<DispatchPreviewConfig, 'isOpen'>) => {
    setDispatchPreviewConfig({
      ...config,
      isOpen: true,
      initialOriginalText: config.messageText,
    });
  };

  const closeDispatchPreview = () => {
    setDispatchPreviewConfig(null);
  };

  // Delete Confirmation Modal state & actions
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<DeleteConfirmTarget | null>(null);
  const [confirmDeleteCallback, setConfirmDeleteCallback] = useState<(() => void) | null>(null);
  const [isExecutingDelete, setIsExecutingDelete] = useState<boolean>(false);

  const openDeleteConfirm = (target: DeleteConfirmTarget, onConfirm: () => void) => {
    setConfirmDeleteTarget(target);
    setConfirmDeleteCallback(() => onConfirm);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteTarget(null);
    setConfirmDeleteCallback(null);
    setIsExecutingDelete(false);
  };

  const confirmDeleteAction = async () => {
    if (confirmDeleteCallback) {
      setIsExecutingDelete(true);
      try {
        await confirmDeleteCallback();
      } finally {
        setIsExecutingDelete(false);
        setConfirmDeleteTarget(null);
        setConfirmDeleteCallback(null);
      }
    }
  };

  // Add Halaqah Modal trigger
  const [isAddHalaqahModalOpen, setIsAddHalaqahModalOpen] = useState<boolean>(false);
  const openAddHalaqahModal = () => {
    setActiveTab('halaqat');
    setIsAddHalaqahModalOpen(true);
  };

  const unlockDirector = () => {
    localStorage.setItem('ibn_baz_director_unlocked', 'true');
    setIsDirectorUnlocked(true);
  };

  const lockDirector = () => {
    localStorage.removeItem('ibn_baz_director_unlocked');
    setIsDirectorUnlocked(false);
  };

  // Real-time synchronization of Telegram reports sent by sheikhs and teachers
  const processedReportIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telegram/incoming-reports');
        if (!res.ok) return;
        const data = await res.json();
        if (data.telegramStatus) {
          setTelegramSession((prev) => ({
            ...prev,
            status: data.telegramStatus.status,
            botId: data.telegramStatus.botId,
            botUsername: data.telegramStatus.botUsername,
            botName: data.telegramStatus.botName,
            botUrl: data.telegramStatus.botUrl,
            receivedCount: data.telegramStatus.receivedCount,
            lastReportAt: data.telegramStatus.lastReportAt,
            error: data.telegramStatus.error,
          }));
        }

        // Ingest any new students added via Telegram Bot
        if (data.success && Array.isArray(data.newStudents) && data.newStudents.length > 0) {
          setStudents((prev) => {
            let hasChanges = false;
            const updated = [...prev];
            for (const ns of data.newStudents) {
              const existingIndex = updated.findIndex((s) => s.id === ns.id || s.fullName === ns.name);
              if (existingIndex < 0) {
                const hal = halaqat.find(
                  (h) =>
                    h.id === ns.ringId ||
                    h.name.includes(ns.ringId) ||
                    (ns.ringId === 'ring_1' && (h.id === 'hal_early' || h.id === 'hal_nafi')) ||
                    (ns.ringId === 'ring_2' && (h.id === 'hal_grade4' || h.id === 'hal_asim')) ||
                    (ns.ringId === 'ring_3' && (h.id === 'hal_grade5' || h.id === 'hal_ibn_kathir')) ||
                    (ns.ringId === 'ring_4' && (h.id === 'hal_grade6' || h.id === 'hal_abu_amr')) ||
                    (ns.ringId === 'ring_5' && (h.id === 'hal_intermediate' || h.id === 'hal_hamzah')) ||
                    (ns.ringId === 'ring_6' && h.id === 'hal_secondary')
                ) || halaqat[0];
                const stageId: StageId = hal ? hal.stageId : 'primary_early';
                const nextSerial = ns.serial || (updated.filter((s) => s.halaqahId === (hal?.id || 'hal_early')).length + 1);

                const newStu: Student = {
                  id: ns.id,
                  halaqahId: hal ? hal.id : 'hal_early',
                  halaqahSerial: nextSerial,
                  fullName: ns.name,
                  guardianName: `ولي أمر ${ns.name}`,
                  guardianPhone: ns.parentPhone || '',
                  guardianRelation: 'أب',
                  stageId,
                  currentJuz: 1,
                  birthYear: 2014,
                  status: 'active',
                  isNewStudent: true,
                  addedVia: 'telegram_bot',
                  addedAt: ns.addedAt || new Date().toISOString(),
                };
                updated.push(newStu);
                hasChanges = true;
                showGlobalNotification(
                  `✨ طالب جديد مضاف عبر التيليجرام: "${ns.name}" في (${hal?.name || 'الحلقة'}) بنجاح!`,
                  'success'
                );
              } else if (!updated[existingIndex].isNewStudent) {
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  isNewStudent: true,
                  addedVia: 'telegram_bot',
                };
                hasChanges = true;
              }
            }
            return hasChanges ? updated : prev;
          });
        }

        if (data.success && Array.isArray(data.reports)) {
          for (const report of data.reports) {
            if (processedReportIdsRef.current.has(report.id)) continue;
            processedReportIdsRef.current.add(report.id);

            // Match Halqah
            const targetHalaqah =
              halaqat.find(
                (h) =>
                  h.name.includes(report.detectedHalaqahName) ||
                  report.detectedHalaqahName.includes(h.name) ||
                  (report.senderPhone && h.teacherPhone.replace(/\D/g, '') === report.senderPhone.replace(/\D/g, ''))
              ) || halaqat[0];

            if (targetHalaqah) {
              const halaqahStudents = students.filter(
                (s) => s.halaqahId === targetHalaqah.id && s.status === 'active'
              );

              // Identify absent students
              const absentStudents = halaqahStudents.filter((stu) => {
                const matchSerial = Array.isArray(report.absentSerials) && report.absentSerials.includes(stu.halaqahSerial);
                const matchName =
                  Array.isArray(report.absentNames) &&
                  report.absentNames.some(
                    (name: string) => stu.fullName.includes(name) || name.includes(stu.fullName.split(' ')[0])
                  );
                return matchSerial || matchName;
              });

              const isTelegram = report.source === 'telegram';
              const channelTitle = isTelegram ? 'بوت تيليجرام الرسمي (@DiwanSys_bot)' : 'بوت واتساب حلقات ابن باز';
              const channelBadge = isTelegram ? '✈️ تيليجرام' : '💬 واتساب';

              // Update attendance & recitation (strictly enforce recitedCount <= attended)
              const attendedStudentsCount = halaqahStudents.filter(
                (stu) => !absentStudents.some((a) => a.id === stu.id)
              ).length;
              const targetRecitedCount = Math.min(
                report.recitedCount !== undefined ? Number(report.recitedCount) : attendedStudentsCount,
                attendedStudentsCount
              );

              setAttendance((prev) => {
                const updated = [...prev];
                let recitedAssigned = 0;
                halaqahStudents.forEach((stu) => {
                  const isAbsent = absentStudents.some((a) => a.id === stu.id);
                  const status: AttendanceStatus = isAbsent ? 'absent' : 'present';
                  let isRecited = false;
                  if (!isAbsent && recitedAssigned < targetRecitedCount) {
                    isRecited = true;
                    recitedAssigned++;
                  }

                  const existingIdx = updated.findIndex(
                    (a) => a.studentId === stu.id && a.date === selectedDate
                  );
                  const record: AttendanceRecord = {
                    id: existingIdx >= 0 ? updated[existingIdx].id : `att_${stu.id}_${selectedDate}`,
                    date: selectedDate,
                    studentId: stu.id,
                    halaqahId: targetHalaqah.id,
                    status,
                    recited: isRecited,
                    recitationAmount: isRecited ? 'المقرر اليومي' : undefined,
                    recordedAt: new Date().toISOString(),
                    recordedBy: isTelegram ? 'manager' : 'whatsapp_bot',
                    parentNotified: isAbsent,
                    parentNotifiedAt: isAbsent ? new Date().toISOString() : undefined,
                  };

                  if (existingIdx >= 0) {
                    updated[existingIdx] = record;
                  } else {
                    updated.push(record);
                  }
                });
                return updated;
              });

              // Also mark the ring's teacher as present when report arrives
              const targetTeacherId = targetHalaqah.teacherId;
              if (targetTeacherId) {
                setTeacherAttendanceState((prev) => {
                  const idx = prev.findIndex((t) => t.teacherId === targetTeacherId && t.date === selectedDate);
                  if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], status: 'present', notes: 'رُصد تلقائياً عبر البوت' };
                    return copy;
                  }
                  return [
                    ...prev,
                    {
                      id: `t_att_${targetTeacherId}_${selectedDate}`,
                      date: selectedDate,
                      teacherId: targetTeacherId,
                      teacherName: targetHalaqah.teacherName,
                      role: 'teacher',
                      status: 'present',
                      checkInTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                      latenessMinutes: 0,
                      notes: 'رُصد تلقائياً عبر البوت',
                      recordedAt: new Date().toISOString(),
                    },
                  ];
                });
              }

              // Add bot simulation entry
              const newSim: BotIncomingSimulation = {
                id: `sim_${report.id}`,
                senderName: report.senderName || targetHalaqah.teacherName,
                senderPhone: report.senderPhone || (isTelegram ? `@${targetHalaqah.teacherName}` : targetHalaqah.teacherPhone),
                messageText: report.rawText,
                timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                parsedHalaqahId: targetHalaqah.id,
                parsedAbsentSerials: report.absentSerials,
                parsedAbsentNames: absentStudents.map((s) => s.fullName),
                status: 'processed',
                responseMessage: report.replyText,
              };
              setBotSimulations((prev) => [newSim, ...prev]);

              // Log incoming message
              const newLog: MessageLog = {
                id: `log_${report.id}`,
                timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                type: 'incoming_teacher',
                recipient: channelTitle,
                recipientName: `${targetHalaqah.teacherName} (${targetHalaqah.name})`,
                text: report.rawText,
                status: 'delivered',
                halaqahName: targetHalaqah.name,
              };
              setLogs((prev) => [newLog, ...prev]);

              // Update ring preparation status
              const prepBy = report.senderName || targetHalaqah.teacherName;
              const presentCnt = report.presentCount || attendedStudentsCount;
              setRingPreparationStatus((prev) => ({
                ...prev,
                [targetHalaqah.id]: {
                  ringId: targetHalaqah.id,
                  ringName: targetHalaqah.name,
                  teacherName: prepBy,
                  preparedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                  date: selectedDate,
                  presentCount: presentCnt,
                  absentCount: absentStudents.length,
                  status: 'completed',
                },
              }));

              // Global notification popup
              showGlobalNotification(
                `✅ [${channelBadge}] تم تحضير "${targetHalaqah.name}" بواسطة (${prepBy}): حضور ${presentCnt}، غياب ${absentStudents.length}، تسميع ${targetRecitedCount} وتحديث لوحة التحكم فوراً!`,
                'success'
              );
            }
          }
        }

        // Sync teacher attendance updates sent via Telegram Bot
        if (data.success && data.teacherAttendance && typeof data.teacherAttendance === 'object') {
          const idAliasMap: Record<string, string> = {
            t_1: 'teach_1',
            t_2: 'teach_2',
            t_3: 'teach_3',
            t_4: 'teach_4',
            t_5: 'teach_5',
            t_6: 'teach_6',
          };
          const statusMap: Record<string, 'present' | 'absent' | 'excused'> = {
            'حاضر': 'present',
            'غائب': 'absent',
            'مستأذن': 'excused',
          };
          setTeacherAttendanceState((prev) => {
            let changed = false;
            const copy = [...prev];
            for (const [srvId, srvRec] of Object.entries<any>(data.teacherAttendance)) {
              const targetTeacherId = idAliasMap[srvId] || srvId;
              const mappedStatus = statusMap[srvRec?.status];
              if (!mappedStatus) continue;
              const idx = copy.findIndex((r) => r.teacherId === targetTeacherId && r.date === selectedDate);
              if (idx >= 0 && copy[idx].status !== mappedStatus && srvRec?.updatedAt > copy[idx].recordedAt) {
                copy[idx] = { ...copy[idx], status: mappedStatus, recordedAt: srvRec.updatedAt };
                changed = true;
              }
            }
            return changed ? copy : prev;
          });
        }
      } catch (_) {}
    }, 3500);

    return () => clearInterval(interval);
  }, [halaqat, students, selectedDate]);


  useEffect(() => {
    localStorage.setItem('teachers_data', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('students_data', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendance_data', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('teacher_attendance_data', JSON.stringify(teacherAttendance));
  }, [teacherAttendance]);

  // Ensure attendance and teacher attendance have records for today dynamically
  useEffect(() => {
    const today = getTodayDateString();
    setAttendance((prev) => {
      const hasToday = prev.some((a) => a.date === today);
      if (!hasToday) {
        const freshTodayRecords = generateInitialAttendance();
        return [...prev, ...freshTodayRecords];
      }
      return prev;
    });

    setTeacherAttendanceState((prev) => {
      const hasToday = prev.some((a) => a.date === today);
      if (!hasToday) {
        const freshTodayTeachers = generateInitialTeacherAttendance();
        return [...prev, ...freshTodayTeachers];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('presets_data', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem('logs_data', JSON.stringify(logs));
  }, [logs]);

  // مزامنة تلقائية حية لجميع الحلقات والطلاب والمعلمين مع بوت التيليجرام
  useEffect(() => {
    try {
      fetch('/api/telegram/sync-system-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rings: halaqat.map((h) => ({
            id: h.id,
            name: h.name,
            stage: h.stageId,
            teacherId: h.teacherId,
            teacherName: h.teacherName,
          })),
          teachers: teachers
            .filter((t) => t.role === 'teacher')
            .map((t) => ({
              id: t.id,
              name: t.fullName,
              phone: t.phoneNumber,
              assignedHalaqahId: t.assignedHalaqahId,
            })),
          students: students.map((s) => ({
            id: s.id,
            name: s.fullName,
            halaqahId: s.halaqahId,
            guardianPhone: s.guardianPhone,
            stage: s.stageId,
            serial: s.halaqahSerial,
          })),
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [halaqat, teachers, students]);

  // دالة إرسال وتحويل مباشر للواتساب الرسمي لولي الأمر بالرقم الحقيقي المسجل
  const openDirectWhatsApp = (phone: string, text: string) => {
    const cleanPhone = formatWhatsAppPhone(phone);
    if (!cleanPhone) {
      showGlobalNotification('لا يوجد رقم تواصل مسجل — يرجى إضافة الرقم يدوياً أولاً', 'error');
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}

    // حفظ في الأرشيف الدائم
    const newLog: MessageLog = {
      id: `log_wa_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'parent_alert',
      recipient: cleanPhone,
      recipientName: 'ولي أمر الطالب',
      text: text,
      status: 'delivered',
    };
    setLogs((prev) => [newLog, ...prev]);
    showGlobalNotification(`تم تحويلك إلى محادثة واتساب ولي الأمر (${cleanPhone}) 📲`, 'success');
  };

  const setTeacherAttendance = (
    teacherId: string,
    status: 'present' | 'absent' | 'excused' | 'late',
    checkInTime?: string,
    latenessMinutes?: number,
    notes?: string
  ) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    setTeacherAttendanceState((prev) => {
      const existingIdx = prev.findIndex((a) => a.teacherId === teacherId && a.date === selectedDate);
      const newRec: TeacherAttendanceRecord = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `t_att_${teacherId}_${selectedDate}`,
        date: selectedDate,
        teacherId,
        teacherName: teacher.fullName,
        role: teacher.role as 'teacher' | 'supervisor',
        status,
        checkInTime: checkInTime !== undefined ? checkInTime : (status === 'present' ? '04:10 م' : (status === 'late' ? '04:25 م' : undefined)),
        latenessMinutes: latenessMinutes !== undefined ? latenessMinutes : (status === 'late' ? latenessToleranceMinutes : 0),
        notes: notes !== undefined ? notes : (existingIdx >= 0 ? prev[existingIdx].notes : undefined),
        recordedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRec;
        return copy;
      }
      return [...prev, newRec];
    });
  };

  const bulkMarkTeachers = (status: 'present' | 'absent' | 'excused') => {
    setTeacherAttendanceState((prev) => {
      const copy = [...prev];
      teachers.forEach((t) => {
        const existingIdx = copy.findIndex((a) => a.teacherId === t.id && a.date === selectedDate);
        const newRec: TeacherAttendanceRecord = {
          id: existingIdx >= 0 ? copy[existingIdx].id : `t_att_${t.id}_${selectedDate}`,
          date: selectedDate,
          teacherId: t.id,
          teacherName: t.fullName,
          role: t.role as 'teacher' | 'supervisor',
          status,
          checkInTime: status === 'present' ? '04:10 م' : undefined,
          latenessMinutes: 0,
          recordedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          copy[existingIdx] = newRec;
        } else {
          copy.push(newRec);
        }
      });
      return copy;
    });
  };

  const getStagePartitionedBroadcast = (date = selectedDate): string => {
    const dateFormatted = formatArabicDate(date);
    const elemHalaqat = halaqat.filter((h) => h.stageId === 'primary_early' || h.stageId === 'primary_upper');
    const middleHalaqat = halaqat.filter((h) => h.stageId === 'intermediate');
    const highHalaqat = halaqat.filter((h) => h.stageId === 'secondary');

    const formatStageSection = (title: string, icon: string, stageHalaqat: typeof halaqat) => {
      let out = `${icon} *${title}*\n`;
      stageHalaqat.forEach((h) => {
        const hStudents = students.filter((s) => s.halaqahId === h.id && s.status === 'active');
        const hAtt = attendance.filter((a) => a.halaqahId === h.id && a.date === date);
        const hAbsent = hStudents.filter((s) => hAtt.find((a) => a.studentId === s.id)?.status === 'absent');
        const hLate = hStudents.filter((s) => hAtt.find((a) => a.studentId === s.id)?.status === 'late');
        const hPresentCount = hStudents.length - hAbsent.length;

        out += `  • *${h.name}* (المعلم: ${h.teacherName}):\n`;
        out += `    - الحضور: ${hPresentCount} من ${hStudents.length}\n`;
        if (hAbsent.length > 0) {
          out += `    - 🔴 الغائبون: ${hAbsent.map((s) => s.fullName).join('، ')}\n`;
        } else {
          out += `    - 🟢 الغياب: حضور كامل ما شاء الله\n`;
        }
        if (hLate.length > 0) {
          out += `    - ⏳ المتأخرون: ${hLate.map((s) => s.fullName).join('، ')}\n`;
        }
      });
      return out;
    };

    return `📢 *بيان الحضور والغياب اليومي مقسماً بالمراحل التعليمية* 🕌\n` +
      `📅 التاريخ: ${dateFormatted} (${date})\n` +
      `🕌 حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم\n` +
      `═════════════════════════════════\n` +
      `${formatStageSection('المرحلة الابتدائية (الأولية والعليا)', '🟢', elemHalaqat)}` +
      `═════════════════════════════════\n` +
      `${formatStageSection('المرحلة المتوسطة', '🔵', middleHalaqat)}` +
      `═════════════════════════════════\n` +
      `${formatStageSection('المرحلة الثانوية', '🟣', highHalaqat)}` +
      `═════════════════════════════════\n` +
      `📌 صادر عن إدارة حلقات جامع ابن باز`;
  };

  const resetToToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Set single student attendance (مع دعم الحالات الأربع ووقت الحضور والتأخير)
  const setStudentAttendance = (
    studentId: string,
    status: AttendanceStatus,
    notes?: string,
    checkInTime?: string,
    latenessMinutes?: number
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === selectedDate);
      const prevRec = existingIdx >= 0 ? prev[existingIdx] : undefined;
      // Absent or excused students can NEVER be marked as recited
      const isAttended = status === 'present' || status === 'late';
      const willRecite = isAttended ? (prevRec?.recited !== undefined ? prevRec.recited : true) : false;

      const finalCheckIn = checkInTime !== undefined ? checkInTime : (status === 'present' ? '04:10 م' : (status === 'late' ? '04:30 م' : undefined));
      const finalLateness = latenessMinutes !== undefined ? latenessMinutes : (status === 'late' ? latenessToleranceMinutes : 0);

      const newRec: AttendanceRecord = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `att_${studentId}_${selectedDate}`,
        date: selectedDate,
        studentId,
        halaqahId: student.halaqahId,
        status,
        recited: willRecite,
        recitationAmount: isAttended ? prevRec?.recitationAmount : undefined,
        uniformCompliant: prevRec?.uniformCompliant !== undefined ? prevRec.uniformCompliant : true,
        checkInTime: finalCheckIn,
        latenessMinutes: finalLateness,
        recordedAt: new Date().toISOString(),
        recordedBy: 'manager',
        notes: notes || (existingIdx >= 0 ? prev[existingIdx].notes : undefined),
        parentNotified: status === 'absent' ? false : undefined,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRec;
        return copy;
      }
      return [...prev, newRec];
    });
  };

  // Toggle recitation for student (سمّع ورد اليوم / لم يُسمّع) — ممنوع للغائب أو المستأذن
  const toggleStudentRecitation = (studentId: string, customAmount?: string) => {
    const existingRec = attendance.find((a) => a.studentId === studentId && a.date === selectedDate);
    if (existingRec && (existingRec.status === 'absent' || existingRec.status === 'excused')) {
      showGlobalNotification('لا يمكن رصد تسميع لطالب غائب أو مستأذن', 'error');
      return;
    }

    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === selectedDate);
      if (existingIdx >= 0) {
        const copy = [...prev];
        const recStatus = copy[existingIdx].status;
        if (recStatus === 'absent' || recStatus === 'excused') {
          copy[existingIdx] = { ...copy[existingIdx], recited: false };
          return copy;
        }
        const currentRecited = copy[existingIdx].recited !== undefined ? copy[existingIdx].recited : true;
        copy[existingIdx] = {
          ...copy[existingIdx],
          recited: !currentRecited,
          recitationAmount: customAmount || copy[existingIdx].recitationAmount,
        };
        return copy;
      } else {
        const student = students.find((s) => s.id === studentId);
        return [
          ...prev,
          {
            id: `att_${studentId}_${selectedDate}`,
            date: selectedDate,
            studentId,
            halaqahId: student?.halaqahId || '',
            status: 'present',
            recited: true,
            recitationAmount: customAmount,
            recordedAt: new Date().toISOString(),
            recordedBy: 'manager',
          },
        ];
      }
    });
  };

  const setStudentRecitation = (studentId: string, recited: boolean, customAmount?: string) => {
    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === selectedDate);
      if (existingIdx >= 0) {
        const copy = [...prev];
        const recStatus = copy[existingIdx].status;
        const isAttended = recStatus === 'present' || recStatus === 'late';
        copy[existingIdx] = {
          ...copy[existingIdx],
          recited: isAttended ? recited : false,
          recitationAmount: isAttended ? (customAmount || copy[existingIdx].recitationAmount) : undefined,
        };
        return copy;
      } else {
        const student = students.find((s) => s.id === studentId);
        return [
          ...prev,
          {
            id: `att_${studentId}_${selectedDate}`,
            date: selectedDate,
            studentId,
            halaqahId: student?.halaqahId || '',
            status: 'present',
            recited,
            recitationAmount: customAmount,
            recordedAt: new Date().toISOString(),
            recordedBy: 'manager',
          },
        ];
      }
    });
  };

  const toggleStudentUniform = (studentId: string) => {
    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === selectedDate);
      if (existingIdx >= 0) {
        const copy = [...prev];
        const currentUniform = copy[existingIdx].uniformCompliant !== false;
        copy[existingIdx] = {
          ...copy[existingIdx],
          uniformCompliant: !currentUniform,
        };
        return copy;
      } else {
        const student = students.find((s) => s.id === studentId);
        return [
          ...prev,
          {
            id: `att_${studentId}_${selectedDate}`,
            date: selectedDate,
            studentId,
            halaqahId: student?.halaqahId || '',
            status: 'present',
            recited: true,
            uniformCompliant: false,
            recordedAt: new Date().toISOString(),
            recordedBy: 'manager',
          },
        ];
      }
    });
  };

  // Bulk mark all students in a halaqah
  const bulkMarkHalaqah = (halaqahId: string, status: AttendanceStatus) => {
    const targetStudents = students.filter((s) => s.halaqahId === halaqahId && s.status === 'active');
    setAttendance((prev) => {
      const copy = [...prev];
      const isAttended = status === 'present' || status === 'late';
      targetStudents.forEach((stu) => {
        const existingIdx = copy.findIndex((a) => a.studentId === stu.id && a.date === selectedDate);
        const willRecite = isAttended;
        const record: AttendanceRecord = {
          id: existingIdx >= 0 ? copy[existingIdx].id : `att_${stu.id}_${selectedDate}`,
          date: selectedDate,
          studentId: stu.id,
          halaqahId,
          status,
          recited: willRecite,
          recitationAmount: isAttended && existingIdx >= 0 ? copy[existingIdx].recitationAmount : undefined,
          recordedAt: new Date().toISOString(),
          recordedBy: 'manager',
        };

        if (existingIdx >= 0) {
          copy[existingIdx] = record;
        } else {
          copy.push(record);
        }
      });
      return copy;
    });

    // Document ring preparation status
    const ring = halaqat.find((h) => h.id === halaqahId);
    if (ring) {
      setRingPreparationStatus((prev) => ({
        ...prev,
        [halaqahId]: {
          ringId: halaqahId,
          ringName: ring.name,
          teacherName: ring.teacherName || 'مشرف الحلقات',
          preparedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          date: selectedDate,
          presentCount: status === 'present' ? targetStudents.length : 0,
          absentCount: status === 'absent' ? targetStudents.length : 0,
          status: 'completed',
        },
      }));
    }
  };

  // Send Consolidated Daily Attendance Report to WhatsApp General Group
  // Send Consolidated Daily Attendance Report to Telegram / Official Group
  const sendConsolidatedReportToGroup = async (date = selectedDate, customText?: string): Promise<string> => {
    const reportText = customText || generateConsolidatedWhatsAppReport(date, halaqat, students, attendance);
    const newLog: MessageLog = {
      id: `log_rep_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'group_broadcast',
      recipient: 'مجموعة وقناة حلقات ابن باز الرسمية',
      recipientName: 'المجموعة العامة (@DiwanSys_bot)',
      text: reportText,
      status: 'delivered',
    };
    setLogs((prev) => [newLog, ...prev]);
    return reportText;
  };

  // Trigger Preview & Edit modal for Consolidated Daily Report
  const requestSendConsolidatedReport = (date = selectedDate) => {
    const reportText = generateConsolidatedWhatsAppReport(date, halaqat, students, attendance);
    openDispatchPreview({
      title: 'معاينة التقرير اليومي الختامي والمفصل للمجموعة',
      recipientLabel: 'مجموعة وقناة حلقات ابن باز الرسمية (@DiwanSys_bot)',
      recipientType: 'group',
      messageText: reportText,
      onConfirm: async (finalText) => {
        await sendConsolidatedReportToGroup(date, finalText);
        showGlobalNotification('تم إرسال وبث التقرير اليومي بنجاح 🚀');
      },
    });
  };

  // Send Preset Activity to Official Group
  const sendActivityBroadcast = async (
    presetId: string,
    customLocation?: string,
    customTime?: string,
    customText?: string
  ): Promise<string> => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return '';

    let message = customText;
    if (!message) {
      message = preset.templateMessage;
      const finalLocation = customLocation || preset.defaultLocation || 'المجمع القرآني';
      const finalTime = customTime || preset.defaultTime || 'الموعد المحدد';
      message = message.replace('{location}', finalLocation).replace('{time}', finalTime);
    }

    const newLog: MessageLog = {
      id: `log_act_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'group_broadcast',
      recipient: 'مجموعة وقناة حلقات ابن باز الرسمية',
      recipientName: preset.title,
      text: message,
      status: 'delivered',
    };
    setLogs((prev) => [newLog, ...prev]);
    return message;
  };

  // Trigger Preview & Edit modal for Activity Preset
  const requestSendActivityBroadcast = (presetId: string, customLocation?: string, customTime?: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    const finalLocation = customLocation || preset.defaultLocation || 'المجمع القرآني';
    const finalTime = customTime || preset.defaultTime || 'الموعد المحدد';
    const initialText = preset.templateMessage.replace('{location}', finalLocation).replace('{time}', finalTime);

    openDispatchPreview({
      title: `معاينة إعلان النشاط: ${preset.title}`,
      recipientLabel: 'مجموعة وقناة حلقات ابن باز الرسمية',
      recipientType: 'group',
      messageText: initialText,
      onConfirm: async (finalText) => {
        await sendActivityBroadcast(presetId, customLocation, customTime, finalText);
        showGlobalNotification(`تم إرسال إعلان "${preset.title}" بنجاح 🚀`);
      },
    });
  };

  // Send single parent alert
  const sendSingleParentAlert = async (studentId: string, customText?: string): Promise<string> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return '';

    const halaqah = halaqat.find((h) => h.id === student.halaqahId) || halaqat[0];
    const alertMessage = customText || generateParentAlertMessage(student, halaqah, selectedDate);

    // توجيه وفتح تطبيق ومحادثة الواتساب مباشرة لرقم ولي الأمر الحقيقي
    openDirectWhatsApp(student.guardianPhone || '', alertMessage);

    // Mark as notified in attendance records
    setAttendance((prev) =>
      prev.map((rec) =>
        rec.studentId === studentId && rec.date === selectedDate
          ? { ...rec, parentNotified: true, parentNotifiedAt: new Date().toISOString() }
          : rec
      )
    );

    return alertMessage;
  };

  // Trigger Preview & Edit modal for Single Student Parent Alert
  const requestSendSingleParentAlert = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const halaqah = halaqat.find((h) => h.id === student.halaqahId) || halaqat[0];
    const initialText = generateParentAlertMessage(student, halaqah, selectedDate);

    openDispatchPreview({
      title: `معاينة تنبيه ولي أمر الطالب: ${student.fullName}`,
      recipientLabel: `ولي أمر الطالب: ${student.fullName}`,
      recipientType: 'parent',
      studentName: student.fullName,
      phone: student.guardianPhone,
      messageText: initialText,
      onConfirm: async (finalText) => {
        await sendSingleParentAlert(student.id, finalText);
        showGlobalNotification(`تم إرسال التنبيه بنجاح إلى ولي أمر الطالب "${student.fullName}" 🚀`);
      },
    });
  };

  // Send alerts to all absent students' parents for selected date
  const sendAllAbsentParentsAlerts = async (customTemplate?: string): Promise<number> => {
    const absentRecords = attendance.filter((a) => a.date === selectedDate && a.status === 'absent');
    if (absentRecords.length === 0) return 0;

    const newLogs: MessageLog[] = [];

    for (const rec of absentRecords) {
      const student = students.find((s) => s.id === rec.studentId);
      if (student) {
        const halaqah = halaqat.find((h) => h.id === student.halaqahId) || halaqat[0];
        let msg = customTemplate;
        if (!msg) {
          msg = generateParentAlertMessage(student, halaqah, selectedDate);
        } else {
          msg = msg
            .replace(/\{student_name\}/g, student.fullName)
            .replace(/\{halaqah_name\}/g, halaqah.name);
        }

        newLogs.push({
          id: `log_batch_${Date.now()}_${student.id}`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          type: 'parent_alert',
          recipient: student.guardianPhone,
          recipientName: student.guardianName,
          text: msg,
          status: 'delivered',
          studentName: student.fullName,
          halaqahName: halaqah.name,
        });
      }
    }

    if (newLogs.length > 0) {
      setLogs((prev) => [...newLogs, ...prev]);
    }

    // Mark all as notified
    setAttendance((prev) =>
      prev.map((rec) =>
        rec.date === selectedDate && rec.status === 'absent'
          ? { ...rec, parentNotified: true, parentNotifiedAt: new Date().toISOString() }
          : rec
      )
    );

    return newLogs.length;
  };

  // Trigger Preview & Edit modal for All Absent Students' Parents Alerts
  const requestSendAllAbsentAlerts = () => {
    const absentRecords = attendance.filter((a) => a.date === selectedDate && a.status === 'absent');
    const absentStudents = absentRecords
      .map((r) => students.find((s) => s.id === r.studentId))
      .filter((s): s is Student => s !== undefined);

    if (absentStudents.length === 0) {
      showGlobalNotification('لا يوجد طلاب غائبون مسجلون لتاريخ اليوم لإرسال تنبيهات لهم.', 'info');
      return;
    }

    const firstStudent = absentStudents[0];
    const firstHalaqah = halaqat.find((h) => h.id === firstStudent.halaqahId) || halaqat[0];
    const sampleText = generateParentAlertMessage(firstStudent, firstHalaqah, selectedDate);

    openDispatchPreview({
      title: `معاينة تنبيهات أولياء الأمور للطلاب الغائبين (${absentStudents.length} طلاب)`,
      recipientLabel: `أولياء أمور ${absentStudents.length} طلاب غائبين`,
      recipientType: 'batch_parents',
      batchCount: absentStudents.length,
      messageText: sampleText,
      onConfirm: async (finalText) => {
        const count = await sendAllAbsentParentsAlerts(finalText);
        showGlobalNotification(`تم إرسال تنبيهات أولياء الأمور بنجاح (${count} إشعار) 🚀`);
      },
    });
  };

  // Quick enroll student (name + halaqah + age)
  const quickEnrollStudent = (data: QuickEnrollParams): Student => {
    const targetHalaqah = halaqat.find((h) => h.id === data.halaqahId) || halaqat[0];

    // Deduce stage if not explicit
    let stageId: StageId = targetHalaqah.stageId;
    if (data.age <= 9) stageId = 'primary_early';
    else if (data.age <= 12) stageId = 'primary_upper';
    else if (data.age <= 15) stageId = 'intermediate';
    else stageId = 'secondary';

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (data.age || 10);

    // Compute next serial number in this halaqah
    const existingInHalaqah = students.filter((s) => s.halaqahId === targetHalaqah.id);
    const maxSerial = existingInHalaqah.reduce((max, s) => Math.max(max, s.halaqahSerial), 0);
    const nextSerial = maxSerial + 1;

    const firstName = data.fullName.trim().split(/\s+/)[0] || 'الطالب';
    const guardianName = data.guardianName || `ولي أمر الطالب ${firstName}`;
    const guardianPhone = data.guardianPhone?.trim() || '';

    const newStudent: Student = {
      id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      halaqahId: targetHalaqah.id,
      halaqahSerial: nextSerial,
      fullName: data.fullName.trim(),
      guardianName,
      guardianPhone,
      guardianRelation: 'والد الطالب',
      stageId,
      currentJuz: data.currentJuz || 1,
      birthYear,
      status: 'active',
      notes: `تم التسجيل التلقائي السريع (العمر: ${data.age} سنة)`,
    };

    setStudents((prev) => [...prev, newStudent]);

    // Automatically record student as present for today
    setAttendance((prev) => [
      ...prev,
      {
        id: `att_${newStudent.id}_${selectedDate}`,
        date: selectedDate,
        studentId: newStudent.id,
        halaqahId: targetHalaqah.id,
        status: 'present',
        recordedAt: new Date().toISOString(),
        recordedBy: currentRole,
      },
    ]);

    // Log the enrollment
    const enrollLog: MessageLog = {
      id: `log_enroll_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: targetHalaqah.name,
      recipientName: 'إدارة التسجيل',
      text: `تم تسجيل الطالب الجديد "${newStudent.fullName}" (عمره ${data.age} سنة) بحلقة ${targetHalaqah.name} ورقم تسلسله [${nextSerial}].`,
      status: 'delivered',
      halaqahName: targetHalaqah.name,
      studentName: newStudent.fullName,
    };
    setLogs((prev) => [enrollLog, ...prev]);

    return newStudent;
  };

  // Delete student with automatic clean-up and halaqah serial re-sequencing
  const deleteStudent = (studentId: string) => {
    const studentToDelete = students.find((s) => s.id === studentId);
    if (!studentToDelete) return;

    const targetHalaqahId = studentToDelete.halaqahId;

    // Filter out deleted student and resequence remaining students in that halaqah
    setStudents((prev) => {
      const remaining = prev.filter((s) => s.id !== studentId);
      let serialCounter = 1;
      return remaining.map((s) => {
        if (s.halaqahId === targetHalaqahId && s.status === 'active') {
          const updated = { ...s, halaqahSerial: serialCounter };
          serialCounter++;
          return updated;
        }
        return s;
      });
    });

    // Remove from attendance records
    setAttendance((prev) => prev.filter((a) => a.studentId !== studentId));

    // Log the deletion
    const deleteLog: MessageLog = {
      id: `log_del_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: 'نظام الحلقات',
      recipientName: 'إدارة شؤون الطلاب',
      text: `تم حذف الطالب "${studentToDelete.fullName}" وإعادة ضبط أرقام التسلسل داخل الحلقة.`,
      status: 'delivered',
      studentName: studentToDelete.fullName,
    };
    setLogs((prev) => [deleteLog, ...prev]);
  };

  // Clear all students and start completely fresh with blank rosters
  const clearAllStudents = () => {
    setStudents([]);
    setAttendance([]);
    localStorage.setItem('students_data', JSON.stringify([]));
    localStorage.setItem('attendance_data', JSON.stringify([]));
    
    const clearLog: MessageLog = {
      id: `log_clear_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: 'نظام الحلقات',
      recipientName: 'مدير الحلقات',
      text: 'تم تفريغ كافة سجلات الطلاب وأرقامهم للبدء بخانات فارغة وكشوف جديدة.',
      status: 'delivered',
    };
    setLogs((prev) => [clearLog, ...prev]);
  };

  // Restore official real students roster (123 students)
  const restoreDemoStudents = () => {
    setStudents(INITIAL_STUDENTS);
    localStorage.setItem('students_data', JSON.stringify(INITIAL_STUDENTS));
    
    const today = getTodayDateString();
    const demoAtt: AttendanceRecord[] = INITIAL_STUDENTS.map((student, idx) => ({
      id: `att_${student.id}_${today}`,
      date: today,
      studentId: student.id,
      halaqahId: student.halaqahId,
      status: idx % 10 === 0 ? 'absent' : (idx % 15 === 0 ? 'late' : 'present'),
      recited: idx % 10 !== 0,
      recordedAt: new Date().toISOString(),
      recordedBy: currentRole,
    }));
    setAttendance(demoAtt);
    localStorage.setItem('attendance_data', JSON.stringify(demoAtt));
  };

  // Import batch of scanned students from paper photo
  const importScannedStudents = (
    scannedList: Array<{
      halaqahSerial?: number;
      fullName: string;
      guardianPhone?: string;
      guardianName?: string;
      stage?: string;
      currentJuz?: number;
      attendanceStatus?: AttendanceStatus;
      recited?: boolean;
      notes?: string;
    }>,
    targetHalaqahId?: string
  ): number => {
    if (!scannedList || scannedList.length === 0) return 0;
    
    const assignedHalaqahId = targetHalaqahId || (halaqat[0]?.id ?? 'hal_early');
    const halaqahObj = halaqat.find((h) => h.id === assignedHalaqahId);
    const existingInHalaqah = students.filter((s) => s.halaqahId === assignedHalaqahId);
    let currentMaxSerial = existingInHalaqah.reduce((max, s) => Math.max(max, s.halaqahSerial), 0);

    const newStudents: Student[] = scannedList.map((item, index) => {
      const serial = (typeof item.halaqahSerial === 'number' && item.halaqahSerial > 0)
        ? item.halaqahSerial
        : ++currentMaxSerial;
      
      const firstName = item.fullName.trim().split(/\s+/)[0] || 'الطالب';
      const guardianName = item.guardianName || `ولي أمر الطالب ${firstName}`;
      const guardianPhone = item.guardianPhone?.trim() || '';

      // Infer stage
      let stageId = halaqahObj?.stageId || 'intermediate';
      if (item.stage) {
        if (item.stage.includes('براعم') || item.stage.includes('أولى') || item.stage.includes('ثاني')) stageId = 'primary_early';
        else if (item.stage.includes('ابتدائي') || item.stage.includes('عليا')) stageId = 'primary_upper';
        else if (item.stage.includes('متوسط')) stageId = 'intermediate';
        else if (item.stage.includes('ثانوي')) stageId = 'secondary';
      }

      return {
        id: `stu_scan_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        halaqahId: assignedHalaqahId,
        halaqahSerial: serial,
        fullName: item.fullName.trim(),
        guardianName,
        guardianPhone,
        guardianRelation: 'والد الطالب',
        stageId,
        currentJuz: item.currentJuz || 1,
        birthYear: 2011,
        status: 'active',
        notes: item.notes || 'تم الإدراج عبر مسح الكشف الورقي بالكاميرا',
      };
    });

    setStudents((prev) => [...prev, ...newStudents]);

    // Add attendance entries for today preserving scanned presence and strict recitation invariant
    const newAttRecords: AttendanceRecord[] = newStudents.map((s, idx) => {
      const orig = scannedList[idx];
      const status: AttendanceStatus = orig?.attendanceStatus || 'present';
      const isAttended = status === 'present' || status === 'late';
      const didRecite = isAttended && (orig?.recited !== undefined ? orig.recited : true);
      return {
        id: `att_${s.id}_${selectedDate}`,
        date: selectedDate,
        studentId: s.id,
        halaqahId: assignedHalaqahId,
        status,
        recited: didRecite,
        recordedAt: new Date().toISOString(),
        recordedBy: currentRole,
      };
    });
    setAttendance((prev) => [...prev, ...newAttRecords]);

    // Message log
    const scanLog: MessageLog = {
      id: `log_scan_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: halaqahObj?.name || 'الكشوف الورقية',
      recipientName: 'إدارة التسجيل الذكي',
      text: `تم استخراج واعتماد ${newStudents.length} طالباً بنجاح من الكشف الورقي وإدراجهم في ${halaqahObj?.name || 'الحلقة'}.`,
      status: 'delivered',
      halaqahName: halaqahObj?.name,
    };
    setLogs((prev) => [scanLog, ...prev]);

    return newStudents.length;
  };

  // Director: Direct modification of any student's serial number with auto-shifting
  const updateStudentSerial = (studentId: string, newSerial: number) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent || newSerial < 1) return;

    const halaqahId = targetStudent.halaqahId;
    const halaqahStudents = students
      .filter((s) => s.halaqahId === halaqahId && s.status === 'active' && s.id !== studentId)
      .sort((a, b) => a.halaqahSerial - b.halaqahSerial);

    // Insert student at desired position (clamped)
    const targetIndex = Math.max(0, Math.min(newSerial - 1, halaqahStudents.length));
    halaqahStudents.splice(targetIndex, 0, targetStudent);

    // Re-index all in this halaqah cleanly 1..N
    const updatedHalaqahStudents = halaqahStudents.map((s, idx) => ({
      ...s,
      halaqahSerial: idx + 1,
    }));

    setStudents((prev) => {
      return prev.map((s) => {
        const found = updatedHalaqahStudents.find((u) => u.id === s.id);
        return found || s;
      });
    });

    // Log
    const log: MessageLog = {
      id: `log_serial_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: 'شؤون الطلاب',
      recipientName: 'مدير الحلقات',
      text: `قام المدير بتعديل الرقم التسلسلي للطالب "${targetStudent.fullName}" إلى الرقم [${newSerial}] مع إعادة ضبط تسلسل الحلقة.`,
      status: 'delivered',
    };
    setLogs((prev) => [log, ...prev]);
  };

  // Director: Transfer student between halaqat
  const transferStudentHalaqah = (studentId: string, newHalaqahId: string) => {
    const student = students.find((s) => s.id === studentId);
    const newHalaqah = halaqat.find((h) => h.id === newHalaqahId);
    if (!student || !newHalaqah || student.halaqahId === newHalaqahId) return;

    const oldHalaqahId = student.halaqahId;

    // Next serial in new halaqah
    const studentsInNew = students.filter((s) => s.halaqahId === newHalaqahId && s.status === 'active');
    const newSerial = studentsInNew.reduce((max, s) => Math.max(max, s.halaqahSerial), 0) + 1;

    setStudents((prev) => {
      // 1. Update transferred student
      const updatedList = prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            halaqahId: newHalaqahId,
            stageId: newHalaqah.stageId,
            halaqahSerial: newSerial,
            notes: `${s.notes ? s.notes + ' · ' : ''}تم النقل إلى ${newHalaqah.name}`,
          };
        }
        return s;
      });

      // 2. Re-index old halaqah students so there are no holes
      let counter = 1;
      return updatedList.map((s) => {
        if (s.halaqahId === oldHalaqahId && s.status === 'active') {
          const renumbered = { ...s, halaqahSerial: counter };
          counter++;
          return renumbered;
        }
        return s;
      });
    });

    // Update today's attendance records to point to new halaqah
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId && a.date === selectedDate ? { ...a, halaqahId: newHalaqahId } : a))
    );

    // Log
    const log: MessageLog = {
      id: `log_trans_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: newHalaqah.name,
      recipientName: 'مدير الحلقات',
      text: `نقل المدير الطالب "${student.fullName}" إلى ${newHalaqah.name} ورقم تسلسله الجديد [${newSerial}].`,
      status: 'delivered',
    };
    setLogs((prev) => [log, ...prev]);
  };

  // Director: Automatically sort and renumber a halaqah (Alphabetical or Current)
  const autoRenumberHalaqah = (halaqahId: string, method: 'alphabetical' | 'current' | 'age' = 'alphabetical') => {
    setStudents((prev) => {
      const halaqahStudents = prev.filter((s) => s.halaqahId === halaqahId && s.status === 'active');
      const otherStudents = prev.filter((s) => s.halaqahId !== halaqahId || s.status !== 'active');

      if (method === 'alphabetical') {
        halaqahStudents.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
      } else if (method === 'age') {
        halaqahStudents.sort((a, b) => b.birthYear - a.birthYear);
      } else {
        halaqahStudents.sort((a, b) => a.halaqahSerial - b.halaqahSerial);
      }

      const renumbered = halaqahStudents.map((s, idx) => ({
        ...s,
        halaqahSerial: idx + 1,
      }));

      return [...otherStudents, ...renumbered];
    });

    const targetH = halaqat.find((h) => h.id === halaqahId);
    const log: MessageLog = {
      id: `log_renum_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: targetH?.name || 'الحلقة',
      recipientName: 'مدير الحلقات',
      text: `تمت إعادة ترتيب وتسلسل أرقام طلاب ${targetH?.name || 'الحلقة'} أبجدياً من [1] إلى [N].`,
      status: 'delivered',
    };
    setLogs((prev) => [log, ...prev]);
  };

  // Director: Teacher CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teach_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)));

    // If teacher's halaqah assignment or name changed, sync halaqat
    if (updatedTeacher.assignedHalaqahId) {
      setHalaqat((prev) =>
        prev.map((h) =>
          h.id === updatedTeacher.assignedHalaqahId
            ? {
                ...h,
                teacherId: updatedTeacher.id,
                teacherName: updatedTeacher.fullName,
                teacherPhone: updatedTeacher.phoneNumber,
              }
            : h
        )
      );
    }
  };

  const deleteTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  // Director: Delete Halaqah with safety
  const deleteHalaqah = (halaqahId: string) => {
    const hToDelete = halaqat.find((h) => h.id === halaqahId);
    if (!hToDelete) return;

    // Remaining halaqat
    const remainingHalaqat = halaqat.filter((h) => h.id !== halaqahId);
    const fallbackHalaqah = remainingHalaqat[0];

    // Reassign any students belonging to this halaqah to fallback halaqah
    if (fallbackHalaqah) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.halaqahId === halaqahId) {
            return {
              ...s,
              halaqahId: fallbackHalaqah.id,
              stageId: fallbackHalaqah.stageId,
            };
          }
          return s;
        })
      );
    }

    setHalaqat(remainingHalaqat);

    const log: MessageLog = {
      id: `log_del_h_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'system_report',
      recipient: 'إدارة حلقات ابن باز',
      recipientName: 'مشرف حلقات ابن باز',
      text: `قام المدير بحذف "${hToDelete.name}" ونقل طلابها إلى ${fallbackHalaqah?.name || 'حلقة أخرى'}.`,
      status: 'delivered',
    };
    setLogs((prev) => [log, ...prev]);
  };

  // Director: Activities modification & deletion
  const updatePreset = (updatedPreset: ActivityQuickPreset) => {
    setPresets((prev) => prev.map((p) => (p.id === updatedPreset.id ? updatedPreset : p)));
  };

  const deletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
  };

  // Process incoming teacher WhatsApp message (Full automated flow)
  const processTeacherWhatsAppMessage = async (
    text: string,
    senderName: string,
    senderPhone = '+966501112233'
  ) => {
    // Check if it's a student command (enroll / delete)
    const cmdResult = parseStudentCommand(text, senderPhone, halaqat);

    if (cmdResult.isEnrollCommand && cmdResult.studentName) {
      const targetH = cmdResult.halaqah || halaqat[0];
      const enrolled = quickEnrollStudent({
        fullName: cmdResult.studentName,
        halaqahId: targetH.id,
        age: cmdResult.age || 11,
      });

      const responseMessage = `✅ أهلاً وسهلاً يا ${senderName}، تم تسجيل الطالب الجديد بنجاح!\n` +
        `👤 الاسم: ${enrolled.fullName}\n` +
        `🕌 الحلقة: ${targetH.name}\n` +
        `🔢 الرقم التسلسلي الممنوح له في الحلقة: [${enrolled.halaqahSerial}]\n` +
        `تم تحديث قاعدة البيانات وقائمة الحضور فوراً!`;

      const botSim: BotIncomingSimulation = {
        id: `sim_${Date.now()}`,
        senderName,
        senderPhone,
        messageText: text,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        parsedHalaqahId: targetH.id,
        status: 'processed',
        responseMessage,
      };
      setBotSimulations((prev) => [botSim, ...prev]);

      return {
        parsedText: text,
        affectedStudents: [enrolled],
        halaqahName: targetH.name,
        reportSent: false,
        isStudentAction: true,
        actionMessage: responseMessage,
      };
    }

    if (cmdResult.isDeleteCommand && cmdResult.deleteSerial) {
      const targetH = cmdResult.halaqah || halaqat[0];
      const stu = students.find((s) => s.halaqahId === targetH.id && s.halaqahSerial === cmdResult.deleteSerial);

      let responseMsg = '';
      if (stu) {
        deleteStudent(stu.id);
        responseMsg = `✅ تم حذف الطالب [${cmdResult.deleteSerial}] ${stu.fullName} من ${targetH.name} وإعادة ترتيب التسلسل بنجاح.`;
      } else {
        responseMsg = `⚠️ لم يتم العثور على طالب بالرقم [${cmdResult.deleteSerial}] في ${targetH.name}.`;
      }

      const botSim: BotIncomingSimulation = {
        id: `sim_${Date.now()}`,
        senderName,
        senderPhone,
        messageText: text,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        parsedHalaqahId: targetH.id,
        status: 'processed',
        responseMessage: responseMsg,
      };
      setBotSimulations((prev) => [botSim, ...prev]);

      return {
        parsedText: text,
        affectedStudents: stu ? [stu] : [],
        halaqahName: targetH.name,
        reportSent: false,
        isStudentAction: true,
        actionMessage: responseMsg,
      };
    }

    // Default: Attendance parsing
    const parseRes = parseTeacherAttendanceMessage(text, senderPhone, halaqat, students);
    const targetHalaqah = parseRes.detectedHalaqah || halaqat[0];
    const halaqahStudents = students.filter((s) => s.halaqahId === targetHalaqah.id && s.status === 'active');

    // Update attendance in database (strictly enforce recitedCount <= attended)
    const attendedCount = halaqahStudents.filter(
      (stu) => !parseRes.absentStudents.some((abs) => abs.id === stu.id)
    ).length;
    const boundedRecited = Math.min(
      parseRes.recitedCount ?? attendedCount,
      attendedCount
    );

    setAttendance((prev) => {
      const updated = [...prev];
      let assignedRecited = 0;
      halaqahStudents.forEach((stu) => {
        const isAbsent = parseRes.absentStudents.some((abs) => abs.id === stu.id);
        const status: AttendanceStatus = isAbsent ? 'absent' : 'present';
        let isRecited = false;
        if (!isAbsent && assignedRecited < boundedRecited) {
          isRecited = true;
          assignedRecited++;
        }

        const existingIdx = updated.findIndex((a) => a.studentId === stu.id && a.date === selectedDate);
        const newRecord: AttendanceRecord = {
          id: existingIdx >= 0 ? updated[existingIdx].id : `att_${stu.id}_${selectedDate}`,
          date: selectedDate,
          studentId: stu.id,
          halaqahId: targetHalaqah.id,
          status,
          recited: isRecited,
          recitationAmount: isRecited ? 'المقرر اليومي' : undefined,
          recordedAt: new Date().toISOString(),
          recordedBy: 'whatsapp_bot',
          parentNotified: isAbsent,
          parentNotifiedAt: isAbsent ? new Date().toISOString() : undefined,
        };

        if (existingIdx >= 0) {
          updated[existingIdx] = newRecord;
        } else {
          updated.push(newRecord);
        }
      });
      return updated;
    });

    // Log the incoming message
    const incomingLog: MessageLog = {
      id: `log_in_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'incoming_teacher',
      recipient: 'بوت تيليجرام حلقات ابن باز (@DiwanSys_bot)',
      recipientName: `${senderName} (${targetHalaqah.name})`,
      text,
      status: 'delivered',
      halaqahName: targetHalaqah.name,
    };

    // Send parent alerts for absentees automatically
    for (const absentStu of parseRes.absentStudents) {
      const parentMsg = generateParentAlertMessage(absentStu, targetHalaqah, selectedDate);
      const parentLog: MessageLog = {
        id: `log_parent_${Date.now()}_${absentStu.id}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        type: 'parent_alert',
        recipient: absentStu.guardianPhone,
        recipientName: absentStu.guardianName,
        text: parentMsg,
        status: 'delivered',
        studentName: absentStu.fullName,
        halaqahName: targetHalaqah.name,
      };
      setLogs((prev) => [parentLog, ...prev]);
    }

    // Broadcast updated consolidated report to official Telegram group
    const reportText = generateConsolidatedWhatsAppReport(selectedDate, halaqat, students, attendance);
    const groupLog: MessageLog = {
      id: `log_group_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: 'group_broadcast',
      recipient: 'مجموعة وقناة حلقات ابن باز الرسمية',
      recipientName: 'المجموعة العامة (@DiwanSys_bot)',
      text: reportText,
      status: 'delivered',
    };

    setLogs((prev) => [groupLog, incomingLog, ...prev]);

    // Record simulation event
    const botSim: BotIncomingSimulation = {
      id: `sim_${Date.now()}`,
      senderName,
      senderPhone,
      messageText: text,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      parsedHalaqahId: targetHalaqah.id,
      parsedAbsentSerials: parseRes.absentSerials,
      parsedAbsentNames: parseRes.absentStudents.map((s) => s.fullName),
      status: 'processed',
      responseMessage: `✅ تم التحقق والربط! تم رصد غياب ${parseRes.absentStudents.length} طلاب بحلقة ${targetHalaqah.name}، وتحديث قاعدة البيانات، وإشعار أولياء أمورهم، ونشر التقرير بالمجموعة العامة.`,
    };

    setBotSimulations((prev) => [botSim, ...prev]);

    return {
      parsedText: text,
      affectedStudents: parseRes.absentStudents,
      halaqahName: targetHalaqah.name,
      reportSent: true,
    };
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'halaqahSerial'>): Student => {
    const existingInHalaqah = students.filter((s) => s.halaqahId === studentData.halaqahId);
    const maxSerial = existingInHalaqah.reduce((max, s) => Math.max(max, s.halaqahSerial), 0);
    const newSerial = maxSerial + 1;

    const newStudent: Student = {
      ...studentData,
      id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      halaqahSerial: newSerial,
    };

    setStudents((prev) => [...prev, newStudent]);

    // Add present record for today
    setAttendance((prev) => [
      ...prev,
      {
        id: `att_${newStudent.id}_${selectedDate}`,
        date: selectedDate,
        studentId: newStudent.id,
        halaqahId: newStudent.halaqahId,
        status: 'present',
        recordedAt: new Date().toISOString(),
        recordedBy: currentRole,
      },
    ]);

    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const addHalaqah = (data: Omit<Halaqah, 'id'>): Halaqah => {
    const newHalaqah: Halaqah = {
      ...data,
      id: `hal_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    };
    setHalaqat((prev) => [...prev, newHalaqah]);
    return newHalaqah;
  };

  const updateHalaqah = (updated: Halaqah) => {
    setHalaqat((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const addPreset = (data: Omit<ActivityQuickPreset, 'id'>) => {
    const newPreset: ActivityQuickPreset = {
      ...data,
      id: `act_custom_${Date.now()}`,
      isCustom: true,
    };
    setPresets((prev) => [...prev, newPreset]);
  };

  const deleteLog = (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const clearLogs = (type?: MessageLog['type']) => {
    setLogs((prev) => (type ? prev.filter((l) => l.type !== type) : []));
  };

  return (
    <HalaqatContext.Provider
      value={{
        stages,
        halaqat,
        teachers,
        students,
        attendance,
        teacherAttendance,
        setTeacherAttendance,
        bulkMarkTeachers,
        getStagePartitionedBroadcast,
        presets,
        logs,
        botSimulations,
        selectedDate,
        formattedTodayArabic: getTodayFormattedArabic(),
        formattedSelectedDateArabic: formatArabicDate(selectedDate),
        currentRole,
        activeTab,
        isQuickEnrollOpen,
        setIsQuickEnrollOpen,
        isPaperScannerOpen,
        setIsPaperScannerOpen,
        isBulkWhatsAppModalOpen,
        setIsBulkWhatsAppModalOpen,
        openBulkWhatsAppModal,
        closeBulkWhatsAppModal,
        isLiveReportModalOpen,
        openLiveReportModal,
        closeLiveReportModal,
        handleDownloadTxtReport,
        todayAbsentsCount,
        setActiveTab,
        setSelectedDate,
        resetToToday,
        isDirectorUnlocked,
        unlockDirector,
        lockDirector,
        toggleStudentRecitation,
        setStudentRecitation,
        toggleStudentUniform,
        clearAllStudents,
        restoreDemoStudents,
        importScannedStudents,
        setStudentAttendance,
        openDirectWhatsApp,
        bulkMarkHalaqah,
        dispatchPreviewConfig,
        openDispatchPreview,
        closeDispatchPreview,
        globalNotification,
        showGlobalNotification,
        dismissGlobalNotification,
        latenessToleranceMinutes,
        setLatenessToleranceMinutes,
        ringPreparationStatus,
        getRingPreparationStatus,
        sendConsolidatedReportToGroup,
        sendActivityBroadcast,
        sendSingleParentAlert,
        sendAllAbsentParentsAlerts,
        requestSendConsolidatedReport,
        requestSendAllAbsentAlerts,
        requestSendSingleParentAlert,
        requestSendActivityBroadcast,
        processTeacherWhatsAppMessage,
        quickEnrollStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        updateStudentSerial,
        transferStudentHalaqah,
        autoRenumberHalaqah,
        addHalaqah,
        updateHalaqah,
        deleteHalaqah,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addPreset,
        updatePreset,
        deletePreset,
        confirmDeleteTarget,
        openDeleteConfirm,
        closeDeleteConfirm,
        confirmDeleteAction,
        isExecutingDelete,
        isAddHalaqahModalOpen,
        setIsAddHalaqahModalOpen,
        openAddHalaqahModal,
        deleteLog,
        clearLogs,
        telegramSession,
        refreshTelegramStatus,
        simulateTelegramReport,
      }}
    >
      {children}
    </HalaqatContext.Provider>
  );
};

export const useHalaqat = () => {
  const context = useContext(HalaqatContext);
  if (!context) {
    throw new Error('useHalaqat must be used within a HalaqatProvider');
  }
  return context;
};
