import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service functions based on the specifications
export const radarAPI = {
  // GET /api/radar/stats: Returns overall statistics
  getStats: () => api.get('/radar/stats'),

  // GET /api/radar/top-skills?district=<district_code>&time=<days>: Returns ranked skills
  getTopSkills: (district = '', time = '30') => 
    api.get(`/radar/top-skills?district=${district}&time=${time}`),

  // GET /api/radar/heatmap?skill=<skill_name>&time=<days>: Returns job counts per district for the map
  getHeatmap: (skill = '', time = '30') => 
    api.get(`/radar/heatmap?skill=${skill}&time=${time}`),

  // GET /api/radar/analytics?skill=<skill_name>&district=<district_code>&time=<days>: Returns detailed analytics
  getAnalytics: (skill = '', district = '', time = '30') => 
    api.get(`/radar/analytics?skill=${skill}&district=${district}&time=${time}`),

  // GET /api/radar/districts: Returns a list of all available districts
  getDistricts: () => api.get('/radar/districts'),

  // GET /api/radar/skills: Returns a list of all available skills
  getSkills: () => api.get('/radar/skills'),

  // Adzuna API endpoints
  // GET /api/radar/adzuna/search: Search jobs using Adzuna API
  searchAdzunaJobs: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/radar/adzuna/search?${queryParams.toString()}`);
  },

  // POST /api/radar/adzuna/fetch: Fetch and save jobs from Adzuna
  fetchAdzunaJobs: (data) => api.post('/radar/adzuna/fetch', data),

  // GET /api/radar/adzuna/categories: Get job categories
  getAdzunaCategories: () => api.get('/radar/adzuna/categories'),

  // GET /api/radar/adzuna/trending-skills: Get trending skills from Adzuna data
  getAdzunaTrendingSkills: (district = '', time = '30') => 
    api.get(`/radar/adzuna/trending-skills?district=${district}&time=${time}`),

  // GET /api/radar/adzuna/stats: Get job statistics from Adzuna data
  getAdzunaStats: (district = '', time = '30') => 
    api.get(`/radar/adzuna/stats?district=${district}&time=${time}`),
};

export { api };
