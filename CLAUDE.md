# IELTS Speaking Practice Platform — CLAUDE.md

## Project Overview

A full-stack IELTS Speaking practice web application with AI-powered question generation, grading, and feedback. Professional UI with smooth animations, fully responsive (mobile-first).

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Audio Recording**: Web Audio API + MediaRecorder API
- **Charts/Heatmap**: recharts

### Backend
- **Runtime**: Node.js (Next.js API Routes / Route Handlers)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (JWT strategy)
- **Payment**: Stripe (subscription model)
- **Validation**: Zod

### External APIs
- **AI (LLM)**: Groq API — question generation, grading, sample answers, vocabulary suggestions
- **Speech-to-Text + Pronunciation**: Deepgram API — real-time transcription, pronunciation scoring
- **Payment**: Stripe

### Infrastructure
- **Database**: PostgreSQL on Railway
- **Hosting**: Railway (Node/Next.js service)
- **File Storage**: Railway Volume or Cloudflare R2 (audio recordings)
- **Environment**: `.env` managed via Railway environment variables

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...  # Railway PostgreSQL URL

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# AI APIs
GROQ_API_KEY=
DEEPGRAM_API_KEY=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Database Schema (Prisma)

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  avatarUrl       String?
  passwordHash    String?
  plan            Plan     @default(FREE)
  stripeCustomerId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sessions        PracticeSession[]
  vocabulary      VocabEntry[]
  activityLogs    ActivityLog[]
  subscription    Subscription?
}

model PracticeSession {
  id              String      @id @default(cuid())
  userId          String
  type            SessionType // BEGINNER | TOPIC | FULL_TEST
  part            IELTSPart?  // PART1 | PART2 | PART3
  topic           String?
  questions       Json        // array of questions
  answers         Json        // array of { audioUrl, transcript, ... }
  scores          Json?       // { overall, fluency, vocabulary, grammar, pronunciation }
  feedback        Json?       // per-question feedback + overall feedback
  sampleAnswers   Json?       // AI-generated sample answers
  duration        Int?        // seconds
  createdAt       DateTime    @default(now())

  user            User        @relation(fields: [userId], references: [id])
}

model VocabEntry {
  id          String   @id @default(cuid())
  userId      String
  word        String
  definition  String
  example     String?
  topic       String?
  sessionId   String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @default(now()) @db.Date
  minutes   Int      @default(0)
  sessions  Int      @default(1)

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}

model Subscription {
  id                  String   @id @default(cuid())
  userId              String   @unique
  stripeSubscriptionId String  @unique
  status              String
  currentPeriodEnd    DateTime
  plan                Plan

  user                User     @relation(fields: [userId], references: [id])
}

enum Plan {
  FREE
  PRO
  PREMIUM
}

enum SessionType {
  BEGINNER
  TOPIC
  FULL_TEST
}

enum IELTSPart {
  PART1
  PART2
  PART3
}
```

---

## Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar + navbar
│   │   ├── dashboard/page.tsx       # Heatmap + leaderboard + stats
│   │   ├── beginner/
│   │   │   └── page.tsx             # Duolingo-style roadmap
│   │   ├── practice/
│   │   │   ├── page.tsx             # Topic selection
│   │   │   └── [sessionId]/page.tsx # Active practice session
│   │   ├── full-test/
│   │   │   └── page.tsx             # Full IELTS test
│   │   ├── results/
│   │   │   └── [sessionId]/page.tsx # Score breakdown + feedback
│   │   └── vocabulary/
│   │       └── page.tsx             # Vocabulary notebook
│   ├── (landing)/
│   │   └── page.tsx                 # Landing/marketing page
│   ├── pricing/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── sessions/route.ts
│   │   ├── sessions/[id]/route.ts
│   │   ├── practice/generate/route.ts    # Groq: generate questions
│   │   ├── practice/grade/route.ts       # Groq: grade answer
│   │   ├── practice/sample/route.ts      # Groq: sample answer
│   │   ├── practice/vocabulary/route.ts  # Groq: related vocabulary
│   │   ├── transcribe/route.ts           # Deepgram: STT
│   │   ├── vocabulary/route.ts           # CRUD vocab notebook
│   │   ├── leaderboard/route.ts
│   │   ├── heatmap/route.ts
│   │   └── stripe/webhook/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn/ui base components
│   ├── audio/
│   │   ├── AudioRecorder.tsx        # Record + visualize audio waveform
│   │   └── AudioPlayer.tsx
│   ├── practice/
│   │   ├── QuestionCard.tsx
│   │   ├── ScoreBreakdown.tsx       # Radar chart + band scores
│   │   ├── FeedbackPanel.tsx
│   │   └── TopicSelector.tsx
│   ├── beginner/
│   │   ├── RoadmapTrack.tsx         # Duolingo-style path
│   │   └── LessonNode.tsx
│   ├── dashboard/
│   │   ├── HeatmapCalendar.tsx      # GitHub-style activity heatmap
│   │   ├── Leaderboard.tsx          # Top 10 users
│   │   └── StatsCards.tsx
│   ├── vocabulary/
│   │   └── VocabCard.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Navbar.tsx
├── lib/
│   ├── groq.ts                      # Groq client + prompts
│   ├── deepgram.ts                  # Deepgram client
│   ├── prisma.ts                    # Prisma client singleton
│   ├── stripe.ts
│   └── auth.ts                      # NextAuth config
├── prisma/
│   └── schema.prisma
├── public/
└── middleware.ts                    # Auth protection
```

---

## Feature Specifications

### 1. Beginner Path (Duolingo-style)

- Visual roadmap with connected nodes (SVG path between circular lesson nodes)
- Lessons grouped into "units" with crown/star completion badges
- Each lesson: vocabulary intro → listen → repeat → short speaking task
- XP points system, streak counter, progress bar per unit
- Locked/unlocked state with smooth unlock animation
- Topics: Greetings → Everyday Topics → Opinion Giving → Describing → Complex Grammar

**UI Pattern**: Vertical scrolling path, nodes pulse when active, completed nodes show gold checkmark, locked nodes are grayed with lock icon.

---

### 2. Topic-based Practice (Part 1, 2, 3)

**Flow**:
1. User selects: IELTS Part (1, 2, or 3) → Topic (from preset list) → Number of questions (3/5/7/10)
2. Call `POST /api/practice/generate` → Groq generates questions matching IELTS format for chosen part/topic
3. For each question: prep time countdown (Part 2: 60s prep) → recording (30s/120s limit per part) → auto-stop
4. Deepgram transcribes each answer in real-time
5. After all questions: Call `POST /api/practice/grade` → Groq grades with IELTS band scoring

**Topics available**:
- Work & Career, Education, Family & Relationships, Technology, Environment, Health, Travel, Food, Hobbies, Media, Housing, Culture, Sports, Society & Change

**Grading (strict IELTS rubric)**:
- Overall Band Score (0–9, half-band precision)
- Fluency & Coherence (0–9)
- Lexical Resource / Vocabulary (0–9)
- Grammatical Range & Accuracy (0–9)
- Pronunciation (0–9)
- Per-answer written feedback (what was good, what to improve)

**After results**:
- "Sample Answer" button → `POST /api/practice/sample` → AI generates a Band 8+ model answer
- "Related Vocabulary" button → `POST /api/practice/vocabulary` → AI returns 10–15 topic-relevant words with definitions + example sentences
- Each vocabulary item has a "+ Save" button → saves to user's vocabulary notebook

---

### 3. Full IELTS Test Mode

- Simulates real IELTS Speaking test structure:
  - **Part 1**: 4–5 questions, personal/familiar topics, ~4–5 min total
  - **Part 2**: 1 cue card topic, 1 min prep, 2 min response, 1–2 follow-up questions
  - **Part 3**: 4–5 abstract discussion questions linked to Part 2 topic, ~4–5 min
- Timer shown throughout, examiner instructions displayed as text
- Graded holistically after all 3 parts
- Full transcript + band score breakdown
- Option to download PDF report (Pro/Premium only)

---

### 4. Dashboard

**Stats Cards**: Total sessions, avg band score, best band score, current streak

**Heatmap**: GitHub-style contribution calendar
- Toggle: Weekly view / Monthly view / 3-month view
- Color intensity = minutes practiced that day
- Hover tooltip: date + minutes + sessions

**Leaderboard** (Top 10):
- Ranked by total practice minutes (this week)
- Shows avatar, name (truncated), rank badge, minutes
- Current user always shown even if outside top 10
- Refreshes every 5 minutes

---

### 5. Vocabulary Notebook

- Grid/list of saved words with definition, example, topic tag, date saved
- Search + filter by topic
- Mark as "learned" / remove
- Flashcard review mode (flip card animation)
- Export as CSV (Pro feature)

---

### 6. Authentication

- Email/password (bcrypt hashed)
- Google OAuth (NextAuth)
- Email verification on signup
- Forgot password flow (email magic link)
- Protected routes via `middleware.ts`

---

### 7. Pricing / Payment (Stripe)

**Plans**:
- **Free**: 5 practice sessions/month, no full test, no PDF export
- **Pro** ($9.99/month): Unlimited sessions, full test, PDF export, advanced stats
- **Premium** ($19.99/month): Pro + pronunciation deep analysis, priority feedback, 1:1 feedback sessions

Stripe Checkout → Webhook updates DB subscription status → middleware enforces plan limits

---

## AI Prompts (Groq)

Use `llama-3.3-70b-versatile` model. All prompts must return valid JSON.

### Question Generation Prompt
```
You are an expert IELTS examiner. Generate {count} IELTS Speaking {part} questions about the topic "{topic}".
Return JSON: { "questions": [{ "id": string, "text": string, "prepTime": number, "speakingTime": number }] }
Part 1: conversational, personal. Part 2: cue card with bullet points. Part 3: abstract/analytical.
```

### Grading Prompt
```
You are a strict, certified IELTS examiner. Grade this IELTS Speaking {part} response.
Topic: {topic}
Question: {question}
Transcript: {transcript}

Grade according to official IELTS band descriptors (0-9 scale, half-band precision allowed).
Be strict — a native speaker with no preparation typically scores 7.0-7.5.

Return JSON: {
  "overall": number,
  "fluency": number,
  "vocabulary": number,
  "grammar": number,
  "pronunciation": number,
  "strengths": string[],
  "improvements": string[],
  "detailedFeedback": string
}
```

### Sample Answer Prompt
```
You are an IELTS Band 8-9 candidate. Give a model answer for this IELTS Speaking {part} question.
Question: {question}
Topic: {topic}
Return JSON: { "sampleAnswer": string, "bandIndicators": string[] }
```

### Vocabulary Prompt
```
You are an IELTS vocabulary expert. Generate 12 high-value vocabulary items for the IELTS topic "{topic}".
Include collocations, phrasal verbs, and idiomatic expressions suitable for Band 6.5-8.0.
Return JSON: { "vocabulary": [{ "word": string, "type": string, "definition": string, "example": string, "ieltsRelevance": string }] }
```

---

## UI/UX Design Guidelines

### Design Principles
- **Primary color**: Deep blue `#1E3A8A` with gradient to `#3B82F6`
- **Accent**: Emerald green `#10B981` (success/scores)
- **Warning**: Amber `#F59E0B` (medium scores)
- **Error**: Rose `#F43F5E` (low scores)
- **Background**: `#0F172A` (dark) or `#F8FAFC` (light), support both themes
- **Font**: Inter (UI) + Outfit (headings)

### Animation Standards (Framer Motion)
- Page transitions: `fadeInUp` with 0.3s duration
- Cards: `staggerChildren` with 0.05s delay
- Score reveals: count-up animation over 1.5s
- Heatmap cells: staggered fill animation on mount
- Recording pulse: CSS keyframe ring pulse
- Lesson unlock: spring bounce animation

### Responsive Breakpoints
- Mobile: < 640px — single column, bottom nav
- Tablet: 640–1024px — collapsible sidebar
- Desktop: > 1024px — persistent sidebar

### Audio Recorder Component
- Real-time waveform visualization (canvas, bar-based)
- Circular progress timer
- States: idle → preparing (countdown) → recording (pulsing red dot) → processing → done
- Auto-stop when time limit reached
- Playback of recorded audio before submitting

---

## API Route Specifications

```
POST /api/auth/register           Body: { email, password, name }
POST /api/auth/[...nextauth]      NextAuth handler

POST /api/practice/generate       Body: { part, topic, count }
                                  Returns: { sessionId, questions[] }

POST /api/practice/grade          Body: { sessionId, questionId, transcript, audioUrl }
                                  Returns: { scores, feedback }

POST /api/practice/grade/final    Body: { sessionId }
                                  Returns: { overallScore, allScores[], summary }

POST /api/practice/sample         Body: { questionId, part, topic }
                                  Returns: { sampleAnswer, bandIndicators[] }

POST /api/practice/vocabulary     Body: { topic, questionId }
                                  Returns: { vocabulary[] }

POST /api/transcribe              Body: FormData (audio file)
                                  Returns: { transcript, confidence }

GET  /api/vocabulary              Query: { search?, topic?, page }
POST /api/vocabulary              Body: { word, definition, example, topic, sessionId }
DELETE /api/vocabulary/:id

GET  /api/leaderboard             Query: { period: 'week'|'month' }
GET  /api/heatmap                 Query: { userId, months: 1|3|6 }
GET  /api/dashboard/stats         Returns user stats summary

POST /api/stripe/create-checkout  Body: { plan }
POST /api/stripe/webhook          Stripe webhook handler
GET  /api/stripe/portal           Returns billing portal URL
```

---

## Railway Deployment

### Services to create on Railway:
1. **PostgreSQL** plugin — copy `DATABASE_URL`
2. **Next.js Web Service** — connect GitHub repo, set root dir `/`

### Build & Start Commands
```
Build: npm run build
Start: npm start
```

### Railway Config (`railway.toml`)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Post-deploy
```bash
npx prisma migrate deploy   # run via Railway "Deploy Command" or manually
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Seed beginner lessons
npm run db:seed

# Dev server
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Implementation Order

1. **Project setup** — Next.js, Tailwind, shadcn/ui, Prisma, NextAuth
2. **Database** — Connect Railway PostgreSQL, run migrations
3. **Auth** — Login, Register, Google OAuth, middleware
4. **Landing page** — Marketing page + Pricing page
5. **Stripe** — Checkout, webhook, plan enforcement
6. **Dashboard** — Stats, heatmap, leaderboard skeleton
7. **Audio Recorder** — Core reusable component with waveform + Deepgram
8. **Topic Practice (Part 2)** — Full flow: select → generate → record → grade → results
9. **Vocabulary Notebook** — Save, browse, flashcard review
10. **Beginner Path** — Roadmap UI + lesson content
11. **Full Test Mode** — Part 1→2→3 sequential flow
12. **Dashboard** — Wire up real data (heatmap, leaderboard)
13. **Polish** — Animations, responsive fixes, dark mode, PDF export
14. **Deploy** — Railway, env vars, domain

---

## Key Constraints & Notes

- All API routes require authentication (except `/api/auth/*`, `/api/stripe/webhook`)
- Deepgram used server-side (never expose API key client-side)
- Groq streaming supported — use for real-time feedback display
- Audio recordings: record as WebM/OGG client-side, upload to server for Deepgram
- Free plan: enforce session limits in API middleware, not just UI
- IELTS grading must be strict — prompt engineering is critical; test against known Band 6/7/8 transcripts
- Pronunciation score: derived from Deepgram's confidence + Groq analysis of transcript patterns
- Leaderboard data cached in Redis (or simple DB query with index on `ActivityLog.date`) — refresh every 5 min
- Heatmap: aggregate `ActivityLog` by date, join with `PracticeSession` for session count
