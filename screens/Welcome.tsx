
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full flex flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 pt-12">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
          <span className="material-symbols-outlined text-white text-lg">pets</span>
        </div>
        <button 
          onClick={() => navigate('/home')}
          className="text-sm font-semibold text-white/90 hover:text-white"
        >
          跳过
        </button>
      </div>

      <div className="relative w-full h-[55%] shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDNu8fBxVtYmr59K2C6L4GI5E0ATpJoS-CEPt6ePEiqSN0v1F81UO4d338tmPGY-Z4sWwKT3EXER6fD5y4-Jxed1D9EZr7ugs59PmaBg_s7Ac6ZopN3N-TkXb6AEV7Biz27xh-jhIA86FmjL1GFakqBeP1lzGELG0ZYCBkvVPt3TthqpThb1eGzamz8_DydMFy7v-67MFynCvXchD-mo1WG5Hu-eCSvdvLi0ZNAajxJ7Q37flbMh_f93dmbB0ZKGY4A4CN2Fzf57xCG")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background-light dark:to-background-dark h-full w-full" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent" />
      </div>

      <div className="flex-1 flex flex-col justify-between px-6 pb-12 pt-2 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-text-main dark:text-white tracking-tight text-[32px] font-bold leading-[1.2] pb-3">
            发现无条件的爱
          </h1>
          <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-relaxed pb-6 max-w-[300px]">
            加入成千上万个幸福家庭。只需轻轻点击，即可浏览、结识并领养您身边的宠物。
          </p>
          <div className="flex flex-row items-center justify-center gap-3 py-4">
            <div className="h-2 w-8 rounded-full bg-primary shadow-sm shadow-primary/50" />
            <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        <div className="w-full flex justify-between gap-4 mb-6 px-2 overflow-x-auto no-scrollbar">
           <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div className="w-16 h-16 bg-cover rounded-2xl shadow-sm border-4 border-white" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmRs4LAni26mdxSDfX7AGK86JNRSKMKSmIwgLOni-EmYLWnrOoW7px6gdoxW4HDR_37iFYQvPhQZ77HtPiqyQmA_KT2RTcc0BqFR62G9rQ76TfXn_rdWcUXCZVkWuYItKOdqShOfITCE0nu2jSqqfkeI0uNGWL3uAYC4wdS5FqVVsNgnLDlGmxi0fnRT5KHdXAJ5vqoGLz17ynLvJmIV25TaM8ZWfSTaYhQbVxXsXQALwxubiCpJV4atU-wEo7Eew-eiKidhDFLR-a")'}} />
              <span className="text-[10px] font-bold">寻找伙伴</span>
           </div>
           <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div className="w-16 h-16 bg-cover rounded-2xl shadow-sm border-4 border-white" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArU5pKxKf1dT2l0JRhhNs6ewPGvWJsqpwSyotCHgxdQHYfTDHOyHADUjDnkyUpR-bBhcjBaVkmsYsfWHkJDVkaccQ8tq2Dscpsfx6bWHsARRqCoNDhPjyR0O-AzI4T7yfarnvNftA_BRXwi94wiCT790PasfdJwKgwSerMXdWzXiXI_u0QJqQz4ggoRBC7hhdqSPOb0oNJDTRKmnx3PCSzzhoYgVkSiteprjsOTb_pTjefyAw35pbsFq5rZPjJeZOtViV5wrP22z0a")'}} />
              <span className="text-[10px] font-bold">流程简单</span>
           </div>
           <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div className="w-16 h-16 bg-cover rounded-2xl shadow-sm border-4 border-white" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC-zgq3bpm1PQbsM8Wl8yyuJUP5_fgkPgI_s_DUEAeBeZiFNphIGnyhyFwqr6KhzL_oAsxL6x9jdBAuhdwXe-KeuyvOg5YJjbicdXEBSeb-oVqcQ7oF7rBWmjODxIRNr4nOgDHNQVBOZ5GGpSKB3XGvmm0uSg6K4RxiR1_5RNGx_F7QUfD1NQ4gHCX4nXgtEczdfdraroRq4omTRjqSGzxripoSu4IrpBM9myG9db_UTdu2rkFXuqaffpD3sQgX98LPXMx1QGEOyGlU")'}} />
              <span className="text-[10px] font-bold">拯救生命</span>
           </div>
        </div>

        <button 
          onClick={() => navigate('/register')}
          className="flex w-full items-center justify-center rounded-xl h-14 px-5 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all text-[#111817] text-base font-bold shadow-lg shadow-primary/25"
        >
          开始探索
          <span className="material-symbols-outlined ml-2 text-sm font-bold">arrow_forward</span>
        </button>
        <div className="flex justify-center items-center gap-1 mt-4">
          <span className="text-text-muted text-sm">已有账号？</span>
          <button 
            onClick={() => navigate('/login')}
            className="text-primary font-bold text-sm hover:underline"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
