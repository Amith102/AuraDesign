import { useState } from 'react';
import ModelViewer from './ModelViewer';
import './RedesignPanel.css';

function RedesignPanel({ design }) {
  const [activeTab, setActiveTab] = useState('colors');
  const [isRedesigning, setIsRedesigning] = useState(false);

  // Redesign Options
  const tabs = [
    { id: 'colors', label: 'Color Palette' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'lighting', label: 'Lighting' },
    { id: '3d', label: '3D View' },
  ];

  const handleApply = () => {
    setIsRedesigning(true);
    // Simulate API call for redesign
    setTimeout(() => {
      setIsRedesigning(false);
      alert('Redesign applied successfully! (Simulated)');
    }, 1500);
  };

  return (
    <div className="redesign-panel">
      <div className="panel-header">
        <h3>Tweak Design {design.id}</h3>
        <span className="style-tag">{design.style}</span>
      </div>

      <div className="redesign-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'colors' && (
          <div className="option-section">
            <h4>Extract Color Palette</h4>
            <div className="color-circles">
              {design.colors.map((color, i) => (
                <div 
                  key={i} 
                  className="color-circle" 
                  style={{ backgroundColor: color }}
                  title={color}
                ></div>
              ))}
            </div>
            <h4>Change Color Scheme</h4>
            <div className="scheme-list">
              <button className="scheme-btn" style={{ background: 'linear-gradient(to right, #fecdd3, #fda4af)' }}>Warm Monotone</button>
              <button className="scheme-btn" style={{ background: 'linear-gradient(to right, #bfdbfe, #93c5fd)' }}>Cool Ocean</button>
              <button className="scheme-btn" style={{ background: 'linear-gradient(to right, #dcfce7, #86efac)' }}>Nature Greens</button>
            </div>
          </div>
        )}

        {activeTab === 'furniture' && (
          <div className="option-section">
            <h4>Furniture Arrangement</h4>
            <p className="description">How would you like to update the furniture layout?</p>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="furniture" defaultChecked />
                <span>Optimize for Space</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="furniture" />
                <span>Central Focus</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="furniture" />
                <span>Minimalist</span>
              </label>
            </div>
            
            <h4 style={{ marginTop: '16px' }}>Swap Items</h4>
            <select className="swap-select">
              <option>Swap Sofa for Sectional</option>
              <option>Change Coffee Table</option>
              <option>Update Rug Pattern</option>
            </select>
          </div>
        )}

        {activeTab === 'lighting' && (
          <div className="option-section">
            <h4>Lighting Vibe</h4>
            <div className="lighting-grid">
              <button className="light-btn selected">☀️ Natural Daylight</button>
              <button className="light-btn">🌙 Evening Cozy</button>
              <button className="light-btn">💡 Studio Bright</button>
              <button className="light-btn">🕯️ Romantic Dim</button>
            </div>
          </div>
        )}

        {activeTab === '3d' && (
          <div className="option-section">
            <h4>Interactive 3D Preview</h4>
            <p className="description" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Spin, zoom, and inspect a parameterized 3D model representing the primary furniture element of this design!
            </p>
            <ModelViewer />
          </div>
        )}
      </div>

      <div className="redesign-actions">
        <button 
          className="apply-btn" 
          onClick={handleApply}
          disabled={isRedesigning}
        >
          {isRedesigning ? 'Applying Changes...' : '✨ Apply Redesign'}
        </button>
      </div>
    </div>
  );
}

export default RedesignPanel;
