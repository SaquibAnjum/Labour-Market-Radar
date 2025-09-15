import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { radarAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // Filter state
  filters: {
    district: '',
    skill: '',
    timeWindow: '30', // days
  },
  
  // Data state
  districts: [],
  skills: [],
  stats: null,
  
  // UI state
  loading: false,
  darkMode: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_DISTRICTS: 'SET_DISTRICTS',
  SET_SKILLS: 'SET_SKILLS',
  SET_STATS: 'SET_STATS',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    
    case actionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          district: '',
          skill: '',
          timeWindow: '30',
        },
      };
    
    case actionTypes.SET_DISTRICTS:
      return {
        ...state,
        districts: action.payload,
      };
    
    case actionTypes.SET_SKILLS:
      return {
        ...state,
        skills: action.payload,
      };
    
    case actionTypes.SET_STATS:
      return {
        ...state,
        stats: action.payload,
      };
    
    case actionTypes.TOGGLE_DARK_MODE:
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode !== state.darkMode) {
      dispatch({ type: actionTypes.TOGGLE_DARK_MODE });
    }
  }, []);

  // Update document class and localStorage when dark mode changes
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', state.darkMode);
  }, [state.darkMode]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Action creators
  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
    if (error) {
      toast.error(error);
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: actionTypes.CLEAR_FILTERS });
  };

  const toggleDarkMode = () => {
    dispatch({ type: actionTypes.TOGGLE_DARK_MODE });
  };

  // API actions
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [districtsRes, skillsRes, statsRes] = await Promise.all([
        radarAPI.getDistricts(),
        radarAPI.getSkills(),
        radarAPI.getStats(),
      ]);

      dispatch({ type: actionTypes.SET_DISTRICTS, payload: districtsRes.data });
      dispatch({ type: actionTypes.SET_SKILLS, payload: skillsRes.data });
      dispatch({ type: actionTypes.SET_STATS, payload: statsRes.data });
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await radarAPI.getStats();
      dispatch({ type: actionTypes.SET_STATS, payload: response.data });
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load statistics');
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setError,
    setFilters,
    clearFilters,
    toggleDarkMode,
    loadInitialData,
    loadStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
