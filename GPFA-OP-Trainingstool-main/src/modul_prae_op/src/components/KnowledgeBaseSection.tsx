import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Activity, Utensils, Bath, ClipboardCheck, Trophy, BookOpen, FileText, AlertCircle, TestTube, ChevronDown, CheckCircle, ArrowRight, RotateCcw, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Section } from '../types';
import NavigationButtons from './NavigationButtons';
import { playSound } from '../utils/audio';
import ModuleMeta from './ModuleMeta';

interface Props {
  onNavigate: (section: Section) => void;
  onNuggetComplete: (index: number) => void;
  completedNuggets: Record<number, boolean>;
  onAchievement?: (title: string, desc: string) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function LearningNugget({ title, children, isVisible }: { title: string, children: React.ReactNode, isVisible: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/50 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-teal-900 bg-teal-100/50 hover:bg-teal-200 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <span>Learning Nugget: {title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-teal-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 text-sm text-slate-700 leading-relaxed bg-white border-t border-teal-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizFeedback({ status, feedback, onRetry }: { status: 'idle' | 'correct' | 'incorrect', feedback: string | React.ReactNode, onRetry?: () => void }) {
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 10, height: 0 }} 
          animate={{ opacity: 1, y: 0, height: 'auto' }} 
          exit={{ opacity: 0, y: 10, height: 0 }}
          className="mt-4 overflow-hidden relative z-10"
        >
          <div className={`p-4 rounded-xl border-2 flex flex-col space-y-3 text-sm font-medium ${
            status === 'correct' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {status === 'correct' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>{feedback}</div>
            </div>
            {onRetry && (
              <div className="flex justify-end mt-2">
                <button 
                  onClick={onRetry}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    status === 'correct' 
                      ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-900' 
                      : 'bg-rose-200 hover:bg-rose-300 text-rose-900'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Wiederholen</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- QUIZZES ---

function QuizScenario2({ onComplete, isDone }: { onComplete: () => void, isDone: boolean }) {
  const [selected, setSelected] = useState<string | null>(isDone ? 'b' : null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>(isDone ? 'correct' : 'idle');
  
  const options = useMemo(() => [
    { id: 'a', text: 'Ich händige der Patientin den Bogen aus, erkläre kurz den Ablauf und lasse sie unterschreiben.' },
    { id: 'b', text: 'Ich weigere mich. Das ärztliche Aufklärungsgespräch ist nicht an Pflegefachkräfte delegierbar. Zudem fehlt die gesetzliche Bedenkzeit.' },
    { id: 'c', text: 'Ich informiere die Pflegedienstleitung und verschiebe die Operation eigenmächtig auf morgen.' }
  ], []);
  
  const [shuffledOptions, setShuffledOptions] = useState(isDone ? options : shuffleArray([...options]));

  const checkAnswer = () => {
    if (selected === 'b') {
      setStatus('correct');
      onComplete();
    } else {
      setStatus('incorrect');
      playSound('error');
    }
  };

  const retry = () => {
    setStatus('idle');
    setSelected(null);
    setShuffledOptions(shuffleArray([...options]));
  };

  return (
    <div className="mt-6 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-start space-x-3 text-indigo-800 font-semibold mb-4">
        <Brain className="w-8 h-8 text-indigo-600 flex-shrink-0" />
        <span className="mt-1">Rechtliches Szenario 2: Ärztliche Aufklärung</span>
      </div>
      <div className="mb-6">
        <p className="font-medium text-slate-800 mb-2">Ihnen fällt auf, dass eine Patientin, die für heute zu einer elektiven Operation geplant ist, noch nicht aufgeklärt wurde. Telefonisch teilt Ihnen der zuständige Oberarzt mit, dass er gerade im OP steht. Sie sollen der Patientin den Aufklärungsbogen aushändigen, kurz erklären was passiert und sie unterschreiben lassen. Wie reagieren Sie korrekt?</p>
        <div className="space-y-2 mt-4">
          {shuffledOptions.map(opt => (
            <div 
              key={opt.id} 
              onClick={() => { if (status !== 'correct') { setSelected(opt.id); setStatus('idle'); } }}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all transform hover:-translate-y-0.5 ${selected === opt.id ? 'border-indigo-500 bg-indigo-100 text-indigo-900 font-medium' : 'border-slate-200 bg-white text-slate-700'}`}
            >{opt.text}</div>
          ))}
        </div>
      </div>
      {status !== 'correct' && (
        <button onClick={checkAnswer} disabled={!selected} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer">Antwort prüfen</button>
      )}
      <QuizFeedback status={status} feedback={status === 'correct' ? "Korrekt! Die Aufklärung muss durch einen Arzt erfolgen und ist nicht delegierbar. Außerdem muss die Patientin Zeit haben (z.B. einen Tag zuvor), um sich nach der Aufklärung entscheiden zu können." : "Falsch! Denken Sie an die gesetzlichen Vorgaben zur Aufklärung."} onRetry={retry} />
    </div>
  );
}

function QuizPraemedikation({ onComplete, isDone }: { onComplete: () => void, isDone: boolean }) {
  const correctAnswers = ['a', 'b', 'c', 'e'];
  const [selected, setSelected] = useState<string[]>(isDone ? correctAnswers : []);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>(isDone ? 'correct' : 'idle');
  
  const options = useMemo(() => [
    { id: 'a', text: 'Kontrolle der korrekten Haarentfernung im OP-Gebiet.' },
    { id: 'b', text: 'Überprüfung des Patientenidentifikationsarmbands.' },
    { id: 'c', text: 'Nachfragen, ob Patient:in nochmals zur Toilette möchte.' },
    { id: 'd', text: 'Durchführung der ärztlichen Aufklärung.' }, 
    { id: 'e', text: 'Prüfen, ob frische Kleidung und MTPS getragen werden.' },
    { id: 'f', text: 'Sofortige Mobilisation zur Kreislaufstabilisierung nach Tablettengabe.' } 
  ], []);

  const [shuffledOptions, setShuffledOptions] = useState(isDone ? options : shuffleArray([...options]));

  const toggleSelect = (id: string) => {
    if (status === 'correct') return;
    setStatus('idle');
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const checkAnswers = () => {
    const isCorrect = selected.length === correctAnswers.length && correctAnswers.every(ans => selected.includes(ans));
    if (isCorrect) {
      setStatus('correct');
      onComplete();
    } else {
      setStatus('incorrect');
      playSound('error');
    }
  };

  const retry = () => { 
    setStatus('idle'); 
    setSelected([]); 
    setShuffledOptions(shuffleArray([...options])); 
  };

  return (
    <div className="mt-6 p-5 bg-teal-50/40 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-start space-x-3 text-teal-800 font-semibold mb-4">
        <Brain className="w-8 h-8 text-teal-600 flex-shrink-0" />
        <span className="mt-1">Was muss zwingend VOR der Verabreichung der Prämedikation (Beruhigungs-/Schmerzmittel am OP-Morgen) kontrolliert oder erledigt werden? (Mehrere Antworten)</span>
      </div>
      
      <div className="space-y-2">
        {shuffledOptions.map(opt => {
          const isSelected = selected.includes(opt.id);
          const isActuallyCorrect = correctAnswers.includes(opt.id);
          
          let btnClass = `p-3 rounded-xl border-2 transition-all flex items-start space-x-3 group cursor-pointer ${
            isSelected ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
          }`;
          
          if (status !== 'idle') {
              if (isSelected && isActuallyCorrect) {
                  btnClass = "p-3 rounded-xl border-2 flex items-start space-x-3 bg-emerald-50 border-emerald-500 text-emerald-900 font-medium";
              } else if (isSelected && !isActuallyCorrect) {
                  btnClass = "p-3 rounded-xl border-2 flex items-start space-x-3 bg-rose-50 border-rose-500 text-rose-900 font-medium line-through opacity-70";
              } else if (!isSelected && isActuallyCorrect && status === 'incorrect') {
                  btnClass = "p-3 rounded-xl border-2 flex items-start space-x-3 bg-amber-50 border-amber-400 text-amber-900 font-medium border-dashed";
              }
          }

          return (
            <button key={opt.id} disabled={status === 'correct'} onClick={() => toggleSelect(opt.id)} className={btnClass}>
              <div className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white'}`}>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-left">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {status !== 'correct' && (
        <button onClick={checkAnswers} disabled={selected.length === 0} className="mt-4 w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
          Antworten prüfen
        </button>
      )}
      
      <QuizFeedback status={status} feedback={status === 'correct' ? "Exakt! Die Aufklärung macht der Arzt vorab. NACH der Medikamentengabe besteht erhöhte Sturzgefahr, d.h. vorher Toilette erledigen, und der Patient darf nicht mehr allein aufstehen." : "Achten Sie auf die farbliche Markierung: Die ärztliche Aufklärung ist Aufgabe des Arztes. Nach der Medikamentengabe darf der Patient wegen akuter Sturzgefahr nicht mehr mobilisiert werden!"} onRetry={retry} />
    </div>
  );
}

// --- MAIN KNOWLEDGE BASE COMPONENT ---

export default function KnowledgeBaseSection({ onNavigate, onNuggetComplete, completedNuggets, onAchievement }: Props) {
  const requiredQuizzes = 2; // For this simplified view to unlock achievements
  const allCompleted = Object.values(completedNuggets).filter(Boolean).length >= requiredQuizzes;

  useEffect(() => {
    if (allCompleted && onAchievement) {
      onAchievement("Prä-OP Wissens-Meister!", "Alle Learning Nuggets in Modul 3 erfolgreich absolviert!");
    }
  }, [allCompleted, onAchievement]);

  return (
    <section className="max-w-5xl mx-auto w-full">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Die Wissens-Base (Prä-OP)</h2>
        <ModuleMeta time="Doppelstunde 5 & 6" mode="Einzelarbeit" goal="Fachwissen aufbauen & überprüfen" />
                 
        <div className="mt-6 bg-blue-50/50 border border-blue-200 p-6 rounded-2xl text-left">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-700 mt-1">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-lg mb-2">Arbeitsauftrag</h3>
              <p className="text-slate-700 mb-2">
                Bitte lesen Sie sich den folgenden Fachtext vollständig durch. Das Wissen benötigen Sie zur Bearbeitung der folgenden Aufgaben und Quizformate.
              </p>
              <p className="text-slate-700 mb-4 font-medium">
                Sie können jederzeit im Skript nach Antworten suchen oder unseren KI-Helfer fragen, wenn Sie sich nicht sicher sind. Viel Erfolg!
              </p>
              <a href="https://archive.org/download/icare-pflege-pra-op-kapitel-reduced/ICare%20Pflege%20pr%C3%A4%20OP%20Kapitel%20-%20Reduced.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                <FileText className="w-4 h-4" /><span>I Care Skript (Primärquelle) öffnen</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-left">
        
        {/* SEKTION 0: NEU - Von der Vorbereitung zur OP */}
        <div className="bg-white rounded-3xl shadow-sm border-l-8 border-l-blue-500 border-y border-r border-slate-100 overflow-hidden group">
          <div className="p-6 sm:p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Video className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-slate-900">Von der Vorbereitung zur OP</h3>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl mb-6 text-left shadow-sm">
              <strong className="text-amber-800 flex items-center text-lg mb-2">
                Arbeitsauftrag:
              </strong>
              <p className="text-amber-900 font-medium leading-relaxed">
                Willkommen im präoperativen Navigator! Bevor Sie in die praktische Vorbereitung der Patientin einsteigen, müssen die Grundlagen sitzen. Bitte sehen Sie sich zunächst die beiden folgenden Einführungsvideos <em>vollständig</em> an.
              </p>
            </div>
            <p className="text-slate-700 mb-6 leading-relaxed">
              Das erste Video (ErstensMedizin) gibt Ihnen eine übersichtliche theoretische Einführung in die perioperative Phase anhand eines fiktiven Falls. Das zweite Video zeigt Ihnen ein echtes Beispiel aus dem Klinikalltag. Beachten Sie dabei: Die genauen Abläufe können von Klinik zu Klinik leicht variieren.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-200">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/DADwjbcMfXg?si=6kchwL_QhQ-JJCWp"
                  title="Theoretische Einführung"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-200">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/Y3EwPcJxr80?si=AvqD1IWAN2PTJ2jz"
                  title="Beispiel Klinikalltag"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* SEKTION 1: Rechtliches & Aufklärung */}
        <div className="bg-white rounded-3xl shadow-sm border-l-8 border-l-indigo-500 border-y border-r border-slate-100 overflow-hidden group">
          <div className="p-6 sm:p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><BookOpen className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-slate-900">Grundlagen & Rechtliches</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Wer klärt auf und wer willigt ein? Diese rechtlichen Fragen sind vor jeder Operation von entscheidender Bedeutung.
            </p>
            
            <QuizScenario2 onComplete={() => onNuggetComplete(1)} isDone={!!completedNuggets[1]} />
            
            <LearningNugget title="Die OP-Aufklärung" isVisible={!!completedNuggets[1]}>
              <p className="mb-2"><strong>Wer klärt auf?</strong> Ausschließlich der Arzt (Arztvorbehalt). Die Pflege darf organisieren, aber keine medizinisch-inhaltliche Aufklärung durchführen.</p>
              <p className="mb-2"><strong>Wann wird aufgeklärt?</strong> Der Patient benötigt eine angemessene Bedenkzeit zwischen Aufklärung und Eingriff (bei elektiven Eingriffen oft mindestens 24 Stunden vorher).</p>
            </LearningNugget>
          </div>
        </div>

        {/* SEKTION 4: Medikation & Transport */}
        <div className="bg-white rounded-3xl shadow-sm border-l-8 border-l-teal-500 border-y border-r border-slate-100 overflow-hidden group">
          <div className="p-6 sm:p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-teal-100 p-3 rounded-xl text-teal-600"><ClipboardCheck className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-slate-900">Medikation & Transport in den OP</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Am Operationstag ist die korrekte Vorbereitung zur Übergabe essenziell. Die Prämedikation ist dabei der letzte große Schritt auf Station.
            </p>
            
            <QuizPraemedikation onComplete={() => onNuggetComplete(2)} isDone={!!completedNuggets[2]} />
            
            <LearningNugget title="Prämedikation & Transport" isVisible={!!completedNuggets[2]}>
              <p className="mb-2"><strong>Prämedikation:</strong> Dient der Angstlösung und Beruhigung. Achtung: Bei Benzodiazepinen bei älteren Menschen kritisch hinterfragen (verlängerte Aufwachzeit).</p>
              <p className="mb-4 text-rose-600 font-bold border-l-4 border-rose-500 pl-3 bg-rose-50 py-2">
                WICHTIG: Nach der Prämedikation besteht erhöhte Sturzgefahr! Die Toilette muss vorher aufgesucht werden, danach darf die Person nicht mehr alleine aufstehen.
              </p>
              <p className="mb-2"><strong>Transport und Übergabe:</strong></p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Zahnprothesen und Wertgegenstände ablegen (Ausnahme: Seh-/Hörhilfen bis zum Vorraum / OP-Schleuse).</li>
                <li>Im Eingangsbereich der OP-Abteilung (Schleuse) wird der Patient übergeben: Patient:in vorstellen, Name nennen, geplante Operation nennen (Verwechslungsgefahr!).</li>
                <li>Bett ggf. frisch beziehen (Keimverschleppung vermeiden).</li>
              </ul>
            </LearningNugget>
          </div>
        </div>

      </div>
    </section>
  );
}