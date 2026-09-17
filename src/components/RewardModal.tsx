import React from 'react';
import { RewardResult } from '../data/rewards';

interface RewardModalProps {
  reward: RewardResult | null;
  onClose: () => void;
  onEquipAvatar?: (avatarChar: string) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  reward,
  onClose,
  onEquipAvatar,
}) => {
  if (!reward) return null;

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
        maxWidth: '420px',
        borderRadius: '24px',
        padding: '30px 24px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        animation: 'reward-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        {/* Animated Badge Icon */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: reward.type === 'freeze' ? '#eff6ff' : reward.type === 'avatar' ? '#fdf2f8' : '#fffbeb',
          border: `3px solid ${reward.type === 'freeze' ? '#3b82f6' : reward.type === 'avatar' ? '#ec4899' : '#f59e0b'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '44px',
          margin: '0 auto 18px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        }}>
          {reward.icon}
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
          {reward.title}
        </h3>

        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: '0 0 24px' }}>
          {reward.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reward.type === 'avatar' && onEquipAvatar && (
            <button
              onClick={() => {
                onEquipAvatar(reward.value);
                onClose();
              }}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              }}
            >
              تعيين كصورة ملفي الشخصي الآن
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: reward.type === 'avatar' ? '#f1f5f9' : '#059669',
              color: reward.type === 'avatar' ? '#475569' : '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: reward.type === 'avatar' ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
            }}
          >
            استلام ومتابعة الدراسة
          </button>
        </div>
      </div>
    </div>
  );
};
