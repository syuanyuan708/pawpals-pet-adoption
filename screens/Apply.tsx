
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PETS } from '../constants';
import type { Pet } from '../types';
import { getPetById } from '../src/services/pets.service';
import { submitApplication, type ApplicationFormData } from '../src/services/applications.service';
import { sendUserMessage } from '../src/services/messages.service';
import { useAuth } from '../src/contexts/AuthContext';

interface FormData {
  name: string;
  phone: string;
  city: string;
  houseType: 'own' | 'rent' | '';
  hasExperience: boolean | null;
  hasChildren: boolean | null;
  hasAllergies: boolean | null;
  agreedToTerms: boolean;
}

const Apply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    city: '',
    houseType: '',
    hasExperience: null,
    hasChildren: null,
    hasAllergies: null,
    agreedToTerms: false,
  });

  // 加载宠物信息
  useEffect(() => {
    const loadPet = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getPetById(id);
        if (data) {
          setPet(data);
        } else {
          const mockPet = MOCK_PETS.find(p => p.id === id);
          setPet(mockPet || null);
        }
      } catch (err) {
        const mockPet = MOCK_PETS.find(p => p.id === id);
        setPet(mockPet || null);
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [id]);

  // 预填用户名
  useEffect(() => {
    if (user && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="p-10 text-center">
        <p className="text-text-muted mb-4">未找到该宠物信息</p>
        <button onClick={() => navigate('/home')} className="text-primary font-bold">返回首页</button>
      </div>
    );
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.houseType) {
        alert('请完整填写基本信息');
        return;
      }
    }
    if (step === 2) {
      if (formData.hasExperience === null || formData.hasAllergies === null) {
        alert('请回答环境评估问题');
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      alert('请先阅读并同意领养协议');
      return;
    }

    if (!user) {
      alert('请先登录后再提交申请');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      // 提交申请
      await submitApplication({
        petId: pet.id,
        applicantName: formData.name,
        phone: formData.phone,
        city: formData.city,
        houseType: formData.houseType,
        hasExperience: formData.hasExperience,
        hasChildren: formData.hasChildren,
        hasAllergies: formData.hasAllergies,
        agreedToTerms: formData.agreedToTerms
      });

      // 发送通知消息
      try {
        await sendUserMessage(
          user.id,
          pet.shelter.owner,
          pet.shelter.avatar,
          `🎉 恭喜！您领养 ${pet.name} 的申请已提交成功。我们将于近期为您办理领养手续。`
        );
      } catch (msgErr) {
        console.error('发送消息失败:', msgErr);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('提交申请失败:', err);
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background-light dark:bg-background-dark px-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30 scale-110">
          <span className="material-symbols-outlined text-white text-5xl font-bold">check</span>
        </div>
        <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2">申请已提交！</h1>
        <p className="text-text-muted dark:text-gray-400 mb-10 leading-relaxed">
          您的领养申请已成功发送给 <b>{pet.shelter.name}</b>。<br />
          负责人 <b>{pet.shelter.owner}</b> 将在 24 小时内与您联系。
        </p>
        <div className="w-full space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 bg-primary text-primary-content font-bold rounded-2xl shadow-md hover:opacity-90 transition-all"
          >
            返回首页
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="w-full py-4 bg-white dark:bg-surface-dark text-text-main dark:text-white font-bold rounded-2xl border border-gray-100 dark:border-white/10 transition-all"
          >
            查看消息通知
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background-light dark:bg-background-dark overflow-hidden relative z-[60]">
      {/* 1. 固定顶部导航 */}
      <header className="shrink-0 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center">
        <button
          onClick={handlePrev}
          className="mr-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-main dark:text-white"
        >
          <span className="material-symbols-outlined block text-2xl">
            {step === 1 ? 'close' : 'arrow_back'}
          </span>
        </button>
        <h1 className="text-lg font-bold text-text-main dark:text-white flex-1 text-center pr-10">
          领养 {pet.name}
        </h1>
      </header>

      {/* 2. 可滚动内容区 */}
      <main className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar">
        {/* 进度指示 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex justify-between items-end">
            <span className="text-text-main dark:text-white text-sm font-black tracking-tighter">第 {step} 步 / 3</span>
            <span className="text-text-muted dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
              {step === 1 ? '基础资料' : step === 2 ? '环境评估' : '领养承诺'}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(250,198,56,0.4)]"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="pb-10">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">联系人信息</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                    placeholder="您的真实姓名"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                    placeholder="联系电话 (11位手机号)"
                  />
                </div>
              </section>

              <section className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">home</span>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">居住环境</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, houseType: 'own' })}
                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all ${formData.houseType === 'own' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-white dark:bg-slate-800 text-text-muted dark:text-gray-400'}`}
                  >
                    <span className="material-symbols-outlined text-3xl">key</span>
                    <span className="font-bold text-sm">自有住房</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, houseType: 'rent' })}
                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all ${formData.houseType === 'rent' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-white dark:bg-slate-800 text-text-muted dark:text-gray-400'}`}
                  >
                    <span className="material-symbols-outlined text-3xl">apartment</span>
                    <span className="font-bold text-sm">租赁住房</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">是否有过养宠经验？</h3>
                <div className="flex gap-3">
                  {[{ label: '有经验', v: true }, { label: '小白上手', v: false }].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setFormData({ ...formData, hasExperience: opt.v })}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${formData.hasExperience === opt.v ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-transparent text-text-muted'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">家里是否有过敏成员？</h3>
                <div className="flex gap-3">
                  {[{ label: '有', v: true }, { label: '无', v: false }].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setFormData({ ...formData, hasAllergies: opt.v })}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${formData.hasAllergies === opt.v ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-transparent text-text-muted'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">领养电子协议</h3>
                <div className="space-y-4 text-sm text-text-muted dark:text-gray-400 leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <p>• 承诺提供充足的食物、纯净的饮水和安全的居住环境。</p>
                  <p>• 承诺不因搬家、生育、出差等理由随意遗弃宠物。</p>
                  <p>• 承诺若确实无法继续饲养，必须联系原送养机构退回。</p>
                  <p>• 承诺接受送养方的定期回访。</p>
                  <div className="h-px bg-gray-100 dark:bg-slate-700 my-4" />
                  <p className="text-xs italic">提交申请即代表您已深思熟虑，并愿意承担起照顾一个生命的责任。</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-5 bg-primary/5 border border-primary/20 rounded-2xl cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm font-bold text-text-main dark:text-white leading-snug">
                  我已满18周岁，具有独立经济能力，且全家人均知情并同意领养。
                </span>
              </label>
            </div>
          )}
        </div>
      </main>

      {/* 3. 固定底部按钮栏 */}
      <footer className="shrink-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 p-4 pb-safe shadow-[0_-8px_20px_rgba(0,0,0,0.05)] relative z-[70]">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              disabled={submitting}
              className="flex-1 h-14 rounded-2xl font-bold text-text-main dark:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              上一步
            </button>
          )}
          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={submitting}
            className={`h-14 rounded-2xl font-bold text-primary-content shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${step === 1 ? 'w-full' : 'flex-[2]'} bg-primary hover:opacity-95 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span className="font-bold text-lg">
                  {step === 3 ? '提交领养申请' : '下一步'}
                </span>
                <span className="material-symbols-outlined text-[20px] font-bold">
                  {step === 3 ? 'send' : 'arrow_forward'}
                </span>
              </>
            )}
          </button>
        </div>
      </footer>

      <style>{`
        .pb-safe { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 24px)); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        @keyframes slideInFromBottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation: slideInFromBottom 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Apply;
