import React, { useState, useEffect, useCallback, useRef } from 'react';
import ControlBar from './components/ControlBar';
import TextDisplay from './components/TextDisplay';
import ApiSettingsModal from './components/ApiSettingsModal';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { tokenizeText } from './utils/tokenizer';
import { PlaybackSettings, SentenceToken, DoubaoCredentials } from './types';
import { generateVolcAudioV3 } from './utils/volcengine';

// Simple Trash Icon for Clear Button
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const DEMO_TEXT = `To secure a future in Australia, mastering IT operations is crucial. CompTIA A+ certification acts as the foundational step for understanding hardware and software troubleshooting. Meanwhile, consistency in PTE practice will ensure the language barrier is broken. Stay focused, Da Fei.

Web development creates opportunities to build tools that solve real problems. By combining technical skills with persistence, you can achieve your migration goals. Remember, every line of code written is a step closer to your dream.`;

const DOUBAO_APP_ID_KEY = 'volcengineAppId';
const DOUBAO_API_KEY_KEY = 'doubaoApiKey';

const App: React.FC = () => {
  const [rawText, setRawText] = useState(DEMO_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [sentences, setSentences] = useState<SentenceToken[]>([]);
  
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-play state management
  const [autoPlay, setAutoPlay] = useState(false);

  const [settings, setSettings] = useState<PlaybackSettings>({
    rate: 1.0, 
    pitch: 1.0, 
    volume: 1.0, 
    voice: 'BV700_V2_streaming'
  });

  // Credential Management — simplified to just API Key
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [credentials, setCredentials] = useState<DoubaoCredentials>(() => {
    const savedAppId = typeof window !== 'undefined' ? localStorage.getItem(DOUBAO_APP_ID_KEY) || '' : '';
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem(DOUBAO_API_KEY_KEY) || '' : '';
    return { appId: savedAppId, apiKey: savedKey };
  });

  const handleSaveCredentials = (appId: string, apiKey: string) => {
    setCredentials({ appId, apiKey });
    localStorage.setItem(DOUBAO_APP_ID_KEY, appId);
    localStorage.setItem(DOUBAO_API_KEY_KEY, apiKey);
    setIsApiSettingsOpen(false);
  };

  useEffect(() => {
    const tokens = tokenizeText(rawText);
    setSentences(tokens);
    setCurrentSentenceIndex(0);
    setCurrentWordIndex(-1);
    setAutoPlay(false);
  }, [rawText]);

  // Callback when a sentence finishes playing
  const handleSentenceEnd = useCallback(() => {
      if (currentSentenceIndex < sentences.length - 1) {
          // Move to next sentence
          setCurrentSentenceIndex(prev => prev + 1);
          // autoPlay remains true, effect will trigger next play
      } else {
          // Finished all
          setAutoPlay(false);
          setCurrentSentenceIndex(0);
      }
  }, [currentSentenceIndex, sentences.length]);

  const handlePlaybackError = useCallback((msg: string) => {
      setAutoPlay(false); // Stop loop on error
      if (msg.includes("Missing Doubao API Key") || msg.includes("Missing Doubao App ID")) {
          setIsApiSettingsOpen(true);
      } else {
          alert("Playback Error: " + msg);
      }
  }, []);

  const { isPlaying, isLoading, speakSentence, pause, resume, stop } = useSpeechSynthesis({ 
      onEnd: handleSentenceEnd, 
      credentials,
      onError: handlePlaybackError
  });

  // Playback Loop Effect
  useEffect(() => {
      if (autoPlay && !isPlaying && !isLoading && sentences.length > 0) {
          const sentence = sentences[currentSentenceIndex];
          if (sentence) {
              speakSentence(sentence.text, settings);
          }
      }
  }, [autoPlay, currentSentenceIndex, sentences, settings, speakSentence, isPlaying, isLoading]);


  const handlePlayPause = () => {
    if (isPlaying) {
       // Pause
       pause();
       setAutoPlay(false);
    } else {
       if (autoPlay) {
           resume();
       } else {
           // Start playing
           setAutoPlay(true);
       }
    }
  };

  const handleRestart = () => {
      stop();
      setAutoPlay(false);
      setCurrentSentenceIndex(0);
      setCurrentWordIndex(-1);
      // Give state a moment to settle then start
      setTimeout(() => setAutoPlay(true), 100);
  };

  const handleWordClick = (sentenceIndex: number) => {
     stop();
     setCurrentSentenceIndex(sentenceIndex);
     setCurrentWordIndex(-1);
     setAutoPlay(true);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    if (!credentials.apiKey || !credentials.appId) {
        setIsApiSettingsOpen(true);
        return;
    }

    setIsDownloading(true);
    try {
        // V3 API returns a Blob directly
        const blob = await generateVolcAudioV3(rawText, settings.voice, credentials, settings.rate);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dafei-tts-${settings.voice}-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error(err);
        const e = err as Error;
        alert(`Download failed: ${e.message}`);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleClearText = () => {
    if (window.confirm("Are you sure you want to clear all text?")) {
      stop();
      setAutoPlay(false);
      setRawText("");
      setIsEditing(true); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <ControlBar 
        isPlaying={isPlaying || (autoPlay && isLoading)} 
        isLoading={isLoading}
        onPlayPause={handlePlayPause} 
        onRestart={handleRestart}
        settings={settings} 
        onSettingsChange={setSettings} 
        onDownload={handleDownload} 
        isDownloading={isDownloading} 
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />
      <main className="flex-grow relative">
        <div className="fixed bottom-8 right-8 z-40 flex items-center gap-3">
           <button 
             onClick={handleClearText}
             className="bg-white text-red-500 border border-red-100 w-12 h-12 rounded-full shadow-lg hover:bg-red-50 hover:scale-105 transition-all flex items-center justify-center"
             title="Clear Text"
           >
             <TrashIcon />
           </button>
           <button onClick={() => { if (!isEditing) stop(); setIsEditing(!isEditing); }} className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-all font-medium text-sm flex items-center gap-2">
             {isEditing ? 'Done Editing' : 'Edit Text'}
           </button>
        </div>
        <TextDisplay 
          sentences={sentences}
          currentSentenceIndex={currentSentenceIndex}
          currentWordIndex={currentWordIndex}
          onSentenceClick={handleWordClick}
          // Word click just plays sentence for now as we don't have word timestamps
          onWordClick={(sIdx) => handleWordClick(sIdx)}
          isEditing={isEditing}
          rawText={rawText}
          onTextChange={setRawText}
        />
      </main>
      
      <ApiSettingsModal 
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onSave={handleSaveCredentials}
        initialAppId={credentials.appId}
        initialApiKey={credentials.apiKey}
      />
    </div>
  );
};
export default App;