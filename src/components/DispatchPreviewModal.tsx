import React, { useState, useEffect } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  X,
  Share2,
  Send,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { hasValidGuardianPhone } from '../data/mockData';

export const DispatchPreviewModal: React.FC = () => {
  const {
    dispatchPreviewConfig,
    closeDispatchPreview,
    openDirectWhatsApp,
    formattedSelectedDateArabic,
    showGlobalNotification,
  } = useHalaqat();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (dispatchPreviewConfig?.messageText) {
      setMessageText(dispatchPreviewConfig.messageText);
    }
  }, [dispatchPreviewConfig]);

  if (!dispatchPreviewConfig || !dispatchPreviewConfig.isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      await dispatchPreviewConfig.onConfirm(messageText);
      closeDispatchPreview();
    } catch (err: any) {
      showGlobalNotification(`تعذر إرسال التقرير: ${err?.message || 'خطأ غير متوقع'}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDirectWhatsApp = () => {
    const targetPhone = dispatchPreviewConfig.phone || '';
    if (!hasValidGuardianPhone(targetPhone)) {
      showGlobalNotification('لا يوجد رقم تواصل مسجل لهذا المستلم. يرجى إضافة الرقم أو نسخ الرسالة يدوياً.', 'error');
      return;
    }
    openDirectWhatsApp(targetPhone, messageText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showGlobalNotification('تم نسخ نص التقرير للحافظة بنجاح 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetToOriginal = () => {
    if (dispatchPreviewConfig.initialOriginalText) {
      setMessageText(dispatchPreviewConfig.initialOriginalText);
      showGlobalNotification('تمت استعادة النص الأصلي للتقرير ✓', 'info');
    }
  };

  const isGroup = dispatchPreviewConfig.recipientType === 'group';
  const isBatch = dispatchPreviewConfig.recipientType === 'batch_parents';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
              {isGroup ? (
                <Share2 className="w-5 h-5 text-emerald-300" />
              ) : isBatch ? (
                <BellRing className="w-5 h-5 text-rose-300" />
              ) : (
                <MessageSquare className="w-5 h-5 text-sky-300" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {dispatchPreviewConfig.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-emerald-200">
                <span>{formattedSelectedDateArabic}</span>
                <span>•</span>
                <span>{dispatchPreviewConfig.recipientLabel}</span>
              </div>
            </div>
          </div>

          <button
            onClick={closeDispatchPreview}
            disabled={isSending}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold">المستلم:</span>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md text-[11px]">
              {dispatchPreviewConfig.recipientLabel}
            </span>
            {hasValidGuardianPhone(dispatchPreviewConfig.phone) ? (
              <span className="font-mono text-slate-600 text-[11px]" dir="ltr">
                ({dispatchPreviewConfig.phone})
              </span>
            ) : dispatchPreviewConfig.recipientType === 'parent' ? (
              <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                ⚠️ لا يوجد رقم
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ ✓' : 'نسخ النص'}</span>
            </button>

            {dispatchPreviewConfig.initialOriginalText && (
              <button
                onClick={handleResetToOriginal}
                type="button"
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="إعادة النص إلى صيغته الأصلية قبل التعديل"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الأصل</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea Editor Area */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>نص البيان / التقرير (قابل للمراجعة والتعديل الفوري):</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {messageText.length} حرفاً
              </span>
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={12}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all font-medium"
              placeholder="اكتب أو عدّل نص التقرير هنا..."
            />
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              يمكنك تعديل أي جزء من نص التقرير قبل الإرسال. بالضغط على &quot;بث وإرسال الآن&quot; سيتم إرسال التقرير واعتماده، كما يمكنك فتحه مباشرة في محادثة الواتساب.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDirectWhatsApp}
              type="button"
              disabled={isSending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح واتساب مباشر 📲</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={closeDispatchPreview}
              disabled={isSending}
              type="button"
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSending || !messageText.trim()}
              type="button"
              className="px-5 py-2 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الإرسال والبث...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 -rotate-45" />
                  <span>بث وإرسال الآن 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
