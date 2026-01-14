# ISP Sport Sales Demo

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![Vault Powered](https://img.shields.io/badge/Powered%20by-Vault%20AI-5d4fff)](https://the-vaultai.com)

> **World-class sales demo for ISP Sport & Marketing** - A complete sponsor matching and sales enablement platform powered by Vault AI agents.

## 🎯 Features

### 📊 Dashboard
- Real-time KPIs and sales metrics
- Pipeline overview with weighted values
- Recent activity feed
- Agent execution status

### 🤝 Sponsor Match
- AI-powered sponsor-rights matching using SURE model
- Fanbase analysis integration
- Match scores based on demographic overlap
- Real-time data from Orvesto (63K+ B2C profiles)

### 👥 Fanbase Insights
- Deep demographic analysis
- Interest mapping and psychographics
- Geographic distribution
- Income and age segmentation

### 🔍 Prospect Research
- Company database search (189K+ companies)
- AI-driven company analysis
- Decision maker identification
- Sponsorship potential scoring

### 📈 Pipeline Management
- Kanban-style deal tracking
- 5-stage sales pipeline
- Weighted value calculations
- Probability tracking

### ✨ AI Pitch Generator
- Automated sponsorship proposal generation
- SURE model integration (Synlighet, Upplevelse, Relation, Engagemang)
- ROI projections
- Customizable activation suggestions
- Export to text/PDF

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI Agents:** 66 specialized agents via Vault Business Engine
- **Auth:** SSO integration with the-vaultai.com

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ottovf1/isp-sales-demo.git
cd isp-sales-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment
The app connects to the Vault Business Engine (Supabase) for data and AI agents. SSO authentication is handled via the-vaultai.com portal.

## 🔐 Authentication

The app uses SSO tokens from the main Vault portal:

1. User logs in at the-vaultai.com
2. Portal redirects to `/token-receiver` with access tokens
3. App establishes Supabase session
4. User can access all features

## 🤖 Agent Integration

The app leverages multiple Vault agents:

| Agent | Purpose |
|-------|---------|
| `sponsor_match_agent` | Match sponsors with rights holders |
| `fanbase_analysis_agent` | Analyze and segment fanbase data |
| `company_research_agent` | Research companies via web |
| `lead_scoring_agent` | Score and prioritize leads |
| `pitch_preparation` | Generate sponsorship proposals |

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useAuth.tsx     # Authentication hook with SSO
│   └── use-toast.ts    # Toast notifications
├── integrations/
│   └── supabase/       # Supabase client config
├── lib/
│   ├── vaultAgentService.ts  # Agent API integration
│   ├── portalNavigation.ts   # Portal navigation utils
│   └── utils.ts              # Utility functions
└── pages/
    ├── Dashboard.tsx         # Main dashboard
    ├── SponsorMatch.tsx      # Sponsor matching
    ├── FanbaseInsights.tsx   # Fanbase analysis
    ├── ProspectResearch.tsx  # Company research
    ├── Pipeline.tsx          # Sales pipeline
    ├── PitchGenerator.tsx    # AI pitch generator
    ├── Login.tsx             # Login page
    └── TokenReceiver.tsx     # SSO token handler
```

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (dark blue) | `#1E3A5F` | Sidebar, headings |
| Accent (purple) | `#5d4fff` | Buttons, highlights |
| Background | `#0f172a` | Main background |

## 📊 Data Sources

- **B2B Data:** 189K+ Swedish companies
- **B2C Data:** 63K+ consumer profiles (Orvesto)
- **CRM:** 4K+ customer records
- **Orders:** 42K+ historical orders

## 🔗 Links

- **Live App:** [isp-grabber-buddy.lovable.app](https://isp-grabber-buddy.lovable.app)
- **Vault Portal:** [the-vaultai.com](https://the-vaultai.com)
- **ISP Sport:** [isp-sport.se](https://isp-sport.se)

## 📝 License

Private - ISP Sport & Marketing AB

---

Built with ❤️ by ISP Sport & Vault AI
