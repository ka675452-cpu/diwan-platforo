import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';
import {
  X,
  Activity,
  Users,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Printer,
  Download,
  MessageCircle,
  Shield,
  GraduationCap,
  Send,
  AlertCircle,
} from 'lucide-react';

export const LiveReportsModal: React.FC = () => {
  const {
    isLiveReportModalOpen,
    closeLiveReportModal,
    halaqat,
    students,
    attendance,
    teachers,
    teacherAttendance,
    setTeacherAttendance,
    bulkMarkTeachers,
    ringPreparationStatus,
    selectedDate,
    formattedSelectedDateArabic,
    openDirectWhatsApp,
    requestSendConsolidatedReport,
    handleDownloadTxtReport,
    setActiveTab,
  } = useHalaqat();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'staff'>('students');

  if (!isLiveReportModalOpen) return null;

  const activeStudents = students.filter((s) => s.status === 'active');
  const todayRecords = attendance.filter((a) => a.date === selectedDate);

  // Compute strict daily invariants:
  // Attended = present + late; Total = Attended + absent + excused; Recited <= Attended (never absent/excused)
  let presentOnTime = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let recitedCount = 0;

  activeStudents.forEach((stu) => {
    const rec = todayRecords.find((a) => a.studentId === stu.id);
    const st = rec?.status || 'present';
    const isAttended = st === 'present' || st === 'late';
    if (st === 'present') presentOnTime++;
    else if (st === 'late') lateCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'excused') excusedCount++;

    if (isAttended && (rec ? rec.recited !== false : true)) {
      recitedCount++;
    }
  });

  const totalAttended = presentOnTime + lateCount;
  const attendanceRate = activeStudents.length > 0 ? Math.round((totalAttended / activeStudents.length) * 100) : 0;

  const teachersList = teachers.filter((t) => t.role === 'teacher');
  const supervisorsList = teachers.filter((t) => t.role === 'supervisor');

  const getTeacherStatus = (teacherId: string) => {
    return teacherAttendance.find((r) => r.teacherId === teacherId && r.date === selectedDate)?.status || 'present';
  };

  const getTeacherRecord = (teacherId: string) => {
    return teacherAttendance.find((r) => r.teacherId === teacherId && r.date === selectedDate);
  };

  const teachersPresentCount = teachersList.filter((t) => {
    const st = getTeacherStatus(t.id);
    return st === 'present' || st === 'late';
  }).length;

  const supervisorsPresentCount = supervisorsList.filter((s) => {
    const st = getTeacherStatus(s.id);
    return st === 'present' || st === 'late';
  }).length;

  const handlePrintModal = () => {
    window.print();
  };

  const renderStaffRow = (person: (typeof teachers)[number], isSupervisor: boolean) => {
    const st = getTeacherStatus(person.id);
    const rec = getTeacherRecord(person.id);
    const validPhone = hasValidGuardianPhone(person.phoneNumber);
    const waPhone = formatWhatsAppPhone(person.phoneNumber);
    const halaqahName = person.assignedHalaqahName || (isSupervisor ? person.specialization : 'إشراف عام');

    return (
      <div
        key={person.id}
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSupervisor ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isSupervisor ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">{person.fullName}</h4>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  isSupervisor ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {halaqahName}
              </span>
              {!validPhone && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold">
                  <AlertCircle className="w-3 h-3" />
                  لا يوجد رقم
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              {validPhone ? (
                <span dir="ltr" className="font-mono font-bold text-slate-700">
                  {person.phoneNumber}
                </span>
              ) : (
                <span className="text-slate-400">رقم الهاتف غير مسجل</span>
              )}
              {rec?.checkInTime && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {rec.checkInTime}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTeacherAttendance(person.id, 'present', '04:00 م', 0)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                st === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
              }`}
            >
              حاضر
            </button>
            <button
              type="button"
              onClick={() => setTeacherAttendance(person.id, 'late', '04:20 م', 20)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                st === 'late' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
              }`}
            >
              متأخر
            </button>
            <button
              type="button"
              onClick={() => setTeacherAttendance(person.id, 'excused', undefined, 0, 'مستأذن / تكليف')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                st === 'excused' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
              }`}
            >
              مستأذن
            </button>
            <button
              type="button"
              onClick={() => setTeacherAttendance(person.id, 'absent', undefined, 0)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                st === 'absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
              }`}
            >
              غائب
            </button>
          </div>

          {validPhone && waPhone ? (
            <button
              type="button"
              onClick={() =>
                openDirectWhatsApp(
                  person.phoneNumber,
                  `السلام عليكم ورحمة الله وبركاته ${person.fullName}، نود متابعة حضوركم اليوم في (${halaqahName}) بتاريخ ${formattedSelectedDateArabic}.`
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              واتساب
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLiveReportModal();
      }}
    >
      <div className="bg-slate-50 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between gap-4 print:bg-white print:text-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                مركز التقارير الحية وحضور المعلمين والشيخ
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  مباشر الآن
                </span>
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {formattedSelectedDateArabic} • متابعة فورية لإحصائيات الطلاب ({activeStudents.length}) والحلقات ({halaqat.length}) والمعلمين والمشرفين
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLiveReportModal}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer print:hidden"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Switcher */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === 'students'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              إحصائيات الطلاب والحلقات ({halaqat.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('staff')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === 'staff'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              حضور المعلمين ({teachersList.length}) والشيخ والمشرفين ({supervisorsList.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeLiveReportModal();
                setActiveTab('reports');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              التقارير التفصيلية الكاملة ←
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'students' ? (
            <>
              {/* Strict Formula KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold">إجمالي الطلاب</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeStudents.length}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">حضر + غاب + استأذن = {totalAttended + absentCount + excusedCount}</p>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-800 font-bold">إجمالي الحاضرين</p>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    {totalAttended} <span className="text-xs font-bold">({attendanceRate}%)</span>
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">
                    بالموعد: {presentOnTime} • متأخر: {lateCount}
                  </p>
                </div>

                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-sky-800 font-bold">المسمّعون (من الحضور)</p>
                    <BookOpen className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-sky-700 mt-1">
                    {recitedCount} <span className="text-xs font-bold">/ {totalAttended}</span>
                  </p>
                  <p className="text-[11px] text-sky-700/80 mt-0.5">
                    {totalAttended > 0 ? Math.round((recitedCount / totalAttended) * 100) : 0}% من الحاضرين
                  </p>
                </div>

                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-rose-800 font-bold">الغياب</p>
                    <UserX className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">{absentCount}</p>
                  <p className="text-[11px] text-rose-700/80 mt-0.5">بدون تسميع محسوب</p>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-amber-800 font-bold">المستأذنون</p>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">{excusedCount}</p>
                  <p className="text-[11px] text-amber-700/80 mt-0.5">بعذر رسمي</p>
                </div>
              </div>

              {/* 6 Rings Live Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    حالة الحلقات الست والتحضير الفوري ({halaqat.length} حلقات)
                  </h3>
                  <span className="text-xs text-slate-500">المعلمون الحاضرون: {teachersPresentCount}/{teachersList.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-bold">
                      <tr>
                        <th className="py-3 px-4">الحلقة</th>
                        <th className="py-3 px-4">المعلم المسؤول</th>
                        <th className="py-3 px-4 text-center">الإجمالي</th>
                        <th className="py-3 px-4 text-center">الحاضرون</th>
                        <th className="py-3 px-4 text-center">المسمّعون</th>
                        <th className="py-3 px-4 text-center">الغائبون</th>
                        <th className="py-3 px-4 text-center">الاستئذان</th>
                        <th className="py-3 px-4">حالة التحضير</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {halaqat.map((h) => {
                        const hStds = activeStudents.filter((s) => s.halaqahId === h.id);
                        let hOnTime = 0;
                        let hLate = 0;
                        let hAbs = 0;
                        let hExc = 0;
                        let hRec = 0;

                        hStds.forEach((stu) => {
                          const rec = todayRecords.find((a) => a.studentId === stu.id);
                          const st = rec?.status || 'present';
                          const isAtt = st === 'present' || st === 'late';
                          if (st === 'present') hOnTime++;
                          else if (st === 'late') hLate++;
                          else if (st === 'absent') hAbs++;
                          else if (st === 'excused') hExc++;
                          if (isAtt && (rec ? rec.recited !== false : true)) hRec++;
                        });

                        const hAttended = hOnTime + hLate;
                        const prep = ringPreparationStatus[h.id];
                        const isPrepDone = prep && prep.date === selectedDate && prep.status === 'completed';

                        return (
                          <tr key={h.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-slate-900">{h.name}</td>
                            <td className="py-3 px-4">
                              <div className="text-xs font-bold text-slate-700">{h.teacherName}</div>
                              {hasValidGuardianPhone(h.teacherPhone) ? (
                                <div dir="ltr" className="text-[11px] font-mono text-slate-500 text-right">
                                  {h.teacherPhone}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">لا يوجد رقم</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700">{hStds.length}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-emerald-700">{hAttended}</span>
                              {hLate > 0 && (
                                <span className="block text-[10px] text-amber-600">({hLate} متأخر)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-sky-700">
                              {hRec} / {hAttended}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-rose-600">{hAbs}</td>
                            <td className="py-3 px-4 text-center font-bold text-amber-600">{hExc}</td>
                            <td className="py-3 px-4">
                              {isPrepDone ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  تم ({prep.preparedAt})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  بانتظار التأكيد
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-emerald-50/70 font-extrabold text-slate-900">
                        <td className="py-3 px-4" colSpan={2}>
                          الإجمالي العام ({halaqat.length} حلقات)
                        </td>
                        <td className="py-3 px-4 text-center">{activeStudents.length}</td>
                        <td className="py-3 px-4 text-center text-emerald-800">{totalAttended}</td>
                        <td className="py-3 px-4 text-center text-sky-800">
                          {recitedCount} / {totalAttended}
                        </td>
                        <td className="py-3 px-4 text-center text-rose-700">{absentCount}</td>
                        <td className="py-3 px-4 text-center text-amber-700">{excusedCount}</td>
                        <td className="py-3 px-4 text-xs text-emerald-700">نسبة الحضور {attendanceRate}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Bulk Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    حضور المعلمين ({teachersPresentCount}/{teachersList.length}) والشيخ والمشرفين ({supervisorsPresentCount}/{supervisorsList.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    اضغط على حالة أي معلم أو شيخ مشرف لتحديث حضوره اليومي مباشرة مع إتاحة التواصل عبر الواتساب
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => bulkMarkTeachers('present')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  تحضير الجميع حاضر
                </button>
              </div>

              {/* Sheikh & Supervisors Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  الشيخ والمشرفون ({supervisorsList.length})
                </h4>
                <div className="space-y-2.5">
                  {supervisorsList.map((sup) => renderStaffRow(sup, true))}
                </div>
              </div>

              {/* 6 Teachers Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  معلمو الحلقات الست ({teachersList.length})
                </h4>
                <div className="space-y-2.5">
                  {teachersList.map((t) => renderStaffRow(t, false))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrintModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة التقرير الحي
            </button>
            <button
              type="button"
              onClick={handleDownloadTxtReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              تصدير ملف نصي (.txt)
            </button>
            <button
              type="button"
              onClick={() => {
                closeLiveReportModal();
                requestSendConsolidatedReport(selectedDate);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              معاينة وبث التقرير الختامي
            </button>
          </div>
          <button
            type="button"
            onClick={closeLiveReportModal}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
