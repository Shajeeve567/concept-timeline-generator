import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import the two pages we just created
import Home from './Home';
import RoadmapPage from './RoadmapPage';

// Import CSS if you have global styles (optional)
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Routes acts like a Switch statement */}
      <Routes>
        
        {/* 1. THE LANDING PAGE (http://localhost:5173/) */}
        <Route path="/" element={<Home />} />
        
        {/* 2. THE GRAPH PAGE (http://localhost:5173/search/Bitcoin) */}
        {/* :concept is a variable! It matches anything after /search/ */}
        <Route path="/search/:concept" element={<RoadmapPage />} />
        
        {/* 3. SAFETY NET */}
        {/* If user goes to a weird URL (e.g. /login), send them Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;