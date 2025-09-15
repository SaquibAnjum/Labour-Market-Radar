# Labour Market Radar - Frontend

A modern, responsive React application for visualizing job market trends and skill demands. Built with React, Tailwind CSS, and Recharts for an exceptional user experience.

## 🚀 Features

### Core Functionality
- **Interactive Dashboard** - Real-time job market insights with KPI cards and skill trend charts
- **Geographic Heatmap** - Interactive map of India showing job distribution across districts
- **Detailed Analytics** - Comprehensive skill and district analysis with demand/supply trends
- **Smart Filtering** - Dynamic filters for districts, skills, and time windows
- **Dark Mode** - Complete dark/light theme support with system preference detection

### Technical Features
- **React 18** with functional components and hooks
- **Context API** for global state management
- **React Router DOM** for client-side routing
- **Recharts** for beautiful, interactive data visualizations
- **React Simple Maps** for geographic visualizations
- **Tailwind CSS** for modern, responsive design
- **Axios** for robust API integration
- **Hot Toast** notifications for user feedback

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Labour Market Radar backend API running on port 8000

## 🛠️ Installation

1. **Clone the repository and navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**
   ```bash
   # Create .env file in client directory
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── FilterBar.js     # Smart filtering component
│   │   └── Navbar.js        # Navigation with dark mode toggle
│   ├── context/             # React Context for state management
│   │   └── AppContext.js    # Global application state
│   ├── pages/               # Main application pages
│   │   ├── Dashboard.js     # Main dashboard with KPIs and charts
│   │   ├── Heatmap.js      # Interactive geographic visualization
│   │   └── Analytics.js     # Detailed skill/district analysis
│   ├── services/            # API integration
│   │   └── api.js          # Axios configuration and API calls
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles and Tailwind configuration
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md
```

## 🎯 Available Pages

### 1. Dashboard (`/`)
- **Overview Cards**: Total skills tracked, districts covered, supply records, DSI records
- **Top Skills Chart**: Bar chart showing the 10 most in-demand skills
- **Real-time Filtering**: Dynamic data updates based on selected filters

### 2. Heatmap (`/heatmap`)
- **Interactive Map**: Color-coded Indian districts based on job concentrations
- **Skill Selection**: View geographic distribution for specific skills
- **Hover Tooltips**: Detailed information on mouseover
- **Color Legend**: Visual guide for job count intensity

### 3. Analytics (`/analytics`)
- **Detailed Metrics**: Demand score, job postings, available talent, time to fill
- **Salary Information**: Comprehensive salary ranges and averages
- **Market Competition**: Active employers and DSI scores
- **Trend Analysis**: Demand vs supply line charts
- **AI Recommendations**: Market insights and strategic recommendations

## 🔧 API Integration

The frontend expects the following API endpoints:

```javascript
// Base URL: http://localhost:8000/api

GET /radar/stats                    // Overall statistics
GET /radar/districts               // Available districts list
GET /radar/skills                  // Available skills list
GET /radar/top-skills?district=<>&time=<>  // Ranked skills data
GET /radar/heatmap?skill=<>&time=<>        // Geographic job distribution
GET /radar/analytics?skill=<>&district=<>&time=<>  // Detailed analytics
```

### Expected API Response Formats

**Stats Response:**
```json
{
  "totalSkillsTracked": 50,
  "districtsCovered": 10,
  "supplyRecords": 1500,
  "dsiRecords": 120
}
```

**Top Skills Response:**
```json
[
  {
    "rank": 1,
    "skill": "Python",
    "jobCount": 250,
    "trend": "up"
  }
]
```

**Analytics Response:**
```json
{
  "demandScore": 85.5,
  "jobPostings": 120,
  "availableTalent": 350,
  "timeToFill": "1.5 months",
  "salary": {
    "min": 800000,
    "max": 1500000,
    "avg": 1150000
  },
  "marketCompetition": {
    "activeEmployers": 45,
    "dsi": 0.34
  },
  "talentSupply": {
    "total": 350,
    "highSkilled": 150
  },
  "recommendation": "High demand, moderate talent pool."
}
```

## 🎨 Theming & Customization

### Dark Mode
- Automatic system preference detection
- Manual toggle in navigation bar
- Persistent user preference storage
- Complete component theme coverage

### Tailwind Configuration
- Custom color palette with primary/secondary themes
- Responsive breakpoints for mobile-first design
- Custom animations and transitions
- Dark mode class-based strategy

### Component Styling
- Consistent design system
- Accessible color contrasts
- Interactive hover states
- Loading and error states

## 📱 Responsive Design

The application is fully responsive across all device sizes:

- **Desktop** (1024px+): Full feature experience with side-by-side layouts
- **Tablet** (768px-1023px): Optimized grid layouts and navigation
- **Mobile** (< 768px): Stacked layouts with collapsible navigation

## 🔍 State Management

### Global State (Context API)
- **Filters**: District, skill, and time window selections
- **Data**: Districts, skills, and statistics
- **UI State**: Loading states, dark mode, error handling

### Local State
- Component-specific data and UI states
- API response caching
- Form state management

## 🚨 Error Handling

- **API Errors**: User-friendly error messages with retry options
- **Network Issues**: Offline detection and recovery suggestions
- **Loading States**: Skeleton loaders and progress indicators
- **Validation**: Form validation with helpful feedback

## 🔧 Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject
```

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Traditional web servers

3. **Configure environment variables** for production API URL

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
- Verify backend server is running on port 8000
- Check CORS configuration on backend
- Confirm API URL in environment variables

**Map Not Loading**
- Check internet connection for external map data
- Verify React Simple Maps configuration
- Ensure geographic data CDN is accessible

**Dark Mode Not Working**
- Clear browser localStorage
- Check Tailwind dark mode configuration
- Verify CSS classes are properly applied

## 🤝 Contributing

1. Follow the established code structure
2. Use functional components with hooks
3. Maintain responsive design principles
4. Test across different screen sizes
5. Ensure dark mode compatibility

## 📄 License

This project is part of the Labour Market Radar application suite.

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**
