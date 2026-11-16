import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  BellRing,
  Send,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Edit3,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { Student } from '../types';
import { generateParentAlertMessage } from '../services/telegramParser';
import { hasValidGuardianPhone } from '../data/mockData';

export const GuardianAlerts: React.FC = () => {
  const {
    students,
    halaqat,
    attendance,
    selectedDate,
    requestSendSingleParentAlert,
    requestSendAllAbsentAlerts,
    openBulkWhatsAppModal,
    todayAbsentsCount,
    setStudentAttendance,
    openDirectWhatsApp,
    logs,
    deleteLog,
    clearLogs,
    openDeleteConfirm,
    showGlobalNotification,
  } = useHalaqat();

  const [activeSubTab, setActiveSubTab] = useState<'current_absents' | 'sent_history'>('current_absents');

  // Absent students for selected date
  const absentRecords = attendance.filter((a) => a.date === selectedDate && a.status === 'absent');
  const absentStudents = absentRecords
    .map((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const halaqah = student ? halaqat.find((h) => h.id === student.halaqahId) : null;
      return {
        record: rec,
        student,
        halaqah,
      };
    })
    .filter((item) => item.student != null);

  // Sent parent alerts logs
  const parentLogs = logs.filter((l) => l.type === 'parent_alert');

  const handleSendSingle = (studentId: string) => {
    requestSendSingleParentAlert(studentId);
  };

  const handleSendAll = () => {
    openBulkWhatsAppModal();
  };

  const handleMarkPresent = (student: Student) => {
    setStudentAttendance(student.id, 'present');
    showGlobalNotification(`تم تعديل حالة الطالب "${student.fullName}" إلى حاضر بنجاح ✅`, 'success');
  };

  const handleDeleteAbsenceRecord = (student: Student, halaqahName: string) => {
    openDeleteConfirm(
      {
        id: student.id,
        name: student.fullName,
        type: 'student',
        subtext: `حذف قيد الغياب المسجل لتاريخ: ${selectedDate} · ${halaqahName}`,
        details: {
          'اسم ولي الأمر': student.guardianName,
          'رقم الجوال': hasValidGuardianPhone(student.guardianPhone) ? student.guardianPhone : 'لا يوجد رقم',
          'الحلقة': halaqahName,
          'التاريخ': selectedDate,
        },
      },
      () => {
        setStudentAttendance(student.id, 'present');
        showGlobalNotification(`تم حذف سجل غياب الطالب "${student.fullName}" وإعادته لقائمة الحضور 🗑️`, 'info');
      }
    );
  };

  const handleDeleteLogItem = (logId: string, recipientName: string) => {
    openDeleteConfirm(
      {
        id: logId,
        name: `سجل إشعار ولي الأمر: ${recipientName}`,
        type: 'preset',
        subtext: 'حذف هذا السجل نهائياً من أرشيف الرسائل المرسلة',
        details: {
          'المستلم': recipientName,
          'معرّف الرسالة': logId,
        },
      },
      () => {
        deleteLog(logId);
        showGlobalNotification(`تم حذف سجل الإشعار بنجاح 🗑️`, 'info');
      }
    );
  };

  const handleClearAllParentLogs = () => {
    openDeleteConfirm(
      {
        id: 'all_parent_logs',
        name: 'كافة سجلات إشعارات أولياء الأمور',
        type: 'preset',
        subtext: `سيتم مسح عدد (${parentLogs.length}) إشعار من الأرشيف`,
      },
      () => {
        clearLogs('parent_alert');
        showGlobalNotification(`تم تفريغ أرشيف إشعارات أولياء الأمور بالكامل 🗑️`, 'info');
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-800" />
            <span>إشعارات وتنبيهات أولياء الأمور (تحكم المدير المباشر)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              تعديل وحذف متاح 👑
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إرسال تنبيهات الغياب الآلية عبر بوت الواتساب، تعديل حالة الحضور، وحذف سجلات الإشعارات بتأكيد أمني.
          </p>
        </div>

        {absentStudents.length > 0 && activeSubTab === 'current_absents' && (
          <button
            onClick={handleSendAll}
            className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 border border-emerald-400/30"
            title="الإرسال الجماعي الفوري لكافة الغائبين من الطلاب والمعلمين عبر الواتساب"
          >
            <Send className="w-4 h-4 -rotate-45" />
            <span>إرسال للجميع (واتساب الغائبين) ({todayAbsentsCount}) 🚀</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher: Current Absents vs Sent History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('current_absents')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'current_absents'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>الطلاب الغائبون اليوم ({absentStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sent_history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'sent_history'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>أرشيف وسجل الرسائل المرسلة ({parentLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Current Absent Students */}
      {activeSubTab === 'current_absents' && (
        <>
          {absentStudents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">لا يوجد غياب مسجل لتاريخ اليوم!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ما شاء الله، جميع الطلاب حاضرون أو لم يتم رصد غياب بعد لتاريخ {selectedDate}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {absentStudents.map(({ record, student, halaqah }) => {
                if (!student || !halaqah) return null;
                const isNotified = Boolean(record.parentNotified);

                return (
                  <div
                    key={student.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold text-xs font-mono-numbers shrink-0">
                          {student.halaqahSerial.toString().padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{student.fullName}</h3>
                          <div className="text-[11px] text-slate-500">{halaqah.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isNotified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isNotified ? 'تم الإشعار ✓' : 'بانتظار الإرسال'}
                        </span>

                        {/* Delete absence record button */}
                        <button
                          onClick={() => handleDeleteAbsenceRecord(student, halaqah.name)}
                          className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف سجل الغياب لهذا الطالب وإعادته للحضور"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ولي الأمر:</span>
                        <span className="font-semibold text-slate-800">{student.guardianName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">رقم الهاتف:</span>
                        {hasValidGuardianPhone(student.guardianPhone) ? (
                          <span className="font-mono-numbers text-slate-800 font-bold" dir="ltr">
                            {student.guardianPhone}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>لا يوجد رقم</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message preview snippet */}
                    <div className="text-[11px] text-slate-500 bg-slate-100/50 p-2 rounded border border-slate-200/50 line-clamp-2">
                      "وعليكم السلام ورحمة الله وبركاته، نود إفادتكم بتسجيل غياب ابنكم {student.fullName} عن حلقة{' '}
                      {halaqah.name} لهذا اليوم..."
                    </div>

                    {/* Actions: Direct WhatsApp OR Preview Modal OR Modify to Present */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      {hasValidGuardianPhone(student.guardianPhone) ? (
                        <button
                          onClick={() => {
                            const msg = generateParentAlertMessage(student, halaqah, selectedDate);
                            openDirectWhatsApp(student.guardianPhone, msg);
                          }}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          title={`فتح محادثة الواتساب لرقم ولي الأمر (${student.guardianPhone}) مباشرة`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>فتح واتساب مباشر 📲</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            showGlobalNotification(
                              `لا يوجد رقم تواصل مسجل للطالب "${student.fullName}"، يمكنك إضافة الرقم من صفحة التحضير الذكي أو سجل الطلاب.`,
                              'error'
                            )
                          }
                          className="py-2 px-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                          title="لا يوجد رقم تواصل مسجل لهذا الطالب"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>لا يوجد رقم</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSendSingle(student.id)}
                        className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                        title="معاينة وتعديل نص التنبيه ثم إرساله لولي الأمر بالواتساب"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>معاينة وتأكيد 🚀</span>
                      </button>

                      <button
                        onClick={() => handleMarkPresent(student)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                        title="تعديل حالة الطالب مباشرة إلى حاضر"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>حاضر</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Sent History & Logs Management with Delete Confirmation */}
      {activeSubTab === 'sent_history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700">
              سجل الرسائل المرسلة لأولياء الأمور عبر بوت الواتساب:
            </h2>
            {parentLogs.length > 0 && (
              <button
                onClick={handleClearAllParentLogs}
                className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                title="تفريغ كافة سجلات إشعارات أولياء الأمور"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ الأرشيف بالكامل</span>
              </button>
            )}
          </div>

          {parentLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">لا توجد رسائل سابقة مرسلة لأولياء الأمور في الأرشيف.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {parentLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {log.recipientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-numbers">
                          ({log.recipient})
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.2 rounded font-semibold">
                          تم التسليم ✓✓
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {log.text}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono-numbers">
                        وقت الإرسال: {log.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Delete individual log with confirmation */}
                  <button
                    onClick={() => handleDeleteLogItem(log.id, log.recipientName)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="حذف هذا السجل من الأرشيف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
