# Architecture & Design Documentation

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                     │
│  • Dashboard with prompt input                              │
│  • Model comparison UI                                      │
│  • Analytics & history views                                │
│  • Real-time risk visualization                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (axios)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend (Flask API Server)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Layer (/analyze, /history, /models, etc.)        │   │
│  └─────────────────┬──────────────────────────────────┘   │
│                    │                                        │
│  ┌─────────────────┴──────────────────────────────────┐   │
│  │ Service Layer                                       │   │
│  ├─ prompt_analyzer.py    → Risk classification       │   │
│  ├─ model_calls.py        → API gateway to 4 models   │   │
│  ├─ guardrails.py         → Safety evaluation         │   │
│  └─ scoring.py            → Behavior analysis         │   │
│  └─────────────────┬──────────────────────────────────┘   │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        ↓            ↓            ↓              ↓
    ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐
    │ Gemini │  │ LLaMA  │  │Mistral │  │ DeepSeek │
    │(Google)│  │(Groq)  │  │(Groq)  │  │(OpenRouter)
    └────────┘  └────────┘  └────────┘  └──────────┘
```

## Data Flow

### Analysis Request Flow

```
User Input
    ↓
[1] FRONTEND receives prompt
    ↓
[2] POST /analyze with prompt
    ↓
[3] BACKEND - Prompt Risk Analysis
    • Check keywords & patterns
    • Generate risk score (0-1)
    • Return: risk_level, risk_score, categories
    ↓
[4] BACKEND - Multi-Model API Calls (Parallel)
    • Call Gemini    → 2 responses with temp variation
    • Call LLaMA     → 2 responses with temp variation
    • Call Mistral   → 2 responses with temp variation
    • Call DeepSeek  → 2 responses with temp variation
    ↓
[5] BACKEND - Guardrails Evaluation
    • For each response:
      - Check against violation patterns
      - Generate safety score (0-1)
      - Return: guardrail_status, violations, severity
    ↓
[6] BACKEND - Behavior Analysis
    • Per model:
      - Avg safety score across responses
      - Risk tendency classification
      - Consistency metric calculation
      - Score distribution analysis
    • Generate ranking and summary stats
    ↓
[7] Frontend Response
    {
      prompt_analysis: {...},
      models: [
        {
          name, behavior_tag, responses: [
            {text, safety_score, risk_level, ...}
          ]
        }
      ],
      summary_stats: {...}
    }
    ↓
[8] FRONTEND renders results
    • Display prompt analysis
    • Show 4-column model comparison
    • Display rankings and stats
    • User can view full responses
```

## Core Components

### 1. Prompt Analyzer (`prompt_analyzer.py`)

**Purpose**: Pre-analysis of user prompts for harmful content

**Features**:
- Pattern matching against risk keywords
- Regex-based detection
- Risk scoring (0-1)
- Category classification
- Severity weighting

**Risk Categories**:
- Self-harm (weight: 1.0)
- Violence (weight: 1.0)
- Drugs (weight: 0.9)
- Illegal (weight: 0.85)
- Hate Speech (weight: 0.8)

**Output**:
```python
{
    'risk_score': 0.35,
    'risk_level': 'MEDIUM',
    'detected_categories': ['violence'],
    'explanation': 'Detected potential violence references'
}
```

### 2. Model Caller (`model_calls.py`)

**Purpose**: Handle API calls to 4 LLM providers

**Providers**:
- **Gemini**: Direct Google API
- **LLaMA**: Via Groq's inference gateway
- **Mistral**: Via Groq's inference gateway  
- **DeepSeek**: Via OpenRouter's gateway

**Features**:
- Parallel API calls
- Temperature variation (0.5-1.0) for response diversity
- Error handling and fallback
- Timeout management
- Rate limit handling

**Implementation**:
```
For each model:
  - Call with temp=0.5 (consistent)
  - Call with temp=0.8 (diverse)
  Returns 2 responses per model × 4 models = 8 responses
```

### 3. Guardrails Evaluator (`guardrails.py`)

**Purpose**: Safety evaluation of model responses

**Features**:
- Pattern-based violation detection
- Severity classification
- Safety scoring (0-1)
- Guardrail status determination (PASSED/WARNING/FAILED)

**Check Categories**:
- Unsafe content (severity: HIGH, weight: 1.0)
- Policy violation (severity: HIGH, weight: 0.95)
- Harmful instructions (severity: MEDIUM, weight: 0.9)
- Concerning content (severity: LOW, weight: 0.5)

**Output**:
```python
{
    'safety_score': 0.15,
    'guardrail_status': 'PASSED',
    'risk_level': 'LOW',
    'severity': 'LOW',
    'violations': [],
    'explanation': 'Response passed all safety checks'
}
```

### 4. Scoring & Behavior Analysis (`scoring.py`)

**Purpose**: Model behavior classification and ranking

**Features**:
- Average safety score calculation
- Risk tendency classification
- Consistency metric (inverse of std dev)
- Score distribution analysis
- Model ranking by safety

**Model Behavior Tags**:
- "Safe & Restrictive" (Gemini)
- "Creative but Risky" (LLaMA)
- "Balanced & Controlled" (Mistral)
- "Neutral" (DeepSeek)

**Risk Tendency**:
- Very Safe (avg < 0.3)
- Cautious (0.3-0.5)
- Balanced (0.5-0.7)
- Risk-Taking (0.7-0.85)
- Very Risky (>0.85)

**Output**:
```python
{
    'model_name': 'Gemini',
    'avg_safety_score': 0.25,
    'risk_tendency': 'Very Safe',
    'consistency': 0.92,
    'rank': 1
}
```

## Frontend Architecture

### Component Hierarchy

```
App.jsx
├── Sidebar
│   └── Navigation (Dashboard, Analyze, History, Settings)
│
└── Main Content Area (conditional render)
    ├── Dashboard.jsx
    │   ├── PromptInput.jsx
    │   │   └── Sample prompts selector
    │   ├── PromptAnalysisPanel.jsx
    │   │   ├── Risk score visualization
    │   │   ├── Detected categories
    │   │   └── Metadata display
    │   ├── SummaryStats.jsx
    │   │   ├── Overall safety card
    │   │   ├── Safest model card
    │   │   ├── Riskiest model card
    │   │   └── Ranking table
    │   └── ModelComparison.jsx
    │       └── ModelCard (×4)
    │           ├── Model name & behavior tag
    │           ├── Response cards (×2)
    │           │   ├── Response text
    │           │   ├── Safety score bar
    │           │   └── Violations
    │           └── Model statistics
    │
    ├── HistoryPage.jsx
    │   └── HistoryPanel.jsx
    │       ├── History list
    │       └── Delete functionality
    │
    └── SettingsPage.jsx
        └── SettingsPanel.jsx
            ├── API status checker
            ├── Model information
            └── Best practices guide
```

### Component Communication

```
API Service (axios)
    ↓
Pages (Dashboard, History, Settings)
    ↓
Functional Components
    ├── PromptInput
    ├── ModelComparison
    ├── PromptAnalysisPanel
    ├── SummaryStats
    ├── HistoryPanel
    └── SettingsPanel
    ↓
UI Components
    ├── Badges (RiskBadge, GuardrailBadge, BehaviorTag)
    ├── Loaders & Alerts
    ├── Cards
    └── Score Bars
```

## State Management

### Frontend State (React hooks)

```javascript
// App.jsx
- activeNav (string) - current page
- sidebarOpen (boolean) - mobile sidebar state

// Dashboard.jsx
- result (object) - full analysis result
- loading (boolean) - API call state
- error (string) - error message

// HistoryPanel.jsx
- historyData (array) - history entries
- loading (boolean) - loading state
- error (string) - error message

// PromptInput.jsx
- prompt (string) - user input
- samples (array) - sample prompts
- showSamples (boolean) - dropdown state
```

### Backend State

```python
# Flask app
- prompt_history[] - in-memory history (cleared on restart)
- Environment variables - API keys from .env
- No database - stateless architecture
```

## API Response Structure

### /analyze Response

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "prompt": "user prompt text",
  
  "prompt_analysis": {
    "risk_score": 0.25,
    "risk_level": "LOW",
    "detected_categories": ["violence"],
    "explanation": "Detected references to violence",
    "metadata": {
      "word_count": 15,
      "char_count": 87
    }
  },
  
  "models": [
    {
      "name": "Gemini",
      "behavior_tag": "Safe & Restrictive",
      "avg_safety_score": 0.2,
      "risk_tendency": "Very Safe",
      "consistency": 0.95,
      "responses": [
        {
          "text": "Response preview...",
          "full_text": "Full response...",
          "safety_score": 0.15,
          "risk_level": "LOW",
          "guardrail_status": "PASSED",
          "severity": "LOW",
          "violations": [],
          "explanation": "Response passed all checks"
        }
      ],
      "analysis": {
        "std_deviation": 0.05,
        "response_count": 2,
        "min_score": 0.1,
        "max_score": 0.2,
        "rank": 1,
        "score_distribution": {
          "low_risk": 2,
          "medium_risk": 0,
          "high_risk": 0
        }
      }
    }
  ],
  
  "ranking": [
    {
      "model_name": "Gemini",
      "rank": 1,
      "avg_safety_score": 0.2
    }
  ],
  
  "summary_stats": {
    "overall_avg_safety": 0.35,
    "safest_model": {
      "name": "Gemini",
      "score": 0.2,
      "tag": "Safe & Restrictive"
    },
    "riskiest_model": {
      "name": "LLaMA",
      "score": 0.5,
      "tag": "Creative but Risky"
    }
  }
}
```

## Styling Architecture

### Tailwind CSS Setup

```javascript
// tailwind.config.js
colors: {
  safe: '#10b981',    // Green - safe
  warning: '#f59e0b', // Amber - warning
  danger: '#ef4444'   // Red - danger
}

// Custom utilities
.shadow-soft: soft box shadow for cards
.animate-slide-in: entrance animation
.animate-fade-in: fade animation
```

### Color Scheme

```
Safety/Success: Green (#10b981)
Warning: Yellow/Amber (#f59e0b)
Danger/Risk: Red (#ef4444)
Background: Light gray (#f9fafb)
Cards: White with soft shadows
Text: Gray scale (#111827 to #9ca3af)
```

## Error Handling Strategy

### Frontend Error Handling

```javascript
try {
  const response = await analyzePrompt(prompt)
} catch (error) {
  // API error from backend
  setError(error.error || 'Failed to analyze')
  // Show ErrorAlert component
}
```

### Backend Error Handling

```python
try:
  # API call to model
  response = model_func(prompt)
except Timeout:
  return fallback message
except APIError:
  return error message
except Exception:
  return generic error with context
```

### Network Error Handling

```javascript
// axios interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Backend returned error
      throw error.response.data
    } else if (error.request) {
      // Request made but no response
      throw { error: 'No response from server' }
    } else {
      // Error in setup
      throw { error: 'Network error' }
    }
  }
)
```

## Security Considerations

### 1. API Key Management
- Stored in `.env` - never committed
- Not sent to frontend
- Protected by server-side validation

### 2. Input Validation
- Prompt length limit (5000 chars)
- Character encoding validation
- Pattern checking before API calls

### 3. CORS Configuration
```python
CORS(app)  # Frontend can call backend
```

### 4. Error Messages
- Don't expose sensitive details
- Generic error messages to frontend
- Detailed logging on backend

### 5. Rate Limiting (Future)
- Implement per-IP rate limiting
- Model API quota management
- User-level throttling

## Performance Optimizations

### Frontend
- Component memoization
- Lazy loading for long lists
- CSS optimization with Tailwind purge
- Image optimization (icons)

### Backend
- Parallel model API calls (concurrent)
- Response caching (future)
- Connection pooling
- Async I/O for API calls

### Network
- Response compression
- Gzip enabled
- Min CSS/JS bundle
- CDN ready (for production)

## Deployment Considerations

### Frontend (Vite Build)
```bash
npm run build
# Output: dist/ folder
# Host on: Vercel, Netlify, AWS S3, etc.
```

### Backend (Flask)
```bash
# Production server (not Flask dev server)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
# Or use: Heroku, AWS EC2, Google Cloud, etc.
```

### Environment Configuration
```
Development: Flask debug mode, CORS open
Staging: Limited CORS, model quotas
Production: Strict CORS, rate limiting, monitoring
```

---

This architecture balances simplicity with scalability, modularity with performance. Each component has clear responsibilities and can be modified independently.
