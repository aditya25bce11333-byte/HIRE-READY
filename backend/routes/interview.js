const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');

// ─── AI API Helper (Gemini) ──────────────────────────────────────────────────
async function callClaude(messages, systemPrompt, maxTokens = 1000, demoCtx = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getDemoResponse(messages, demoCtx.role || 'SDE', demoCtx.round || 'Technical');
  }

  // Convert messages to Gemini format
  // Gemini uses "user"/"model" roles and combines system prompt into first user message
  const geminiContents = [];

  // Add system prompt as first user message if provided
  if (systemPrompt) {
    geminiContents.push({
      role: 'user',
      parts: [{ text: `[System Instructions]: ${systemPrompt}\n\nAcknowledge these instructions briefly.` }]
    });
    geminiContents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions as your AI interviewer.' }]
    });
  }

  // Add conversation messages
  for (const msg of messages) {
    geminiContents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  
  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  
  return text;
}

// ─── Rich Demo Response Bank ──────────────────────────────────────────────────
const DEMO_QUESTIONS = {
  SDE: {
    technical: [
      "Let's start! Can you explain the difference between a stack and a queue, and give a real-world use case for each?",
      "Great. Now, how would you design a rate limiter for an API that handles 1 million requests per day?",
      "Interesting approach. Can you walk me through how you would implement a LRU (Least Recently Used) cache from scratch?",
      "Good. What is the time complexity of your solution? Can you optimize it further?",
      "Let's talk system design. How would you design a URL shortener like bit.ly? Walk me through the architecture.",
      "Nice! How do you handle race conditions in a multi-threaded environment? Give me a concrete example.",
      "Can you explain the difference between SQL and NoSQL databases? When would you choose one over the other?",
      "Walk me through how HTTP/HTTPS works. What happens between typing a URL and seeing the webpage?",
      "How would you detect a cycle in a linked list? What's the most efficient algorithm?",
      "Let's talk about microservices. What are the trade-offs compared to a monolithic architecture?",
      "How does garbage collection work in your preferred language? What are its limitations?",
      "Explain the CAP theorem. How does it affect distributed system design?",
      "How would you approach debugging a production system that's suddenly running 10x slower?",
      "What's the difference between optimistic and pessimistic locking in databases?",
      "Can you explain how a binary search tree differs from a balanced BST like AVL or Red-Black tree?",
    ],
    hr: [
      "Tell me about yourself and why you're interested in this SDE role.",
      "Describe a time when you had to meet a tight deadline. How did you manage it?",
      "Tell me about a challenging bug you encountered and how you resolved it.",
      "How do you handle disagreements with your team about technical decisions?",
      "Where do you see yourself in 5 years as a software engineer?",
      "Describe a project you're most proud of. What was your specific contribution?",
      "How do you stay updated with new technologies and industry trends?",
      "Tell me about a time you had to learn a new technology quickly for a project.",
      "How do you prioritize tasks when you have multiple deadlines?",
      "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder.",
    ],
  },
  'Data Scientist': {
    technical: [
      "Let's begin! Can you explain the difference between supervised and unsupervised learning with examples?",
      "How would you handle a dataset with 40% missing values? Walk me through your approach.",
      "Explain the bias-variance tradeoff. How do you balance it in practice?",
      "What's the difference between L1 and L2 regularization? When would you use each?",
      "How would you detect and handle outliers in a dataset?",
      "Explain how gradient descent works. What are its variants and when do you use them?",
      "What metrics would you use to evaluate a classification model on an imbalanced dataset?",
      "How would you design an A/B test for a new recommendation algorithm?",
      "Explain the difference between bagging and boosting. Give examples of algorithms for each.",
      "How does a Random Forest work? What are its advantages over a single decision tree?",
      "Walk me through how you would build a churn prediction model from scratch.",
      "What is the curse of dimensionality and how do you address it?",
      "Explain precision, recall, and F1 score. When would you prioritize recall over precision?",
      "How would you approach feature engineering for a time-series prediction problem?",
      "What's the difference between PCA and t-SNE? When would you use each?",
    ],
    hr: [
      "Tell me about yourself and your journey into data science.",
      "Describe a data project where your findings directly impacted a business decision.",
      "How do you communicate complex statistical findings to non-technical stakeholders?",
      "Tell me about a time your model didn't perform as expected. What did you do?",
      "How do you ensure your models are fair and unbiased?",
      "Describe your experience working with large datasets. What tools did you use?",
      "How do you stay current with the rapidly evolving ML landscape?",
      "Tell me about a time you had to push back on a stakeholder's request for data.",
      "How do you handle conflicting data from different sources?",
      "Where do you see AI/ML heading in the next 5 years?",
    ],
  },
  DevOps: {
    technical: [
      "Let's kick off! Can you explain the difference between Docker containers and virtual machines?",
      "How would you design a CI/CD pipeline for a microservices application?",
      "Explain Kubernetes architecture. What are pods, nodes, and clusters?",
      "How do you handle secrets management in a containerized environment?",
      "What's blue-green deployment and how does it reduce downtime?",
      "How would you monitor a distributed system? What metrics would you track?",
      "Explain infrastructure as code. What tools have you used — Terraform, Ansible?",
      "How do you approach scaling a web application that's experiencing sudden traffic spikes?",
      "What's the difference between horizontal and vertical scaling?",
      "How would you set up a disaster recovery plan for a critical production system?",
      "Explain how Kubernetes handles load balancing and service discovery.",
      "What are the key differences between Git rebase and merge? When do you use each?",
      "How do you implement zero-downtime deployments?",
      "Explain the 12-factor app methodology. Which factors do you consider most important?",
      "How would you debug a pod that keeps crashing in Kubernetes?",
    ],
    hr: [
      "Tell me about yourself and your DevOps philosophy.",
      "Describe a production outage you handled. How did you communicate with stakeholders?",
      "How do you foster a DevOps culture in a team that's traditionally siloed?",
      "Tell me about a time you automated a manual process. What was the impact?",
      "How do you balance speed of deployment with system stability?",
      "Describe your on-call experience. How do you manage alert fatigue?",
      "How do you approach documentation for infrastructure?",
      "Tell me about a security vulnerability you discovered and how you fixed it.",
      "How do you handle disagreements between dev and ops teams?",
      "Where do you see cloud infrastructure heading in the next few years?",
    ],
  },
  PM: {
    technical: [
      "Let's start! How do you prioritize features when you have limited engineering resources?",
      "Walk me through how you would write a product requirements document (PRD).",
      "How do you measure the success of a product feature after launch?",
      "Explain the difference between OKRs and KPIs. How do you use them?",
      "How would you approach building a roadmap for a product with competing stakeholder priorities?",
      "What frameworks do you use for product prioritization — RICE, MoSCoW, Kano?",
      "How do you conduct user research? What methods do you prefer and why?",
      "Walk me through how you would launch a new feature to minimize risk.",
      "How do you define and measure product-market fit?",
      "Explain how you would handle a situation where engineering says a feature will take 3x longer than expected.",
      "How do you decide when to build vs. buy vs. partner?",
      "Walk me through how you would redesign an existing product feature that users aren't engaging with.",
      "How do you balance short-term user needs vs. long-term product vision?",
      "What's your approach to competitive analysis?",
      "How do you work with data analysts to make product decisions?",
    ],
    hr: [
      "Tell me about yourself and what drew you to product management.",
      "Describe a product you launched end-to-end. What was your process?",
      "Tell me about a time a product you owned failed. What did you learn?",
      "How do you handle a disagreement with an engineer about technical feasibility?",
      "Describe how you've used data to change your mind about a product decision.",
      "How do you manage stakeholder expectations when timelines slip?",
      "Tell me about a time you advocated for users against business pressure.",
      "How do you onboard yourself to a new product domain quickly?",
      "Describe your relationship with design teams. How do you collaborate?",
      "Where do you see the product management role evolving in the next 5 years?",
    ],
  },
};

const FOLLOWUPS = [
  "Interesting! Can you give me a more concrete example from your experience?",
  "Good answer. Now, what would you do differently if you had to do it again?",
  "That's partially correct. Can you think about any edge cases or limitations?",
  "Nice. Let's go deeper — how would this scale to 10 million users?",
  "Good point. How would you measure success in that scenario?",
  "I like that approach. What are the potential risks, and how would you mitigate them?",
  "Solid. Can you compare this to an alternative approach and explain your trade-off?",
  "Interesting! How have you actually applied this in a real project?",
  "Good. Walk me through this step by step as if explaining to a junior engineer.",
  "That makes sense. How would your approach change under time pressure?",
];

const usedQuestions = new Map(); // sessionId -> Set of used indices

function getDemoResponse(messages, role = 'SDE', round = 'Technical') {
  const msgCount = messages.filter(m => m.role === 'user').length;
  const roundKey = round.toLowerCase().includes('hr') ? 'hr' : 'technical';
  const bank = (DEMO_QUESTIONS[role] || DEMO_QUESTIONS['SDE'])[roundKey] || [];

  // Opening message
  if (msgCount === 0) {
    return `Hello! Welcome to your ${role} ${round} interview. I'm your AI interviewer today. Let's get started!\n\n${bank[0]}`;
  }

  // Every 3rd question, ask a follow-up
  if (msgCount % 3 === 0 && msgCount > 0) {
    return FOLLOWUPS[Math.floor(Math.random() * FOLLOWUPS.length)];
  }

  // Pick a question from bank sequentially, avoiding repeats
  const sessionKey = messages[0]?.content?.slice(0, 20) || 'default';
  if (!usedQuestions.has(sessionKey)) usedQuestions.set(sessionKey, new Set());
  const used = usedQuestions.get(sessionKey);

  // Find next unused question
  for (let i = 0; i < bank.length; i++) {
    if (!used.has(i)) {
      used.add(i);
      return bank[i];
    }
  }

  // All questions used — wrap around with follow-ups
  return FOLLOWUPS[msgCount % FOLLOWUPS.length];
}

function buildInterviewerSystem(role, difficulty, pressureMode, resumeText, round) {
  const pressureInstructions = pressureMode
    ? `You are conducting a HIGH PRESSURE interview. Occasionally interrupt the candidate mid-answer (say "Wait, let me stop you there..."), ask rapid follow-up questions, challenge their answers skeptically, and impose strict time pressure. This simulates real stress.`
    : '';

  const resumeContext = resumeText
    ? `The candidate's resume highlights: ${resumeText.substring(0, 500)}. Ask questions relevant to their actual experience.`
    : '';

  const difficultyMap = {
    Easy: 'beginner-friendly, conceptual questions',
    Medium: 'intermediate questions requiring practical knowledge',
    Hard: 'advanced, in-depth technical questions with edge cases',
  };

  return `You are a professional ${round} interviewer at a top tech company interviewing for a ${role} position.
  
Interview style: ${difficultyMap[difficulty] || 'intermediate'}
Round: ${round}
${pressureInstructions}
${resumeContext}

Rules:
- Ask ONE question at a time
- Ask follow-ups based on previous answers
- Be professional but evaluate critically
- For HR rounds: ask behavioral questions (STAR method), cultural fit, motivation
- For Technical rounds: ask role-specific technical questions
- Track what has been discussed and avoid repeating topics
- After 5-6 exchanges, wrap up gracefully
- Keep responses concise (2-3 sentences max for questions)
- Do NOT reveal scoring or give feedback during the interview`;
}

// POST /api/interview/start
router.post('/start', protect, async (req, res) => {
  try {
    const { role, difficulty, pressureMode, rounds } = req.body;
    const user = await User.findById(req.user._id);

    const session = await Session.create({
      user: req.user._id,
      role: role || user.targetRole,
      difficulty: difficulty || 'Medium',
      pressureMode: !!pressureMode,
      rounds: rounds || ['Technical', 'HR'],
      messages: [],
      status: 'in-progress',
    });

    // Generate opening question
    const systemPrompt = buildInterviewerSystem(
      role || user.targetRole,
      difficulty || 'Medium',
      pressureMode,
      user.resumeText,
      (rounds || ['Technical'])[0]
    );

    const openingMsg = await callClaude([
      { role: 'user', content: 'Start the interview with a brief greeting and your first question.' }
    ], systemPrompt, 1000, { role: role || user.targetRole, round: (rounds || ['Technical'])[0] });

    session.messages.push({ role: 'assistant', content: openingMsg });
    await session.save();

    res.json({ success: true, sessionId: session._id, message: openingMsg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview.' });
  }
});

// POST /api/interview/message
router.post('/message', protect, async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.status !== 'in-progress') return res.status(400).json({ error: 'Session is not active.' });

    const user = await User.findById(req.user._id);

    // Detect filler words
    const fillerWords = ['um', 'uh', 'like', 'so', 'basically', 'actually', 'literally', 'you know'];
    const detected = fillerWords.filter(w => content.toLowerCase().split(/\s+/).includes(w));

    // Save user message
    session.messages.push({ role: 'user', content, fillerWords: detected });

    // Build conversation for Claude
    const claudeMsgs = session.messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const systemPrompt = buildInterviewerSystem(
      session.role, session.difficulty, session.pressureMode,
      user.resumeText, session.rounds[0] || 'Technical'
    );

    const aiResponse = await callClaude(claudeMsgs, systemPrompt, 1000, { role: session.role, round: session.rounds[0] || 'Technical' });
    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();

    res.json({ success: true, message: aiResponse, fillerWords: detected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// POST /api/interview/end
router.post('/end', protect, async (req, res) => {
  try {
    const { sessionId, duration } = req.body;
    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    session.status = 'completed';
    session.duration = duration || 0;
    session.completedAt = new Date();

    // Generate AI evaluation
    const conversationText = session.messages
      .map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
      .join('\n');

    const evalPrompt = `You are an expert interview evaluator. Analyze this interview transcript and provide a JSON evaluation.

Transcript:
${conversationText}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "technicalAccuracy": <0-100>,
  "communication": <0-100>,
  "confidence": <0-100>,
  "overallScore": <0-100>,
  "fitScore": <0-10 with 1 decimal>,
  "answerQuality": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "fillerWordCount": <number>,
  "detectedFillerWords": ["word1", "word2"],
  "improvementRoadmap": ["action1", "action2", "action3", "action4"],
  "feedback": "<2-3 sentence overall feedback>",
  "trend": "<positive|negative|stable>"
}`;

    let evaluation = {
      technicalAccuracy: 75, communication: 72, confidence: 68, overallScore: 72,
      fitScore: 7.2, answerQuality: 74, strengths: ['Good communication', 'Technical knowledge'],
      weaknesses: ['Needs more specifics', 'Work on filler words'],
      fillerWordCount: 0, detectedFillerWords: [], improvementRoadmap: ['Practice STAR method', 'Study system design'],
      feedback: 'Good overall performance. Keep practicing for improvement.', trend: 'positive',
    };

    try {
      const evalText = await callClaude([
        { role: 'user', content: 'Evaluate the interview transcript.' }
      ], evalPrompt, 800);

      const cleanText = evalText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      evaluation = { ...evaluation, ...parsed };
    } catch (e) {
      console.error('Eval parsing error:', e.message);
    }

    session.evaluation = evaluation;
    await session.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalSessions += 1;
    user.totalPoints += Math.floor(evaluation.overallScore * 10);
    user.updateStreak();
    await user.save();

    res.json({ success: true, evaluation, sessionId: session._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end session.' });
  }
});

// POST /api/interview/code-review
router.post('/code-review', protect, async (req, res) => {
  try {
    const { sessionId, code, language, question } = req.body;

    const reviewPrompt = `You are a senior software engineer reviewing code in an interview setting. Review this ${language} code for the question: "${question}".

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a concise review (3-4 sentences) covering: correctness, efficiency, edge cases, and one improvement suggestion. Be direct and professional.`;

    const review = await callClaude([
      { role: 'user', content: 'Review this code.' }
    ], reviewPrompt, 400);

    // Save to session if provided
    if (sessionId) {
      await Session.findOneAndUpdate(
        { _id: sessionId, user: req.user._id },
        { $push: { codeSubmissions: { language, code, question, aiReview: review } } }
      );
    }

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: 'Code review failed.' });
  }
});

// GET /api/interview/sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-messages -codeSubmissions');
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

// GET /api/interview/sessions/:id
router.get('/sessions/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

// POST /api/interview/anti-cheat
router.post('/anti-cheat', protect, async (req, res) => {
  try {
    const { sessionId, event } = req.body; // event: 'tab-switch' | 'paste'
    const update = {};
    if (event === 'tab-switch') update['antiCheat.tabSwitches'] = 1;
    if (event === 'paste') update['antiCheat.pasteAttempts'] = 1;

    await Session.findOneAndUpdate(
      { _id: sessionId, user: req.user._id },
      { $inc: update }
    );

    // Flag if too many violations
    const session = await Session.findById(sessionId);
    if (session && (session.antiCheat.tabSwitches >= 3 || session.antiCheat.pasteAttempts >= 3)) {
      session.antiCheat.flagged = true;
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Anti-cheat logging failed.' });
  }
});

module.exports = router;
