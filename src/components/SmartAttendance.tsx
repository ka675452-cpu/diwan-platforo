import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { AttendanceStatus, Student } from '../types';
import {
  Check,
  X,
  Clock,
  HelpCircle,
  Share2,
  BellRing,
  Send,
  ExternalLink,
  Filter,
  CheckCircle2,
  Calendar,
  UserPlus,
  Trash2,
  Camera,
  Users,
  BookOpen,
  Shirt,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Edit2,
  Phone,
} from 'lucide-react';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';

export const SmartAttendance: React.FC = () => {
  const {
    stages,
    halaqat,
    students,
    attendance,
    selectedDate,
    setSelectedDate,
    formattedSelectedDateArabic,
    resetToToday,
    setStudentAttendance,
    openDirectWhatsApp,
    bulkMarkHalaqah,
    toggleStudentRecitation,
    toggleStudentUniform,
    getStagePartitionedBroadcast,
    sendSingleParentAlert,
    requestSendConsolidatedReport,
    updateStudent,
    deleteStudent,
    showGlobalNotification,
    openDispatchPreview,
    openBulkWhatsAppModal,
    todayAbsentsCount,
    latenessToleranceMinutes,
    setLatenessToleranceMinutes,
    getRingPreparationStatus,
  } = useHalaqat();

  const [selectedStageId, setSelectedStageId] = useState<string>('all');
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<string>(halaqat[0]?.id || 'hal_early');
  const [quickNumbersInput, setQuickNumbersInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [editingPhoneStudentId, setEditingPhoneStudentId] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string>('');

  // Filter halaqat by stage
  const filteredHalaqat =
    selectedStageId === 'all'
      ? halaqat
      : halaqat.filter((h) => h.stageId === selectedStageId);

  // Ensure selected halaqah is in filtered list
  const currentHalaqah =
    filteredHalaqat.find((h) => h.id === selectedHalaqahId) || filteredHalaqat[0] || halaqat[0];

  // Active students in current halaqah sorted by serial number
  const currentStudents = students
    .filter((s) => s.halaqahId === currentHalaqah?.id && s.status === 'active')
    .sort((a, b) => a.halaqahSerial - b.halaqahSerial);

  const getStudentRecord = (studentId: string) => {
    return attendance.find((a) => a.studentId === studentId && a.date === selectedDate);
  };

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const rec = getStudentRecord(studentId);
    return rec ? rec.status : 'present';
  };

  const isStudentRecited = (studentId: string): boolean => {
    const rec = getStudentRecord(studentId);
    if (!rec) return true;
    if (rec.status === 'absent' || rec.status === 'excused') return false;
    return rec.recited !== undefined ? rec.recited : true;
  };

  const isUniformCompliant = (studentId: string): boolean => {
    const rec = getStudentRecord(studentId);
    if (!rec) return true;
    return rec.uniformCompliant !== false;
  };

  const isParentNotified = (studentId: string): boolean => {
    const rec = getStudentRecord(studentId);
    return Boolean(rec?.parentNotified);
  };

  // Helper to format clean Saudi phone number for direct WhatsApp links
  const getCleanPhone = (phone?: string) => {
    return formatWhatsAppPhone(phone);
  };

  const buildStudentWhatsAppMessage = (
    student: Student,
    reason: 'absent' | 'late' | 'excused' | 'not_recited' | 'uniform' | 'present_praise'
  ): string => {
    let reasonText = '';
    if (reason === 'absent') {
      reasonText = `تسجيل غياب ابنكم عن جلسة اليوم`;
    } else if (reason === 'late') {
      const rec = getStudentRecord(student.id);
      reasonText = `تسجيل تأخر ابنكم بمقدار (${rec?.latenessMinutes || 15} دقيقة) عن موعد بداية الحلقة لهذا اليوم`;
    } else if (reason === 'excused') {
      reasonText = `تسجيل عذر وتغيب مأذون لابنكم عن جلسة اليوم`;
    } else if (reason === 'not_recited') {
      reasonText = `ملاحظة أن ابنكم لم يتمكن من تسميع ورده القرآني المقرر اليوم`;
    } else if (reason === 'uniform') {
      reasonText = `التنبيه الكريم بشأن عدم الالتزام بالزي الرسمي للحلقة لهذا اليوم`;
    } else {
      reasonText = `يسرنا إشعاركم بحضور ابنكم وتميزه في تسميع ورده القرآني وإتقانه للحفظ اليوم بارك الله فيه`;
    }

    return (
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `المكرم ولي أمر الطالب/ *${student.fullName}* حفظكم الله،\n\n` +
      `نود إفادتكم بـ: ${reasonText} في (*${currentHalaqah.name}*) بتاريخ (${formattedSelectedDateArabic}).\n\n` +
      `نرجو منكم دوام المتابعة والتشجيع وحثّه على الانضباط والحرص على كتاب الله المبارك.\n` +
      `شاكرين ومقدرين حسن تعاونكم وحرصكم.\n\n` +
      `_إدارة حلقات جامع الإمام ابن باز_`
    );
  };

  const getDirectWhatsAppUrl = (
    student: Student,
    reason: 'absent' | 'late' | 'excused' | 'not_recited' | 'uniform' | 'present_praise'
  ): string | null => {
    const cleanPhone = getCleanPhone(student.guardianPhone);
    if (!cleanPhone) return null;
    const message = buildStudentWhatsAppMessage(student, reason);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  const triggerDirectWhatsApp = async (
    student: Student,
    reason: 'absent' | 'late' | 'excused' | 'not_recited' | 'uniform' | 'present_praise'
  ) => {
    if (!hasValidGuardianPhone(student.guardianPhone)) {
      setEditingPhoneStudentId(student.id);
      setPhoneDraft('');
      showGlobalNotification(`لا يوجد رقم تواصل مسجل للطالب "${student.fullName}" — يرجى إضافته يدوياً الآن`, 'error');
      return;
    }
    const message = buildStudentWhatsAppMessage(student, reason);
    await sendSingleParentAlert(student.id, message);
    showGlobalNotification(`تم فتح محادثة واتساب لولي أمر الطالب "${student.fullName}" بنجاح 📲`, 'success');
  };

  const handleSaveStudentPhone = (student: Student) => {
    const cleaned = phoneDraft.trim();
    updateStudent({
      ...student,
      guardianPhone: cleaned,
    });
    setEditingPhoneStudentId(null);
    setPhoneDraft('');
    showGlobalNotification(
      cleaned
        ? `تم حفظ رقم ولي أمر الطالب "${student.fullName}" (${cleaned}) بنجاح ✓`
        : `تم تحديث حالة رقم الطالب "${student.fullName}"`,
      'success'
    );
  };

  // Stage partitioned broadcast preview and confirmation
  const handleStageBroadcast = (stageType: 'elementary' | 'middle' | 'high' | 'all') => {
    const fullBroadcastText = getStagePartitionedBroadcast(selectedDate);
    let title = 'بث البيان المجمع لكافة المراحل التعليمية';
    if (stageType === 'elementary') title = 'بث كشف المرحلة الابتدائية للمجموعة';
    if (stageType === 'middle') title = 'بث كشف المرحلة المتوسطة للمجموعة';
    if (stageType === 'high') title = 'بث كشف المرحلة الثانوية للمجموعة';

    openDispatchPreview({
      title,
      recipientLabel: 'مجموعة وقناة حلقات ابن باز الرسمية (@DiwanSys_bot)',
      recipientType: 'group',
      messageText: fullBroadcastText,
      onConfirm: async () => {
        showGlobalNotification(`تم بث تقرير ${title} بنجاح إلى القروب العام 🚀`, 'success');
      },
    });
  };

  // Quick absence parser from serial numbers input (e.g. "2, 5, 7" or "2 و 7")
  const handleQuickAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNumbersInput.trim()) return;

    const cleanStr = quickNumbersInput.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const matchedNumbers = cleanStr.match(/\b([1-9]|[12][0-9]|30)\b/g);

    if (!matchedNumbers || matchedNumbers.length === 0) {
      setFeedbackMessage('لم يتم التعرف على أرقام تسلسلية صحيحة');
      return;
    }

    const absentSerials = matchedNumbers.map((n) => parseInt(n, 10));
    let markedCount = 0;

    currentStudents.forEach((stu) => {
      if (absentSerials.includes(stu.halaqahSerial)) {
        setStudentAttendance(stu.id, 'absent', 'رصد عبر الأرقام السريعة');
        markedCount++;
      }
    });

    setFeedbackMessage(`تم رصد غياب ${markedCount} طلاب بالأرقام: [${absentSerials.join('، ')}]`);
    setQuickNumbersInput('');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Stats in current active halaqah
  const absentInCurrent = currentStudents.filter((s) => getStudentStatus(s.id) === 'absent');
  const lateInCurrent = currentStudents.filter((s) => getStudentStatus(s.id) === 'late');
  const presentInCurrent = currentStudents.filter((s) => getStudentStatus(s.id) === 'present');
  const excusedInCurrent = currentStudents.filter((s) => getStudentStatus(s.id) === 'excused');
  const attendedInCurrent = [...presentInCurrent, ...lateInCurrent];
  const recitedInCurrent = attendedInCurrent.filter((s) => isStudentRecited(s.id));
  const notRecitedInCurrent = attendedInCurrent.filter((s) => !isStudentRecited(s.id));
  const nonUniformInCurrent = currentStudents.filter((s) => !isUniformCompliant(s.id));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" />
              <span>التحضير الذكي للطلاب والمتابعة التفصيلية</span>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-bold">
                {formattedSelectedDateArabic}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة الحضور، التسميع، والالتزام بالزي الرسمي لكل طالب، مع روابط واتساب مباشرة لولي الأمر بأرقام التواصل الحقيقية المعتمدة.
            </p>
          </div>

          {/* Quick Date Travel & Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 font-mono focus:outline-none cursor-pointer"
              />
              <button
                onClick={resetToToday}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded"
              >
                اليوم
              </button>
            </div>

            {/* Lateness Tolerance Setting (إعدادات فترة السماح واحتساب التأخير) */}
            <div
              className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 px-2.5 py-1 rounded-lg text-xs"
              title="تحديد وتعديل فترة التسامح واحتساب التأخير للطلاب والمعلمين"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px] font-bold text-amber-900 hidden sm:inline">فترة احتساب التأخير:</span>
              <select
                value={latenessToleranceMinutes}
                onChange={(e) => setLatenessToleranceMinutes(Number(e.target.value))}
                className="bg-transparent font-bold text-amber-950 font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value={10}>10 د (مشدد)</option>
                <option value={15}>15 د (معتمد)</option>
                <option value={20}>20 د (متوسط)</option>
                <option value={30}>30 د (مرن)</option>
              </select>
            </div>

            <button
              onClick={() => {
                bulkMarkHalaqah(currentHalaqah.id, 'present');
                showGlobalNotification(`تم تحضير جميع طلاب "${currentHalaqah.name}" كـ حاضر بنجاح ✓`, 'success');
              }}
              className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>الكل حاضر ✓</span>
            </button>

            <button
              onClick={openBulkWhatsAppModal}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-emerald-400/30"
              title="الإرسال الجماعي الفوري لكافة الغائبين من الطلاب والمعلمين دفعة واحدة عبر الواتساب"
            >
              <Send className="w-3.5 h-3.5 text-emerald-100 -rotate-45" />
              <span>إرسال للجميع (واتساب الغائبين) 🚀</span>
              {todayAbsentsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {todayAbsentsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Stage-Partitioned Telegram / WhatsApp Group Broadcast Buttons */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                بث بيانات الحضور والغياب للقروبات العامة حسب المرحلة التعليمية:
              </span>
              <span className="text-[11px] text-slate-500">
                إرسال كشوف الغياب والتأخر بضغطة زر مقسمة بالأسماء والتواريخ
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStageBroadcast('elementary')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>🟢 المرحلة الابتدائية</span>
            </button>
            <button
              onClick={() => handleStageBroadcast('middle')}
              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>🔵 المرحلة المتوسطة</span>
            </button>
            <button
              onClick={() => handleStageBroadcast('high')}
              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>🟣 المرحلة الثانوية</span>
            </button>
            <button
              onClick={() => handleStageBroadcast('all')}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>📋 البيان الشامل لكافة المراحل</span>
            </button>
          </div>
        </div>

        {/* 6 Rings Navigation Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            اختر الحلقة لاستعراض طلابها والتحضير الفوري:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {halaqat.map((h, idx) => {
              const isSelected = h.id === currentHalaqah?.id;
              const hStudents = students.filter((s) => s.halaqahId === h.id && s.status === 'active');
              const hAtt = attendance.filter((a) => a.halaqahId === h.id && a.date === selectedDate);
              const hAbsent = hStudents.filter((s) => hAtt.find((a) => a.studentId === s.id)?.status === 'absent').length;

              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHalaqahId(h.id)}
                  className={`text-right p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      حلقة {idx + 1}
                    </span>
                    {hAbsent > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {hAbsent} غياب
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold mt-1.5 line-clamp-1">{h.name}</h4>
                  <div className={`text-[10px] mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    المعلم: {h.teacherName}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {hStudents.length} طلاب مسجلين
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ring Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{currentHalaqah.name}</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
              {currentHalaqah.timeSlotLabel}
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>المعلم المسؤول: <strong className="text-slate-800">{currentHalaqah.teacherName}</strong></span>
            <span>•</span>
            <span>الموقع: <strong className="text-slate-800">{currentHalaqah.location}</strong></span>
          </div>
        </div>

        {/* Ring Live Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div
            className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-center"
            title={`بالموعد: ${presentInCurrent.length} + متأخر: ${lateInCurrent.length}`}
          >
            <span className="text-[10px] text-emerald-700 block font-semibold">إجمالي الحضور</span>
            <span className="font-bold text-emerald-900">{attendedInCurrent.length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[10px] text-amber-700 block font-semibold">تأخير</span>
            <span className="font-bold text-amber-900">{lateInCurrent.length}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[10px] text-rose-700 block font-semibold">غياب</span>
            <span className="font-bold text-rose-900">{absentInCurrent.length}</span>
          </div>
          {excusedInCurrent.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1 text-center">
              <span className="text-[10px] text-purple-700 block font-semibold">عذر</span>
              <span className="font-bold text-purple-900">{excusedInCurrent.length}</span>
            </div>
          )}
          <div className="bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[10px] text-sky-700 block font-semibold">سمّع ورد</span>
            <span className="font-bold text-sky-900">
              {recitedInCurrent.length}/{attendedInCurrent.length}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center">
            <span className="text-[10px] text-slate-600 block font-semibold">مخالف للزي</span>
            <span className="font-bold text-slate-900">{nonUniformInCurrent.length}</span>
          </div>
        </div>
      </div>

      {/* Ring Preparation Status Documentation (توثيق حالة تحضير الحلقة اليوم) */}
      {(() => {
        const prepStatus = getRingPreparationStatus(currentHalaqah.id);
        const isPrepared = prepStatus && prepStatus.status === 'completed';
        return (
          <div
            className={`rounded-xl p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isPrepared
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isPrepared ? (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  ✓
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  ⏳
                </div>
              )}
              <div>
                <div className="font-bold text-sm">
                  {isPrepared
                    ? `🟢 تم تحضير الحلقة اليوم بواسطة ${prepStatus.teacherName}`
                    : `⏳ بانتظار تحضير الشيخ اليوم (${currentHalaqah.teacherName})`}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {isPrepared
                    ? `توثيق رسمي الساعة ${prepStatus.preparedAt} • الحضور: ${prepStatus.presentCount} طلاب • الغياب: ${prepStatus.absentCount} طلاب`
                    : 'يمكن للشيخ إرسال أرقام الحاضرين عبر بوت التيليجرام (@DiwanSys_bot) أو الضغط على (الكل حاضر ✓) أعلاه'}
                </div>
              </div>
            </div>
            {isPrepared && (
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2.5 py-1 rounded-full self-start sm:self-center border border-emerald-300 shrink-0">
                سجل محفوظ ومؤرشف في قاعدة البيانات
              </span>
            )}
          </div>
        );
      })()}

      {/* Quick Serial Input Bar */}
      <form onSubmit={handleQuickAbsenceSubmit} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700 shrink-0">
          ⚡ تحضير سريع بالأرقام التسلسلية:
        </span>
        <input
          type="text"
          value={quickNumbersInput}
          onChange={(e) => setQuickNumbersInput(e.target.value)}
          placeholder="اكتب أرقام الغائبين مفصولة بفاصلة أو واو (مثال: 2، 4)"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          رصد الغياب
        </button>
      </form>

      {/* Student Cards Grid (All 5 students per ring visible at once) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentStudents.map((student) => {
          const status = getStudentStatus(student.id);
          const recited = isStudentRecited(student.id);
          const uniform = isUniformCompliant(student.id);
          const notified = isParentNotified(student.id);

          return (
            <div
              key={student.id}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-xs space-y-3 ${
                status === 'absent'
                  ? 'border-rose-300 bg-rose-50/20'
                  : status === 'late'
                  ? 'border-amber-300 bg-amber-50/20'
                  : status === 'excused'
                  ? 'border-purple-300 bg-purple-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header: Serial Number, Name, Current Juz */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow-2xs ${
                      status === 'absent'
                        ? 'bg-rose-700 text-white'
                        : status === 'late'
                        ? 'bg-amber-600 text-white'
                        : status === 'excused'
                        ? 'bg-purple-700 text-white'
                        : 'bg-emerald-800 text-white'
                    }`}
                    title={`الرقم التسلسلي في الحلقة: ${student.halaqahSerial}`}
                  >
                    {student.halaqahSerial.toString().padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{student.fullName}</h3>
                      {!hasValidGuardianPhone(student.guardianPhone) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>لا يوجد رقم</span>
                        </span>
                      )}
                      {(student.isNewStudent || student.addedVia === 'telegram_bot') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
                          ✨ طالب جديد مضاف في هذه الحلقة
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>الجزء: <strong className="text-slate-800 font-mono">{student.currentJuz}</strong></span>
                      <span>•</span>
                      <span>المرحلة: <strong className="text-slate-700">{student.stageId === 'primary_early' || student.stageId === 'primary_upper' ? 'ابتدائي' : (student.stageId === 'intermediate' ? 'متوسط' : 'ثانوي')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                      status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {status === 'present' ? 'حاضر' : (status === 'absent' ? 'غائب' : (status === 'late' ? 'متأخر' : 'عذر'))}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الطالب "${student.fullName}"؟`)) {
                        deleteStudent(student.id);
                        showGlobalNotification(`تم حذف الطالب "${student.fullName}" بنجاح`, 'info');
                      }
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="حذف الطالب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setStudentAttendance(student.id, 'present')}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    status === 'present'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  حاضر 🟢
                </button>
                <button
                  onClick={() => setStudentAttendance(student.id, 'absent')}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    status === 'absent'
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  غائب 🔴
                </button>
                <button
                  onClick={() => setStudentAttendance(student.id, 'late')}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    status === 'late'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  متأخر ⏳
                </button>
                <button
                  onClick={() => setStudentAttendance(student.id, 'excused')}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    status === 'excused'
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  عذر 🟡
                </button>
              </div>

              {/* Trackers Row: Recitation + Uniform Compliance */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                {/* 1. Recitation toggle */}
                <button
                  onClick={() => toggleStudentRecitation(student.id)}
                  disabled={status === 'absent' || status === 'excused'}
                  className={`px-2 py-1.5 rounded-lg font-bold text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs ${
                    status === 'absent' || status === 'excused'
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : recited
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  }`}
                  title={
                    status === 'absent' || status === 'excused'
                      ? 'لا يمكن احتساب التسميع لطالب غائب أو مستأذن'
                      : 'التبديل بين سمّع ورد اليوم / لم يُسمّع'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {status === 'absent' || status === 'excused'
                      ? 'غير حاضر —'
                      : recited
                      ? 'سمّع ورد اليوم ✓'
                      : 'لم يُسمّع ⏳'}
                  </span>
                </button>

                {/* 2. Uniform compliance toggle */}
                <button
                  onClick={() => toggleStudentUniform(student.id)}
                  className={`px-2 py-1.5 rounded-lg font-bold text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs ${
                    uniform
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                  }`}
                  title="التبديل بين ملتزم بالزي الرسمي للحلقة / غير ملتزم"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>{uniform ? 'ملتزم بالزي 👔' : 'مخالف للزي ⚠️'}</span>
                </button>
              </div>

              {/* Immediate WhatsApp Links Bar & Inline Phone Editor */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2 text-[11px]">
                {editingPhoneStudentId === student.id ? (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="05xxxxxxxx"
                      value={phoneDraft}
                      onChange={(e) => setPhoneDraft(e.target.value)}
                      className="flex-1 text-xs font-mono bg-white border border-amber-300 rounded px-2 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveStudentPhone(student)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] cursor-pointer"
                    >
                      حفظ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPhoneStudentId(null)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[11px] cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                      <span>ولي الأمر:</span>
                      {hasValidGuardianPhone(student.guardianPhone) ? (
                        <span className="text-slate-800 font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded" dir="ltr">
                          {student.guardianPhone}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-sans">
                          <AlertTriangle className="w-3 h-3" />
                          <span>لا يوجد رقم</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhoneStudentId(student.id);
                          setPhoneDraft(student.guardianPhone || '');
                        }}
                        className="inline-flex items-center gap-0.5 text-[10px] font-sans font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer"
                        title={hasValidGuardianPhone(student.guardianPhone) ? 'تعديل رقم ولي الأمر' : 'إضافة رقم ولي الأمر يدوياً'}
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>{hasValidGuardianPhone(student.guardianPhone) ? 'تعديل' : 'إضافة رقم'}</span>
                      </button>
                      {isParentNotified(student.id) && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2 rounded-full font-sans">
                          تم الإشعار ✓
                        </span>
                      )}
                    </div>

                    {/* Direct WhatsApp Trigger Buttons depending on student condition */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!hasValidGuardianPhone(student.guardianPhone) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPhoneStudentId(student.id);
                            setPhoneDraft('');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer text-[11px] transition-all"
                          title="لا يوجد رقم تواصل مسجل — اضغط لإضافة الرقم يدوياً"
                        >
                          <Phone className="w-3 h-3" />
                          <span>لا يوجد رقم (أضف الآن ✏️)</span>
                        </button>
                      ) : (
                        <>
                          {status === 'absent' && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'absent') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'absent')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs transition-all"
                              title="فتح محادثة واتساب فورية لولي الأمر لإشعاره بالغياب مع رسالة مجهزة"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب غياب 📲</span>
                            </a>
                          )}

                          {status === 'late' && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'late') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'late')}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs transition-all"
                              title="فتح محادثة واتساب فورية لولي الأمر لإشعاره بالتأخر مع رسالة مجهزة"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب تأخير 📲</span>
                            </a>
                          )}

                          {status === 'excused' && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'excused') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'excused')}
                              className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs cursor-pointer text-xs transition-all"
                              title="مراسلة واتساب لولي الأمر لتأكيد تسجيل العذر"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب عذر 📲</span>
                            </a>
                          )}

                          {(status === 'present' || status === 'late') && !recited && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'not_recited') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'not_recited')}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs cursor-pointer text-[11px] transition-all"
                              title="مراسلة واتساب لولي الأمر لتنبيهه بعدم التسميع"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>تنبيه تسميع 📖</span>
                            </a>
                          )}

                          {!uniform && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'uniform') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'uniform')}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs cursor-pointer text-[11px] transition-all"
                              title="مراسلة واتساب لولي الأمر للتنبيه بالالتزام بالزي الرسمي"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>تنبيه زي 👔</span>
                            </a>
                          )}

                          {(status === 'present' || status === 'late') && recited && uniform && (
                            <a
                              href={getDirectWhatsAppUrl(student, 'present_praise') || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerDirectWhatsApp(student, 'present_praise')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs cursor-pointer text-[11px] transition-all"
                              title="مراسلة واتساب لولي الأمر للإشادة والتواصل المباشر"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>واتساب ولي الأمر 💬</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
