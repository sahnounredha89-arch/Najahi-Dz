import React, { useState } from 'react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'live_camera' | 'gallery' | 'microphone') => void;
  defaultType?: 'camera' | 'microphone' | 'all';
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  defaultType = 'all',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAllow = (action: 'live_camera' | 'gallery' | 'microphone') => {
    // Request actual browser media permission if supported
    if (action === 'live_camera' || action === 'microphone') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: action === 'live_camera',
          audio: action === 'microphone',
        }).then((stream) => {
          // Permission granted! Stop test track immediately
          stream.getTracks().forEach(t => t.stop());
        }).catch((err) => {
          console.warn("User permission response:", err);
        });
      }
    }
    onSelectAction(action);
    onClose();
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
        maxWidth: '480px',
        borderRadius: '20px',
        padding: '24px',
        textAlign: 'right',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: '#ecfdf5',
            color: '#059669',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {defaultType === 'microphone' ? '🎙️' : '📷'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              إذن استخدام الكاميرا والميكروفون
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              منصة نجاحي AI للدراسة الذكية
            </p>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', marginBottom: '20px' }}>
          هل تسمح لـ <b>نجاحي AI</b> باستخدام الكاميرا والميكروفون لقراءة وتلخيص دروسك وحل التمارين صوتياً ومرئياً؟
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {defaultType !== 'microphone' && (
            <>
              <button
                onClick={() => handleAllow('live_camera')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid #059669',
                  background: '#f0fdf4',
                  color: '#047857',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: '20px' }}>📸</span>
                <div>
                  <div style={{ fontWeight: 800 }}>التقاط صورة جديدة بالكاميرا الآن</div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 500 }}>تصوير صفحة الكتاب أو الكراس مباشرة لتحليلها</div>
                </div>
              </button>

              <button
                onClick={() => handleAllow('gallery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: '20px' }}>🖼️</span>
                <div>
                  <div style={{ fontWeight: 800 }}>اختيار صورة مصورة سابقاً (المعرض)</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>تحديد صورة محفوظة مسبقاً في هاتفك أو جهازك</div>
                </div>
              </button>
            </>
          )}

          {(defaultType === 'microphone' || defaultType === 'all') && (
            <button
              onClick={() => handleAllow('microphone')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: defaultType === 'microphone' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: defaultType === 'microphone' ? '#eff6ff' : '#ffffff',
                color: defaultType === 'microphone' ? '#1d4ed8' : '#1e293b',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: '20px' }}>🎙️</span>
              <div>
                <div style={{ fontWeight: 800 }}>السماح بالميكروفون للتحدث مع الأستاذ</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>طرح الأسئلة بصوتك والاستماع لشرح الأستاذ ذكي</div>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
