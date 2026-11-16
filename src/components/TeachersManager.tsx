import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { Teacher } from '../types';
import {
  GraduationCap,
  Plus,
  Phone,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ShieldCheck,
  Search,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';

export const TeachersManager: React.FC = () => {
  const {
    teachers,
    halaqat,
    students,
    teacherAttendance,
    setTeacherAttendance,
    bulkMarkTeachers,
    selectedDate,
    setSelectedDate,
    formattedSelectedDateArabic,
    resetToToday,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    openDeleteConfirm,
    showGlobalNotification,
  } = useHalaqat();

  // Active top-level mode: 'attendance' (تحضير المعلمين والمشرفين) vs 'directory' (دليل وبيانات المعلمين)
  const [activeView, setActiveView] = useState<'attendance' | 'directory'>('attendance');

  // Filter role for attendance & directory
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'supervisor'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    role: 'teacher' as Teacher['role'],
    assignedHalaqahId: halaqat[0]?.id || '',
    specialization: 'حفظ وتجويد القرآن الكريم',
    status: 'active' as Teacher['status'],
    joinedYear: 2024,
    notes: '',
  });

  // Filter teachers by search and role
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phoneNumber.includes(searchQuery) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || t.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Today's attendance records for the selectedDate
  const currentRecords = teacherAttendance.filter((r) => r.date === selectedDate);

  const getRecordForTeacher = (teacherId: string) => {
    return currentRecords.find((r) => r.teacherId === teacherId);
  };

  // Stats for the selectedDate
  const totalStaff = teachers.length;
  const presentCount = currentRecords.filter((r) => r.status === 'present').length;
  const lateCount = currentRecords.filter((r) => r.status === 'late').length;
  const excusedCount = currentRecords.filter((r) => r.status === 'excused').length;
  const absentCount = currentRecords.filter((r) => r.status === 'absent').length;
  const onTimeRate = totalStaff > 0 ? Math.round(((presentCount + lateCount) / totalStaff) * 100) : 100;

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      role: 'teacher',
      assignedHalaqahId: halaqat[0]?.id || '',
      specialization: 'حفظ وتجويد القرآن الكريم',
      status: 'active',
      joinedYear: new Date().getFullYear(),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      fullName: t.fullName,
      phoneNumber: t.phoneNumber,
      role: t.role,
      assignedHalaqahId: t.assignedHalaqahId || halaqat[0]?.id || '',
      specialization: t.specialization,
      status: t.status,
      joinedYear: t.joinedYear,
      notes: t.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedH = halaqat.find((h) => h.id === formData.assignedHalaqahId);

    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        ...formData,
        assignedHalaqahName: assignedH?.name,
      });
      showGlobalNotification(`تم تحديث بيانات المعلم/المشرف "${formData.fullName}" بنجاح ✅`, 'success');
    } else {
      addTeacher({
        ...formData,
        assignedHalaqahName: assignedH?.name,
      });
      showGlobalNotification(`تمت إضافة "${formData.fullName}" بنجاح ✅`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (t: Teacher) => {
    openDeleteConfirm(
      {
        id: t.id,
        name: t.fullName,
        type: 'teacher',
        subtext: `الصفة: ${t.role === 'supervisor' ? 'مشرف تعليمي' : 'معلم حلقة'} · ${t.assignedHalaqahName || 'غير مسند لحلقة'}`,
        details: {
          'رقم الهاتف المعتمد': t.phoneNumber,
          'الحلقة المسندة': t.assignedHalaqahName || 'غير مسند لحلقة',
          'التخصص': t.specialization,
          'سنة الانضمام': t.joinedYear,
        },
      },
      () => {
        deleteTeacher(t.id);
        showGlobalNotification(`تم حذف "${t.fullName}" بنجاح وتحديث السجلات 🗑️`, 'info');
      }
    );
  };

  // Generate direct WhatsApp link to teacher
  const getWhatsAppTeacherLink = (t: Teacher, statusText?: string) => {
    const cleanPhone = formatWhatsAppPhone(t.phoneNumber);
    if (!cleanPhone) return null;
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،\nفضيلة ${t.role === 'supervisor' ? 'المشرف' : 'المعلم'}/ ${t.fullName} حفظكم الله.\n\n` +
      `نحيطكم علماً بأنه تم تسجيل حالة حضوركم ليوم (${formattedSelectedDateArabic}) كـ: [${statusText || 'متابع'}] في نظام حلقات جامع ابن باز.\n` +
      `شاكرين ومقدرين جهودكم المباركة في تعليم القرآن الكريم.\n_إدارة حلقات جامع ابن باز_`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>تحضير وإدارة المعلمين والمشرفين</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  أرشفة تاريخية دائمة 📅
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                رصد حضور وغياب المعلمين والمشرفين (مثل الشيخ فهد بن خالد العتيبي)، وقت الحضور ودقائق التأخير مع إمكانية مراجعة أي تاريخ سابق.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'attendance'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 سجل التحضير اليومي والتاريخي
          </button>
          <button
            onClick={() => setActiveView('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'directory'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 دليل الكادر التعليمي والإشرافي ({teachers.length})
          </button>
        </div>
      </div>

      {/* Date Picker Bar & Quick Actions (Always visible in Attendance view) */}
      {activeView === 'attendance' && (
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold text-white">تاريخ التحضير المختار:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white text-slate-900 text-xs font-bold font-mono px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                />
              </div>

              <button
                onClick={resetToToday}
                className="px-3 py-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all cursor-pointer border border-white/20"
                title="الرجوع الفوري لتاريخ اليوم"
              >
                اليوم
              </button>

              <span className="text-xs font-semibold text-emerald-200">
                {formattedSelectedDateArabic}
              </span>
            </div>

            {/* Bulk Attendance Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  bulkMarkTeachers('present');
                  showGlobalNotification(`تم تحضير جميع المعلمين والمشرفين "حاضر" لتاريخ ${selectedDate} بنجاح ✅`, 'success');
                }}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تحضير الكل حاضر ✓</span>
              </button>

              <button
                onClick={() => {
                  bulkMarkTeachers('excused');
                  showGlobalNotification(`تم تعيين حالة الجميع كـ "مستأذن" لتاريخ ${selectedDate}`, 'info');
                }}
                className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                استئذان جماعي 🟡
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-center">
              <span className="text-[11px] text-emerald-200 block">إجمالي الكادر</span>
              <span className="text-lg font-black text-white">{totalStaff}</span>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-2.5 border border-emerald-400/30 text-center">
              <span className="text-[11px] text-emerald-300 block">حاضرون في الوقت</span>
              <span className="text-lg font-black text-emerald-300">{presentCount}</span>
            </div>
            <div className="bg-amber-500/20 rounded-xl p-2.5 border border-amber-400/30 text-center">
              <span className="text-[11px] text-amber-300 block">متأخرون</span>
              <span className="text-lg font-black text-amber-300">{lateCount}</span>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-2.5 border border-purple-400/30 text-center">
              <span className="text-[11px] text-purple-300 block">مستأذنون بعذر</span>
              <span className="text-lg font-black text-purple-300">{excusedCount}</span>
            </div>
            <div className="bg-rose-500/20 rounded-xl p-2.5 border border-rose-400/30 text-center">
              <span className="text-[11px] text-rose-300 block">غياب</span>
              <span className="text-lg font-black text-rose-300">{absentCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Role Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              الكل ({teachers.length})
            </button>
            <button
              onClick={() => setRoleFilter('teacher')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                roleFilter === 'teacher' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              المعلمون ({teachers.filter((t) => t.role === 'teacher').length})
            </button>
            <button
              onClick={() => setRoleFilter('supervisor')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                roleFilter === 'supervisor' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              المشرفون ({teachers.filter((t) => t.role === 'supervisor').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {activeView === 'directory' && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. ATTENDANCE VIEW: Staff Attendance Cards */}
      {activeView === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeachers.map((t) => {
            const rec = getRecordForTeacher(t.id);
            const currentStatus = rec?.status || 'present';
            const checkIn = rec?.checkInTime || (currentStatus === 'present' ? '04:10 م' : (currentStatus === 'late' ? '04:25 م' : '-'));
            const lateness = rec?.latenessMinutes ?? (currentStatus === 'late' ? 15 : 0);
            const notes = rec?.notes || (currentStatus === 'present' ? 'حضور منضبط' : (currentStatus === 'late' ? 'تأخر عن موعد الحلقة' : ''));

            return (
              <div
                key={t.id}
                className={`bg-white border rounded-2xl p-4 transition-all shadow-xs space-y-3.5 ${
                  currentStatus === 'present'
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : currentStatus === 'late'
                    ? 'border-amber-300 bg-amber-50/20'
                    : currentStatus === 'excused'
                    ? 'border-purple-200 bg-purple-50/20'
                    : 'border-rose-300 bg-rose-50/25'
                }`}
              >
                {/* Header: Teacher Name, Role Badge, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        t.role === 'supervisor'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {t.role === 'supervisor' ? '🛡️' : '📖'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        <span>{t.fullName}</span>
                        {hasValidGuardianPhone(t.phoneNumber) ? (
                          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                            {t.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            لا يوجد رقم
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {t.role === 'supervisor' ? 'مشرف تعليمي' : 'معلم حلقة'}
                        </span>
                        {t.assignedHalaqahName && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-800 font-medium">{t.assignedHalaqahName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Status Pill */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-2xs shrink-0 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentStatus === 'late'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : currentStatus === 'excused'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {currentStatus === 'present'
                      ? 'حاضر في الموعد ✓'
                      : currentStatus === 'late'
                      ? `متأخر (${lateness} د)`
                      : currentStatus === 'excused'
                      ? 'مستأذن بعذر'
                      : 'غائب ✗'}
                  </span>
                </div>

                {/* Status Toggle Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setTeacherAttendance(t.id, 'present', '04:10 م', 0, 'حضور منضبط');
                      showGlobalNotification(`تم تسجيل ${t.fullName} كـ حاضر ✓`);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentStatus === 'present'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    حاضر 🟢
                  </button>
                  <button
                    onClick={() => {
                      setTeacherAttendance(t.id, 'late', '04:25 م', 15, 'تأخر 15 دقيقة');
                      showGlobalNotification(`تم تسجيل ${t.fullName} كـ متأخر ⏳`);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    متأخر ⏳
                  </button>
                  <button
                    onClick={() => {
                      setTeacherAttendance(t.id, 'excused', undefined, 0, 'استئذان رسمي');
                      showGlobalNotification(`تم تسجيل ${t.fullName} كـ مستأذن بعذر 🟡`);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentStatus === 'excused'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    عذر 🟡
                  </button>
                  <button
                    onClick={() => {
                      setTeacherAttendance(t.id, 'absent', undefined, 0, 'غياب بدون عذر');
                      showGlobalNotification(`تم تسجيل ${t.fullName} كـ غائب 🔴`);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentStatus === 'absent'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    غائب 🔴
                  </button>
                </div>

                {/* Details Footer: Check-in Time, Lateness, WhatsApp Contact */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>وقت الحضور:</span>
                      <strong className="text-slate-800">{checkIn}</strong>
                    </span>

                    {currentStatus === 'late' && (
                      <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                        تأخير: {lateness} دقيقة
                      </span>
                    )}
                  </div>

                  {/* Direct WhatsApp link */}
                  {(() => {
                    const waLink = getWhatsAppTeacherLink(
                      t,
                      currentStatus === 'present' ? 'حاضر' : currentStatus === 'late' ? 'متأخر' : 'غائب'
                    );
                    return waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                        title={`فتح محادثة واتساب مباشرة (${t.phoneNumber})`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>مراسلة عبر واتساب</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span>لا يوجد رقم تواصل</span>
                      </span>
                    );
                  })()}
                </div>

                {notes && (
                  <div className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-slate-600 font-medium">
                    📝 ملاحظات: {notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DIRECTORY VIEW: Staff Management, Editing & Roles */}
      {activeView === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                      t.role === 'supervisor' ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {t.role === 'supervisor' ? '🛡️' : '📖'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{t.fullName}</h3>
                      {!hasValidGuardianPhone(t.phoneNumber) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          لا يوجد رقم
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${
                        t.role === 'supervisor' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.role === 'supervisor' ? 'مشرف تربوي' : 'معلم حلقة'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="تعديل البيانات"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الحلقة المسندة:</span>
                  <span className="font-semibold text-slate-800">
                    {t.assignedHalaqahName || 'إشراف عام على كافة الحلقات'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">التخصص:</span>
                  <span className="font-medium text-slate-700">{t.specialization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">رقم الجوال:</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">
                    {hasValidGuardianPhone(t.phoneNumber) ? t.phoneNumber : 'لا يوجد رقم'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingTeacher ? `تعديل بيانات: ${editingTeacher.fullName}` : 'إضافة معلم أو مشرف جديد'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: الشيخ فهد بن خالد العتيبي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصفة / الدور:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  >
                    <option value="teacher">معلم حلقة</option>
                    <option value="supervisor">مشرف تعليمي / إداري</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الجوال:</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  />
                </div>
              </div>

              {formData.role === 'teacher' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحلقة المسندة:</label>
                  <select
                    value={formData.assignedHalaqahId}
                    onChange={(e) => setFormData({ ...formData, assignedHalaqahId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  >
                    <option value="">-- بدون إسناد حالي --</option>
                    {halaqat.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص والمهام:</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="مثال: ضبط المتشابهات والتجويد العملي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold shadow-xs"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
