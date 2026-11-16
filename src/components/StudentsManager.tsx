import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { Student, StageId } from '../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  BookOpen,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Hash,
  UserPlus,
  ArrowRightLeft,
  ArrowUpDown,
  ShieldAlert,
  Camera,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { hasValidGuardianPhone } from '../data/mockData';

export const StudentsManager: React.FC = () => {
  const {
    students,
    halaqat,
    stages,
    addStudent,
    updateStudent,
    deleteStudent,
    updateStudentSerial,
    transferStudentHalaqah,
    autoRenumberHalaqah,
    setIsQuickEnrollOpen,
    setIsPaperScannerOpen,
    clearAllStudents,
    restoreDemoStudents,
    openDeleteConfirm,
    showGlobalNotification,
  } = useHalaqat();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHalaqahFilter, setSelectedHalaqahFilter] = useState('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [onlyMissingPhone, setOnlyMissingPhone] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Transfer Student Modal state
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [targetHalaqahId, setTargetHalaqahId] = useState('');

  // Direct Serial Edit Modal state
  const [editingSerialStudent, setEditingSerialStudent] = useState<Student | null>(null);
  const [newSerialInput, setNewSerialInput] = useState<number>(1);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    halaqahId: halaqat[0]?.id || '',
    halaqahSerial: 1,
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'والد الطالب',
    stageId: 'intermediate' as StageId,
    currentJuz: 1,
    birthYear: 2012,
    status: 'active' as Student['status'],
    notes: '',
  });

  const missingPhoneCount = students.filter((s) => !hasValidGuardianPhone(s.guardianPhone)).length;

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesHalaqah = selectedHalaqahFilter === 'all' || s.halaqahId === selectedHalaqahFilter;
    const matchesStage = selectedStageFilter === 'all' || s.stageId === selectedStageFilter;
    const matchesMissingPhone = !onlyMissingPhone || !hasValidGuardianPhone(s.guardianPhone);
    const matchesQuery =
      searchQuery === '' ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianPhone.includes(searchQuery) ||
      s.halaqahSerial.toString() === searchQuery.trim();

    return matchesHalaqah && matchesStage && matchesMissingPhone && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      halaqahId: halaqat[0]?.id || '',
      halaqahSerial: 1,
      guardianName: '',
      guardianPhone: '',
      guardianRelation: 'والد الطالب',
      stageId: halaqat[0]?.stageId || 'intermediate',
      currentJuz: 1,
      birthYear: 2013,
      status: 'active',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      halaqahId: student.halaqahId,
      halaqahSerial: student.halaqahSerial,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianRelation: student.guardianRelation,
      stageId: student.stageId,
      currentJuz: student.currentJuz,
      birthYear: student.birthYear,
      status: student.status,
      notes: student.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
      });

      // If serial number changed directly in modal
      if (formData.halaqahSerial !== editingStudent.halaqahSerial) {
        updateStudentSerial(editingStudent.id, formData.halaqahSerial);
      }

      setFeedbackNotice(`تم تحديث بيانات الطالب "${formData.fullName}" بنجاح!`);
      showGlobalNotification(`تم تحديث بيانات الطالب "${formData.fullName}" بنجاح ✅`, 'success');
    } else {
      addStudent(formData);
      setFeedbackNotice(`تم تسجيل الطالب "${formData.fullName}" بنجاح!`);
      showGlobalNotification(`تم تسجيل الطالب الجديد "${formData.fullName}" بنجاح في الحلقة ✅`, 'success');
    }
    setIsAddModalOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringStudent || !targetHalaqahId) return;

    transferStudentHalaqah(transferringStudent.id, targetHalaqahId);
    const newH = halaqat.find((h) => h.id === targetHalaqahId);
    setFeedbackNotice(`تم نقل الطالب "${transferringStudent.fullName}" إلى ${newH?.name || 'الحلقة الجديدة'} وتحديث رقمه.`);
    setTransferringStudent(null);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleSerialChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSerialStudent || newSerialInput < 1) return;

    updateStudentSerial(editingSerialStudent.id, newSerialInput);
    setFeedbackNotice(`تم تغيير رقم الطالب "${editingSerialStudent.fullName}" إلى [${newSerialInput}] وإعادة ضبط تسلسل الحلقة!`);
    setEditingSerialStudent(null);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleAutoRenumberSelected = () => {
    if (selectedHalaqahFilter === 'all') return;
    const targetH = halaqat.find((h) => h.id === selectedHalaqahFilter);
    openDeleteConfirm(
      {
        id: selectedHalaqahFilter,
        name: `إعادة ترتيب طلاب "${targetH?.name || ''}" أبجدياً`,
        type: 'action',
        subtext: 'سيتم تحديث أرقام جميع طلاب الحلقة تسلسلياً من [01] إلى [N] وفق الترتيب الأبجدي.',
        details: {
          'اسم الحلقة': targetH?.name || '',
          'المعلم': targetH?.teacherName || '',
        },
      },
      () => {
        autoRenumberHalaqah(selectedHalaqahFilter, 'alphabetical');
        setFeedbackNotice(`تمت إعادة ترتيب أرقام طلاب "${targetH?.name}" أبجدياً بنجاح!`);
        showGlobalNotification(`تمت إعادة ترتيب أرقام طلاب "${targetH?.name}" أبجدياً بنجاح 🔢`, 'success');
        setTimeout(() => setFeedbackNotice(null), 3500);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <span>سجل الطلاب والأرقام التسلسلية (تحكم المدير الشامل)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              تعديل كامل 👑
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تعديل بيانات الطلاب، تغيير الأرقام التسلسلية يدوياً، النقل بين الحلقات، والحذف الفوري.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Camera Scan Button */}
          <button
            onClick={() => setIsPaperScannerOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            title="تصوير الكشف الورقي بالكاميرا وقراءة الأسماء بالذكاء الاصطناعي"
          >
            <Camera className="w-4 h-4" />
            <span>مسح كشف ورقي بالكاميرا 📷</span>
          </button>

          <button
            onClick={() => setIsQuickEnrollOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            title="تسجيل فوري بمجرد كتابة الاسم والحلقة والعمر"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل طالب فوري</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="تسجيل مفصل"
          >
            <Plus className="w-4 h-4" />
            <span>نموذج مفصل</span>
          </button>

          {students.length > 0 ? (
            <button
              onClick={() => {
                openDeleteConfirm(
                  {
                    id: 'all_students_purge',
                    name: 'تفريغ سجل الطلاب بالكامل',
                    type: 'action',
                    subtext: `سيتم حذف جميع الطلاب الحاليين وعددهم (${students.length} طالب) ومسح سجلات التحضير المرتبطة بهم للبدء بكشف فارغ تماماً.`,
                    details: {
                      'إجمالي الطلاب المسجلين': `${students.length} طالب`,
                      'الهدف': 'بدء كشف يدوي جديد فارغ',
                    },
                  },
                  () => {
                    clearAllStudents();
                    setFeedbackNotice('تم تفريغ كافة الطلاب وسجل الحضور بنجاح. الخانات الآن فارغة تماماً.');
                    showGlobalNotification('تم تفريغ كافة الطلاب والبدء بسجل جديد فارغ 🗑️', 'info');
                    setTimeout(() => setFeedbackNotice(null), 3500);
                  }
                );
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="تفريغ كافة الطلاب والبدء بخانات فارغة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ كافة الطلاب</span>
            </button>
          ) : (
            <button
              onClick={() => {
                restoreDemoStudents();
                setFeedbackNotice('تم استرداد كشف الطلاب التجريبي للاختبار.');
                setTimeout(() => setFeedbackNotice(null), 3500);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="استعادة كشف تجريبي للاختبار"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>استعادة عينة تجريبية</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert Notice */}
      {feedbackNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، هاتف ولي الأمر، أو رقم الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Halaqah Filter */}
          <div>
            <select
              value={selectedHalaqahFilter}
              onChange={(e) => setSelectedHalaqahFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">جميع الحلقات</option>
              {halaqat.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">جميع المراحل الدراسية</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            عرض <span className="font-bold font-mono-numbers text-slate-800">{filteredStudents.length}</span> من أصل{' '}
            <span className="font-mono-numbers">{students.length}</span> طالب مسجل
          </span>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {missingPhoneCount > 0 && (
              <button
                type="button"
                onClick={() => setOnlyMissingPhone((prev) => !prev)}
                className={`text-[11px] font-bold flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md border transition-colors ${
                  onlyMissingPhone
                    ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
                title="عرض الطلاب الذين ليس لديهم رقم تواصل لإضافته يدوياً"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>بدون رقم تواصل ({missingPhoneCount})</span>
              </button>
            )}

            {selectedHalaqahFilter !== 'all' && (
              <button
                onClick={handleAutoRenumberSelected}
                className="text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60"
                title="إعادة ترقيم طلاب هذه الحلقة أبجدياً من 1 إلى N"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>إعادة تسلسل طلاب هذه الحلقة أبجدياً</span>
              </button>
            )}

            {(searchQuery || selectedHalaqahFilter !== 'all' || selectedStageFilter !== 'all' || onlyMissingPhone) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedHalaqahFilter('all');
                  setSelectedStageFilter('all');
                  setOnlyMissingPhone(false);
                }}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Table with Direct Director Actions */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم الطالب بالحلقة</th>
                <th className="py-3 px-4">اسم الطالب الكامل</th>
                <th className="py-3 px-4">الحلقة القرآنية</th>
                <th className="py-3 px-4">المرحلة</th>
                <th className="py-3 px-4">الجزء الحالي</th>
                <th className="py-3 px-4">ولي الأمر والهاتف</th>
                <th className="py-3 px-4 text-center">صلاحيات المدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900">
                          {students.length === 0
                            ? 'سجل الطلاب فارغ حالياً (الخانات جاهزة لك لملئها)'
                            : 'لا يوجد طلاب مطابقون للبحث المختار'}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {students.length === 0
                            ? 'تم تفريغ كافة الأسماء والأرقام السابقة. يمكنك الآن مسح الكشوف الورقية بالكاميرا لقراءة الأسماء فوراً، أو إدخال الطلاب يدوياً وتحديد أرقامهم.'
                            : 'جرب تغيير معايير البحث أو اختيار حلقة أخرى من القائمة أعلاه.'}
                        </p>
                      </div>

                      {students.length === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-right">
                          <button
                            onClick={() => setIsPaperScannerOpen(true)}
                            className="p-4 bg-linear-to-br from-amber-500/10 via-emerald-500/10 to-amber-500/10 border-2 border-amber-300 rounded-xl hover:border-amber-400 transition-all text-right cursor-pointer flex flex-col justify-between group shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                                ميزة التصوير 📷
                              </span>
                              <Camera className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">
                              تصوير الكشف الورقي بالكاميرا
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1">
                              صوّر ورقة الكشف وسيتولى الذكاء الاصطناعي استخراج الأسماء والأرقام وكتابتها لك.
                            </p>
                          </button>

                          <button
                            onClick={() => setIsQuickEnrollOpen(true)}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-right cursor-pointer flex flex-col justify-between group shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                إدخال فوري ⚡
                              </span>
                              <UserPlus className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">
                              تسجيل طالب فوري
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1">
                              اكتب اسم الطالب وحلقته وعمره لإدراجه فوراً برقم تسلسلي تلقائي.
                            </p>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                  const stage = stages.find((s) => s.id === student.stageId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Sequential Number inside Halaqah (Clickable to modify) */}
                      <td className="py-3 px-4 font-mono-numbers">
                        <button
                          onClick={() => {
                            setEditingSerialStudent(student);
                            setNewSerialInput(student.halaqahSerial);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                          title="اضغط لتغيير الرقم التسلسلي لهذا الطالب"
                        >
                          <span>[{student.halaqahSerial.toString().padStart(2, '0')}]</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{student.fullName}</span>
                          {!hasValidGuardianPhone(student.guardianPhone) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>لا يوجد رقم</span>
                            </span>
                          )}
                          {(student.isNewStudent || student.addedVia === 'telegram_bot') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
                              ✨ طالب جديد مضاف في هذه الحلقة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Halaqah */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800 block truncate max-w-[180px]">
                          {halaqah?.name || 'غير محدد'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-numbers">
                          {halaqah?.teacherName}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {stage?.shortName}
                        </span>
                      </td>

                      {/* Current Juz */}
                      <td className="py-3 px-4 font-mono-numbers text-slate-700">
                        الجزء <span className="font-bold text-emerald-800">{student.currentJuz}</span>
                      </td>

                      {/* Guardian */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 text-xs">{student.guardianName}</div>
                        {hasValidGuardianPhone(student.guardianPhone) ? (
                          <div className="text-[11px] font-mono-numbers text-slate-600 flex items-center gap-1 mt-0.5" dir="ltr">
                            <Phone className="w-3 h-3 text-emerald-700" />
                            <span>{student.guardianPhone}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                            title="اضغط لإضافة رقم ولي الأمر يدوياً"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>لا يوجد رقم · أضف الآن</span>
                          </button>
                        )}
                      </td>

                      {/* Actions: Transfer, Edit, Delete */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Transfer button */}
                          <button
                            onClick={() => {
                              setTransferringStudent(student);
                              const otherH = halaqat.find((h) => h.id !== student.halaqahId);
                              setTargetHalaqahId(otherH?.id || halaqat[0]?.id || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="نقل الطالب إلى حلقة أخرى"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Full Edit button */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="تعديل كافة بيانات الطالب"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              openDeleteConfirm(
                                {
                                  id: student.id,
                                  name: student.fullName,
                                  type: 'student',
                                  subtext: `رقم الطالب في الحلقة: [${student.halaqahSerial.toString().padStart(2, '0')}] · ${halaqah?.name || 'حلقة قرآنية'}`,
                                  details: {
                                    'اسم ولي الأمر': student.guardianName,
                                    'رقم الجوال': hasValidGuardianPhone(student.guardianPhone) ? student.guardianPhone : 'لا يوجد رقم',
                                    'المرحلة': stage?.shortName,
                                    'الجزء الحالي': `الجزء ${student.currentJuz}`,
                                  },
                                },
                                () => {
                                  deleteStudent(student.id);
                                  setFeedbackNotice(`تم حذف الطالب "${student.fullName}" بنجاح، وتحديث قاعدة البيانات وإعادة ترتيب تسلسل الحلقة.`);
                                  showGlobalNotification(`تم حذف الطالب "${student.fullName}" بنجاح وتحديث السجلات 🗑️`, 'info');
                                }
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="حذف الطالب نهائياً من الحلقة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Serial Number Change Modal */}
      {editingSerialStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-emerald-800" />
                <span>تعديل الرقم التسلسلي للطالب</span>
              </h3>
              <button onClick={() => setEditingSerialStudent(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSerialChangeSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg text-slate-700">
                <div className="font-bold text-slate-900">{editingSerialStudent.fullName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  الرقم الحالي: <span className="font-mono-numbers font-bold text-rose-700">[{editingSerialStudent.halaqahSerial}]</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الرقم التسلسلي الجديد المطلوب:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={newSerialInput}
                  onChange={(e) => setNewSerialInput(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-sm font-bold font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-center"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  سيقوم النظام تلقائياً بإعادة ترقيم باقي طلاب الحلقة تجنباً لأي تكرار.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSerialStudent(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  حفظ الرقم الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Student to Another Halaqah Modal */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-emerald-800" />
                <span>نقل الطالب إلى حلقة أخرى</span>
              </h3>
              <button onClick={() => setTransferringStudent(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{transferringStudent.fullName}</div>
                <div className="text-[11px] text-slate-500">
                  الحلقة الحالية:{' '}
                  <span className="font-semibold text-slate-800">
                    {halaqat.find((h) => h.id === transferringStudent.halaqahId)?.name}
                  </span>{' '}
                  (الرقم: [{transferringStudent.halaqahSerial}])
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اختر الحلقة الجديدة:</label>
                <select
                  value={targetHalaqahId}
                  onChange={(e) => setTargetHalaqahId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {halaqat
                    .filter((h) => h.id !== transferringStudent.halaqahId)
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} — المعلم: {h.teacherName}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-emerald-800 mt-1 block">
                  سيتم تعيين الرقم التسلسلي التالي تلقائياً في الحلقة الجديدة وإعادة ترقيم الحلقة القديمة.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferringStudent(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>تأكيد النقل الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Student Detailed Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'تعديل كامل لبيانات الطالب' : 'تسجيل طالب جديد في الحلقة'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الطالب الرباعي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الله بن محمد العتيبي"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الحلقة القرآنية:</label>
                  <select
                    value={formData.halaqahId}
                    onChange={(e) => {
                      const hId = e.target.value;
                      const targetH = halaqat.find((h) => h.id === hId);
                      setFormData({
                        ...formData,
                        halaqahId: hId,
                        stageId: targetH?.stageId || formData.stageId,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {halaqat.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرقم التسلسلي بالطالب:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.halaqahSerial}
                    onChange={(e) => setFormData({ ...formData, halaqahSerial: parseInt(e.target.value, 10) || 1 })}
                    className="w-full font-mono-numbers font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الجزء الحالي بالمصحف:</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.currentJuz}
                    onChange={(e) => setFormData({ ...formData, currentJuz: parseInt(e.target.value, 10) || 1 })}
                    className="w-full font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سنة الميلاد:</label>
                  <input
                    type="number"
                    min={2000}
                    max={2022}
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value, 10) || 2012 })}
                    className="w-full font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم ولي الأمر:</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم ولي الأمر الكامل"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">هاتف ولي الأمر:</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxxx (اتركه فارغاً إن لم يتوفر)"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">حالة القيد:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Student['status'] })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="active">منتظم ونشط</option>
                  <option value="inactive">منقطع / مؤجل</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'تسجيل الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
