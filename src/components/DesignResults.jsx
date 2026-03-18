import './DesignResults.css';

function DesignResults({ designs, selectedIndex, onSelectDesign }) {
  if (designs.length === 0) return null;

  const currentDesign = designs[selectedIndex] || designs[0];

  return (
    <div className="design-results">
      <h2>Generated Designs</h2>
      <p>Select a beautiful concept to see more details and redesign options.</p>

      <div className="design-display">
        {/* Main large display image */}
        <div className="main-image-container">
          <img className="main-image" src={currentDesign.url} alt={`Main Design`} />
          <div className="image-overlay"></div>
          <div className="design-badge">{currentDesign.style}</div>
        </div>

        {/* Thumbnail selector strip below the image (only shows if multiple) */}
        {designs.length > 1 && (
          <div className="variant-thumbnails">
            {designs.map((design, idx) => (
              <button 
                key={design.id} 
                className={`thumbnail-btn ${selectedIndex === idx ? 'active' : ''}`}
                onClick={() => onSelectDesign(idx)}
              >
                <img src={design.url} alt={`Variant ${design.id}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignResults;
