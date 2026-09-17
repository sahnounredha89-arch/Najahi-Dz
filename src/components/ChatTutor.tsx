import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Loader2, RotateCcw, Camera } from 'lucide-react';
import { ChatMessage } from '../types';
import { getCurriculumSubjects } from '../data/curriculum';

interface ChatTutorProps {
  currentCycle?: 'primary' | 'middle' | 'secondary';
  currentGradeId?: string;
  initialSubject?: string;
  onAddXP: (amount: number) => void;
  onOpenScanner?: () => void;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  { name: 'الرياضيات', icon: '📐' },
  { name: 'العلوم الفيزيائية والتكنولوجيا', icon: '⚛️' },
  { name: 'علوم الطبيعة والحياة', icon: '🧬' },
  { name: 'اللغة العربية وآدابها', icon: '📖' },
  { name: 'التاريخ والجغرافيا', icon: '🌍' },
  { name: 'العلوم الإسلامية', icon: '🕌' },
  { name: 'الفلسفة', icon: '📚' },
  { name: 'اللغة الفرنسية', icon: '🇫🇷' },
  { name: 'اللغة الإنجليزية', icon: '🇬🇧' },
];

export const ChatTutor: React.FC<ChatTutorProps> = ({
  currentCycle = 'secondary',
  currentGradeId = '3AS',
  initialSubject,
  onAddXP,
  onOpenScanner,
}) => {
  const curriculumSubjects = getCurriculumSubjects(currentCycle, currentGradeId);
  const subjectsList =
    curriculumSubjects.length > 0
      ? curriculumSubjects.map((s) => ({ name: s.name, icon: '📘' }))
      : COMMON_SUBJECT_SUGGESTIONS;

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialSubject) {
      return [
        {
          id: 'welcome',
          role: 'ai',
          text: `أهلاً بك يا بني العزيز وبطلنا المتفوق! 🎓\nأنا "الأستاذ الذكي"، معلمك المخلص والمتفاني لجميع المناهج الجزائرية.\nنحن ندرس الآن مادة "${initialSubject}".\n\nأرسل لي أي درس، قاعدة، سؤال، أو تمرين وسأشرحه لك فوراً بكل إخلاص وتفانٍ وتبسيط خطوة بخطوة!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    }
    return [
      {
        id: 'welcome',
        role: 'ai',
        text: `مرحباً بك يا بني العزيز وبطلنا المتفوق! 🎓\nأنا "الأستاذ الذكي"، معلمك وموجهك المخلص والمتفاني.\n\nاكتب لي اسم أي درس أو تمرين أو مسألة، أو تحدث بالصوت 🎙️، وسأشرحها لك فوراً شرحاً وافياً وممنهجاً من الألف إلى الياء، دون تضييع للوقت وبكل إخلاص وتفانٍ!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Synchronize when initialSubject changes from parent
  useEffect(() => {
    if (initialSubject && initialSubject !== selectedSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition (STT)
  const startVoiceRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('متصفحك لا يدعم التعرف الصوتي المباشر، يمكنك الكتابة في مربع المحادثة.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'ar-DZ';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        handleSendMessage(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Text to Speech (TTS)
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();

    const cleanText = text.replace(/[*#_`]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = 'ar-SA';
    utter.rate = 1.0;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    synth.speak(utter);
  };

  // Conversational Subject Selection Check
  const checkAndDetectSubject = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const s of subjectsList) {
      if (lower.includes(s.name.toLowerCase())) {
        return s.name;
      }
    }
    // Check common aliases
    if (lower.includes('رياضيات') || lower.includes('ماط')) return 'الرياضيات';
    if (lower.includes('فيزياء')) return 'العلوم الفيزيائية والتكنولوجيا';
    if (lower.includes('علوم') || lower.includes('طبيعة')) return 'علوم الطبيعة والحياة';
    if (lower.includes('عربية') || lower.includes('أدب')) return 'اللغة العربية وآدابها';
    if (lower.includes('تاريخ') || lower.includes('جغرافيا') || lower.includes('اجتماعيات')) return 'التاريخ والجغرافيا';
    if (lower.includes('فلسفة')) return 'الفلسفة';
    if (lower.includes('فرنسية')) return 'اللغة الفرنسية';
    if (lower.includes('إنجليزية') || lower.includes('انجليزية')) return 'اللغة الإنجليزية';
    if (lower.includes('إسلامية') || lower.includes('تربية إسلامية') || lower.includes('شريعة'))
      return 'العلوم الإسلامية';
    return null;
  };

  // Handler for conversational subject button click
  const handleSelectSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `أريد مراجعة مادة ${subjectName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: `بارك الله فيك يا بني وبوركت همتك العالية! 🌟\nاخترنا الآن مادة "${subjectName}".\nأرسل لي اسم أي درس أو تمرين، أو تحدث بالصوت 🎙️، وسأشرحه لك فوراً من الصفر وبكل تفانٍ وإخلاص!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    speak(aiMsg.text);
    onAddXP(10);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const detected = checkAndDetectSubject(text);
    const activeSubj = detected || selectedSubject || 'عام';

    if (detected && detected !== selectedSubject) {
      setSelectedSubject(detected);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          subject: activeSubj,
          level: `${currentCycle} - ${currentGradeId}`,
        }),
      });

      const data = await res.json();
      const aiReply = data.response || 'أهلاً بك يا بطل. إليك الشرح المفصل والمنهجي الكامل خطوة بخطوة بكل إخلاص وتفانٍ.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speak(aiReply);
      onAddXP(15);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'عذراً يا بني، حدث انقطاع مؤقت في الاتصال بالخادم. تفضل بإعادة المحاولة وسأشرحها لك فوراً.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-right">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[78vh]">
        {/* Header - Clean High Contrast Light Mode */}
        <div className="bg-white text-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-900 flex items-center justify-center text-white text-2xl shadow-xs">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-slate-900">الأستاذ الذكي</h2>
                <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300">
                  شرح فوري بتفانٍ وإخلاص
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSubject ? `المادة الحالية: ${selectedSubject}` : 'اكتب أو انطق أي سؤال، وسأشرحه لك مباشرة دون استفسارات جانبية'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedSubject && (
              <button
                onClick={() => {
                  setSelectedSubject('');
                  const resetMsg: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'ai',
                    text: 'ما هي المادة الأخرى التي تود أن يشرحها لك الأستاذ الذكي الآن؟ اختر المادة أو تحدث بالصوت:',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  setMessages((prev) => [...prev, resetMsg]);
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تغيير المادة</span>
              </button>
            )}

            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="bg-purple-900 hover:bg-purple-800 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>تصوير سؤال</span>
              </button>
            )}
          </div>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="bg-purple-900 text-white text-center py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-pulse border-b border-purple-800">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            الأستاذ الذكي يستمع لصوتك الآن... تحدث بوضوح 🎙️
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-purple-900 text-white rounded-bl-xs'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-br-xs'
                }`}
              >
                <div className="whitespace-pre-line font-medium">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-left ${
                    msg.role === 'user' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Subject Selection Chips inside first AI message */}
              {msg.role === 'ai' && idx === 0 && !selectedSubject && (
                <div className="mt-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-[90%] text-right">
                  <div className="text-xs font-black text-slate-800 mb-2">
                    اختر المادة لتدرسها الآن مع الأستاذ الذكي:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjectsList.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleSelectSubject(s.name)}
                        className="text-xs bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200 hover:border-purple-300 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
                      >
                        <span>{s.icon || '📘'}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'ai' && (
                <button
                  onClick={() => speak(msg.text)}
                  className="mt-1 flex items-center gap-1 text-xs text-purple-900 hover:text-purple-950 font-bold px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg transition border border-purple-200"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استمع لصوت الأستاذ الذكي</span>
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 max-w-xs shadow-xs">
              <Loader2 className="w-5 h-5 text-purple-900 animate-spin" />
              <span className="text-xs font-bold text-slate-700">الأستاذ الذكي يكتب الشرح المفصل بتفانٍ...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Dedicated Quick Action Chips */}
        <div className="px-3 pt-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold shrink-0">طلب فوري:</span>
          <button
            onClick={() => handleSendMessage('اشرح لي الدرس كاملاً خطوة بخطوة بكل تفصيل وإخلاص')}
            className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition"
          >
            💡 اشرح لي الدرس بالتفصيل
          </button>
          <button
            onClick={() => handleSendMessage('أعطني تمريناً نموذجياً مع خطوات الحل النموذجي وسلم التنقيط')}
            className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition"
          >
            🎯 تمرين نموذجي محلول
          </button>
          <button
            onClick={() => handleSendMessage('ما هي أهم الأخطاء وفخاخ الامتحانات التي يجب الحذر منها في هذا الدرس؟')}
            className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition"
          >
            ⚠️ فخاخ وأخطاء الامتحانات
          </button>
          <button
            onClick={() => handleSendMessage('ما هي القواعد الذهبية والقوانين الأساسية لهذا الدرس؟')}
            className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition"
          >
            📐 القواعد الذهبية والقوانين
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={startVoiceRecognition}
            className={`p-3 rounded-2xl transition flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white animate-bounce shadow-md'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
            title="تحدث مع الأستاذ الذكي بالصوت"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="p-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
              title="التقاط صورة لمسألة أو كراس"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              selectedSubject
                ? `اطرح سؤالك على الأستاذ الذكي في مادة ${selectedSubject}...`
                : 'اكتب اسم الدرس أو سؤالك هنا وسيشرحه لك الأستاذ الذكي فوراً...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-slate-800"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-purple-900 hover:bg-purple-800 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition shadow-xs"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
