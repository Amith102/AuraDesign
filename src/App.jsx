import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Chatbot from './components/Chatbot';
import DesignResults from './components/DesignResults';
import RedesignPanel from './components/RedesignPanel';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Interior Designer. To get started, please tell me about the room you want to design (e.g., size, type, preferred style).' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(null);
  
  // WebSocket State
  const [socketId, setSocketId] = useState(null);
  const [progressStatus, setProgressStatus] = useState({ message: '', percent: 0 });

  // App Mode State
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'gallery'
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      setSocketId(socket.id);
    });
    
    socket.on('progress', (data) => {
      setProgressStatus(data);
    });

    return () => socket.disconnect();
  }, []);

  const handleSendMessage = async (text) => {
    const newUserMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsGenerating(true);
    
    try {
      // 1. Send the chat context to our Express backend
      const chatRes = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newUserMsg] })
      });
      const chatData = await chatRes.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: chatData.reply }]);
      
      // 2. Trigger Image Generation via Express backend
      setProgressStatus({ message: 'Starting generation...', percent: 5 });
      const imageRes = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `A photorealistic interior design of a room: ${text}, detailed, architectural digest, 4k`,
          socketId: socketId 
        })
      });
      const { imageUrls } = await imageRes.json();
      
      if (!imageUrls || imageUrls.length === 0) {
         throw new Error("No images generated");
      }

      setDesigns([
        {
          id: 1,
          url: imageUrls[0] || '/design1.png',
          style: 'DALL-E Concept 1',
          colors: ['#ffffff', '#e2e8f0', '#0f172a']
        },
        {
          id: 2,
          url: imageUrls[1] || '/design2.png',
          style: 'DALL-E Concept 2',
          colors: ['#f8fafc', '#78716c', '#000']
        },
        {
          id: 3,
          url: imageUrls[2] || '/design3.png',
          style: 'DALL-E Concept 3',
          colors: ['#27272a', '#b45309', '#000']
        },
        {
          id: 4,
          url: imageUrls[3] || '/design1.png',
          style: 'DALL-E Concept 4',
          colors: ['#8b5cf6', '#ec4899', '#000']
        },
        {
          id: 5,
          url: imageUrls[4] || '/design2.png',
          style: 'DALL-E Concept 5',
          colors: ['#dcfce7', '#22c55e', '#000']
        }
      ]);
      setSelectedDesignIndex(0);
    } catch (error) {
      console.error('Error fetching from API:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Oops! I had trouble connecting to the backend server. Make sure it is running on port 3001.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadGallery = async () => {
    setViewMode('gallery');
    setIsLoadingGallery(true);
    try {
      const res = await fetch('http://localhost:3001/api/gallery');
      const data = await res.json();
      setGalleryItems(data.designs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const currentDesign = designs[selectedDesignIndex] || null;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <h1>AuraDesign</h1>
        </div>
        
        <div className="header-nav">
          <button 
            className={`nav-btn ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => setViewMode('chat')}
          >
            Design Studio
          </button>
          <button 
            className={`nav-btn ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={loadGallery}
          >
            Global Gallery
          </button>
        </div>
      </header>

      <main className="app-content">
          <aside className="chat-sidebar" style={{ display: viewMode === 'chat' ? 'flex' : 'none' }}>
            <Chatbot 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isGenerating={isGenerating} 
            />
          </aside>
          
          <section className="main-view">
            {viewMode === 'gallery' ? (
              <div className="gallery-container">
                <h2>Saved Designs Gallery</h2>
                <p>Explore all previous designs generated securely through Supabase.</p>
                
                {isLoadingGallery ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading database history...</p>
                  </div>
                ) : galleryItems.length === 0 ? (
                  <div className="empty-state">
                    <p>No designs saved in the database yet!</p>
                  </div>
                ) : (
                  <div className="designs-grid">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="design-card">
                        <div className="design-image-wrapper">
                          <img src={item.image_url} alt="Gallery item" />
                          <div className="design-overlay">
                            <span className="style-tag">AI Generated</span>
                          </div>
                        </div>
                        <div className="gallery-metadata">
                          <p className="gallery-prompt">"{item.prompt}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Existing Chat/Results View
              designs.length === 0 && !isGenerating ? (
                <div className="empty-state">
                  <div className="empty-icon">✨</div>
                  <h2>Ready to visualize your space?</h2>
                  <p>Chat with our AI to generate multiple stunning interior designs tailored to your taste.</p>
                </div>
              ) : isGenerating && designs.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>{progressStatus.message || 'Dreaming up your perfect space...'}</p>
                  {progressStatus.percent > 0 && (
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progressStatus.percent}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="results-container">
                  <DesignResults 
                    designs={designs} 
                    selectedIndex={selectedDesignIndex} 
                    onSelectDesign={setSelectedDesignIndex} 
                    isGenerating={isGenerating}
                  />
                  {currentDesign && (
                    <RedesignPanel design={currentDesign} />
                  )}
                </div>
              )
            )}
          </section>
        </main>
    </div>
  );
}

export default App;
