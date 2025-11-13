import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/dashboard/Dashboard';
import { AddCandidateForm } from './components/candidates/AddCandidateForm';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates/add" element={<AddCandidateForm />} />
        {/* Placeholder for future candidate detail page */}
        <Route
          path="/candidates/:id"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Candidate Details
                </h1>
                <p className="text-gray-600">
                  Candidate detail page coming soon...
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
