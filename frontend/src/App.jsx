import { useCallback, useState, useEffect } from 'react'; // <--- Import useEffect
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


  const [showDetails, setShowDetails] = useState(null);


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
<div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 2. Floating Header (Like a Toolbar) */}
      <div style={{ 
        position: 'absolute',    // Floats on top
        top: 0, 
        left: 0, 
        right: 0,                // Stretches full width
        zIndex: 10,              // Higher than canvas (1)
        padding: '15px 30px', 
        background: 'rgba(255, 255, 255, 0.9)', // Slight transparency
        backdropFilter: 'blur(5px)',            // Nice blur effect
        borderBottom: '1px solid #ddd', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Genealogy of Ideas 🧬</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={concept} 
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Search concept..."
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={() => handleSearch()} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {loading ? "..." : "Generate"}
            </button>
        </div>
      </div>

{/* 3. ERROR MESSAGE (Floating) */}
      {error && (
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, background: '#ffdddd', padding: '10px', borderRadius: '5px' }}>
          <p style={{ margin: 0, color: 'red' }}>{error}</p>
        </div>
      )}

      {/* 4. CANVAS LAYER (The Base) */}
      {/* If we have data, show the graph. It fills the parent (100vh) */}
      {data ? (
        <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
           <RoadmapGraph data={data} />
        </div>
      ) : (
        /* 5. EMPTY STATE / GALLERY (Centered in the middle of the screen) */
        !loading && (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ color: '#555' }}>Start your journey</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '600px', justifyContent: 'center', marginTop: '20px' }}>
              {recentTerms.map((item) => (
                <button 
                  key={item.slug} 
                  onClick={() => handleSearch(item.concept)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'transform 0.1s'
                  }}
                >
                  {item.concept}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;