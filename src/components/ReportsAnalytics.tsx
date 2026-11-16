import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  BarChart3,
  Calendar,
  Download,
  Award,
  AlertCircle,
  CheckCircle2,
  FileText,
  Filter,
  Clock,
  GraduationCap,
  Users,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import emblemImg from '../assets/images/halaqat_badge_emblem_1792392345633.jpg';
import { formatWhatsAppPhone, hasValidGuardianPhone } from '../data/mockData';

export const ReportsAnalytics: React.FC = () => {
  const {
    students,
    halaqat,
    stages,
    teachers,
    attendance,
    teacherAttendance,
    selectedDate,
    setSelectedDate,
    formattedSelectedDateArabic,
    resetToToday,
    showGlobalNotification,
  } = useHalaqat();

  // Active Report Section: 1 to 4
  const [activeReportSection, setActiveReportSection] = useState<'students_attendance' | 'students_lateness' | 'teachers_performance' | 'consolidated_download'>('students_attendance');

  // Duration Filter: 'daily' (اليوم المختار) | 'weekly' (آخر أسبوع) | 'monthly' (آخر شهر)
  const [durationMode, setDurationMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filterHalaqah, setFilterHalaqah] = useState('all');

  const activeStudents = students.filter((s) => s.status === 'active');
  const filteredStudents =
    filterHalaqah === 'all'
      ? activeStudents
      : activeStudents.filter((s) => s.halaqahId === filterHalaqah);

  // Filter attendance records based on durationMode and selectedDate
  const getRelevantStudentRecords = () => {
    if (durationMode === 'daily') {
      return attendance.filter((a) => a.date === selectedDate);
    }
    // Calculate cutoff
    const daysBack = durationMode === 'weekly' ? 7 : 30;
    const targetObj = new Date(selectedDate);
    targetObj.setDate(targetObj.getDate() - daysBack);
    const cutoff = targetObj.toISOString().split('T')[0];

    return attendance.filter((a) => a.date <= selectedDate && a.date >= cutoff);
  };

  const getRelevantTeacherRecords = () => {
    if (durationMode === 'daily') {
      return teacherAttendance.filter((a) => a.date === selectedDate);
    }
    const daysBack = durationMode === 'weekly' ? 7 : 30;
    const targetObj = new Date(selectedDate);
    targetObj.setDate(targetObj.getDate() - daysBack);
    const cutoff = targetObj.toISOString().split('T')[0];

    return teacherAttendance.filter((a) => a.date <= selectedDate && a.date >= cutoff);
  };

  const relevantStudentRecords = getRelevantStudentRecords();
  const relevantTeacherRecords = getRelevantTeacherRecords();
  const selectedDayStudentRecords = attendance.filter((a) => a.date === selectedDate);
  const selectedDayTeacherRecords = teacherAttendance.filter((a) => a.date === selectedDate);

  // 1. Student Attendance Stats
  const studentStats = filteredStudents.map((student) => {
    const studentRecords = relevantStudentRecords.filter((a) => a.studentId === student.id);
    const totalRecorded = studentRecords.length || 1;
    const present = studentRecords.filter((a) => a.status === 'present').length;
    const absent = studentRecords.filter((a) => a.status === 'absent').length;
    const late = studentRecords.filter((a) => a.status === 'late').length;
    const excused = studentRecords.filter((a) => a.status === 'excused').length;
    const recited = studentRecords.filter(
      (a) => (a.status === 'present' || a.status === 'late') && a.recited === true
    ).length;
    const rate = Math.round(((present + late) / totalRecorded) * 100);

    return {
      student,
      totalRecorded,
      present,
      absent,
      late,
      excused,
      recited,
      rate,
    };
  });

  // 2. Late Students List
  const lateStudentsRecords = relevantStudentRecords
    .filter((a) => a.status === 'late')
    .map((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const halaqah = halaqat.find((h) => h.id === rec.halaqahId);
      return {
        record: rec,
        student,
        halaqah,
      };
    })
    .filter((item) => item.student != null);

  // 3. Teachers & Supervisors Performance
  const teacherStats = teachers.map((teacher) => {
    const records = relevantTeacherRecords.filter((r) => r.teacherId === teacher.id);
    const totalRecorded = records.length || 1;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const punctualityRate = Math.round(((present) / totalRecorded) * 100);

    return {
      teacher,
      records,
      totalRecorded,
      present,
      late,
      excused,
      absent,
      punctualityRate,
    };
  });

  // =========================================================================
  // 1. تقرير تحضير وحضور وغياب الطلاب: Print & Export
  // =========================================================================
  const handlePrintStudentsAttendance = () => {
    setActiveReportSection('students_attendance');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportStudentsAttendanceCSV = () => {
    const headers = [
      'الرقم التسلسلي',
      'اسم الطالب',
      'الحلقة',
      'المرحلة',
      'الجزء الحالي',
      'حالة الحضور اليوم',
      'التسميع',
      'الالتزام بالزي',
      'جوال ولي الأمر',
      'نسبة الالتزام الإجمالية %',
    ];

    const rows = filteredStudents.map((student) => {
      const stats = studentStats.find((s) => s.student.id === student.id);
      const halaqah = halaqat.find((h) => h.id === student.halaqahId);
      const stage = stages.find((s) => s.id === student.stageId);
      const todayRec = selectedDayStudentRecords.find((a) => a.studentId === student.id);
      const rawStatus = todayRec?.status || 'present';
      const isAttended = rawStatus === 'present' || rawStatus === 'late';
      const status =
        rawStatus === 'present'
          ? 'حاضر'
          : rawStatus === 'late'
          ? 'متأخر'
          : rawStatus === 'excused'
          ? 'مستأذن'
          : 'غائب';
      const recited = isAttended
        ? todayRec?.recited !== false
          ? 'سمّع ورده'
          : 'لم يُسمّع'
        : '— (غائب/بعذر)';
      const uniform = todayRec?.uniformCompliant !== false ? 'ملتزم بالزي' : 'مخالف للزي';

      return [
        student.halaqahSerial,
        `"${student.fullName}"`,
        `"${halaqah?.name || ''}"`,
        `"${stage?.shortName || ''}"`,
        student.currentJuz,
        `"${status}"`,
        `"${recited}"`,
        `"${uniform}"`,
        `"${hasValidGuardianPhone(student.guardianPhone) ? student.guardianPhone : 'لا يوجد رقم'}"`,
        `"${stats?.rate ?? 100}%"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_حضور_وغياب_الطلاب_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showGlobalNotification('تم تصدير تقرير حضور وغياب الطلاب (Excel/CSV) بنجاح 📥', 'success');
  };

  // =========================================================================
  // 2. تقرير تأخير الطلاب: Print & Export
  // =========================================================================
  const handlePrintLateness = () => {
    setActiveReportSection('students_lateness');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportLatenessCSV = () => {
    const headers = [
      '#',
      'اسم الطالب',
      'الحلقة',
      'المعلم المشرف',
      'تاريخ الجلسة',
      'وقت الحضور الفعلي',
      'دقائق التأخير',
      'الملاحظات والأسباب',
      'جوال ولي الأمر',
    ];

    const rows = lateStudentsRecords.map((item, idx) => [
      idx + 1,
      `"${item.student?.fullName || ''}"`,
      `"${item.halaqah?.name || ''}"`,
      `"${item.halaqah?.teacherName || ''}"`,
      `"${item.record.date}"`,
      `"${item.record.checkInTime || '04:30 م'}"`,
      item.record.latenessMinutes || 15,
      `"${item.record.notes || 'تأخر عن موعد الحلقة'}"`,
      `"${hasValidGuardianPhone(item.student?.guardianPhone) ? item.student?.guardianPhone : 'لا يوجد رقم'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_تأخير_الطلاب_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showGlobalNotification('تم تصدير تقرير تأخير الطلاب (Excel/CSV) بنجاح 📥', 'success');
  };

  // =========================================================================
  // 3. تقرير تحضير وأداء المعلمين والمشرفين: Print & Export
  // =========================================================================
  const handlePrintTeachers = () => {
    setActiveReportSection('teachers_performance');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportTeachersCSV = () => {
    const headers = [
      '#',
      'الاسم الكامل',
      'الصفة الوظيفية',
      'الحلقة / المهمة المسندة',
      'رقم الجوال',
      'حالة اليوم',
      'وقت الحضور اليوم',
      'مرات الحضور بالفترة',
      'مرات التأخير بالفترة',
      'مرات الغياب بالفترة',
      'نسبة الالتزام والانضباط %',
    ];

    const rows = teachers.map((t, idx) => {
      const stat = teacherStats.find((s) => s.teacher.id === t.id);
      const todayRec = selectedDayTeacherRecords.find((r) => r.teacherId === t.id);
      const rawStatus = todayRec?.status || 'present';
      const status =
        rawStatus === 'present'
          ? 'حاضر في الموعد'
          : rawStatus === 'late'
          ? 'متأخر'
          : rawStatus === 'excused'
          ? 'مستأذن'
          : 'غائب';
      const checkIn =
        todayRec?.checkInTime ||
        (rawStatus === 'present' ? '04:10 م' : rawStatus === 'late' ? '04:25 م' : '-');

      return [
        idx + 1,
        `"${t.fullName}"`,
        `"${t.role === 'supervisor' ? 'مشرف تعليمي' : 'معلم حلقة'}"`,
        `"${t.assignedHalaqahName || 'إشراف عام'}"`,
        `"${hasValidGuardianPhone(t.phoneNumber) ? t.phoneNumber : 'لا يوجد رقم'}"`,
        `"${status}"`,
        `"${checkIn}"`,
        stat?.present ?? 1,
        stat?.late ?? 0,
        stat?.absent ?? 0,
        `"${stat?.punctualityRate ?? 100}%"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المعلمين_والمشرفين_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showGlobalNotification('تم تصدير تقرير المعلمين والمشرفين (Excel/CSV) بنجاح 📥', 'success');
  };

  // =========================================================================
  // 4. التقرير الختامي الشامل: Print & TXT & CSV
  // =========================================================================
  const handlePrintConsolidated = () => {
    setActiveReportSection('consolidated_download');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadTxtReport = () => {
    let content = `=================================================================\n`;
    content += `        التقرير الشامل الختامي لحلقات جامع الإمام ابن باز        \n`;
    content += `=================================================================\n`;
    content += `تاريخ التقرير: ${formattedSelectedDateArabic} (${selectedDate})\n`;
    content += `الفترة الزمنية: ${durationMode === 'daily' ? 'تقرير يومي' : (durationMode === 'weekly' ? 'تقرير أسبوعي (آخر 7 أيام)' : 'تقرير شهري (آخر 30 يوماً)')}\n`;
    content += `إدارة حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم\n`;
    content += `-----------------------------------------------------------------\n\n`;

    content += `[1] إحصائيات حضور وغياب الطلاب (${selectedDate}):\n`;
    content += `• إجمالي الطلاب المسجلين: ${activeStudents.length} طالباً\n`;
    halaqat.forEach((h) => {
      const hStds = activeStudents.filter((s) => s.halaqahId === h.id);
      const hOnTime = hStds.filter((s) => {
        const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
        return !rec || rec.status === 'present';
      }).length;
      const hLate = hStds.filter((s) => {
        const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
        return rec?.status === 'late';
      }).length;
      const hExcused = hStds.filter((s) => {
        const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
        return rec?.status === 'excused';
      }).length;
      const hAbsent = hStds.filter((s) => {
        const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
        return rec?.status === 'absent';
      }).length;
      const hAttended = hOnTime + hLate;
      const hRecited = Math.min(
        hStds.filter((s) => {
          const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
          const attended = !rec || rec.status === 'present' || rec.status === 'late';
          return attended && rec?.recited !== false;
        }).length,
        hAttended
      );
      content += `  - ${h.name} (المعلم: ${h.teacherName}): ${hAttended}/${hStds.length} حاضرون (منهم ${hLate} متأخر) | ${hAbsent} غياب | ${hExcused} عذر | التسميع: ${hRecited}/${hAttended}\n`;
    });

    content += `\n[2] كشف تأخير الطلاب:\n`;
    if (lateStudentsRecords.length > 0) {
      lateStudentsRecords.forEach((item, idx) => {
        content += `  ${idx + 1}. الطالب: ${item.student?.fullName} (${item.halaqah?.name}) - وقت الحضور: ${item.record.checkInTime || '04:25 م'} - تأخير: ${item.record.latenessMinutes || 15} دقيقة\n`;
      });
    } else {
      content += `  لا توجد حالات تأخير مرصودة خلال الفترة المحددة.\n`;
    }

    content += `\n[3] تقرير تحضير وأداء المعلمين والمشرفين:\n`;
    teachers.forEach((t, idx) => {
      const tStat = teacherStats.find((s) => s.teacher.id === t.id);
      content += `  ${idx + 1}. ${t.role === 'supervisor' ? 'المشرف' : 'المعلم'}: ${t.fullName} (${t.assignedHalaqahName || 'إشراف عام'})\n`;
      content += `     مرات الحضور: ${tStat?.present} | التأخير: ${tStat?.late} | الغياب: ${tStat?.absent} | نسبة الانضباط: ${tStat?.punctualityRate}%\n`;
    });

    content += `\n=================================================================\n`;
    content += `صادر عن إدارة حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_حلقات_ابن_باز_${selectedDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showGlobalNotification('تم تنزيل التقرير الشامل الختامي كملف نصي (.txt) بنجاح 📄', 'success');
  };

  const handleExportConsolidatedCSV = () => {
    handleExportStudentsAttendanceCSV();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-800" />
            <span>نظام التقارير والأرشفة بالمدة الزمنية</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            أرشفة تلقائية ودائمة لكافة عمليات التحضير والمتابعة للطلاب والمعلمين مع إمكانية مراجعة أي يوم أو شهر سابق.
          </p>
        </div>

        {/* Global Controls: Date Picker + Duration Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-700">تاريخ التقرير:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 font-mono font-bold px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            />
            <button
              onClick={resetToToday}
              className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]"
            >
              اليوم
            </button>
          </div>

          {/* Duration Mode Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDurationMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                durationMode === 'daily' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              📅 يومي
            </button>
            <button
              onClick={() => setDurationMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                durationMode === 'weekly' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              🗓️ أسبوعي
            </button>
            <button
              onClick={() => setDurationMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                durationMode === 'monthly' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              📆 شهري
            </button>
          </div>
        </div>
      </div>

      {/* 4 Distinct Report Categories Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 print:hidden">
        <button
          onClick={() => setActiveReportSection('students_attendance')}
          className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
            activeReportSection === 'students_attendance'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeReportSection === 'students_attendance' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              القسم 1
            </span>
          </div>
          <h3 className="text-xs font-bold mt-2">تقرير حضور وغياب الطلاب</h3>
          <p className={`text-[11px] mt-1 line-clamp-1 ${
            activeReportSection === 'students_attendance' ? 'text-emerald-100' : 'text-slate-500'
          }`}>
            نسب الالتزام ومعدلات الحضور للحلقات الـ {halaqat.length}
          </p>
        </button>

        <button
          onClick={() => setActiveReportSection('students_lateness')}
          className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
            activeReportSection === 'students_lateness'
              ? 'bg-amber-700 text-white border-amber-800 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <Clock className="w-4 h-4 text-amber-300" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeReportSection === 'students_lateness' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              القسم 2
            </span>
          </div>
          <h3 className="text-xs font-bold mt-2">تقرير تأخير الطلاب</h3>
          <p className={`text-[11px] mt-1 line-clamp-1 ${
            activeReportSection === 'students_lateness' ? 'text-amber-100' : 'text-slate-500'
          }`}>
            رصد أوقات الحضور ودقائق التأخير وملاحظاتها
          </p>
        </button>

        <button
          onClick={() => setActiveReportSection('teachers_performance')}
          className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
            activeReportSection === 'teachers_performance'
              ? 'bg-indigo-800 text-white border-indigo-900 shadow-md ring-2 ring-indigo-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <GraduationCap className="w-4 h-4 text-indigo-300" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeReportSection === 'teachers_performance' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              القسم 3
            </span>
          </div>
          <h3 className="text-xs font-bold mt-2">تحضير وأداء المعلمين والمشرفين</h3>
          <p className={`text-[11px] mt-1 line-clamp-1 ${
            activeReportSection === 'teachers_performance' ? 'text-indigo-100' : 'text-slate-500'
          }`}>
            متابعة انضباط الـ 6 معلمين والـ 3 مشرفين
          </p>
        </button>

        <button
          onClick={() => setActiveReportSection('consolidated_download')}
          className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
            activeReportSection === 'consolidated_download'
              ? 'bg-slate-900 text-white border-slate-950 shadow-md ring-2 ring-slate-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeReportSection === 'consolidated_download' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              القسم 4
            </span>
          </div>
          <h3 className="text-xs font-bold mt-2">التقرير الختامي الشامل والتنزيل</h3>
          <p className={`text-[11px] mt-1 line-clamp-1 ${
            activeReportSection === 'consolidated_download' ? 'text-slate-300' : 'text-slate-500'
          }`}>
            تنزيل مباشر .txt و .csv لتصدير التقارير وحفظها
          </p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: تقرير تحضير وحضور وغياب الطلاب */}
      {/* ========================================================================= */}
      {activeReportSection === 'students_attendance' && (
        <div className="space-y-4">
          {/* Official Print Letterhead (visible only on print) */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-emerald-800 mb-4">
            <div className="flex items-center gap-3">
              <img src={emblemImg} alt="شعار الحلقات" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h1 className="text-base font-bold text-slate-900">حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم</h1>
                <span className="text-xs text-slate-600 block">تقرير تحضير وحضور وغياب الطلاب</span>
                <span className="text-xs font-bold text-emerald-800">التاريخ: {formattedSelectedDateArabic} ({selectedDate})</span>
              </div>
            </div>
            <div className="text-left text-xs font-mono">
              <div>كشف الحضور الرسمي المعتمد</div>
              <div>الفترة: {durationMode === 'daily' ? 'يومي' : (durationMode === 'weekly' ? 'أسبوعي' : 'شهري')}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>كشف الحضور والغياب للطلاب ({formattedSelectedDateArabic} - {durationMode === 'daily' ? 'يومي' : (durationMode === 'weekly' ? 'أسبوعي' : 'شهري')})</span>
              </h2>
              <span className="text-xs text-slate-500">إجمالي الطلاب المسجلين: {activeStudents.length} طالباً</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterHalaqah}
                onChange={(e) => setFilterHalaqah(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="all">كافة الحلقات ({halaqat.length} حلقات)</option>
                {halaqat.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handlePrintStudentsAttendance}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="طباعة تقرير حضور وغياب الطلاب"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة التقرير</span>
              </button>

              <button
                onClick={handleExportStudentsAttendanceCSV}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="تصدير كشف حضور وغياب الطلاب كملف Excel (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel (.csv)</span>
              </button>
            </div>
          </div>

          {/* Rings Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {halaqat.map((h) => {
              const hStds = activeStudents.filter((s) => s.halaqahId === h.id);
              let hAttended = 0;
              let hAbsent = 0;
              let hExcused = 0;
              let hRecited = 0;
              let rate = 100;

              if (durationMode === 'daily') {
                hStds.forEach((s) => {
                  const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                  const st = rec?.status || 'present';
                  if (st === 'present' || st === 'late') {
                    hAttended += 1;
                    if (rec?.recited !== false) hRecited += 1;
                  } else if (st === 'excused') {
                    hExcused += 1;
                  } else {
                    hAbsent += 1;
                  }
                });
                rate = hStds.length > 0 ? Math.round((hAttended / hStds.length) * 100) : 100;
              } else {
                const hPeriodRecs = relevantStudentRecords.filter((a) => a.halaqahId === h.id);
                const periodAttended = hPeriodRecs.filter(
                  (a) => a.status === 'present' || a.status === 'late'
                ).length;
                const periodAbsent = hPeriodRecs.filter((a) => a.status === 'absent').length;
                const periodExcused = hPeriodRecs.filter((a) => a.status === 'excused').length;
                const periodRecited = Math.min(
                  hPeriodRecs.filter(
                    (a) => (a.status === 'present' || a.status === 'late') && a.recited === true
                  ).length,
                  periodAttended
                );
                hAttended = periodAttended;
                hAbsent = periodAbsent;
                hExcused = periodExcused;
                hRecited = periodRecited;
                rate =
                  hPeriodRecs.length > 0
                    ? Math.round((periodAttended / hPeriodRecs.length) * 100)
                    : 100;
              }

              return (
                <div key={h.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md block truncate">
                    {h.name}
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">المعلم:</span>
                    <strong className="text-slate-800 text-[11px] truncate max-w-[110px]">{h.teacherName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-emerald-700 font-bold">{hAttended} حضور</span>
                    <span className="text-rose-700 font-bold">{hAbsent} غياب</span>
                    <span className="text-sky-700 font-bold">سمّع {hRecited}</span>
                  </div>
                  {hExcused > 0 && (
                    <div className="text-[10px] text-purple-700 font-semibold">مستأذن: {hExcused}</div>
                  )}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Students Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">الجزء الحالي</th>
                    <th className="p-3">حالة الحضور</th>
                    <th className="p-3">التسميع</th>
                    <th className="p-3">الالتزام بالزي</th>
                    <th className="p-3">جوال ولي الأمر</th>
                    <th className="p-3">نسبة الالتزام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stu) => {
                    const stats = studentStats.find((s) => s.student.id === stu.id);
                    const halaqah = halaqat.find((h) => h.id === stu.halaqahId);
                    const todayRec = selectedDayStudentRecords.find((a) => a.studentId === stu.id);
                    const status = todayRec?.status || 'present';
                    const isAttended = status === 'present' || status === 'late';
                    const recited = isAttended && todayRec?.recited !== false;
                    const uniform = todayRec?.uniformCompliant !== false;

                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500">
                          {stu.halaqahSerial.toString().padStart(2, '0')}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 text-slate-700">{halaqah?.name}</td>
                        <td className="p-3 font-mono font-semibold text-slate-800">جزء {stu.currentJuz}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'late' ? 'bg-amber-100 text-amber-800' :
                            status === 'excused' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {status === 'present' ? 'حاضر' : (status === 'late' ? 'متأخر' : (status === 'excused' ? 'مستأذن' : 'غائب'))}
                          </span>
                        </td>
                        <td className="p-3">
                          {!isAttended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              غير محتسب (غائب/عذر)
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              recited ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {recited ? 'سمّع ورد اليوم' : 'لم يُسمّع'}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            uniform ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {uniform ? 'ملتزم بالزي' : 'مخالف'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600" dir="ltr">
                          {hasValidGuardianPhone(stu.guardianPhone) ? (
                            stu.guardianPhone
                          ) : (
                            <span className="text-rose-700 font-bold text-[10px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              لا يوجد رقم
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold font-mono text-emerald-900">{stats?.rate ?? 100}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: تقرير تأخير الطلاب */}
      {/* ========================================================================= */}
      {activeReportSection === 'students_lateness' && (
        <div className="space-y-4">
          {/* Official Print Letterhead (visible only on print) */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-amber-800 mb-4">
            <div className="flex items-center gap-3">
              <img src={emblemImg} alt="شعار الحلقات" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h1 className="text-base font-bold text-slate-900">حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم</h1>
                <span className="text-xs text-slate-600 block">تقرير تأخير الطلاب المرصود</span>
                <span className="text-xs font-bold text-amber-800">التاريخ: {formattedSelectedDateArabic} ({selectedDate})</span>
              </div>
            </div>
            <div className="text-left text-xs font-mono">
              <div>إدارة حلقات جامع ابن باز</div>
              <div>إجمالي التأخير: {lateStudentsRecords.length} حالات</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>سجل تأخر الطلاب عن مواعيد الحلقات ({formattedSelectedDateArabic})</span>
              </h2>
              <span className="text-xs text-slate-500">
                إجمالي حالات التأخير المسجلة في الفترة: <strong>{lateStudentsRecords.length} حالات</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintLateness}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="طباعة كشف تأخير الطلاب"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة التقرير</span>
              </button>

              <button
                onClick={handleExportLatenessCSV}
                className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="تصدير كشف تأخير الطلاب بصيغة Excel (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel (.csv)</span>
              </button>
            </div>
          </div>

          {lateStudentsRecords.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">لا توجد حالات تأخير مسجلة في هذا التاريخ</h3>
              <p className="text-xs text-slate-500">جميع الطلاب حضروا في الوقت المحدد ما شاء الله.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">المعلم المشرف</th>
                    <th className="p-3">تاريخ الجلسة</th>
                    <th className="p-3">وقت الحضور الفعلي</th>
                    <th className="p-3">دقائق التأخير</th>
                    <th className="p-3">السبب / الملاحظات</th>
                    <th className="p-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lateStudentsRecords.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{item.student?.fullName}</td>
                      <td className="p-3 text-slate-700">{item.halaqah?.name}</td>
                      <td className="p-3 text-slate-600">{item.halaqah?.teacherName}</td>
                      <td className="p-3 font-mono text-slate-500">{item.record.date}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{item.record.checkInTime || '04:30 م'}</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {item.record.latenessMinutes || 15} دقيقة
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{item.record.notes || 'تأخر عن بداية التسميع'}</td>
                      <td className="p-3">
                        {(() => {
                          const waPhone = formatWhatsAppPhone(item.student?.guardianPhone);
                          if (!waPhone) {
                            return (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold text-[10px]">
                                لا يوجد رقم
                              </span>
                            );
                          }
                          return (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                `السلام عليكم ورحمة الله، المكرم ولي أمر الطالب/ ${item.student?.fullName}، نود إفادتكم بتسجيل تأخره اليوم بمقدار (${item.record.latenessMinutes || 15} دقيقة) عن موعد الحلقة.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                            >
                              <span>واتساب ولي الأمر</span>
                            </a>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: تقرير تحضير وأداء المعلمين والمشرفين */}
      {/* ========================================================================= */}
      {activeReportSection === 'teachers_performance' && (
        <div className="space-y-4">
          {/* Official Print Letterhead (visible only on print) */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-indigo-800 mb-4">
            <div className="flex items-center gap-3">
              <img src={emblemImg} alt="شعار الحلقات" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h1 className="text-base font-bold text-slate-900">حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم</h1>
                <span className="text-xs text-slate-600 block">تقرير تحضير وأداء المعلمين والمشرفين</span>
                <span className="text-xs font-bold text-indigo-800">التاريخ: {formattedSelectedDateArabic} ({selectedDate})</span>
              </div>
            </div>
            <div className="text-left text-xs font-mono">
              <div>تقرير الكادر التعليمي</div>
              <div>المعلمون: {teachers.filter((t) => t.role === 'teacher').length} | المشرفون: {teachers.filter((t) => t.role === 'supervisor').length}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-700" />
                <span>سجل انضباط المعلمين (6) والمشرفين (3) التاريخي ({formattedSelectedDateArabic})</span>
              </h2>
              <span className="text-xs text-slate-500">
                متابعة الحضور الميداني، التسميع، وأوقات الوصول والانضباط
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintTeachers}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="طباعة تقرير تحضير وأداء المعلمين والمشرفين"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة التقرير</span>
              </button>

              <button
                onClick={handleExportTeachersCSV}
                className="px-3.5 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="تصدير كشف المعلمين والمشرفين بصيغة Excel (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel (.csv)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => {
              const stat = teacherStats.find((s) => s.teacher.id === t.id);
              const todayRec = selectedDayTeacherRecords.find((r) => r.teacherId === t.id);
              const status = todayRec?.status || 'present';
              const checkIn = todayRec?.checkInTime || (status === 'present' ? '04:10 م' : (status === 'late' ? '04:25 م' : '-'));
              const lateness = todayRec?.latenessMinutes ?? 0;

              return (
                <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t.fullName}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {t.role === 'supervisor' ? 'مشرف تعليمي' : 'معلم حلقة'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-800 font-medium">
                          {t.assignedHalaqahName || 'إشراف عام'}
                        </span>
                        <span>•</span>
                        {hasValidGuardianPhone(t.phoneNumber) ? (
                          <span className="font-mono font-bold text-slate-700" dir="ltr">
                            {t.phoneNumber}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                            لا يوجد رقم
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                      status === 'late' ? 'bg-amber-100 text-amber-800' :
                      status === 'excused' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {status === 'present' ? 'حاضر في الموعد' : (status === 'late' ? `متأخر (${lateness} د)` : (status === 'excused' ? 'مستأذن' : 'غائب'))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 block">وقت الحضور</span>
                      <strong className="text-slate-800 font-mono">{checkIn}</strong>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 block">مرات الحضور</span>
                      <strong className="text-emerald-700">{stat?.present || 1}</strong>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 block">نسبة الالتزام</span>
                      <strong className="text-indigo-700">{stat?.punctualityRate ?? 100}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: التقرير الختامي الشامل والتنزيل */}
      {/* ========================================================================= */}
      {activeReportSection === 'consolidated_download' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-800" />
                <span>التقرير الختامي الشامل المتاح للتنزيل المباشر</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تنزيل فوري لملف التقرير النصي (.txt) أو جدول الإكسل (.csv) أو الطباعة الرسمية المباشرة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintConsolidated}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="طباعة التقرير الختامي الرسمي المعتمد"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التقرير الرسمي</span>
              </button>

              <button
                onClick={handleDownloadTxtReport}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="تنزيل التقرير الشامل كملف نصي (.txt)"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل كملف نصي (.txt)</span>
              </button>

              <button
                onClick={handleExportConsolidatedCSV}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="تصدير التقرير الشامل كجدول إكسل (.csv)"
              >
                <Download className="w-4 h-4" />
                <span>تصدير Excel (.csv)</span>
              </button>
            </div>
          </div>

          {/* Official Printable Report Preview Sheet */}
          <div className="bg-white border border-slate-300 rounded-2xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header with Emblem */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-emerald-800">
              <div className="flex items-center gap-4">
                <img
                  src={emblemImg}
                  alt="شعار الحلقات"
                  className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-emerald-700/20"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">حلقات جامع الإمام ابن باز لتحفيظ القرآن الكريم</h1>
                  <span className="text-xs text-slate-500 block">التقرير الإداري الختامي الشامل والموثق</span>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                    تاريخ التقرير: {formattedSelectedDateArabic} ({selectedDate})
                  </span>
                </div>
              </div>

              <div className="text-left text-xs space-y-1">
                <div className="font-bold text-slate-800">النسخة الرسمية المعتمدة</div>
                <div className="text-slate-500">الحلقات: {halaqat.length} حلقات مسجلة</div>
                <div className="text-slate-500">الطلاب: {activeStudents.length} طالباً</div>
              </div>
            </div>

            {/* Summary Highlights (Exact Daily Snapshot Totals = activeStudents.length) */}
            {(() => {
              const totalStudentsCount = activeStudents.length;
              const dayOnTime = activeStudents.filter((s) => {
                const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                return !rec || rec.status === 'present';
              }).length;
              const dayLate = activeStudents.filter((s) => {
                const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                return rec?.status === 'late';
              }).length;
              const dayExcused = activeStudents.filter((s) => {
                const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                return rec?.status === 'excused';
              }).length;
              const dayAbsent = activeStudents.filter((s) => {
                const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                return rec?.status === 'absent';
              }).length;
              const dayAttended = dayOnTime + dayLate;
              const dayRecited = Math.min(
                activeStudents.filter((s) => {
                  const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                  const attended = !rec || rec.status === 'present' || rec.status === 'late';
                  return attended && rec?.recited !== false;
                }).length,
                dayAttended
              );

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-xs text-slate-500 block">إجمالي الطلاب</span>
                      <strong className="text-xl font-bold text-slate-900 font-mono">{totalStudentsCount}</strong>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <span className="text-xs text-emerald-700 block">الحضور الفعلي (بالموعد + متأخر)</span>
                      <strong className="text-xl font-bold text-emerald-900 font-mono">{dayAttended}</strong>
                      <span className="block text-[10px] text-emerald-700 mt-0.5">
                        بالموعد: {dayOnTime} | متأخر: {dayLate}
                      </span>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                      <span className="text-xs text-sky-700 block">المسمّعون (من الحاضرين)</span>
                      <strong className="text-xl font-bold text-sky-900 font-mono">{dayRecited}</strong>
                      <span className="block text-[10px] text-sky-700 mt-0.5">
                        من أصل {dayAttended} حاضر
                      </span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <span className="text-xs text-rose-700 block">الغائبون / المستأذنون</span>
                      <strong className="text-xl font-bold text-rose-900 font-mono">{dayAbsent + dayExcused}</strong>
                      <span className="block text-[10px] text-rose-700 mt-0.5">
                        غياب: {dayAbsent} | عذر: {dayExcused}
                      </span>
                    </div>
                  </div>

                  {/* Rings Breakdown Table */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      بيان تفصيلي بالحلقات الـ {halaqat.length} المعتمدة:
                    </h3>
                    <table className="w-full text-right text-xs border border-slate-200">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">الحلقة</th>
                          <th className="p-2.5">المرحلة</th>
                          <th className="p-2.5">المعلم المسؤول</th>
                          <th className="p-2.5">عدد الطلاب</th>
                          <th className="p-2.5">الحضور</th>
                          <th className="p-2.5">المتأخرون</th>
                          <th className="p-2.5">الغياب / العذر</th>
                          <th className="p-2.5">التسميع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {halaqat.map((h) => {
                          const hStds = activeStudents.filter((s) => s.halaqahId === h.id);
                          const hOnTime = hStds.filter((s) => {
                            const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                            return !rec || rec.status === 'present';
                          }).length;
                          const hLate = hStds.filter((s) => {
                            const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                            return rec?.status === 'late';
                          }).length;
                          const hExcused = hStds.filter((s) => {
                            const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                            return rec?.status === 'excused';
                          }).length;
                          const hAbsent = hStds.filter((s) => {
                            const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                            return rec?.status === 'absent';
                          }).length;
                          const hAttended = hOnTime + hLate;
                          const hRecited = Math.min(
                            hStds.filter((s) => {
                              const rec = selectedDayStudentRecords.find((a) => a.studentId === s.id);
                              const attended = !rec || rec.status === 'present' || rec.status === 'late';
                              return attended && rec?.recited !== false;
                            }).length,
                            hAttended
                          );

                          return (
                            <tr key={h.id}>
                              <td className="p-2.5 font-bold text-slate-900">{h.name}</td>
                              <td className="p-2.5 text-slate-600">
                                {h.stageId === 'primary_early'
                                  ? 'ابتدائي مبكر'
                                  : h.stageId === 'primary_upper'
                                  ? 'ابتدائي عليا'
                                  : h.stageId === 'intermediate'
                                  ? 'متوسط'
                                  : 'ثانوي'}
                              </td>
                              <td className="p-2.5 font-semibold text-slate-800">{h.teacherName}</td>
                              <td className="p-2.5 font-mono">{hStds.length}</td>
                              <td className="p-2.5 font-mono text-emerald-700 font-bold">{hAttended}</td>
                              <td className="p-2.5 font-mono text-amber-700 font-bold">{hLate}</td>
                              <td className="p-2.5 font-mono text-rose-700 font-bold">{hAbsent + hExcused}</td>
                              <td className="p-2.5 font-mono text-sky-700 font-bold">{hRecited}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-emerald-50/70 border-t-2 border-emerald-200 font-bold text-slate-900">
                        <tr>
                          <td colSpan={3} className="p-2.5">الإجمالي الكلي للحلقات</td>
                          <td className="p-2.5 font-mono">{totalStudentsCount}</td>
                          <td className="p-2.5 font-mono text-emerald-800">{dayAttended}</td>
                          <td className="p-2.5 font-mono text-amber-800">{dayLate}</td>
                          <td className="p-2.5 font-mono text-rose-800">{dayAbsent + dayExcused}</td>
                          <td className="p-2.5 font-mono text-sky-800">{dayRecited}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* Official Signature Footer */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                <span>المشرف العام على الحلقات:</span>
                <span className="block font-bold text-slate-900 mt-1">الشيخ فهد بن خالد العتيبي</span>
              </div>
              <div className="text-left">
                <span>الختم والاعتماد:</span>
                <span className="block font-bold text-emerald-800 mt-1">إدارة حلقات جامع الإمام ابن باز</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
