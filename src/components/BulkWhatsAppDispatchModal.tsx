import React, { useState, useMemo } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  X,
  Send,
  Share2,
  Users,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Phone,
  BookOpen,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Edit3,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';

export interface AbsentItem {
  id: string;
  targetId: string; // studentId or teacherId
  type: 'student' | 'teacher' | 'supervisor';
  name: string;
  roleOrHalaqah: string;
  guardianName?: string;
  phone: string | null;
  rawPhone: string;
  hasPhone: boolean;
  status: 'absent';
  notes?: string;
  message: string;
  isNotified: boolean;
  notifiedAt?: string;
}

interface BulkWhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkWhatsAppDispatchModal: React.FC<BulkWhatsAppDispatchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    students,
    halaqat,
    teachers,
    attendance,
    teacherAttendance,
    selectedDate,
    formattedSelectedDateArabic,
    openDirectWhatsApp,
    setStudentAttendance,
    setTeacherAttendance,
    showGlobalNotification,
  } = useHalaqat();

  const [filterType, setFilterType] = useState<'all' | 'students' | 'teachers'>('all');
  const [activeRecipientIndex, setActiveRecipientIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Default customizable templates
  const [studentTemplate, setStudentTemplate] = useState<string>(
    `السلام عليكم ورحمة الله وبركاته،\n` +
    `المكرم ولي أمر الطالب/ {name} حفظكم الله،\n\n` +
    `نود إفادتكم من إدارة حلقات جامع الإمام ابن باز بتسجيل غياب ابنكم عن {halaqah} لهذا اليوم {date}.\n\n` +
    `نرجو منكم دوام حثه ومتابعته والحرص على انتظامه في حلقة القرآن الكريم.\n` +
    `شاكرين ومقدرين حسن تعاونكم وحرصكم المبارك.\n\n` +
    `_إدارة حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم_`
  );

  const [teacherTemplate, setTeacherTemplate] = useState<string>(
    `السلام عليكم ورحمة الله وبركاته،\n` +
    `فضيلة الشيخ المكرم/ {name} حفظكم الله ورعاكم،\n\n` +
    `نود إفادتكم من إدارة حلقات جامع الإمام ابن باز بأنه تم تسجيل حالة غياب لكم في كشف حضور المشايخ والمشرفين لهذا اليوم {date}.\n\n` +
    `نرجو التكرم بإفادة الإدارة بالعذر المعتمد أو ترتيب من ينوب عنكم في تدريس ومتابعة الحلقة إن لزم الأمر.\n` +
    `جزاكم الله خيراً وبارك في جهودكم المباركة.\n\n` +
    `_إدارة حلقات جامع الإمام ابن باز_`
  );

  // Compile list of absent students and absent teachers/supervisors for the selected date
  const absentList = useMemo<AbsentItem[]>(() => {
    const list: AbsentItem[] = [];

    // 1. Absent students
    const absentStudentRecords = attendance.filter(
      (a) => a.date === selectedDate && a.status === 'absent'
    );
    absentStudentRecords.forEach((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      if (student) {
        const halaqah = halaqat.find((h) => h.id === student.halaqahId);
        const halaqahName = halaqah ? halaqah.name : 'حلقة القرآن';
        const rawPhone = student.guardianPhone || '';
        const cleanPhone = formatWhatsAppPhone(rawPhone);
        const hasPhone = Boolean(cleanPhone && hasValidGuardianPhone(rawPhone));
        const message = studentTemplate
          .replace(/\{name\}/g, student.fullName)
          .replace(/\{halaqah\}/g, halaqahName)
          .replace(/\{date\}/g, formattedSelectedDateArabic);

        list.push({
          id: `stu_${student.id}`,
          targetId: student.id,
          type: 'student',
          name: student.fullName,
          roleOrHalaqah: halaqahName,
          guardianName: student.guardianName,
          phone: cleanPhone,
          rawPhone: hasPhone ? rawPhone : 'لا يوجد رقم',
          hasPhone,
          status: 'absent',
          notes: rec.notes || 'غياب مرصود لهذا اليوم',
          message,
          isNotified: Boolean(rec.parentNotified),
          notifiedAt: rec.parentNotifiedAt,
        });
      }
    });

    // 2. Absent teachers & supervisors
    const absentTeacherRecords = teacherAttendance.filter(
      (t) => t.date === selectedDate && t.status === 'absent'
    );
    absentTeacherRecords.forEach((rec) => {
      const teacher = teachers.find((t) => t.id === rec.teacherId);
      if (teacher) {
        const roleLabel = teacher.role === 'supervisor' ? 'مشرف تعليمي' : 'معلم حلقة';
        const rawPhone = teacher.phoneNumber || '';
        const cleanPhone = formatWhatsAppPhone(rawPhone);
        const hasPhone = Boolean(cleanPhone && hasValidGuardianPhone(rawPhone));
        const message = teacherTemplate
          .replace(/\{name\}/g, teacher.fullName)
          .replace(/\{date\}/g, formattedSelectedDateArabic);

        list.push({
          id: `teach_${teacher.id}`,
          targetId: teacher.id,
          type: teacher.role === 'supervisor' ? 'supervisor' : 'teacher',
          name: teacher.fullName,
          roleOrHalaqah: roleLabel,
          phone: cleanPhone,
          rawPhone: hasPhone ? rawPhone : 'لا يوجد رقم',
          hasPhone,
          status: 'absent',
          notes: rec.notes || 'غياب مرصود بكشف المشايخ',
          message,
          isNotified: false,
        });
      }
    });

    return list;
  }, [
    attendance,
    teacherAttendance,
    students,
    teachers,
    halaqat,
    selectedDate,
    formattedSelectedDateArabic,
    studentTemplate,
    teacherTemplate,
  ]);

  if (!isOpen) return null;

  const filteredList = absentList.filter((item) => {
    if (filterType === 'students') return item.type === 'student';
    if (filterType === 'teachers') return item.type === 'teacher' || item.type === 'supervisor';
    return true;
  });

  const studentsCount = absentList.filter((i) => i.type === 'student').length;
  const teachersCount = absentList.filter((i) => i.type === 'teacher' || i.type === 'supervisor').length;

  const markItemAsNotified = (item: AbsentItem) => {
    if (item.type === 'student') {
      const rec = attendance.find((a) => a.studentId === item.targetId && a.date === selectedDate);
      if (rec) {
        setStudentAttendance(item.targetId, 'absent', rec.notes);
      }
    } else {
      setTeacherAttendance(item.targetId, 'absent', undefined, 0, item.notes);
    }
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showGlobalNotification('تم نسخ نص الرسالة للحافظة بنجاح 📋', 'success');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopyAllSummary = () => {
    let summary = `📋 *بيان إشعارات الغائبين (جامع الإمام ابن باز)*\n`;
    summary += `📅 التاريخ: ${formattedSelectedDateArabic} (${selectedDate})\n`;
    summary += `═════════════════════════════════\n\n`;

    if (studentsCount > 0) {
      summary += `👥 *أولياء أمور الطلاب الغائبين (${studentsCount}):*\n`;
      absentList
        .filter((i) => i.type === 'student')
        .forEach((s, idx) => {
          summary += `${idx + 1}. الطالب: ${s.name} (${s.roleOrHalaqah}) - الجوال: ${s.rawPhone}\n`;
        });
      summary += `\n`;
    }

    if (teachersCount > 0) {
      summary += `🕌 *المعلمون والمشرفون الغائبون (${teachersCount}):*\n`;
      absentList
        .filter((i) => i.type !== 'student')
        .forEach((t, idx) => {
          summary += `${idx + 1}. ${t.name} (${t.roleOrHalaqah}) - الجوال: ${t.rawPhone}\n`;
        });
      summary += `\n`;
    }

    summary += `═════════════════════════════════\n`;
    summary += `📌 صادر عن إدارة حلقات جامع ابن باز لتحفيظ القرآن الكريم`;

    navigator.clipboard.writeText(summary);
    setCopiedAll(true);
    showGlobalNotification('تم نسخ كشف الغياب المجمع بالكامل بنجاح 📋', 'success');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const dispatchableList = filteredList.filter((item) => item.hasPhone && item.phone);

  // Launch sequential dispatch (steps through items that have a phone number)
  const handleLaunchSequential = () => {
    if (dispatchableList.length === 0) {
      showGlobalNotification('لا توجد أرقام تواصل مسجلة للغائبين المحددين (لا يوجد رقم).', 'error');
      return;
    }
    const safeIndex = Math.min(activeRecipientIndex, dispatchableList.length - 1);
    const currentItem = dispatchableList[safeIndex];

    openDirectWhatsApp(currentItem.phone || currentItem.rawPhone, currentItem.message);
    markItemAsNotified(currentItem);
    showGlobalNotification(`تم إرسال التنبيه لـ ${currentItem.name} (${safeIndex + 1}/${dispatchableList.length}) 📲`, 'success');

    // Move to next if available
    if (safeIndex < dispatchableList.length - 1) {
      setActiveRecipientIndex(safeIndex + 1);
    } else {
      showGlobalNotification('أحسنت! تم إكمال إرسال التنبيهات لجميع الغائبين المتوفر لهم أرقام تواصل 🏁', 'success');
    }
  };

  // Open all WhatsApp links (only items with valid phone)
  const handleOpenAllTabs = () => {
    if (dispatchableList.length === 0) {
      showGlobalNotification('لا توجد أرقام تواصل مسجلة للغائبين المحددين (لا يوجد رقم).', 'error');
      return;
    }

    dispatchableList.forEach((item, index) => {
      setTimeout(() => {
        openDirectWhatsApp(item.phone || item.rawPhone, item.message);
        markItemAsNotified(item);
      }, index * 400);
    });

    showGlobalNotification(`جاري فتح محادثات واتساب لـ (${dispatchableList.length}) مستلمين تباعاً 🚀`, 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Send className="w-5 h-5 text-emerald-300 -rotate-45" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>الإرسال الجماعي الفوري عبر الواتساب (للغائبين)</span>
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {absentList.length} غائب
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-emerald-200">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{formattedSelectedDateArabic}</span>
                </span>
                <span>•</span>
                <span>حلقات جامع الإمام ابن باز</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats & Filter Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              type="button"
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>الكل ({absentList.length})</span>
            </button>

            <button
              onClick={() => setFilterType('students')}
              type="button"
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'students'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>الطلاب ({studentsCount})</span>
            </button>

            <button
              onClick={() => setFilterType('teachers')}
              type="button"
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'teachers'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المعلمون والمشرفون ({teachersCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              type="button"
              className="text-[11px] font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isCustomizing ? 'إخفاء تخصيص الرسائل' : 'تخصيص نص الرسائل'}</span>
            </button>

            <button
              onClick={handleCopyAllSummary}
              type="button"
              className="text-[11px] font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'تم النسخ ✓' : 'نسخ كشف الغياب 📋'}</span>
            </button>
          </div>
        </div>

        {/* Optional Message Templates Customizer */}
        {isCustomizing && (
          <div className="bg-amber-50/60 border-b border-amber-200 p-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>تخصيص الصياغة التلقائية للرسائل (تُطبّق على جميع الغائبين فورياً):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  صيغة رسالة ولي أمر الطالب:
                </label>
                <textarea
                  value={studentTemplate}
                  onChange={(e) => setStudentTemplate(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  صيغة رسالة المعلم / المشرف:
                </label>
                <textarea
                  value={teacherTemplate}
                  onChange={(e) => setTeacherTemplate(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State or Main List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
          {filteredList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                ما شاء الله! لا توجد حالات غياب مسجلة لتاريخ اليوم
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جميع الطلاب والمعلمين مسجلون بحالة حضور أو لم يتم رصد أي غياب بعد لتاريخ ({formattedSelectedDateArabic}).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Sequential Dispatch Helper Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>جاهزية الإرسال الجماعي ({dispatchableList.length} متاح للإرسال من أصل {filteredList.length})</span>
                  </div>
                  <div className="text-[11px] text-emerald-200 mt-0.5">
                    يمكنك بدء الإرسال المتتابع خطوة بخطوة، أو فتح كافة الروابط للطلاب المتوفر لهم أرقام تواصل.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLaunchSequential}
                    type="button"
                    disabled={dispatchableList.length === 0}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    title="إرسال للشخص التالي في القائمة"
                  >
                    <Send className="w-3.5 h-3.5 -rotate-45" />
                    <span>
                      إرسال التالي ({Math.min(activeRecipientIndex + 1, Math.max(1, dispatchableList.length))}/{dispatchableList.length})
                    </span>
                  </button>

                  <button
                    onClick={handleOpenAllTabs}
                    type="button"
                    disabled={dispatchableList.length === 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    title="فتح محادثات واتساب لجميع الغائبين"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح الكل في الواتساب 🚀</span>
                  </button>
                </div>
              </div>

              {/* Cards for each absent person */}
              {filteredList.map((item, index) => {
                const whatsappUrl = item.phone ? `https://api.whatsapp.com/send?phone=${item.phone}&text=${encodeURIComponent(item.message)}` : '';
                const isCurrentActive = index === activeRecipientIndex;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border transition-all p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isCurrentActive
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.type === 'student'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          {item.type === 'student' ? 'طالب 👤' : item.type === 'supervisor' ? 'مشرف 📋' : 'معلم 🕌'}
                        </span>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.name}
                        </h4>

                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.roleOrHalaqah}
                        </span>

                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          <span>غائب</span>
                        </span>

                        {item.isNotified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>تم الإشعار مسبقاً</span>
                          </span>
                        )}
                      </div>

                      {/* Recipient Details & Phone */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        {item.guardianName && (
                          <span className="text-[11px]">
                            <strong className="text-slate-800">ولي الأمر:</strong> {item.guardianName}
                          </span>
                        )}
                        {item.hasPhone ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded" dir="ltr">
                            <Phone className="w-3 h-3 text-emerald-700" />
                            <span>{item.rawPhone}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>لا يوجد رقم</span>
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[11px] text-slate-500 italic">
                            ({item.notes})
                          </span>
                        )}
                      </div>

                      {/* Preview of text snippet */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-700 font-sans line-clamp-2">
                        {item.message}
                      </div>
                    </div>

                    {/* Direct Action Link & Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleCopySingle(item.message, index)}
                        type="button"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="نسخ نص الرسالة"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {item.hasPhone && item.phone ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            markItemAsNotified(item);
                            setActiveRecipientIndex(index + 1);
                            showGlobalNotification(`تم فتح محادثة واتساب لـ ${item.name} 📲`, 'success');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>إرسال واتساب الآن 📲</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showGlobalNotification(`الطالب "${item.name}" ليس لديه رقم تواصل مسجل — يمكنك إضافته من التحضير الذكي أو سجل الطلاب.`, 'error')}
                          className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
                          title="لا يوجد رقم تواصل مسجل"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>لا يوجد رقم</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span className="font-bold text-slate-700">المجموع الكلي للغائبين:</span>
            <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-900">
              {absentList.length} (طلاب: {studentsCount} • معلمون: {teachersCount})
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            {dispatchableList.length > 0 && (
              <button
                onClick={handleOpenAllTabs}
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>إرسال للجميع الآن ({dispatchableList.length}) 🚀</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
