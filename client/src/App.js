import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Heatmap from './pages/Heatmap';
import Analytics from './pages/Analytics';
import AdzunaTest from './components/AdzunaTest';
import AdzunaIntegrationTest from './components/AdzunaIntegrationTest';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/adzuna-test" element={<AdzunaTest />} />
              <Route path="/adzuna-integration-test" element={<AdzunaIntegrationTest />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              duration: 4000,
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
