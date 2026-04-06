# AI Guardrails & Multi-Model Evaluation Dashboard

A professional, research-grade platform for analyzing AI model behavior, safety guardrails, and comparative evaluation.

## 🎯 Features

### Core Functionality
- **Prompt Risk Analysis**: Analyzes user prompts for harmful content before model calls
- **Multi-Model Response Generation**: Sends prompts to Gemini, LLaMA, Mistral, and DeepSeek
- **Guardrails Evaluation**: Evaluates each response for safety violations
- **Model Behavior Analysis**: Classifies models by behavior patterns
- **Side-by-Side Comparison**: Horizontal comparison layout with unified scoring

### Analytics & Insights
- Safety score rankings
- Model behavior classification
- Risk tendency analysis
- Consistency metrics
- Historical tracking

### User Experience
- Clean, minimal, modern dashboard design
- Professional styling inspired by Stripe/Vercel
- Responsive layout (mobile, tablet, desktop)
- Dark mode ready
- Real-time analytics

## 🛠️ Tech Stack

### Frontend
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- Lucide Icons
- Axios

### Backend
- Python 3.8+
- Flask 3.0
- Flask-CORS 4.0
- Requests 2.31
- python-dotenv

### AI Models
- **Gemini**: via Google AI Studio API
- **LLaMA**: via Groq API
- **Mistral**: via Groq API
- **DeepSeek**: via OpenRouter API

## 📦 Project Structure

```
guardrail-dashboard/
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── ...
│
└── backend/                  # Flask backend
    ├── app.py              # Main Flask application
    ├── prompt_analyzer.py   # Risk analysis engine
    ├── guardrails.py        # Safety evaluation
    ├── scoring.py           # Model scoring & behavior analysis
    ├── model_calls.py       # API integrations
    ├── requirements.txt
    ├── .env.example
    └── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- API Keys:
  - Google Generative AI (Gemini)
  - Groq API (LLaMA, Mistral)
  - OpenRouter API (DeepSeek)

### Backend Setup

1. **Create Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run backend**
   ```bash
   python app.py
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. **Build for production**
   ```bash
   npm run build
   ```

## 🔌 API Endpoints

### POST /analyze
Analyze a prompt and get multi-model responses with safety evaluation.

**Request:**
```json
{
  "prompt": "Your prompt here"
}
```

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "prompt": "Your prompt here",
  "prompt_analysis": {
    "risk_score": 0.25,
    "risk_level": "LOW",
    "detected_categories": [],
    "explanation": "..."
  },
  "models": [
    {
      "name": "Gemini",
      "behavior_tag": "Safe & Restrictive",
      "avg_safety_score": 0.2,
      "responses": [...]
    }
  ],
  "summary_stats": {
    "overall_avg_safety": 0.4,
    "safest_model": {...},
    "riskiest_model": {...}
  }
}
```

### GET /history
Retrieve analysis history.

### GET /sample-prompts
Get sample prompts for testing.

### GET /models
Get information about available models.

### GET /api-status
Check API keys configuration status.

## 🎨 UI Components

### Dashboard
- Centered input area with sample prompts
- Risk analysis summary
- Model comparison grid
- Analytics summary cards
- Historical leaderboard

### Model Comparison
- 4-column responsive layout
- Individual cards per model
- Safety scores and guardrail status
- Violation details and explanations

### Visual Indicators
- Color-coded badges (Green/Yellow/Red)
- Safety score bars
- Risk level classifications
- Consistency metrics

## 📊 Risk Scoring

### Prompt Analysis
- **Self-harm**: 1.0 weight
- **Violence**: 1.0 weight
- **Drugs**: 0.9 weight
- **Illegal Activities**: 0.85 weight
- **Hate Speech**: 0.8 weight

### Guardrail Evaluation
- **Unsafe Content**: HIGH severity
- **Policy Violation**: HIGH severity
- **Harmful Instructions**: MEDIUM severity
- **Concerning Content**: LOW severity

## 🔐 Security

- Environment variables for sensitive keys
- No credentials in codebase
- API key validation
- Error handling without exposing details
- CORS configuration

## 🧪 Advanced Features

### Coming Soon
- Toggle guardrails ON/OFF
- Batch prompt testing
- Export results (CSV/JSON)
- Jailbreak detection
- Retry mechanisms
- Performance trends

## 📝 Prompt Categories

The system recognizes:
- Self-harm / Suicide
- Violence / Bombing / Weapons
- Drug misuse / Overdose
- Illegal activities (hacking, fraud)
- Toxic / Hate speech

## 🎓 Model Behaviors

- **Gemini**: Safe & Restrictive (conservative, prioritizes safety)
- **LLaMA**: Creative but Risky (flexible, higher variance)
- **Mistral**: Balanced & Controlled (good balance)
- **DeepSeek**: Neutral (neutral stance)

## 🐛 Troubleshooting

### Backend Issues
- **Import errors**: Check `requirements.txt` and virtual environment
- **API errors**: Verify API keys in `.env` file
- **CORS errors**: Check Flask-CORS configuration
- **Port conflicts**: Run on different port with `FLASK_PORT=5001`

### Frontend Issues
- **Connection refused**: Ensure backend is running on port 5000
- **Build errors**: Clear `node_modules` and reinstall: `npm install`
- **Styling issues**: Rebuild Tailwind: `npm run build`

## 📞 Support

For issues or questions:
1. Check the error messages in browser console
2. Review API response in Network tab
3. Verify `.env` configuration
4. Check backend logs for detailed errors

## 📄 License

This project is for research and educational purposes.

## 🙏 Acknowledgments

- Google for Gemini API
- Groq for LLaMA & Mistral hosting
- OpenRouter for DeepSeek access
- The AI safety research community
