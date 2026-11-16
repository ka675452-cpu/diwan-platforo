import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, CheckCircle2, Delete, Sparkles, KeyRound } from 'lucide-react';
import emblemImg from '../assets/images/halaqat_badge_emblem_1792392345633.jpg';

interface DirectorPinLockScreenProps {
  onUnlock: () => void;
}

const CORRECT_PIN = '3421';

export const DirectorPinLockScreen: React.FC<DirectorPinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isSuccess) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isSuccess) {
      setPin(pin.slice(0, -1));
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setPin('');
      setErrorMsg(null);
    }
  };

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === CORRECT_PIN) {
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setIsShaking(true);
      setErrorMsg('رمز المرور غير صحيح! يرجى إدخال الرمز السري المعتمد.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 900);
    }
  };

  // Allow physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black text-white p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Mosque Emblem & Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative">
            <img
              src={emblemImg}
              alt="شعار حلقات ابن باز"
              className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-emerald-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>نظام حلقات ابن باز المعتمد</span>
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              بوابة تسجيل دخول مدير الحلقات
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              النظام مخصص حصرياً لمدير الحلقات فقط، أدخل رمز المرور (PIN)
            </p>
          </div>
        </div>

        {/* PIN Dots Display */}
        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            {isSuccess ? (
              <Unlock className="w-4 h-4 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>{isSuccess ? 'تم التحقق بنجاح!' : 'أدخل رمز المرور المكون من 4 أرقام:'}</span>
          </div>

          {/* 4 PIN indicators */}
          <div
            className={`flex items-center justify-center gap-4 transition-transform duration-200 ${
              isShaking ? 'translate-x-[-10px] animate-pulse' : ''
            }`}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 border-2 ${
                    isSuccess
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 scale-105'
                      : isFilled
                      ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-400 shadow-md shadow-emerald-900/30'
                      : 'border-slate-800 bg-slate-950/60 text-slate-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Error / Success message banner */}
          <div className="min-h-[28px] flex items-center justify-center w-full">
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-fadeIn">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium text-center">{errorMsg}</span>
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold text-center">أهلاً وسهلاً بك يا مدير الحلقات، جاري فتح اللوحة...</span>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                disabled={isSuccess}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold font-mono text-white transition-all shadow-md cursor-pointer border border-slate-700/60 flex items-center justify-center disabled:opacity-50"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={isSuccess || pin.length === 0}
              className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-xs font-semibold text-slate-400 transition-all cursor-pointer flex items-center justify-center disabled:opacity-30"
              title="مسح الكل"
            >
              مسح
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              disabled={isSuccess}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold font-mono text-white transition-all shadow-md cursor-pointer border border-slate-700/60 flex items-center justify-center disabled:opacity-50"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSuccess || pin.length === 0}
              className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-slate-300 transition-all cursor-pointer flex items-center justify-center disabled:opacity-30"
              title="حذف رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Secure access notice */}
          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>تسجيل دخول مشفر وآمن مخصص لمدير الحلقات</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
