import React, { useState, useEffect, useRef } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Zap,
  BookOpen,
  Camera,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  PlusCircle,
  Database,
  Trash2,
  Upload,
  UserPlus,
  AlertCircle,
  KeyRound,
  FileText,
  Download,
  BellRing,
  Share2,
  PhoneCall,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';

export const TelegramBotManager: React.FC = () => {
  const {
    telegramSession,
    refreshTelegramStatus,
    simulateTelegramReport,
    halaqat,
    teachers,
    students,
    botSimulations,
    selectedDate,
    formattedSelectedDateArabic,
    showGlobalNotification,
  } = useHalaqat();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'simulator' | 'live_data'>('simulator');

  // Mode in simulator: 'buttons' (Interactive Inline Keyboard) vs 'text' (Manual text message)
  const [simulatorMode, setSimulatorMode] = useState<'buttons' | 'text'>('buttons');

  // Interactive Bot State per teacher/supervisor (عزل محادثة وجلسة كل معلم)
  const [selectedTeacherName, setSelectedTeacherName] = useState('مصباح نور الدين');

  const [teacherSessions, setTeacherSessions] = useState<
    Record<
      string,
      {
        step: string;
        ringId: string;
        ringName: string;
        text: string;
        numbersInput: string;
      }
    >
  >({
    'مصباح نور الدين': {
      step: 'main',
      ringId: 'ring_1',
      ringName: 'حلقة الصفوف الأولية',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 3, 5, 10, 15',
    },
    'أ. بندر القحطاني / أبو فيصل القحطاني': {
      step: 'main',
      ringId: 'ring_2',
      ringName: 'حلقة الصف الرابع الابتدائي',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 2, 4, 7',
    },
    'أ. بسام البعيجان': {
      step: 'main',
      ringId: 'ring_3',
      ringName: 'حلقة الصف الخامس الابتدائي',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 3, 5, 12, 20',
    },
    'أ. جابر الشهري': {
      step: 'main',
      ringId: 'ring_4',
      ringName: 'حلقة الصف السادس الابتدائي',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 3, 5, 8',
    },
    'أ. عبدالله العتيبي': {
      step: 'main',
      ringId: 'ring_5',
      ringName: 'حلقة المرحلة المتوسطة',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 2, 5, 10, 18',
    },
    'أ. وليد عبدالله العتيبي': {
      step: 'main',
      ringId: 'ring_6',
      ringName: 'حلقة المرحلة الثانوية',
      text:
        '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
        '📅 الكشف الرسمي المعتمد بأرقام المعلمين وأولياء الأمور الحقيقية\n\n' +
        'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
      numbersInput: '1, 3, 6, 12, 19',
    },
  });

  const currentTeacherSession = teacherSessions[selectedTeacherName] || {
    step: 'main',
    ringId: 'ring_1',
    ringName: 'حلقة الصفوف الأولية',
    text:
      '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
      '📅 الكشف الرسمي المعتمد بأرقام أولياء الأمور الحقيقية\n\n' +
      'جميع الأزرار والخدمات مفعّلة وتعمل بشكل فوري وحقيقي 100%:',
    numbersInput: '1, 3, 5, 10',
  };

  const interactiveStep = currentTeacherSession.step;
  const interactiveRingId = currentTeacherSession.ringId;
  const interactiveRingName = currentTeacherSession.ringName;
  const interactiveText = currentTeacherSession.text;
  const numbersInput = currentTeacherSession.numbersInput;

  const updateCurrentSession = (
    partial: Partial<{
      step: string;
      ringId: string;
      ringName: string;
      text: string;
      numbersInput: string;
    }>
  ) => {
    setTeacherSessions((prev) => ({
      ...prev,
      [selectedTeacherName]: {
        ...(prev[selectedTeacherName] || {
          step: 'main',
          ringId: 'ring_1',
          ringName: 'حلقة الصفوف الأولية',
          text: '🌸 مرحباً بك في مركز تحكم بوت التليجرام 🌸',
          numbersInput: '1, 3, 4',
        }),
        ...partial,
      },
    }));
  };

  const setInteractiveStep = (step: string) => updateCurrentSession({ step });
  const setInteractiveRingId = (ringId: string) => updateCurrentSession({ ringId });
  const setInteractiveRingName = (ringName: string) => updateCurrentSession({ ringName });
  const setInteractiveText = (text: string) => updateCurrentSession({ text });
  const setNumbersInput = (numbersInput: string) => updateCurrentSession({ numbersInput });

  // System bot data from server
  const [systemData, setSystemData] = useState<{
    rings: Record<string, any>;
    teachers: Record<string, any>;
    students: Record<string, any>;
    supervisors: Record<string, any>;
    studentAttendance: Record<string, any>;
    teacherAttendance: Record<string, any>;
    supervisorPhone: string;
  }>({
    rings: {},
    teachers: {},
    students: {},
    supervisors: {},
    studentAttendance: {},
    teacherAttendance: {},
    supervisorPhone: '',
  });

  const [attendanceInputText, setAttendanceInputText] = useState<string>(
    'الحاضرون: أحمد، خالد، محمد، عبد الله\nالسمّيعة: أحمد، خالد\nالغائبون: سعد\nالمتأخرون: عمر'
  );
  const [newStudentNameInput, setNewStudentNameInput] = useState<string>('عبدالمحسن خالد العتيبي');
  const [newStudentPhoneInput, setNewStudentPhoneInput] = useState<string>('');
  const [manageInputText, setManageInputText] = useState<string>('');
  const [messageInput, setMessageInput] = useState(
    '1, 3, 4'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [botResponse, setBotResponse] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BOT_TOKEN_DISPLAY = '8782679226:AAF7LUUwXva8thHJVq_czieb0e3HfWhs-tc';

  // Fetch bot system data
  const fetchSystemData = async () => {
    try {
      const res = await fetch('/api/telegram/system-data');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSystemData({
            rings: data.rings || {},
            teachers: data.teachers || {},
            students: data.students || {},
            supervisors: data.supervisors || {},
            studentAttendance: data.studentAttendance || {},
            teacherAttendance: data.teacherAttendance || {},
            supervisorPhone: data.supervisorPhone || '',
          });
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  // Clear bot database to start completely empty
  const handleClearBotData = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/telegram/sync-system-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      const data = await res.json();
      if (data.success) {
        showGlobalNotification(data.message || 'تم تفريغ بيانات البوت والبدء من الصفر', 'info');
        await fetchSystemData();
        setInteractiveStep('main');
        setInteractiveText(
          '🌸 مرحباً بك في مركز تحكم بوت التليجرام لحلقات جامع ابن باز 🌸\n\n' +
            'تم تفريغ البيانات، ويمكنك الآن إضافة الحلقات والطلاب من البداية:'
        );
      }
    } catch (_) {
      showGlobalNotification('تعذر تفريغ بيانات البوت', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to default seed (5 rings, 25 students, 5 teachers)
  const handleResetDefaultSeed = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/telegram/sync-system-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_default' }),
      });
      const data = await res.json();
      if (data.success) {
        showGlobalNotification('تمت إعادة ضبط بيانات الكشف الرسمي (6 حلقات، 123 طالباً، 6 معلمين)', 'success');
        await fetchSystemData();
        setInteractiveStep('main');
      }
    } catch (_) {
      showGlobalNotification('تعذر إعادة ضبط البيانات', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInteractiveClick = async (callbackData: string) => {
    setIsProcessing(true);
    try {
      const res = await simulateTelegramReport(undefined, selectedTeacherName, callbackData);
      if (res && res.replyText) {
        setInteractiveText(res.replyText);

        if (callbackData === 'main_menu') {
          setInteractiveStep('main');
        } else if (callbackData === 'start_prep' || callbackData === 'quick_num_prep' || callbackData === 'prep_students_menu') {
          setInteractiveStep('quick_num_prep');
        } else if (
          callbackData.startsWith('prep_num_ring_') ||
          callbackData.startsWith('prep_ring_') ||
          callbackData.startsWith('ring_')
        ) {
          let id = callbackData;
          if (id.startsWith('prep_num_ring_')) id = id.substring('prep_num_ring_'.length);
          else if (id.startsWith('prep_ring_')) id = id.substring('prep_ring_'.length);
          else if (id.startsWith('ring_')) id = id.substring('ring_'.length);
          setInteractiveRingId(id);
          setInteractiveRingName(res.ringName || 'الحلقة');
          setInteractiveStep('prep_num_ring');
          setNumbersInput('1, 3, 4');
        } else if (callbackData === 'add_student' || callbackData === 'add_item_student') {
          setInteractiveStep('add_student_step1_name');
          setNewStudentNameInput('عبدالمحسن خالد العتيبي');
        } else if (callbackData.startsWith('confirm_add_to_ring_') || callbackData.startsWith('assign_std_ring_')) {
          setInteractiveStep('student_added');
          showGlobalNotification('تمت إضافة الطالب الجديد للحلقة بنجاح وشارة الطالب الجديد مفعّلة ✨', 'success');
        } else if (callbackData.startsWith('mark_all_present_')) {
          setInteractiveStep('done');
          showGlobalNotification('تم تحضير جميع طلاب الحلقة كحاضرين بنجاح! ✅', 'success');
        }
      }
      await fetchSystemData();
    } catch (_) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNumbersSubmit = async (customNumbers?: string) => {
    const valueToSend = customNumbers !== undefined ? customNumbers : numbersInput;
    if (!valueToSend.trim()) return;
    setIsProcessing(true);
    try {
      const res = await simulateTelegramReport(valueToSend.trim(), selectedTeacherName);
      if (res && res.replyText) {
        setInteractiveText(res.replyText);
        setInteractiveStep('done');
        showGlobalNotification(res.message || 'تم اعتماد رصد التحضير السريع بالأرقام بنجاح! 🚀', 'success');
      }
      await fetchSystemData();
    } catch (_) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStep1NameSubmit = async () => {
    if (!newStudentNameInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await simulateTelegramReport(newStudentNameInput.trim(), selectedTeacherName);
      if (res && res.replyText) {
        setInteractiveText(res.replyText);
        setInteractiveStep('add_student_step2_phone');
        showGlobalNotification(`تم استلام اسم الطالب (${newStudentNameInput.trim()})`, 'info');
      }
      await fetchSystemData();
    } catch (_) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStep2PhoneSubmit = async (customPhone?: string) => {
    const phoneToSend = customPhone !== undefined ? customPhone : (newStudentPhoneInput.trim() || 'لا يوجد');
    setIsProcessing(true);
    try {
      const res = await simulateTelegramReport(phoneToSend, selectedTeacherName);
      if (res && res.replyText) {
        setInteractiveText(res.replyText);
        setInteractiveStep('add_student_step3_ring');
        showGlobalNotification(
          phoneToSend === 'لا يوجد'
            ? 'تم تسجيل الطالب بدون رقم تواصل (يمكن إضافته لاحقاً)'
            : `تم تسجيل رقم جوال ولي الأمر (${phoneToSend})`,
          'info'
        );
      }
      await fetchSystemData();
    } catch (_) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReportFile = () => {
    const link = document.createElement('a');
    link.href = '/api/telegram/download-report';
    link.download = 'التقرير_الختامي_المفصل.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showGlobalNotification('جاري تحميل التقرير الختامي والمفصل 📄', 'success');
  };

  const handleSimulateOcrPhoto = async (sampleData?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPhoto: true,
          imageBase64: sampleData || 'simulated_camera_paper_roster',
          senderName: selectedTeacherName,
        }),
      });
      const data = await res.json();
      if (data.success && data.replyText) {
        setInteractiveStep('done');
        setInteractiveText(data.replyText);
        showGlobalNotification(data.message || 'تم تحليل الكشف الورقي بنجاح', 'success');
        refreshTelegramStatus();
      }
      await fetchSystemData();
    } catch (_) {
      showGlobalNotification('تعذر معالجة صورة الكشف', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await handleSimulateOcrPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSendSimulatedReport = async (customText?: string) => {
    const text = customText || messageInput;
    if (!text.trim()) return;

    setIsProcessing(true);
    setBotResponse(null);
    try {
      const res = await simulateTelegramReport(text, selectedTeacherName);
      if (res && res.replyText) {
        setBotResponse(res.replyText);
      }
      await fetchSystemData();
    } catch {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramSession.botUrl);
    setCopiedLink(true);
    showGlobalNotification('تم نسخ رابط البوت للمشاركة ✓', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(BOT_TOKEN_DISPLAY);
    setCopiedToken(true);
    showGlobalNotification('تم نسخ توكن تيليجرام للحافظة ✓', 'success');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const ringsList = Array.from(
    new Map(Object.values(systemData.rings).map((r: any) => [r.name, r])).values()
  );
  const teachersCount = Object.keys(systemData.teachers).length;
  const studentsCount = Object.keys(systemData.students).length;
  const supervisorsCount = Object.keys(systemData.supervisors).length;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-sky-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-sky-700/50">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              ✈️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] bg-sky-500/30 text-sky-200 border border-sky-400/40 px-2.5 py-0.5 rounded-full font-bold">
                  بوت تيليجرام الرسمي ✈️
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>متصل ومفعّل 100% 🟢</span>
                </span>
                <span className="text-[10px] bg-sky-950/80 text-sky-200 px-2 py-0.5 rounded font-mono">
                  @{telegramSession.botUsername}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
                مركز تحكم بوت تيليجرام الرسمي (حلقات جامع ابن باز)
              </h1>
              <p className="text-xs sm:text-sm text-sky-200/90 mt-1 leading-relaxed">
                تحضير الحلقات بنقرة واحدة · روابط واتساب مباشرة لأولياء الأمور · نشر لقروب التليجرام مقسماً حسب المراحل · تقارير يومية/أسبوعية/شهرية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <a
              href={telegramSession.botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              title="فتح البوت مباشرة في تطبيق تيليجرام"
            >
              <Send className="w-4 h-4 -rotate-45" />
              <span>فتح البوت في تيليجرام ↗</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 bg-sky-900/80 hover:bg-sky-800 text-sky-200 border border-sky-700/60 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="نسخ رابط البوت لمشاركته مع المعلمين"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'تم النسخ ✓' : 'نسخ الرابط'}</span>
            </button>

            <button
              onClick={() => {
                refreshTelegramStatus();
                fetchSystemData();
              }}
              className="p-2.5 bg-sky-900/80 hover:bg-sky-800 text-sky-200 rounded-xl transition-colors cursor-pointer border border-sky-700/60"
              title="تحديث حالة الاتصال بـ Telegram API"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Seed Status Ribbon */}
        <div className="mt-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-sky-950/60 border border-sky-700/50 rounded-xl p-3">
            <div className="text-sky-300 text-[11px] font-medium">الحلقات المسجلة بالمراحل:</div>
            <div className="text-base font-extrabold text-white mt-0.5">{ringsList.length} حلقات (ابتدائي، متوسط، ثانوي)</div>
          </div>
          <div className="bg-sky-950/60 border border-sky-700/50 rounded-xl p-3">
            <div className="text-sky-300 text-[11px] font-medium">إجمالي الطلاب المسجلين:</div>
            <div className="text-base font-extrabold text-amber-300 mt-0.5">{studentsCount} طالباً (أرقام حقيقية)</div>
          </div>
          <div className="bg-sky-950/60 border border-sky-700/50 rounded-xl p-3">
            <div className="text-sky-300 text-[11px] font-medium">المعلمون المعتمدون:</div>
            <div className="text-base font-extrabold text-white mt-0.5">{teachersCount} معلمين مكلفين</div>
          </div>
          <div className="bg-sky-950/60 border border-sky-700/50 rounded-xl p-3">
            <div className="text-sky-300 text-[11px] font-medium">فريق الإشراف الإداري:</div>
            <div className="text-base font-extrabold text-white mt-0.5">{supervisorsCount} مشرفين مناوبين</div>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>🔘 مركز تحكم ومحاكاة البوت التفاعلي</span>
          </button>

          <button
            onClick={() => setActiveTab('live_data')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'live_data'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>📊 كشف الحلقات والطلاب الحي ({students.length} طالباً)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaultSeed}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="إعادة ضبط البيانات إلى الكشف الرسمي المعتمد (6 حلقات، 123 طالباً)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة الكشف الرسمي المعتمد</span>
          </button>

          <button
            type="button"
            onClick={handleClearBotData}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تفريغ بيانات البوت تماماً والبدء من الصفر"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>تفريغ للبدء من الصفر</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE BOT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Interactive Bot Screen */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-sky-100 text-sky-800 rounded-lg">
                    <Zap className="w-4 h-4 text-sky-700" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      واجهة محاكاة البوت التفاعلي (الأزرار والخدمات الحقيقية)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      التحضير · تنبيه أولياء الأمور (واتساب مباشر) · النشر للقروب العام · الأرشفة والتقارير
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSimulatorMode('buttons')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      simulatorMode === 'buttons'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔘 الأزرار التفاعلية
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorMode('text')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      simulatorMode === 'text'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✍️ رسائل نصية
                  </button>
                </div>
              </div>

              {/* Sheikh / Teacher selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الشيخ أو المعلم المرسل:
                </label>
                <select
                  value={selectedTeacherName}
                  onChange={(e) => setSelectedTeacherName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <option value="مصباح نور الدين">مصباح نور الدين (+8801740193245) — الصفوف الأولية</option>
                  <option value="أ. بندر القحطاني / أبو فيصل القحطاني">أ. بندر القحطاني / أبو فيصل القحطاني (+966551762227) — الصف الرابع</option>
                  <option value="أ. بسام البعيجان">أ. بسام البعيجان (+966508105571) — الصف الخامس</option>
                  <option value="أ. جابر الشهري">أ. جابر الشهري (+966503263150) — الصف السادس</option>
                  <option value="أ. عبدالله العتيبي">أ. عبدالله العتيبي (+966531816200) — المرحلة المتوسطة</option>
                  <option value="أ. وليد عبدالله العتيبي">أ. وليد عبدالله العتيبي (+966501270970) — المرحلة الثانوية</option>
                </select>
              </div>

              {/* Telegram Screen Simulation */}
              {simulatorMode === 'buttons' && (
                <div className="space-y-3">
                  <div className="bg-[#0e1621] text-white rounded-2xl p-4 shadow-inner border border-sky-950 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                          ✈️
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">بوت حلقات جامع ابن باز</div>
                          <div className="text-[10px] text-sky-400">@DiwanSys_bot · توكن رسمي معتمد</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInteractiveClick('main_menu')}
                        className="text-[11px] text-sky-300 hover:text-white bg-sky-900/60 hover:bg-sky-900 px-2.5 py-1 rounded-lg border border-sky-700/60 cursor-pointer"
                      >
                        /start القائمة الرئيسية
                      </button>
                    </div>

                    {/* Chat Bubble Message */}
                    <div className="bg-[#182533] rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-sky-300/80">
                        <span>رسالة البوت الرسمية</span>
                        <span>{new Date().toLocaleTimeString('ar-SA')}</span>
                      </div>
                      <div className="whitespace-pre-line text-slate-100 font-sans leading-relaxed text-[13px]">
                        {interactiveText}
                      </div>
                    </div>

                    {/* Action Buttons depending on interactiveStep */}
                    <div className="space-y-2 pt-1">
                      {/* MAIN MENU (2 FIELD TASKS ONLY) */}
                      {interactiveStep === 'main' && (
                        <div className="space-y-2.5">
                          <div className="bg-sky-950/80 border border-sky-800/40 rounded-xl p-3 text-xs text-sky-200/90 leading-relaxed">
                            💡 <strong>بوت ميداني خفيف:</strong> مخصص حصرياً للمهمتين الميدانيتين المباشرتين. جميع العمليات الكبرى والأرشيف الدائم والتقارير الأربعة ومتابعة الزي الرسمي تعمل في لوحة التحكم.
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('start_prep')}
                              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-500/30"
                            >
                              <CheckCircle2 className="w-4 h-4 text-sky-300" />
                              <span>📋 بدء التحضير الميداني السريع</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('add_student')}
                              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
                            >
                              <UserPlus className="w-4 h-4 text-emerald-300" />
                              <span>➕ إضافة طالب جديد للحلقات</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP: START PREPARATION CHOICE (NUMBERS VS ADD STUDENT) */}
                      {interactiveStep === 'start_prep' && (
                        <div className="space-y-2.5">
                          <div className="bg-sky-950/80 border border-sky-800/40 rounded-xl p-3 text-xs text-sky-200/90 leading-relaxed">
                            📋 <strong>اختر آلية العمل الميداني المطلوبة:</strong>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('quick_num_prep')}
                              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-500/30"
                            >
                              <CheckCircle2 className="w-4 h-4 text-sky-300" />
                              <span>🔢 التحضير السريع الميداني (بالأرقام)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('add_student')}
                              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
                            >
                              <UserPlus className="w-4 h-4 text-emerald-300" />
                              <span>➕ إضافة طالب جديد (3 خطوات)</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInteractiveClick('main_menu')}
                            className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                          >
                            « رجوع للقائمة الرئيسية
                          </button>
                        </div>
                      )}

                      {/* STEP: CHOOSE RING FOR QUICK NUMBERS ATTENDANCE */}
                      {(interactiveStep === 'quick_num_prep' || interactiveStep === 'prep_students_menu') && (
                        <div className="space-y-2">
                          <div className="text-[11px] text-sky-300 font-bold mb-1 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>اختر الحلقة لعرض كشف الطلاب المرقم ورصد الحضور بالأرقام:</span>
                          </div>
                          {ringsList.map((ring) => (
                            <button
                              key={ring.id}
                              type="button"
                              onClick={() => handleInteractiveClick(`prep_num_ring_${ring.id}`)}
                              className="w-full py-2.5 px-3 bg-[#2b5278] hover:bg-[#32618d] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer border border-white/5"
                            >
                              <span>📖 {ring.name}</span>
                              <span className="text-[10px] text-sky-200 bg-sky-950/70 px-2 py-0.5 rounded font-normal">
                                {ring.stage}
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleInteractiveClick('start_prep')}
                            className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                          >
                            « رجوع
                          </button>
                        </div>
                      )}

                      {/* STEP: RAPID NUMBERS ATTENDANCE INPUT & CHIPS */}
                      {(interactiveStep === 'prep_num_ring' || interactiveStep === 'prep_ring') && (
                        <div className="space-y-2.5">
                          <div className="bg-[#182533] p-3.5 rounded-xl border border-sky-800/40 text-xs space-y-3">
                            <div className="flex items-center justify-between text-sky-300 font-bold text-[11px]">
                              <span>🔢 كشف طلاب ({interactiveRingName})</span>
                              <span className="text-[10px] text-emerald-400 font-bold">التحضير السريع بالأرقام</span>
                            </div>

                            {/* Prominent Quick 1-Click All Present Button */}
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick(`mark_all_present_${interactiveRingId}`)}
                              disabled={isProcessing}
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>✅ تحضير الكل حضور بضغطة زر واحدة</span>
                            </button>

                            <div className="bg-[#0e1621] p-2.5 rounded-lg border border-sky-900/50 space-y-2">
                              <label className="block text-[11px] text-sky-200 font-bold">
                                ✍️ أو أرسل أرقام الحاضرين فقط مفصولة بفواصل أو مسافات:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={numbersInput}
                                  onChange={(e) => setNumbersInput(e.target.value)}
                                  placeholder="مثال: 1, 3, 4 أو 1 3 4"
                                  className="flex-1 bg-[#182533] text-white text-xs font-mono font-bold px-3 py-2 rounded-lg border border-sky-600/50 focus:outline-none focus:ring-1 focus:ring-sky-400"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleNumbersSubmit();
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleNumbersSubmit()}
                                  disabled={isProcessing || !numbersInput.trim()}
                                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <Send className="w-3.5 h-3.5 -rotate-45" />
                                  <span>اعتماد الأرقام</span>
                                </button>
                              </div>
                              <div className="text-[10px] text-sky-400">
                                ⚡ سيقوم النظام آلياً بتحضير الطلاب المطابقين كـ (حاضرين) واعتبار باقي أرقام الطلاب كـ (غائبين) وتحديث لوحة التحكم فوراً.
                              </div>
                            </div>

                            {/* Quick Numbers Suggestion Chips */}
                            <div className="space-y-1.5">
                              <div className="text-[10px] text-slate-400 font-semibold">نماذج سريعة جاهزة للتجربة بضغطة واحدة:</div>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleNumbersSubmit('1, 2, 3, 4, 5')}
                                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-lg font-bold cursor-pointer"
                                >
                                  [1, 2, 3, 4, 5] (الكل حاضر)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNumbersSubmit('1, 3, 4')}
                                  className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[10px] rounded-lg font-bold cursor-pointer"
                                >
                                  [1, 3, 4] (غياب 2 و 5)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNumbersSubmit('1, 2, 4')}
                                  className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[10px] rounded-lg font-bold cursor-pointer"
                                >
                                  [1, 2, 4] (غياب 3 و 5)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNumbersSubmit('2, 3, 5')}
                                  className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[10px] rounded-lg font-bold cursor-pointer"
                                >
                                  [2, 3, 5] (غياب 1 و 4)
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('quick_num_prep')}
                              className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                            >
                              « اختيار حلقة أخرى
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('main_menu')}
                              className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                            >
                              « القائمة الرئيسية
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 1: ADD STUDENT - INPUT NAME */}
                      {interactiveStep === 'add_student_step1_name' && (
                        <div className="space-y-3 bg-[#182533] p-3.5 rounded-xl border border-emerald-600/40">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span>➕ إضافة طالب جديد (الخطوة 1 من 3)</span>
                            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400">الاسم الكامل</span>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] text-slate-300 font-medium">
                              اكتب اسم الطالب الكامل (الثلاثي أو الرباعي):
                            </label>
                            <input
                              type="text"
                              value={newStudentNameInput}
                              onChange={(e) => setNewStudentNameInput(e.target.value)}
                              placeholder="مثال: عبدالمحسن خالد بن نايف العتيبي"
                              className="w-full bg-[#0e1621] text-white text-xs border border-emerald-700/60 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStep1NameSubmit();
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleStep1NameSubmit}
                              disabled={isProcessing || !newStudentNameInput.trim()}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <span>المتابعة للخطوة 2: رقم جوال ولي الأمر ➡️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('main_menu')}
                              className="px-3 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-lg cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: ADD STUDENT - INPUT PHONE */}
                      {interactiveStep === 'add_student_step2_phone' && (
                        <div className="space-y-3 bg-[#182533] p-3.5 rounded-xl border border-emerald-600/40">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span>📱 إضافة طالب جديد (الخطوة 2 من 3)</span>
                            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400">رقم ولي الأمر</span>
                          </div>
                          <div className="bg-[#0e1621] p-2.5 rounded-lg border border-emerald-900/40 text-xs">
                            <div className="text-[11px] text-slate-300">
                              الطالب: <strong className="text-emerald-300">{newStudentNameInput}</strong>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] text-slate-300 font-medium">
                              رقم جوال ولي الأمر (معتمد للتنبيهات والواتساب):
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newStudentPhoneInput}
                                onChange={(e) => setNewStudentPhoneInput(e.target.value)}
                                placeholder="05xxxxxxxx (أو اتركه فارغاً)"
                                className="flex-1 bg-[#0e1621] text-white text-xs font-mono font-bold border border-emerald-700/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleStep2PhoneSubmit('لا يوجد')}
                                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded-lg font-bold border border-slate-600/40 cursor-pointer shrink-0"
                                title="تخطي إدخال الرقم (يُسجّل كـ لا يوجد رقم)"
                              >
                                تخطي (لا يوجد رقم)
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleStep2PhoneSubmit()}
                              disabled={isProcessing}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <span>المتابعة للخطوة 3: اختيار الحلقة ➡️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setInteractiveStep('add_student_step1_name')}
                              className="px-3 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-lg cursor-pointer"
                            >
                              « رجوع
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: ADD STUDENT - CHOOSE RING */}
                      {interactiveStep === 'add_student_step3_ring' && (
                        <div className="space-y-2.5 bg-[#182533] p-3.5 rounded-xl border border-emerald-600/40">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span>📖 إضافة طالب جديد (الخطوة 3 من 3)</span>
                            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400">تسكين الحلقة</span>
                          </div>
                          <div className="bg-[#0e1621] p-2.5 rounded-lg border border-emerald-900/40 text-xs space-y-1">
                            <div className="text-[11px] text-slate-300">
                              الطالب: <strong className="text-emerald-300">{newStudentNameInput}</strong>
                            </div>
                            <div className="text-[11px] text-slate-300">
                              جوال ولي الأمر: <strong className="text-amber-300 font-mono">{newStudentPhoneInput}</strong>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-300 font-bold">
                            اضغط على الحلقة المراد إدراج الطالب فيها:
                          </div>
                          <div className="space-y-1.5">
                            {ringsList.map((ring) => (
                              <button
                                key={ring.id}
                                type="button"
                                onClick={() => handleInteractiveClick(`confirm_add_to_ring_${ring.id}`)}
                                className="w-full py-2.5 px-3 bg-emerald-950/70 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer border border-emerald-500/30"
                              >
                                <span>📖 {ring.name}</span>
                                <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded font-normal">
                                  {ring.stage}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setInteractiveStep('add_student_step2_phone')}
                            className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                          >
                            « رجوع لتعديل رقم الجوال
                          </button>
                        </div>
                      )}

                      {/* AFTER ACTION (DONE / STUDENT ADDED) */}
                      {(interactiveStep === 'done' || interactiveStep === 'student_added') && (
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('start_prep')}
                              className="py-2.5 px-3 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>📋 تحضير حلقة أخرى</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInteractiveClick('add_student')}
                              className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>➕ إضافة طالب آخر</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleInteractiveClick('main_menu')}
                            className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-300 text-xs rounded-xl cursor-pointer"
                          >
                            « رجوع للقائمة الرئيسية
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: Text Message Simulator */}
              {simulatorMode === 'text' && (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="اكتب رسالة المعلم هنا..."
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendSimulatedReport()}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال التقرير النصي ورصده في النظام</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Live Ingestion Log & Immediate Status */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">سجل التقارير الحية المرصودة</h3>
                    <p className="text-[10px] text-slate-500">
                      التحديث التلقائي الفوري لشاشات التحضير
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {botSimulations.length} تقرير
                </span>
              </div>

              {botSimulations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-medium">لم يتم رصد أي تقارير جديدة لهذا اليوم حتى الآن</p>
                  <p className="text-[11px] text-slate-400">
                    استخدم الأزرار التفاعلية على اليمين لتحضير أي حلقة ورصدها في النظام فوراً.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {botSimulations.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{rep.detectedHalaqahName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(rep.timestamp).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span>المعلم: {rep.senderName}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          حضور: {rep.presentCount}
                        </span>
                        <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          غياب: {rep.absentCount}
                        </span>
                        <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          سمّع: {rep.recitedCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SYSTEM DATA */}
      {activeTab === 'live_data' && (
        <div className="space-y-5">
          {/* Rings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {ringsList.map((ring) => {
              const ringStudents = Object.values(systemData.students).filter(
                (s) =>
                  s.ringId === ring.id ||
                  (ring.id === 'ring_1' && s.ringId === 'hal_early') ||
                  (ring.id === 'hal_early' && s.ringId === 'ring_1') ||
                  (ring.id === 'ring_2' && s.ringId === 'hal_grade4') ||
                  (ring.id === 'hal_grade4' && s.ringId === 'ring_2') ||
                  (ring.id === 'ring_3' && s.ringId === 'hal_grade5') ||
                  (ring.id === 'hal_grade5' && s.ringId === 'ring_3') ||
                  (ring.id === 'ring_4' && s.ringId === 'hal_grade6') ||
                  (ring.id === 'hal_grade6' && s.ringId === 'ring_4') ||
                  (ring.id === 'ring_5' && s.ringId === 'hal_intermediate') ||
                  (ring.id === 'hal_intermediate' && s.ringId === 'ring_5') ||
                  (ring.id === 'ring_6' && s.ringId === 'hal_secondary') ||
                  (ring.id === 'hal_secondary' && s.ringId === 'ring_6')
              );
              return (
                <div
                  key={ring.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                      {ring.stage}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-bold shrink-0">
                      {ringStudents.length} طالباً
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{ring.name}</h4>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
                    <span>المعلم: {ring.teacherName || 'المعلم المعتمد'}</span>
                    {(() => {
                      const matchedTeacher = Object.values(systemData.teachers).find(
                        (tc: any) =>
                          tc.id === ring.teacherId ||
                          tc.name === ring.teacherName ||
                          tc.fullName === ring.teacherName
                      );
                      const phone = ring.teacherPhone || matchedTeacher?.phone || matchedTeacher?.phoneNumber || '';
                      return phone ? (
                        <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded" dir="ltr">
                          {phone}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          لا يوجد رقم
                        </span>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('simulator');
                      handleInteractiveClick(`prep_ring_${ring.id}`);
                    }}
                    className="w-full mt-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                  >
                    الانتقال للتحضير ↗
                  </button>
                </div>
              );
            })}
          </div>

          {/* Students Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  كشف جميع الطلاب المسجلين ({studentsCount} طالباً — الكشف الرسمي الحقيقي)
                </h3>
                <p className="text-[11px] text-slate-500">
                  أرقام أولياء الأمور الحقيقية المعتمدة لكل طالب، مع تنبيه (لا يوجد رقم) للطلاب غير المدرج لهم رقم تواصل.
                </p>
              </div>

              <div className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                إجمالي الطلاب: {studentsCount} طالباً
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">اسم الطالب</th>
                    <th className="py-2.5 px-3">الحلقة المسجل بها</th>
                    <th className="py-2.5 px-3">المرحلة الدراسية</th>
                    <th className="py-2.5 px-3">جوال ولي الأمر</th>
                    <th className="py-2.5 px-3">الحالة الحالية</th>
                    <th className="py-2.5 px-3 text-center">إجراء واتساب مباشر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(systemData.students).map((s, idx) => {
                    const ring = systemData.rings[s.ringId] || { name: 'حلقة' };
                    const att = systemData.studentAttendance[s.id] || { status: 'حاضر', recited: true };

                    let badgeColor = 'bg-emerald-100 text-emerald-800';
                    if (att.status === 'غائب') badgeColor = 'bg-red-100 text-red-800 font-bold';
                    else if (att.status === 'عذر') badgeColor = 'bg-amber-100 text-amber-800';
                    else if (att.status === 'متأخر') badgeColor = 'bg-purple-100 text-purple-800 font-bold';

                    const waMsg = encodeURIComponent(
                      `السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب ${s.name}.\nنفيدكم بأن حالة ابنكم اليوم في (${ring.name}) هي: ${att.status}.\nحلقات جامع ابن باز 🌸`
                    );
                    const waPhone = formatWhatsAppPhone(s.parentPhone);
                    const hasPhone = hasValidGuardianPhone(s.parentPhone) && Boolean(waPhone);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{s.serial || idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{s.name}</span>
                            {!hasPhone && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>لا يوجد رقم</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{ring.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{s.stage}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700" dir="ltr">
                          {hasPhone ? (
                            s.parentPhone
                          ) : (
                            <span className="text-rose-700 font-bold text-[10px]">لا يوجد رقم</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${badgeColor}`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {hasPhone ? (
                            <a
                              href={`https://wa.me/${waPhone}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>مراسلة واتساب</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>لا يوجد رقم</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
