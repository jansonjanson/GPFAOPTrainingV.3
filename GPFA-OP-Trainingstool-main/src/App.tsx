import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  HeartHandshake, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Info, 
  Bot, 
  Trophy, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  ArrowUp,
  BookOpen
} from 'lucide-react';
import { DiagnoseModule } from './modul_diagnose/DiagnoseModule';
import { AngstModule } from './modul_angst/AngstModule';
import PraeOpModule from '../modul_prae_op/src/App';
import PostOpModule from '../modul_post_op/src/App';
import { TrainingLandingPage } from './components/TrainingLandingPage';
import { CurriculumInfoModal } from './components/CurriculumInfoModal';
import { TrainingTutorialOverlay } from './components/TrainingTutorialOverlay';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { GlobalFloatingAI } from './components/GlobalFloatingAI';
import { AchievementsModal } from './components/AchievementsModal';
import { GlobalAchievementToast } from './components/GlobalAchievementToast';
import { FachhandbuchModal } from './components/FachhandbuchModal'; // HIER IST DER FEHLENDE IMPORT
import { 
  getLocal, 
  setLocal, 
  StorageKeys, 
  isModuleUnlocked, 
  isAdminUnlocked, 
  getUnlockedAchievementsCount, 
  resetEntireTrainingProgress 
} from './utils/gamification';

type ModuleType = 'hub' | 'diagnose' | 'angst' | 'prae_op' | 'post_op';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>(() => {
    return getLocal<ModuleType>(StorageKeys.ACTIVE_MODULE, 'hub');
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isFachhandbuchOpen, setIsFachhandbuchOpen] = useState(false); // NEUER STATE FÜR DAS HANDBUCH

  // Sync achievements counter & progression
  const [achievementsStats, setAchievementsStats] = useState(() => getUnlockedAchievementsCount());
  const [isAdmin, setIsAdmin] = useState(() => isAdminUnlocked());

  // First-run lifecycle
  useEffect(() => {
    const tutorialSeen = getLocal<boolean>(StorageKeys.TUTORIAL_SEEN, false);
    if (!tutorialSeen) {
      setIsInfoModalOpen(false);
      setIsTutorialOpen(true);
    }
  }, []);

  // Track achievements changes
  useEffect(() => {
    const updateStats = () => {
      setAchievementsStats(getUnlockedAchievementsCount());
      setIsAdmin(isAdminUnlocked());
    };
    window.addEventListener('storage', updateStats);
    const interval = setInterval(updateStats, 2000);
    return () => {
      window.removeEventListener('storage', updateStats);
      clearInterval(interval);
    };
  }, []);

  // Per-module scroll positions tracking
  const scrollPositions = React.useRef<Record<string, number>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectModule = (module: ModuleType) => {
    scrollPositions.current[activeModule] = window.scrollY;
    setActiveModule(module);
    setLocal(StorageKeys.ACTIVE_MODULE, module);
    setMobileMenuOpen(false);
    
    const targetPos = typeof scrollPositions.current[module] === 'number' ? scrollPositions.current[module] : 0;
    window.scrollTo({ top: targetPos, behavior: 'auto' });
    setTimeout(() => window.scrollTo({ top: targetPos, behavior: 'auto' }), 40);
  };

  const handleScrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleOpenInfoModal = () => { setIsTutorialOpen(false); setIsInfoModalOpen(true); };
  const handleCloseInfoModal = () => setIsInfoModalOpen(false);
  const handleOpenTutorial = () => { setIsInfoModalOpen(false); setIsTutorialOpen(true); };
  
  const handleCompleteTutorial = () => {
    setLocal(StorageKeys.TUTORIAL_SEEN, true);
    setLocal(StorageKeys.WELCOME_SEEN, true);
    setIsTutorialOpen(false);
    setIsInfoModalOpen(false);
    setActiveModule('hub');
    setLocal(StorageKeys.ACTIVE_MODULE, 'hub');
  };

  const handleCloseTutorial = () => {
    setLocal(StorageKeys.TUTORIAL_SEEN, true);
    setLocal(StorageKeys.WELCOME_SEEN, true);
    setIsTutorialOpen(false);
    setIsInfoModalOpen(false);
    setActiveModule('hub');
    setLocal(StorageKeys.ACTIVE_MODULE, 'hub');
  };

  const handleAdminUnlocked = () => {
    setIsAdmin(true);
    setAchievementsStats(getUnlockedAchievementsCount());
  };

  const handleConfirmReset = () => {
    resetEntireTrainingProgress();
    setIsAdmin(false);
    setAchievementsStats(getUnlockedAchievementsCount());
    setActiveModule('hub');
    setLocal(StorageKeys.ACTIVE_MODULE, 'hub');
    window.location.reload();
  };

  const m1Unlocked = isModuleUnlocked(1);
  const m2Unlocked = isModuleUnlocked(2);
  const m3Unlocked = isModuleUnlocked(3);
  const m4Unlocked = isModuleUnlocked(4);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 selection:bg-indigo-200">
      
      {/* MOBILE TOP BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-3 flex items-center justify-between border-b border-indigo-100 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">LE 3.4 OP-Trainingstool</h1>
            <span className="text-[10px] text-indigo-700 font-bold block leading-none">J. Rosenow M. A.</span>
          </div>
        </div>
        <button onClick={handleOpenInfoModal} className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm">
          <Info className="w-4 h-4" />
        </button>
      </header>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs lg:hidden" />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white/95 lg:bg-slate-50/95 backdrop-blur-xl text-slate-800 flex flex-col border-r border-indigo-100 shadow-xl transition-transform duration-300 ease-in-out ${(mobileMenuOpen || isTutorialOpen) ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-5 border-b border-indigo-100/80 flex-shrink-0 bg-gradient-to-b from-indigo-50/70 via-white to-transparent">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px] border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Generalistische Pflegeausbildung</span>
            </span>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => handleSelectModule('hub')} className="text-left w-full group mt-3 block cursor-pointer">
            <h2 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">LE 3.4 OP-Trainingstool</h2>
            <p className="text-xs font-bold text-indigo-700 tracking-wide mt-0.5">J. Rosenow M. A.</p>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-indigo-100">
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-indigo-950/60 block mb-2">Lernmodule (DS 1 bis 8)</span>
            
            <button onClick={() => handleSelectModule('hub')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeModule === 'hub' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'text-slate-700 hover:text-indigo-950 hover:bg-indigo-50/80'}`}>
              <div className="flex items-center space-x-2.5"><Layers className="w-4 h-4" /><span>Übersicht & Curriculum</span></div>
            </button>

            <button onClick={() => handleSelectModule('diagnose')} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all text-left cursor-pointer ${activeModule === 'diagnose' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-indigo-50/80'}`}>
              <div className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activeModule === 'diagnose' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}><Stethoscope className="w-4 h-4" /></div>
                <div><span className="font-bold block leading-tight">Modul 1: Diagnose</span><span className="text-[10px] block mt-0.5">DS 1 & DS 2   Beobachtung</span></div>
              </div>
            </button>

            <button disabled={!m2Unlocked} onClick={() => m2Unlocked && handleSelectModule('angst')} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all text-left ${!m2Unlocked ? 'text-slate-400 opacity-60 bg-slate-100/50' : activeModule === 'angst' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-blue-50/80 cursor-pointer'}`}>
              <div className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!m2Unlocked ? 'bg-slate-200' : activeModule === 'angst' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}><HeartHandshake className="w-4 h-4" /></div>
                <div><span className="font-bold block leading-tight">Modul 2: Angst vor OP</span><span className="text-[10px] block mt-0.5">DS 3 & DS 4   Psychosozial</span></div>
              </div>
              {!m2Unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <button disabled={!m3Unlocked} onClick={() => m3Unlocked && handleSelectModule('prae_op')} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all text-left ${!m3Unlocked ? 'text-slate-400 opacity-60 bg-slate-100/50' : activeModule === 'prae_op' ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-teal-50/80 cursor-pointer'}`}>
              <div className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!m3Unlocked ? 'bg-slate-200' : activeModule === 'prae_op' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}><ShieldCheck className="w-4 h-4" /></div>
                <div><span className="font-bold block leading-tight">Modul 3: Prä-OP</span><span className="text-[10px] block mt-0.5">DS 5 & DS 6   Vorbereitung</span></div>
              </div>
              {!m3Unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <button disabled={!m4Unlocked} onClick={() => m4Unlocked && handleSelectModule('post_op')} className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all text-left ${!m4Unlocked ? 'text-slate-400 opacity-60 bg-slate-100/50' : activeModule === 'post_op' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-emerald-50/80 cursor-pointer'}`}>
              <div className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!m4Unlocked ? 'bg-slate-200' : activeModule === 'post_op' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}><Activity className="w-4 h-4" /></div>
                <div><span className="font-bold block leading-tight">Modul 4: Post-OP</span><span className="text-[10px] block mt-0.5">DS 7 & DS 8   Aufwachraum</span></div>
              </div>
              {!m4Unlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-indigo-100/80">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-indigo-950/60 block mb-2">Didaktik & Assistenz</span>
            
            <button onClick={handleOpenInfoModal} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-indigo-50/80 transition-all cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"><Info className="w-4 h-4" /></div>
                <div className="text-left"><span className="font-bold block text-slate-900">Info & Curriculum</span></div>
              </div>
            </button>

            {/* HIER IST DER REPARIERTE FACHHANDBUCH BUTTON */}
            <button
              onClick={() => setIsFachhandbuchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-teal-50/80 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold block text-slate-900">Fachhandbuch</span>
                  <span className="text-[10px] text-slate-500 block">Wissensarchiv aller Module</span>
                </div>
              </div>
            </button>

            <button onClick={() => setIsAiOpen(!isAiOpen)} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-violet-50/80 hover:bg-violet-100/90 text-violet-950 transition-all cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                <div className="text-left"><span className="font-extrabold block text-violet-950">KI-Helfer</span></div>
              </div>
            </button>

            <button onClick={() => setIsAchievementsOpen(true)} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-amber-50/80 transition-all cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><Trophy className="w-4 h-4" /></div>
                <div className="text-left">
                  <span className="font-bold block text-slate-900">Erfolge & Nuggets</span>
                  <span className="text-[10px] text-slate-500 block">{achievementsStats.unlocked} von {achievementsStats.total}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="p-3.5 border-t border-indigo-100/80 bg-white/90 space-y-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsAdminModalOpen(true)} className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isAdmin ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
              {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Admin</span>
            </button>
            <button onClick={() => setIsResetModalOpen(true)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-xl cursor-pointer">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:pl-80 min-h-screen flex flex-col">
        <div className="hidden lg:flex items-center justify-between h-14 px-8 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-900 font-bold">LE 3.4 OP-Trainingstool</span>
            <span>/</span>
            <span className="text-indigo-600">Aktuelles Modul</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-500">Fallbeispiel: <strong>Frau Meinhardt</strong></span>
            <button onClick={handleOpenTutorial} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Tutorial</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {activeModule === 'hub' && <TrainingLandingPage onSelectModule={handleSelectModule} onOpenInfo={handleOpenInfoModal} onOpenTutorial={handleOpenTutorial} onOpenAiHelper={() => setIsAiOpen(true)} />}
          {activeModule === 'diagnose' && <DiagnoseModule onGoToModulAngst={() => handleSelectModule('angst')} onBackToHub={() => handleSelectModule('hub')} />}
          {activeModule === 'angst' && <AngstModule onBackToHub={() => handleSelectModule('hub')} onGoToModulPraeOp={() => handleSelectModule('prae_op')} />}
          {activeModule === 'prae_op' && <PraeOpModule onGoToModulPostOp={() => handleSelectModule('post_op')} />}
          {activeModule === 'post_op' && <PostOpModule />}
        </div>
      </main>

      {/* MODALS */}
      <CurriculumInfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} onStartModule={(mod) => { setIsInfoModalOpen(false); handleSelectModule(mod); }} onStartTutorial={handleOpenTutorial} />
      <TrainingTutorialOverlay isOpen={isTutorialOpen} onClose={handleCloseTutorial} onComplete={handleCompleteTutorial} />
      <AdminUnlockModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onAdminUnlocked={handleAdminUnlocked} />
      <ResetConfirmModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirmReset={handleConfirmReset} />
      
      <AchievementsModal 
        isOpen={isAchievementsOpen} 
        onClose={() => setIsAchievementsOpen(false)} 
        isFreeNav={isAdmin} 
        onToggleFreeNav={() => {}} 
        onResetAllProgress={handleConfirmReset} 
      />

      {/* HIER IST DIE EINBINDUNG DES FACHHANDBUCHS */}
      <FachhandbuchModal 
        isOpen={isFachhandbuchOpen} 
        onClose={() => setIsFachhandbuchOpen(false)} 
      />

      <GlobalFloatingAI isOpenControlled={isAiOpen} onToggleControlled={() => setIsAiOpen(!isAiOpen)} currentModuleTitle="Trainingstool" />
      <GlobalAchievementToast />

      {showScrollTop && (
        <button onClick={handleScrollToTop} className="fixed bottom-6 right-20 z-40 p-3 bg-white hover:bg-slate-50 text-indigo-700 rounded-2xl shadow-xl border border-indigo-100 cursor-pointer">
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
