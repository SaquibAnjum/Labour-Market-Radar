# 🎯 Labour Market Radar - Complete Full-Stack Application

A comprehensive full-stack application for real-time labour market intelligence, featuring interactive dashboards, geographic heatmaps, and detailed analytics for job market trends across Indian districts.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (running on localhost:27017)
- **npm** or **yarn** package manager

### Installation & Setup

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd labour-market-radar
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure Environment**
   ```bash
   # In server directory, create .env file
   echo "MONGODB_URI=mongodb://localhost:27017/labour-market-radar" > .env
   echo "PORT=8000" >> .env
   echo "NODE_ENV=development" >> .env
   ```

5. **Seed the Database**
   ```bash
   cd server
   $env:MONGODB_URI="mongodb://localhost:27017/labour-market-radar"; npm run seed
   ```

6. **Start the Application**
   ```bash
   # Terminal 1 - Start Backend Server
   cd server
   npm start

   # Terminal 2 - Start Frontend Development Server
   cd client
   npm start
   ```

7. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000/api
   - **Health Check**: http://localhost:8000/api/health

## 🏗️ Architecture Overview

### Backend (Node.js + Express + MongoDB)
```
server/
├── index.js              # Main server file with ES modules
├── models/
│   └── Job.js            # MongoDB schemas for all data models
├── routes/
│   ├── radar.js          # Main API endpoints for dashboard data
│   ├── admin.js          # Admin panel endpoints
│   └── health.js         # Health check endpoint
├── services/
│   ├── aggregator.js     # Data aggregation services
│   ├── normalizer.js     # Data normalization
│   ├── scheduler.js      # Job scheduling
│   └── scraper.js        # Web scraping services
└── scripts/
    └── seedData.js       # Database seeding script
```

### Frontend (React + Tailwind CSS + Recharts)
```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── FilterBar.js  # Smart filtering component
│   │   ├── Navbar.js     # Navigation with dark mode
│   │   └── SkillsTable.js # Skills analysis table
│   ├── pages/            # Main application pages
│   │   ├── Dashboard.js  # Main dashboard with KPIs
│   │   ├── Heatmap.js    # Interactive geographic map
│   │   └── Analytics.js  # Detailed analytics page
│   ├── context/
│   │   └── AppContext.js # Global state management
│   └── services/
│       └── api.js        # API integration layer
```

## 🎯 Features

### 📊 Dashboard
- **Real-time KPIs**: Job postings, top skills, average salary, talent gap
- **Interactive Charts**: Top 10 in-demand skills bar chart
- **Skills Analysis Table**: Detailed breakdown with trends and salaries
- **Smart Filtering**: District, skill, and time window filters

### 🗺️ Geographic Heatmap
- **Interactive India Map**: Color-coded districts based on job density
- **Hover Tooltips**: Detailed information on mouseover
- **Skill-based Filtering**: View distribution for specific skills
- **Responsive Design**: Works on all device sizes

### 📈 Analytics
- **Detailed Metrics**: Demand score, job postings, available talent
- **Salary Analysis**: Min, max, and average salary ranges
- **Market Competition**: Active employers and DSI scores
- **Trend Analysis**: Demand vs supply line charts
- **AI Recommendations**: Market insights and strategic advice

### 🎨 Design Features
- **Dark Mode**: Complete theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔌 API Endpoints

### Core Endpoints
```http
GET /api/radar/stats                    # Overall statistics
GET /api/radar/districts               # Available districts
GET /api/radar/skills                  # Available skills
GET /api/radar/top-skills              # Ranked skills data
GET /api/radar/heatmap                 # Geographic job distribution
GET /api/radar/analytics               # Detailed analytics
GET /api/health                        # Health check
```

### Example API Responses

**Stats Response:**
```json
{
  "totalSkillsTracked": 10,
  "districtsCovered": 5,
  "supplyRecords": 0,
  "dsiRecords": 0
}
```

**Top Skills Response:**
```json
[
  {
    "skill": "React.js",
    "jobCount": 1243,
    "trend": "up",
    "rank": 1
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
  "recommendation": "High demand, moderate talent pool."
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with ES modules
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router DOM** for client-side routing
- **Context API** for global state management
- **Tailwind CSS** for utility-first styling
- **Recharts** for data visualizations
- **React Simple Maps** for geographic visualizations
- **Axios** for HTTP requests
- **React Hot Toast** for notifications

## 📱 Responsive Design

The application is fully responsive across all device sizes:

- **Desktop** (1024px+): Full feature experience with side-by-side layouts
- **Tablet** (768px-1023px): Optimized grid layouts and navigation
- **Mobile** (< 768px): Stacked layouts with collapsible navigation

## 🎨 Dark Mode

- **Automatic Detection**: Respects system preference on first visit
- **Manual Toggle**: Persistent user preference with localStorage
- **Complete Coverage**: All components support both themes
- **Smooth Transitions**: CSS transitions for theme switching

## 🔧 Development Commands

### Backend
```bash
cd server
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

### Frontend
```bash
cd client
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🚀 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, AWS, etc.)
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production API URL

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running on localhost:27017
- Check MONGODB_URI in .env file
- Verify database permissions

**CORS Errors**
- Check CORS configuration in server/index.js
- Ensure frontend URL is in allowed origins
- Verify API base URL in client configuration

**Frontend Not Loading Data**
- Check browser console for API errors
- Verify backend server is running on port 8000
- Test API endpoints directly with curl or Postman

**Dark Mode Not Working**
- Clear browser localStorage
- Check Tailwind dark mode configuration
- Verify CSS classes are properly applied

## 📊 Database Schema

### Collections
- **skills**: Available skills with synonyms and sectors
- **districts**: Geographic districts with coordinates
- **jobs**: Processed job postings with skills and locations
- **rawJobs**: Raw scraped job data
- **radarDemand**: Aggregated demand data by skill/district
- **talentSupply**: Talent supply metrics
- **demandSupplyIndex**: DSI calculations

## 🤝 Contributing

1. Follow the established code structure
2. Use functional components with hooks
3. Maintain responsive design principles
4. Test across different screen sizes
5. Ensure dark mode compatibility
6. Follow ES module syntax in backend

## 📄 License

This project is part of the Labour Market Radar application suite.

---

**Built with ❤️ using modern web technologies for real-time labour market intelligence**

## 🎉 Success!

Your Labour Market Radar application is now fully functional with:
- ✅ **Backend**: Node.js server with MongoDB integration
- ✅ **Frontend**: React application with modern UI
- ✅ **Database**: Seeded with sample data
- ✅ **API**: All endpoints working correctly
- ✅ **Integration**: Frontend and backend connected
- ✅ **Features**: Dashboard, Heatmap, Analytics pages
- ✅ **Design**: Responsive, dark mode, modern UI

**Access your application at: http://localhost:3000** 🚀