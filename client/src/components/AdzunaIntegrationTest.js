import React, { useState, useEffect } from 'react';
import { radarAPI } from '../services/api';

const AdzunaIntegrationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState('pending');

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      setTestResults(prev => [...prev, { name: testName, status: 'passed', error: null }]);
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      console.log(`❌ FAILED: ${testName}: ${error.message}`);
      setTestResults(prev => [...prev, { name: testName, status: 'failed', error: error.message }]);
    }
  };

  const testAPIConnection = async () => {
    const response = await radarAPI.searchAdzunaJobs({
      what: 'software developer',
      where: 'Bangalore',
      results_per_page: 3
    });
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    if (!response.data.data.results || response.data.data.results.length === 0) {
      throw new Error('No jobs returned from API');
    }
  };

  const testJobSearch = async () => {
    const response = await radarAPI.searchAdzunaJobs({
      what: 'react developer',
      where: 'Mumbai',
      results_per_page: 5
    });
    
    if (!response.data.success) {
      throw new Error('Job search failed');
    }
    
    const job = response.data.data.results[0];
    if (!job.title || !job.company) {
      throw new Error('Job data missing required fields');
    }
  };

  const testJobFetchAndSave = async () => {
    const response = await radarAPI.fetchAdzunaJobs({
      searchTerm: 'javascript developer',
      location: 'Delhi',
      maxPages: 1
    });
    
    if (!response.data.success) {
      throw new Error('Fetch and save failed');
    }
    
    if (response.data.data.jobsSaved < 0) {
      throw new Error('Invalid jobs saved count');
    }
  };

  const testTrendingSkills = async () => {
    const response = await radarAPI.getAdzunaTrendingSkills('KA01', '30');
    
    if (!response.data.success) {
      throw new Error('Failed to fetch trending skills');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Trending skills data is not an array');
    }
  };

  const testJobStats = async () => {
    const response = await radarAPI.getAdzunaStats('KA01', '30');
    
    if (!response.data.success) {
      throw new Error('Failed to fetch job stats');
    }
    
    if (typeof response.data.data.totalJobs !== 'number') {
      throw new Error('Invalid stats data structure');
    }
  };

  const testJobCategories = async () => {
    const response = await radarAPI.getAdzunaCategories();
    
    if (!response.data.success) {
      throw new Error('Failed to fetch job categories');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Categories data is not an array');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallStatus('running');

    try {
      await runTest('API Connection', testAPIConnection);
      await runTest('Job Search', testJobSearch);
      await runTest('Job Fetch & Save', testJobFetchAndSave);
      await runTest('Trending Skills', testTrendingSkills);
      await runTest('Job Statistics', testJobStats);
      await runTest('Job Categories', testJobCategories);

      const passedTests = testResults.filter(test => test.status === 'passed').length;
      const totalTests = testResults.length;
      
      if (passedTests === totalTests) {
        setOverallStatus('passed');
      } else {
        setOverallStatus('failed');
      }
    } catch (error) {
      console.error('Test suite error:', error);
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'passed': return 'text-green-800 bg-green-200';
      case 'failed': return 'text-red-800 bg-red-200';
      case 'running': return 'text-blue-800 bg-blue-200';
      case 'error': return 'text-orange-800 bg-orange-200';
      default: return 'text-gray-800 bg-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Adzuna Frontend Integration Test</h2>
        <p className="text-gray-600">Comprehensive test suite to verify Adzuna API integration with the frontend</p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Test Suite</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOverallStatusColor()}`}>
            {overallStatus.toUpperCase()}
          </div>
        </div>
        
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          
          {testResults.map((test, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{test.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                  {test.status.toUpperCase()}
                </span>
              </div>
              
              {test.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Error:</strong> {test.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Tests:</span>
              <span className="ml-2 font-medium">{testResults.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Passed:</span>
              <span className="ml-2 font-medium text-green-600">
                {testResults.filter(t => t.status === 'passed').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Failed:</span>
              <span className="ml-2 font-medium text-red-600">
                {testResults.filter(t => t.status === 'failed').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Success Rate:</span>
              <span className="ml-2 font-medium">
                {Math.round((testResults.filter(t => t.status === 'passed').length / testResults.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure the backend server is running on port 5000</li>
          <li>• Ensure MongoDB is connected and accessible</li>
          <li>• Check that Adzuna API credentials are properly configured</li>
          <li>• Run the tests to verify all frontend-backend integration points</li>
        </ul>
      </div>
    </div>
  );
};

export default AdzunaIntegrationTest;
