import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATARS_CATALOG } from '../data/rewards';
import { GRADES, SECONDARY_STREAMS } from '../data/curriculum';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || 'sahnounredha89@gmail.com');
  const [currentScore, setCurrentScore] = useState<number>(user.currentScore);
  const [targetScore, setTargetScore] = useState<number>(user.targetScore);
  const [cycle, setCycle] = useState<'primary' | 'middle' | 'secondary'>(user.cycle);
  const [gradeId, setGradeId] = useState(user.gradeId);
  const [stream, setStream] = useState(user.stream);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [activeTab, setActiveTab] = useState<'info' | 'avatars' | 'inventory'>('info');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: UserProfile = {
      ...user,
      name,
      email,
      currentScore: Number(currentScore) || 10,
      targetScore: Number(targetScore) || 16,
      cycle,
      gradeId,
      stream,
      avatar: selectedAvatar,
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleCycleChange = (newCycle: 'primary' | 'middle' | 'secondary') => {
    setCycle(newCycle);
    if (newCycle === 'primary') {
      setGradeId('1AP');
      setStream('الطور الابتدائي');
    } else if (newCycle === 'middle') {
      setGradeId('1AM');
      setStream('الطور المتوسط');
    } else {
      setGradeId('1AS');
      setStream('علوم تجريبية');
    }
  };

  const scoreGap = (targetScore - currentScore).toFixed(2);

  return (
    <div className="no-print" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}>
              {selectedAvatar}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>الملف الشخصي للطالب</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.9 }}>
                {email} • {user.levelRank}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '4px 16px 0',
        }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '12px 18px',
              borderBottom: activeTab === 'info' ? '3px solid #059669' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'info' ? '#047857' : '#64748b',
              cursor: 'pointer',
            }}
          >
            البيانات والمعدل
          </button>
          <button
            onClick={() => setActiveTab('avatars')}
            style={{
              padding: '12px 18px',
              borderBottom: activeTab === 'avatars' ? '3px solid #059669' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'avatars' ? '#047857' : '#64748b',
              cursor: 'pointer',
            }}
          >
            صور الملف الشخصي ({user.unlockedAvatars?.length || 2})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '12px 18px',
              borderBottom: activeTab === 'inventory' ? '3px solid #059669' : '3px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'inventory' ? '#047857' : '#64748b',
              cursor: 'pointer',
            }}
          >
            خزنة الجوائز والبطاقات
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Google account connection */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                    حساب Google المعتمد
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    تم الحفظ والمزامنة المسبقة بعنوانك الإلكتروني
                  </div>
                </div>
                <div style={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}>
                  مفعل وآمن ✓
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  البريد الإلكتروني (Gmail):
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  اسم الطالب:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* GPA settings */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
              }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px', color: '#0f172a' }}>
                  تحديد ومتابعة المعدل الدراسي (من 20):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                      معدلي الحالي:
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={currentScore}
                      onChange={(e) => setCurrentScore(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 800,
                        textAlign: 'center',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#047857' }}>
                      المعدل المستهدف:
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={targetScore}
                      onChange={(e) => setTargetScore(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #059669',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 800,
                        textAlign: 'center',
                        color: '#047857',
                        background: '#f0fdf4',
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#475569',
                  background: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.6',
                }}>
                  {Number(scoreGap) > 0 ? (
                    <span>
                      🎯 يفصلك عن معدلك المنشود <b>{scoreGap} نقطة</b>. المواظبة على حل التمارين وتلخيص الدروس يومياً كفيل بتحقيق هذا الهدف!
                    </span>
                  ) : (
                    <span style={{ color: '#047857', fontWeight: 700 }}>
                      🌟 رائع! أنت تحقق معدلك المستهدف أو تتجاوزه. حافظ على هذا المستوى بالتدرب المستمر!
                    </span>
                  )}
                </div>
              </div>

              {/* Cycle & Grade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                    الطور التعليمي:
                  </label>
                  <select
                    value={cycle}
                    onChange={(e) => handleCycleChange(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="primary">🎒 الطور الابتدائي</option>
                    <option value="middle">🔥 الطور المتوسط (BEM)</option>
                    <option value="secondary">🎓 الطور الثانوي (البكالوريا)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                    السنة الدراسية:
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  >
                    {GRADES[cycle]?.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {cycle === 'secondary' && (
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 800, marginBottom: '6px', color: '#1e293b' }}>
                    الشعبة:
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 700,
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  >
                    {SECONDARY_STREAMS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'avatars' && (
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                اختر صورة ملفك الشخصي من الصور المفتوحة، أو افتح صوراً نادرة جديدة عند إتمام المهام والتحديات اليومية:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {AVATARS_CATALOG.map((av) => {
                  const isUnlocked = (user.unlockedAvatars || ['👨‍🎓', '👩‍🎓']).includes(av.avatarChar) || user.xp >= av.requiredXp;
                  const isSelected = selectedAvatar === av.avatarChar;

                  return (
                    <button
                      key={av.id}
                      onClick={() => {
                        if (isUnlocked) setSelectedAvatar(av.avatarChar);
                      }}
                      disabled={!isUnlocked}
                      style={{
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.55,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '6px' }}>
                        {av.avatarChar}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#047857' : '#1e293b' }}>
                        {av.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {isUnlocked ? 'متاح للاختيار ✓' : `يتطلب ${av.requiredXp} XP`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Streak Freezes */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '36px' }}>🧊</div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '15px' }}>
                      بطاقات تجميد السلسلة ({user.streakFreezes || 0})
                    </div>
                    <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                      تحمي أيام مواظبتك من الضياع إذا انشغلت يوماً ولم تدرس
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}>
                  {user.streakFreezes > 0 ? 'الحماية مفعلة' : 'احصل عليها من المهام'}
                </div>
              </div>

              {/* Badges and achievements */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
              }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px', color: '#0f172a' }}>
                  إحصائيات الإنجاز:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706' }}>{user.xp}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>إجمالي XP</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>{user.streak} يوم</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>أيام المواظبة</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>{user.bestStreak} يوم</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>أفضل سلسلة</div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '13px',
                color: '#92400e',
                lineHeight: '1.6',
              }}>
                💡 <b>كيف تحصل على المزيد من الجوائز؟</b>
                <br />
                أنجز مهام الحفظ اليومية، حل امتحاناً في بنك الفروض، أو أتم جلسة تركيز (بومودورو) لتحصل على بطاقات تجميد السلسلة وأفاتارات نادرة مجانية!
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {savedSuccess ? (
            <span style={{ color: '#047857', fontWeight: 800, fontSize: '14px' }}>
              تم حفظ التغييرات بنجاح ✓
            </span>
          ) : (
            <span style={{ color: '#64748b', fontSize: '13px' }}>
              سيتم تطبيق التعديلات فوراً
            </span>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
