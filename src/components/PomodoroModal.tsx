import React, { useState, useEffect } from 'react';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isActive && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      setIsActive(false);
      setIsCompleted(true);
      onComplete();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, seconds, onComplete]);

  if (!isOpen) return null;

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="no-print" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px',
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '20px',
        padding: '28px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ fontSize: '38px', marginBottom: '8px' }}>⏱️</div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>
          تحدي التركيز (بومودورو 25 دقيقة)
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px', lineHeight: '1.6' }}>
          ادرس بتركيز كامل دون أي تشتيت، واكسب 50 نقطة XP وفرصة الحصول على بطاقة تجميد السلسلة!
        </p>

        <div style={{
          fontSize: '3.4em',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: isActive ? '#dc2626' : '#0f172a',
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '18px 0',
          marginBottom: '20px',
          border: '2px dashed #cbd5e1',
        }}>
          {formatTime(seconds)}
        </div>

        {isCompleted && (
          <div style={{
            background: '#ecfdf5',
            color: '#047857',
            padding: '12px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            مبروك! أنهيت جلسة التركيز بنجاح وحصلت على +50 XP!
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {!isActive ? (
            <button
              onClick={() => {
                setIsActive(true);
                setIsCompleted(false);
              }}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ابدأ الجلسة
            </button>
          ) : (
            <button
              onClick={() => setIsActive(false)}
              style={{
                background: '#fef2f2',
                border: '1px solid #f87171',
                color: '#dc2626',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              إيقاف مؤقت
            </button>
          )}

          <button
            onClick={() => {
              setIsActive(false);
              setSeconds(1500);
              setIsCompleted(false);
            }}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            إعادة تعيين (25 د)
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSeconds(300);
              setIsCompleted(false);
            }}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            استراحة (5 د)
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          إغلاق النافذة
        </button>
      </div>
    </div>
  );
};
