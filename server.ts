import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!ai });
});

// AI Chat endpoint - الأستاذ الذكي
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, subject, level } = req.body;
    
    const chatHistory = messages ? messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    })) : [];

    const lastUserText = (chatHistory[chatHistory.length - 1]?.parts?.[0]?.text || "الدرس").trim();

    if (!ai) {
      // Direct, dedicated teacher response even if GEMINI_API_KEY is not configured
      return res.json({
        response: `أهلاً بك يا بني العزيز وبطلنا المتفوق! 🎓\nأنا "الأستاذ الذكي"، معلمك المخلص ورفيقك الدائم. سأشرح لك موضوع "${lastUserText}" الآن بكل إخلاص وتفانٍ ومنهجية واضحة خطوة بخطوة:\n\n💡 1. الفكرة الجوهرية للدرس (التبسيط):\nيقوم هذا المفهوم على إدراك الأساس العلمي والمنطقي بدلاً من الحفظ الآلي؛ فكل قاعدة هي أداة لحل مشكلة محددة بسهولة ويسر.\n\n📐 2. القواعد والقوانين الذهبية:\n• استخرج المعطيات بدقة وحدد الشروط المطلوبة قبل البدء.\n• طبّق العلاقات المباشرة المعتمدة في المنهاج مع الانتباه للوحدات والتحويلات.\n\n✍️ 3. تطبيق نموذجي محلول بالتفصيل:\nعند حل المسألة: نبدأ بكتابة العلاقة النظرية أولاً، ثم التعويض العددي المنظم، ثم تأطير النتيجة النهائية مع الوحدة الرياضية/الفيزيائية بدقة.\n\n⚠️ 4. فخاخ الامتحانات (BEM / BAC) لنيل 20/20:\nاحذر من التسرع في الحسابات أو إهمال التبرير اللغوي والمنطقي، فالمصحح يمنح نصف العلامة على الخطوات والتعليل.\n\nأنا بجانبك دائماً يا بطل! أرسل لي أي مسألة أو تمرين محدد وسأحله معك بأدق تفصيل وبكل إخلاص.`
      });
    }

    const systemInstruction = `أنت "الأستاذ الذكي"؛ المعلم والمربي الجزائري المخلص والمتفاني لجميع المناهج والشهادات التعليمية (الابتدائي، المتوسط BEM، الثانوي، البكالوريا BAC، والجامعي).
تتميز بإخلاصك وتفانيك التام، وضميرك التعليمي الحي، وعمق شرحك وبساطته في آن واحد.

قواعد الشرح الصارمة والتفاني في التدريس:
1. الشرح الفوري والمباشر: عندما يرسل لك التلميذ أي موضوع، كلمة، سؤال، قانون، مسألة، تمرين، أو عنوان درس (مثل "النهايات"، "قانون أوم"، "الحرب الباردة"، "الاستعارة")، ابدأ فوراً بالشرح المفصل والوافي بكل إخلاص وتفانٍ، دون أي تأخير.
2. ممنوع منعاً باتاً السؤال أو التردد: إياك قطعيّاً أن تقول للتلميذ "جيد جداً، هل تريد شرح؟" أو "هل تريد أن أشرح لك بالتفصيل؟" أو تطرح عليه أسئلة استفسارية قبل أن تشرح. التلميذ ينتظر منك الشرح الآن، فاشرح له على الفور وبدون لف أو دوران!
3. هيكل الشرح النموذجي المتفاني:
   - 💡 الفكرة الجوهرية (المفهوم الأساسي مبسطاً بتشبيه عبقري يقرب الفكرة للذهن).
   - 📐 القوانين والقواعد الذهبية (مبرزة وواضحة مع شرح كل رمز ووحدة دولية).
   - ✍️ مثال تطبيقي نموذجي محلول خطوة بخطوة مع التبرير الرياضي والمنهجي والتأطير.
   - ⚠️ فخاخ ونقاط حساسة في شهادات التعليم (BEM / BAC) يجب الحذر منها لنيل العلامة الكاملة (20/20).
   - 🌟 خلاصة الأستاذ للتذكر السريع.
4. نبرة المعلم المخلص: تحدث بلغة عربية فصحى واضحة، راقية، مفعمة بالدفء والحنان الأبوي والتشجيع العالي ("يا بني"، "يا بنيتي"، "يا بطلنا"، "ركز معي جيداً خطوة بخطوة").
5. الأمانة والنزاهة العلمية: مساعدة التلاميذ على الفهم والمراجعة المنزلية؛ ولا نساعد في الغش أثناء سير الامتحانات والفروض الرسمية («مَنْ غَشَّنَا فَلَيْسَ مِنَّا»).`;

    // Use gemini-2.5-flash as default model
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: chatHistory.length > 0 ? chatHistory : [{ role: 'user', parts: [{ text: 'اشرح لي درساً' }] }],
      config: {
        systemInstruction: systemInstruction + (subject ? `\nالمادة الحالية: ${subject}` : '') + (level ? `\nالمستوى الدراسي: ${level}` : ''),
        temperature: 0.6,
      }
    });

    res.json({ response: response.text || "أهلاً بك يا بطل! أنا أستاذك الذكي ومعك دائماً لشرح أي درس أو حل أي تمرين بالتفصيل." });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ في الاتصال بالأستاذ الذكي" });
  }
});

// Conversational Lesson A4 Summary Generator Endpoint
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { topic, subject, level } = req.body;
    const cleanTopic = (topic || "").trim();
    const cleanSubject = (subject || "المنهج الجزائري").trim();

    if (!cleanTopic) {
      return res.status(400).json({ error: "يرجى كتابة عنوان الدرس أو الموضوع لتلخيصه" });
    }

    if (!ai) {
      return res.json({
        subject: cleanSubject,
        title: `ملخص مركز: ${cleanTopic}`,
        lessonName: cleanTopic,
        intro: `ملخص رسمي معتمد لدرس "${cleanTopic}" وفق التدرج السنوي للمنهاج الجزائري، مصمم للطباعة A4 المباشرة أو النقل المنظم في الكراس.`,
        rule1: `القاعدة الذهبية: الفهم المنهجي وتدوين القوانين في الكراس هو أقصر طريق للعلامة الكاملة في الفروض والامتحانات.`,
        simplification: `المحاور الجوهرية الملخصة للدرس:`,
        points: [
          `المفهوم الأساسي: تعريف محدد ودقيق يوضح الظاهرة أو المبرهنة وشروط تحققها.`,
          `القوانين والعلاقات: الصيغ الرياضية والفيزيائية المعتمدة مع مراعاة الوحدات الدولية.`,
          `المنهجية: خطوات الحل المتسلسلة من تحديد المعطيات إلى استنتاج النتيجة.`,
          `المصطلحات المفتاحية: الكلمات الدقيقة التي يبحث عنها المصحح في سلم التنقيط.`
        ],
        notebookPoints: [
          `1. تعريف ${cleanTopic}: مفهوم محدد يستوجب الحفظ الدقيق.`,
          `2. القانون الأساسي: كتابة الصيغة وتأطيرها بلون مميز في الكراس.`,
          `3. شرط التطبيق: الحالات الخاصة واستثناءات القاعدة.`,
          `4. النتيجة النموذجية: الحرص على إبراز الوحدات والتبرير.`
        ],
        examTrap: `احذر من الخلط بين الشروط الأولية أو إهمال إشارة السالب والتحويل بين الوحدات (مثل ms إلى s أو cm إلى m).`,
        practice: `تطبيقات نموذجية محلولة وفق سلم التنقيط الوزاري:`,
        exercises: [
          {
            q: `تطبيق نموذجي رقم 1 حول توظيف قواعد ${cleanTopic} في معالجة مسألة أساسية.`,
            a: `الحل النموذجي: استخراج المعطيات، تطبيق القانون النظري، التعويض الحسابي الموثق، وتأطير النتيجة مع الوحدة.`
          },
          {
            q: `تطبيق نموذجي رقم 2 حول معالجة فخ امتحاني شائع في شهادات التعليم.`,
            a: `الحل النموذجي: مناقشة الشروط خطوة بخطوة وإثبات النتيجة بالبرهان المنطقي المعتمد.`
          }
        ],
        antiCheatNotice: "من غشنا فليس منا: هذا الملخص مخصص للمراجعة والتحضير المنزلي وترسيخ الفهم، ولا يجوز استخدامه للغش في قاعات الامتحانات."
      });
    }

    const prompt = `أنت خبير تربوي ومعد ملخصات وزارية رسمية للتعليم الجزائري.
قم بإنشاء ملخص مركز ودقيق جداً لدرس:
الموضوع/الدرس: "${cleanTopic}"
المادة: "${cleanSubject}"
المستوى الدراسي: "${level || 'الطور الثانوي / المتوسط'}"

شروط التلخيص الصارمة:
- اجعل الدروس ملخصة بشكل حقيقي، مركز، وبنقاط واضحة ومباشرة دون حشو أو إطناب.
- اجعلها جاهزة للطباعة الورقية A4 وجاهزة للكتابة والنقل السهل في كراس التلميذ.
- المطلوب إرجاع كائن JSON حصراً بالشكل التالي بدون أي أسطر خارج الـ JSON:
{
  "subject": "${cleanSubject}",
  "title": "ملخص مركز: ${cleanTopic}",
  "lessonName": "${cleanTopic}",
  "intro": "مقدمة موجزة من سطرين تركز على لب الدرس وهدفه في الامتحان",
  "rule1": "القاعدة الذهبية أو القانون الرئيسي الذي يبنى عليه الدرس",
  "simplification": "عناصر التلخيص الأساسية",
  "points": ["نقطة مركزة 1", "نقطة مركزة 2", "نقطة مركزة 3", "نقطة مركزة 4"],
  "notebookPoints": ["عنصر مرقم للكتابة في الكراس 1", "عنصر مرقم للكتابة في الكراس 2", "عنصر مرقم للكتابة في الكراس 3"],
  "examTrap": "فخ امتحاني شهير في BEM أو BAC وكيف يتفاداه التلميذ",
  "practice": "تطبيقات نموذجية للامتحانات",
  "exercises": [
    { "q": "نص السؤال/التمرين 1", "a": "الحل المنهجي الكامل مع التبرير" },
    { "q": "نص السؤال/التمرين 2", "a": "الحل المنهجي الكامل مع التبرير" }
  ],
  "antiCheatNotice": "من غشنا فليس منا: هذا الملخص للدراسة والمراجعة المنزلية فقط، ويحرم الغش به."
}

التزم بأن تكون كل النصوص دقيقة ومطابقة للمناهج الجزائرية، بدون أي علامات markdown خارج كائن الـ JSON.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
      }
    });

    let raw = response.text || "{}";
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        subject: cleanSubject,
        title: `ملخص: ${cleanTopic}`,
        intro: `ملخص دراسي مخصص لدرس ${cleanTopic} للمراجعة والتحضير.`,
        rule1: `القاعدة الذهبية: الاستيعاب الدقيق للتعريفات والقوانين مع حل التطبيقات كتابياً.`,
        simplification: `أهم المفاهيم الأساسية:`,
        points: [
          `فهم البنية الأساسية للدرس والشروط الواجب توفرها.`,
          `تطبيق القواعد خطوة بخطوة ومراعاة الوحدات الرياضية والفيزيائية.`,
          `مراجعة المصطلحات المعتمدة في التصحيح النموذجي.`
        ],
        practice: `تمرين نموذجي للمراجعة:`,
        exercises: [
          {
            q: `سؤال تطبيقي في درس ${cleanTopic}`,
            a: `الإجابة النموذجية المنهجية مع الخطوات بالتفصيل.`
          }
        ],
        antiCheatNotice: "من غشنا فليس منا: هذا الملخص للدراسة والمراجعة المنزلية فقط."
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Generate Summary Error:", error);
    res.status(500).json({ error: error.message || "فشل توليد الملخص" });
  }
});

// Lesson OCR analysis & Quiz generator endpoint
app.post("/api/analyze-lesson", async (req, res) => {
  try {
    const { lessonText, subject } = req.body;
    
    if (!ai) {
      return res.json({
        summary: "ملخص تجريبي للدرس بناءً على النص المستخرج.",
        flashcards: [
          { question: "ما هي الفكرة العامة؟", answer: "الفكرة الأساسية للدرس." },
          { question: "ما هي النتيجة المهمة؟", answer: "الخلاصة الأساسية للدرس." }
        ],
        quiz: [
          {
            question: "سؤال تجريبي 1 حول الدرس؟",
            options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
            correctAnswer: 0,
            explanation: "شرح الإجابة الصحيحة للتوضيح."
          }
        ]
      });
    }

    const prompt = `قم بتحليل نص الدرس التالي (${subject || "عام"}):
---
${lessonText}
---
المطلوب إرجاع النتيجة بصيغة JSON فقط وتحتوي على:
1. "summary": ملخص مبسط للدرس في نقاط واضحة.
2. "flashcards": قائمة من 3 بطاقات مراجعة (كل بطاقة تحتوي على "question" و "answer").
3. "quiz": قائمة من 3 أسئلة اختبر فهمك (كل سؤال يحتوي على "question"، مصفوفة "options" من 4 خيارات، و "correctAnswer" رقم الفهرس 0-3، و "explanation" شرح مبسط).

تأكد من أن الاستجابة هي كائن JSON صالح فقط بدون أي وسوم markdown إضافية خارج الـ JSON.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.5,
      }
    });

    let rawText = response.text || "{}";
    // Clean markdown code blocks if present
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      // Fallback if parsing fails
      parsedData = {
        summary: rawText,
        flashcards: [{ question: "سؤال المراجعة", answer: "الجواب من ملخص الدرس" }],
        quiz: [{ question: "سؤال تفاعلي؟", options: ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], correctAnswer: 0, explanation: "شرح" }]
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Lesson Analysis Error:", error);
    res.status(500).json({ error: error.message || "فشل تحليل الدرس" });
  }
});

// AI Exam Generator endpoint for infinite Algerian exam topics
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { subject, grade, term, examNumber } = req.body;
    const cleanSubject = (subject || "الرياضيات").trim();
    const cleanGrade = (grade || "السنة الثالثة ثانوي (BAC)").trim();
    const cleanTerm = (term || "الفصل الأول").trim();
    const num = examNumber || 1;

    if (!ai) {
      return res.json({
        id: `ai-exam-${Date.now()}`,
        title: `امتحان ${cleanSubject} - نموذج رقم (${num}) [${cleanTerm}]`,
        institution: "وزارة التربية الوطنية - نموذج وزاري معتمد",
        year: "2023/2024",
        duration: "02 سا 00 د",
        coefficient: 5,
        totalScore: 20,
        exercises: [
          {
            title: "التمرين الأول (06 نقاط)",
            points: 6,
            text: `تطبيق شامل في مادة ${cleanSubject} حول معارف ومكتسبات ${cleanTerm}.\n1. اذكر القواعد والمفاهيم الأساسية المستهدفة في المنهاج.\n2. أنجز الحسابات والتعليلات المنهجية خطوة بخطوة مع توضيح المراحل.`,
            solution: "1. القواعد والتعاريف النموذجية المعتمدة.\n2. الحسابات الدقيقة مع إبراز النتائج والوحدات الدولية المعتمدة.",
            gradingRubric: ["القواعد والتعريفات: [3.0 ن]", "الحسابات والتعليلات: [3.0 ن]"]
          },
          {
            title: "التمرين الثاني (06 نقاط)",
            points: 6,
            text: `تمرين مركب وتطبيقي في ${cleanSubject}.\n1. دراسة الحالات الخاصة والمعطيات البيانية والجداول.\n2. الاستدلال العلمي والمنطقي وحساب الثوابت.`,
            solution: "الحل النموذجي المفصل مع الخطوات المنهجية المعتمدة وسلالم التنقيط.",
            gradingRubric: ["تحليل المعطيات: [3.0 ن]", "الاستدلال والنتيجة: [3.0 ن]"]
          }
        ],
        integratedSituation: {
          title: "الجزء الثاني: الوضعية الإدماجية (08 نقاط)",
          points: 8,
          context: `سياق واقعي مركب في مادة ${cleanSubject} يعالج مشكلة حقيقية مستوحاة من الحياة اليومية أو الميدان العلمي.`,
          instructions: ["تحليل السياق والسندات المقدمة بدقة.", "توظيف مكتسبات الفصل لحل المشكلة وصياغة النتائج.", "تقديم التوصيات والحلول الختامية المبررة."],
          solution: "الحل الكامل المنهجي وفق المعايير الوزارية (الوجاهة، الاستعمال السليم لأدوات المادة، الانسجام، والإتقان).",
          gradingRubric: ["الوجاهة (فهم المشكل وترجمته): [2.5 ن]", "الاستعمال السليم لأدوات المادة: [3.0 ن]", "الانسجام والإتقان ونظافة الورقة: [2.5 ن]"]
        }
      });
    }

    const prompt = `أنت مفتش تربوي ومعد مواضيع امتحانات رسمية معتمد في وزارة التربية الوطنية الجزائرية.
قم بصياغة موضوع امتحان رسمي كامل ومطابق للأنموذج الوزاري الجزائري لجميع المراحل:
المادة: "${cleanSubject}"
المستوى/السنة: "${cleanGrade}"
الفصل: "${cleanTerm}"
رقم النموذج: ${num}

المطلوب إرجاع كائن JSON حصراً بالشكل التالي:
{
  "id": "exam_${Date.now()}",
  "title": "امتحان ${cleanSubject} الرسمي - نموذج رقم (${num}) [${cleanTerm}]",
  "institution": "مديرية التربية الوطنية - نموذج وزاري معتمد",
  "year": "2023/2024",
  "duration": "02 سا 00 د",
  "coefficient": 5,
  "totalScore": 20,
  "exercises": [
    {
      "title": "التمرين الأول (06 نقاط)",
      "points": 6,
      "text": "نص الأسئلة والتمارين بالتفصيل مع ترقيم الأسئلة (1، 2، 3)",
      "solution": "الحل النموذجي المفصل خطوة بخطوة بالتبريرات",
      "gradingRubric": ["عنصر 1 [نقطة]", "عنصر 2 [نقطة]"]
    },
    {
      "title": "التمرين الثاني (06 نقاط)",
      "points": 6,
      "text": "نص أسئلة التمرين الثاني المنهجي والمستندات",
      "solution": "الحل النموذجي الكامل مع التبريرات الرياضية أو العلمية",
      "gradingRubric": ["عنصر 1 [نقطة]", "عنصر 2 [نقطة]"]
    }
  ],
  "integratedSituation": {
    "title": "الجزء الثاني: الوضعية الإدماجية (08 نقاط)",
    "points": 8,
    "context": "سياق المسألة والسندات الواقعية",
    "instructions": ["التعليمة 1", "التعليمة 2", "التعليمة 3"],
    "solution": "الحل المنهجي للوضعية بالتفصيل وفق شبكة المعايير",
    "gradingRubric": ["الوجاهة: [2.5 ن]", "الاستعمال السليم لأدوات المادة: [3.0 ن]", "الانسجام والإتقان: [2.5 ن]"]
  }
}

تأكد من أن الاستجابة هي كائن JSON صالح فقط بدون أي وسوم markdown إضافية خارج الـ JSON.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.5 }
    });

    let raw = response.text || "{}";
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        id: `ai-exam-${Date.now()}`,
        title: `امتحان ${cleanSubject} - نموذج رقم (${num})`,
        institution: "وزارة التربية الوطنية",
        year: "2023/2024",
        duration: "02 سا 00 د",
        coefficient: 5,
        totalScore: 20,
        exercises: [{
          title: "التمرين الأول (10 نقاط)",
          points: 10,
          text: `أسئلة مراجعة وتطبيق في ${cleanSubject}`,
          solution: "الحل المنهجي الكامل",
          gradingRubric: ["الإجابة الصحيحة: [10 ن]"]
        }],
        integratedSituation: {
          title: "الجزء الثاني: الوضعية الإدماجية (10 نقاط)",
          points: 10,
          context: `مسألة شاملة في مادة ${cleanSubject}`,
          instructions: ["حل المسألة وفق المنهجية"],
          solution: "الحل النموذجي للوضعية",
          gradingRubric: ["الوجاهة: [5 ن]", "الانسجام: [5 ن]"]
        }
      };
    }
    res.json(data);
  } catch (err: any) {
    console.error("Generate Exam Error:", err);
    res.status(500).json({ error: err.message || "فشل توليد الامتحان" });
  }
});

// AI Classroom Blackboard Lesson Generator Endpoint (سبورة الأستاذ الوزارية)
app.post("/api/generate-blackboard-lesson", async (req, res) => {
  try {
    const { topic, subject, grade } = req.body;
    const cleanTopic = (topic || "الدوال العددية والنهايات").trim();
    const cleanSubject = (subject || "الرياضيات").trim();
    const cleanGrade = (grade || "السنة الثالثة ثانوي (BAC)").trim();

    if (!ai) {
      return res.json({
        id: `bb_${Date.now()}`,
        subject: cleanSubject,
        grade: cleanGrade,
        unit: `الوحدة التعلمية: ${cleanTopic}`,
        title: `درس: ${cleanTopic}`,
        dateStr: "الأحد 20 أكتوبر 2024 م / 17 ربيع الثاني 1446 هـ",
        competency: `التحكم في مفاهيم وتطبيقات ${cleanTopic} وفق الكفاءات الرسمية المقررة في المنهاج الوزاري الجزائري.`,
        starter: {
          title: "1. وضعية الانطلاق والمكتسبات القبلية",
          priorKnowledge: [
            "تذكير بالمكتسبات السابقة والمفاهيم الأساسية ذات الصلة.",
            "مراجعة شروط تطبيق النظريات والتعريفات القبلية."
          ],
          problemText: `كيف يمكن توظيف قواعد ومفاهيم "${cleanTopic}" لحل المسائل المركبة وتفسير النتائج بدقة في الامتحانات الرسمية؟`,
          hypothesis: "ربط القوانين النظرية بالتطبيقات العملية المباشرة وتفكيك المشكل إلى خطوات منهجية."
        },
        coreSections: [
          {
            title: "2. المفهوم الأساسي والتعريف المنهجي",
            ruleBox: `القاعدة الذهبية: الفهم أولاً وكتابة المعطيات المنسقة يضمن 80% من العلامة في سلم التنقيط.`,
            explanation: `يقوم درس ${cleanTopic} على أسس متينة تتطلب الانضباط في استخدام الرموز والمصطلحات المعتمدة في التصحيح النموذجي.`,
            bulletPoints: [
              "الخطوة الأولى: تحديد الشروط والمجال والشروط الحدية.",
              "الخطوة الثانية: كتابة القانون المعتمد بصيغته العامة قبل التعويض.",
              "الخطوة الثالثة: التحقق من التناسق المنطقي والوحدات الدولية."
            ],
            diagramOrFormula: "المعادلة / القاعدة: [ المكتسبات الأساسية + التطبيق المنهجي = النتيجة الدقيقة ]"
          },
          {
            title: "3. خطوات المعالجة والخواص الجوهرية",
            ruleBox: "خاصية محورية: مراعاة حالات عدم التعيين والفخاخ الشائعة في مواضيع الشهادات.",
            explanation: "تفصيل حالات التحليل وكيفية التبرير المنطقي المقنع للمصحح في امتحان شهادة التعليم.",
            bulletPoints: [
              "استخدام البراهين المعيارية المعتمدة رسمياً.",
              "تجنب القفز على المراحل الحاسمة في الحساب والتبيان.",
              "تأطير النتيجة النهائية بلون بارز لإبرازها للمصحح."
            ]
          }
        ],
        sidebar: {
          applicationExercise: {
            title: "تطبيق فوري على السبورة",
            question: `أنجز دراسة مبسطة لحالة تطبيقية مباشرة حول درس ${cleanTopic}.`,
            stepByStepSolution: "1. كتابة المعطيات المنظمة.\n2. تطبيق القاعدة المؤطرة في قلب السبورة.\n3. صياغة النتيجة وتأطيرها بدقة."
          },
          teacherWarnings: [
            "⚠️ انتبه: لا تنس كتابة الوحدات والرموز المعتمدة.",
            "⚠️ احذر: فخ شائع يتكرر كل سنة في البكالوريا/البيام هو التسرع في التعويض دون تبرير."
          ],
          goldenTip: "💡 نصيحة الأستاذ: درب يدك على الكتابة على ورقة بيضاء مرتين على الأقل لكل عنصر في الدرس.",
          homeworkTask: "تطبيق منزلي: حل المسألة رقم 03 من الكتاب المدرسي ومقارنتها بالحل النموذجي."
        }
      });
    }

    const prompt = `أنت أستاذ جزائري متميز وخبير تربوي يكتب درساً كاملاً على السبورة المدرسية (Blackboard) لطلابه.
قم بصياغة درس كامل مكتوب بأسلوب سبورة الأستاذ المدرسية الجزائرية:
الموضوع: "${cleanTopic}"
المادة: "${cleanSubject}"
المستوى/السنة: "${cleanGrade}"

المطلوب إرجاع كائن JSON دقيق ومطابق حصراً للبنية التالية:
{
  "id": "bb_${Date.now()}",
  "subject": "${cleanSubject}",
  "grade": "${cleanGrade}",
  "unit": "اسم الوحدة التعلمية الرسمية",
  "title": "${cleanTopic}",
  "dateStr": "اليوم والتاريخ بالهجري والميلادي كما يكتبه الأستاذ في أعلى السبورة",
  "competency": "الكفاءة المستهدفة من الدرس وفق المنهاج الوزاري",
  "starter": {
    "title": "1. وضعية الانطلاق / الإشكالية (الجناح الأيمن للسبورة)",
    "priorKnowledge": ["مكتسب قبلي 1", "مكتسب قبلي 2"],
    "problemText": "نص التساؤل أو المشكل المطروح في بداية الحصة",
    "hypothesis": "فرضية التوجيه والحل"
  },
  "coreSections": [
    {
      "title": "2. العنصر الأساسي الأول (قلب السبورة)",
      "ruleBox": "قاعدة أو قانون رئيسي مؤطر بالطباشير الأصفر",
      "explanation": "شرح الأستاذ المفصل والمبسط مع التعليل",
      "bulletPoints": ["نقطة فرعية وشرح 1", "نقطة فرعية وشرح 2", "نقطة فرعية وشرح 3"],
      "diagramOrFormula": "صيغة رياضية أو كيميائية أو علاقة منطقية توضيحية"
    },
    {
      "title": "3. العنصر الأساسي الثاني (الخواص وطرق الحل)",
      "ruleBox": "قانون أو استنتاج حاسم",
      "explanation": "طريقة التوظيف في المسائل الوزارية",
      "bulletPoints": ["مرحلة 1", "مرحلة 2", "مرحلة 3"]
    }
  ],
  "sidebar": {
    "applicationExercise": {
      "title": "تطبيق فوري على السبورة (الجناح الأيسر)",
      "question": "نص تمرين أو سؤال تطبيقي ورد في الامتحانات أو يحاكيها",
      "stepByStepSolution": "الحل النموذجي خطوة بخطوة كما يكتبه الأستاذ على السبورة"
    },
    "teacherWarnings": [
      "⚠️ تنبيه الأستاذ: خطأ شائع يقع فيه التلاميذ في الاختبارات",
      "⚠️ تنبيه وزاري: ما يركز عليه المصحح في سلم التنقيط"
    ],
    "goldenTip": "💡 همسة الأستاذ: سر أو قاعدة ذهبية للحصول على العلامة الكاملة",
    "homeworkTask": "واجب منزلي محدد للتدريب"
  }
}

أخرج فقط كائن الـ JSON بدون أي علامات markdown إضافية.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.4 }
    });

    let raw = response.text || "{}";
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        id: `bb_${Date.now()}`,
        subject: cleanSubject,
        grade: cleanGrade,
        unit: `الوحدة: ${cleanTopic}`,
        title: cleanTopic,
        dateStr: "التاريخ المدرسي المعتمد",
        competency: `استيعاب وتطبيق درس ${cleanTopic}`,
        starter: {
          title: "وضعية الانطلاق",
          priorKnowledge: ["المكتسبات القبلية الضرورية"],
          problemText: `كيف نتحكم في معطيات وقوانين ${cleanTopic}؟`,
          hypothesis: "اتباع المنهجية العلمية والخطوات المحددة."
        },
        coreSections: [
          {
            title: "عناصر الدرس الأساسية",
            ruleBox: "القاعدة المنهجية المركزية المؤطرة.",
            explanation: `شرح تفصيلي لدرس ${cleanTopic}.`,
            bulletPoints: ["القواعد الأساسية", "المعادلات والتعريفات", "التطبيق النموذجي"]
          }
        ],
        sidebar: {
          applicationExercise: {
            title: "تطبيق محلول",
            question: "سؤال تطبيقي حول الدرس",
            stepByStepSolution: "خطوات الحل النموذجي بالتفصيل."
          },
          teacherWarnings: ["تنبيه مهم: التركيز على كتابة المعطيات والتعليل."],
          goldenTip: "نصيحة الأستاذ: كرر حل التمارين المماثلة مرتين.",
          homeworkTask: "تطبيق منزلي من الكتاب المدرسي."
        }
      };
    }
    res.json(data);
  } catch (err: any) {
    console.error("Blackboard Lesson Error:", err);
    res.status(500).json({ error: err.message || "فشل كتابة درس السبورة" });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
