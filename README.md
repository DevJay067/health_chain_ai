# HealthChain - Healthcare Management Platform

A modern, responsive healthcare management platform built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **First Aid Guide**: Quick access to emergency medical information
- **Health History**: Track and manage personal health records
- **Health Analytics**: Visualize health data with interactive charts
- **Real-time Monitoring**: Connect health devices via Bluetooth for live monitoring
- **Risk Prediction**: AI-powered health risk assessment and predictions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library (shadcn/ui inspired)
- **Charts**: Recharts
- **Backend**: Supabase (BaaS)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ or Yarn 1.22+
- Supabase account and project
- Modern web browser

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd healthchain
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
# Build the project
yarn build

# Preview the production build
yarn preview
```

## 🚀 Deployment

This project is configured for easy deployment to Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## 📁 Project Structure

```
healthchain/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── FirstAid.tsx
│   │   ├── HealthHistory.tsx
│   │   ├── HealthAnalytics.tsx
│   │   ├── RealTimeMonitoring.tsx
│   │   └── HealthRiskPrediction.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useHealthData.ts
│   ├── lib/              # Utility functions
│   │   ├── utils.ts
│   │   └── supabase.ts
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 🧪 Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linter
yarn lint

# Type checking
yarn typecheck
```

## 🗄️ Database Setup

This app requires the following Supabase tables:

1. **health_records** - Store patient health records
2. **vital_signs** - Store vital sign measurements
3. **health_insights** - Store AI-generated health insights
4. **connected_devices** - Track connected health devices
5. **risk_assessments** - Store health risk predictions

Refer to the Supabase dashboard to create these tables with appropriate schemas.

## 🎨 UI Components

The project includes a custom UI component library with:
- Buttons
- Cards
- Badges
- Inputs
- Progress bars
- Tabs
- Dialogs
- Alerts
- Selects
- And more...

All components are fully typed with TypeScript and styled with Tailwind CSS.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

**Built with ❤️ using React, TypeScript, and Vite**
