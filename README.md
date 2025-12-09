# ResQ-Unified - Disaster Response & Community Alert System

<div align="center">
  
  **A comprehensive disaster response platform for Sri Lanka**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)](https://supabase.com/)
</div>

---

## 🌟 Overview

ResQ-Unified is a production-ready disaster response and community alert system designed specifically for Sri Lanka. It provides real-time flood predictions, emergency response coordination, volunteer management, and community support during natural disasters.

### Key Features

- 🚨 **Real-time Alerts** - Instant emergency notifications with severity levels
- 🗺️ **Crisis Map** - Live emergency locations with interactive mapping
- 🏠 **Shelter Finder** - Find nearby safe shelters with capacity tracking
- 👥 **Volunteer Network** - Coordinate relief efforts with skill-based matching
- 🔍 **Missing Persons** - Help reunite families during emergencies
- 🌧️ **Weather Monitoring** - Flood risk predictions using Open-Meteo API
- 💰 **Donation Portal** - Support relief efforts with secure donations
- 🤖 **AI Assistant** - 24/7 emergency guidance and support
- 📊 **Analytics Dashboard** - Real-time statistics and insights
- 📱 **Mobile-First Design** - Responsive UI for all devices

---

## 🔐 Admin Credentials

For testing and demonstration purposes:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@resq-unified.lk` | `Admin@123!` |
| Coordinator | `coordinator@resq-unified.lk` | `Coord@123!` |
| Case Manager | `casemanager@resq-unified.lk` | `Case@123!` |
| Volunteer | `volunteer@resq-unified.lk` | `Vol@123!` |

> ⚠️ **Important**: Change these credentials immediately in production!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│  Landing Page │ Dashboard │ Admin Panel │ Mobile Views          │
├─────────────────────────────────────────────────────────────────┤
│                     State Management (Zustand)                   │
├─────────────────────────────────────────────────────────────────┤
│                        API Layer                                 │
│  Weather API │ Alerts API │ Cases API │ Volunteers API          │
├─────────────────────────────────────────────────────────────────┤
│                     Supabase Backend                             │
│  PostgreSQL │ Auth │ Realtime │ Storage │ Edge Functions        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available at https://supabase.com)
- Git for version control

### Quick Start (5 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/resq-unified.git
   cd resq-unified
   ```

2. **Run setup script**
   ```bash
   bash scripts/setup-dev.sh
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Detailed Installation

#### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create a new project (free tier available)
3. Wait for project initialization
4. Go to Project Settings → API
5. Copy your **Project URL** and **Anon Key**

#### Step 2: Clone & Install

```bash
git clone https://github.com/your-org/resq-unified.git
cd resq-unified
npm install
```

#### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 4: Initialize Database

```bash
# Install Supabase CLI (optional but recommended)
npm install -g supabase

# Login to Supabase
supabase login

# Apply database migrations
supabase link --project-id your-project-id
supabase db push
```

#### Step 5: Start Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run preview       # Preview production build locally

# Building
npm run build         # Build for production
npm run build-no-errors # Build ignoring TypeScript errors

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript types

# Database
supabase db push      # Apply migrations
supabase functions deploy # Deploy edge functions
```

5. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
resq-unified/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── alerts/          # Alert-related components
│   │   ├── community/       # Community features
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── emergency/       # Emergency response
│   │   ├── family/          # Family safety features
│   │   ├── layout/          # Layout components
│   │   ├── offline/         # Offline support
│   │   ├── prediction/      # Flood prediction
│   │   ├── resources/       # Resource management
│   │   ├── river/           # River level monitoring
│   │   ├── shelters/        # Shelter components
│   │   ├── ui/              # ShadCN UI components
│   │   └── weather/         # Weather components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and APIs
│   │   ├── api/             # API functions
│   │   ├── constants/       # App constants
│   │   └── types/           # TypeScript types
│   ├── pages/               # Page components
│   ├── stores/              # Zustand stores
│   └── stories/             # Storybook stories
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── process-document/
│   │   ├── send-sms/
│   │   └── sync-weather/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

---

## 🔧 Configuration

### API Configuration

The system supports both free and paid APIs. Configure in Admin Settings:

| Service | Free Option | Paid Option |
|---------|-------------|-------------|
| Weather | Open-Meteo (default) | OpenWeatherMap |
| Maps | OpenStreetMap (default) | Google Maps |
| SMS | - | Twilio |
| AI | - | OpenAI |

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full system access, user management, settings |
| **ADMIN** | Dashboard, analytics, case management, broadcasts |
| **COORDINATOR** | Case assignment, volunteer coordination, broadcasts |
| **CASE_MANAGER** | Case management, beneficiary registration |
| **VOLUNTEER** | Assigned cases, status updates |
| **USER** | Public features, emergency reporting |

---

## 📊 Database Schema

### Core Tables

- **user_profiles** - User accounts and roles
- **beneficiaries** - Aid recipients
- **volunteers** - Volunteer information
- **cases** - Aid requests and cases
- **shelters** - Relief shelter data
- **alerts** - Emergency alerts
- **river_levels** - River monitoring data
- **weather_data** - Weather information
- **donations** - Donation records
- **resources** - Resource inventory

### Real-time Features

The following tables have real-time subscriptions enabled:
- cases, alerts, shelters, volunteers
- beneficiaries, river_levels, weather_data
- emergency_reports, missing_persons, donations

---

## 🌐 API Endpoints

### Edge Functions

| Function | Description |
|----------|-------------|
| `process-document` | Extract data from uploaded documents (CSV, JSON, TXT) |
| `send-sms` | Send SMS notifications via Twilio |
| `sync-weather` | Sync weather data from Open-Meteo |

### Weather API (Free - Open-Meteo)

```typescript
// Fetch weather data
const weather = await fetchWeatherData(latitude, longitude);

// Get flood risk prediction
const risk = await getFloodRiskPrediction(district);
```

---

## 📱 Features by Role

### Public Users
- View dashboard with weather and alerts
- Find nearby shelters
- Report emergencies
- Search missing persons
- Donate to relief efforts
- Register as volunteer

### Volunteers
- View assigned cases
- Update case status
- Track completed cases
- View performance metrics

### Case Managers
- Create and manage cases
- Assign volunteers
- Track SLA compliance
- Generate reports

### Administrators
- Full dashboard access
- User management
- API key configuration
- Data import/export
- System settings
- Analytics and reports

---

## 🔄 Data Import

### Supported Formats
- CSV files
- JSON files
- Text files

### Auto-Detection
The system automatically detects data types:
- Beneficiaries
- Volunteers
- Shelters
- Cases
- River levels
- Alerts

### Import Process
1. Navigate to Admin → Data Import
2. Upload file (drag & drop or click)
3. System processes and extracts data
4. Review extracted information
5. Data is automatically imported to database

---

## 🛡️ Security

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security (RLS) policies
- **API Security**: Service role keys for edge functions
- **Audit Logging**: All actions are logged

---

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Real-time Updates**: Supabase subscriptions
- **Caching**: API response caching
- **Optimized Queries**: Indexed database queries
- **PWA Ready**: Offline support capabilities

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables (Production)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### Deploy to Vercel

```bash
vercel --prod
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [Open-Meteo](https://open-meteo.com/) - Free weather API
- [ShadCN UI](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

## 📞 Support

For support, email support@resq-unified.lk or join our Slack channel.

---

<div align="center">
  <p>Built with ❤️ for Sri Lanka</p>
  <p>© 2024 ResQ-Unified. All rights reserved.</p>
</div>
