import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoadmap } from '../api';
import RoadmapGraph from './RoadmapGraph';

const RoadmapPage = () => {
  // 1. GET THE CONCEPT FROM THE URL
  // If URL is /search/Bitcoin, then concept = "Bitcoin"
  const { concept } = useParams(); 
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local state for the header input box
  const [searchInput, setSearchInput] = useState(concept || "");

  // 2. FETCH DATA AUTOMATICALLY
  // This runs immediately when the page loads, OR if the URL changes
  useEffect(() => {
    if (!concept) return;

    let isMounted = true;

    setLoading(true);
    setError(null);
    setData(null);
    setSearchInput(concept); // Sync the input box with the URL

    fetchRoadmap(concept)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not generate roadmap. Please try again.");
        setLoading(false);
      });
  }, [concept]); // <--- dependency array: re-run if 'concept' changes

  // 3. HEADER SEARCH HANDLER
  const handleSearch = () => {
    if (searchInput.trim()) {
      // Just change the URL. The useEffect above will notice and re-fetch!
      navigate(`/search/${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* --- FLOATING HEADER --- */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '15px 30px', 
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid #ddd', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {/* Click Title to go Home */}
        <h1 
          onClick={() => navigate('/')} 
          style={{ margin: 0, fontSize: '1.2rem', color: '#333', cursor: 'pointer' }}
        >
          Genealogy of Ideas 🧬
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search..."
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={handleSearch} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {loading ? "..." : "Generate"}
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        
        {/* Error State */}
        {error && (
            <div style={{ 
              position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', 
              zIndex: 20, background: '#ffebee', padding: '15px', borderRadius: '8px', border: '1px solid #ffcdd2'
            }}>
                <p style={{ margin: 0, color: '#c62828' }}>{error}</p>
            </div>
        )}

        {/* Loading State */}
        {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>Generating roadmap for <strong>{concept}</strong>...</p>
            </div>
        )}

        {/* The Graph */}
        {!loading && !error && data && (
           <RoadmapGraph data={data} concept={concept}/>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;