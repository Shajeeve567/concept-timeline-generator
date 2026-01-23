import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for navigation
import { fetchRecentRoadmaps } from './api';

const Home = () => {
  const [concept, setConcept] = useState("");
  const [recentTerms, setRecentTerms] = useState([]);
  const navigate = useNavigate();

  // Load Gallery
  useEffect(() => {
    fetchRecentRoadmaps().then(setRecentTerms);
  }, []);

  const handleSearch = (term) => {
    const target = term || concept;
    if (target.trim()) {
      // NAVIGATE to the new route instead of fetching directly
      navigate(`/search/${encodeURIComponent(target)}`);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa' 
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>Genealogy of Ideas 🧬</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Discover the origins and evolution of any concept.</p>

        {/* SEARCH BAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <input 
            type="text" 
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter a concept (e.g., Bitcoin, Stoicism)..."
            style={{ 
              flex: 1, 
              padding: '15px', 
              fontSize: '16px', 
              borderRadius: '30px', 
              border: '1px solid #ddd', 
              outline: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          />
          <button 
            onClick={() => handleSearch()}
            style={{ 
              padding: '15px 30px', 
              borderRadius: '30px', 
              background: '#333', 
              color: 'white', 
              border: 'none', 
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Explore
          </button>
        </div>

        {/* GALLERY */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {recentTerms.map((item) => (
            <button 
              key={item.slug} 
              onClick={() => handleSearch(item.concept)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                background: 'white',
                color: '#555',
                cursor: 'pointer'
              }}
            >
              {item.concept}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;