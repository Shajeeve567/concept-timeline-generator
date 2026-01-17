import { useState, useEffect } from 'react'; // <--- Import useEffect
import { fetchRoadmap, fetchRecentRoadmaps } from './api'; // <--- Import new function
import RoadmapGraph from './RoadmapGraph';
import './App.css';

function App() {
  const [concept, setConcept] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New State for the Gallery
  const [recentTerms, setRecentTerms] = useState([]); 

  // --- 1. LOAD GALLERY ON STARTUP ---
  useEffect(() => {
    // This function runs automatically when the page loads
    const loadGallery = async () => {
      const recent = await fetchRecentRoadmaps();
      setRecentTerms(recent);
    };
    loadGallery();
  }, []); // [] means "run once"

  const handleSearch = async (term = null) => {
    // If a term is passed (from clicking gallery), use it. Otherwise use input box.
    const searchTerm = term || concept;
    if (!searchTerm) return;

    setLoading(true);
    setError(null);
    setData(null);
    setConcept(searchTerm); // Update input box to match

    try {
      const result = await fetchRoadmap(searchTerm);
      setData(result);
      
      // Refresh gallery after search (so the new search appears in the list)
      const updatedRecent = await fetchRecentRoadmaps();
      setRecentTerms(updatedRecent);
      
    } catch (err) {
      setError("Failed to fetch roadmap. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Genealogy of Ideas 🧬</h1>
      
      {/* SEARCH BAR */}
      <div className="search-box" style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={concept} 
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Enter concept (e.g., Bitcoin)"
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button onClick={() => handleSearch()} disabled={loading} style={{ padding: '10px' }}>
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- 2. THE GALLERY SECTION --- */}
      {!data && !loading && (
        <div style={{ marginTop: '20px' }}>
          <h3>✨ Recently Generated (Gallery)</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {recentTerms.map((item) => (
              <button 
                key={item.slug} 
                onClick={() => handleSearch(item.concept)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  color: '#1565c0'
                }}
              >
                {item.concept} <span style={{fontSize: '0.8em', color: '#666'}}>({item.views})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GRAPH DISPLAY */}
      {data && (
        <div className="graph-container" style={{ marginTop: '20px' }}>
           <RoadmapGraph data={data} />
        </div>
      )}
    </div>
  );
}

export default App;