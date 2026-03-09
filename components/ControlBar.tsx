import React from 'react';
import { PlaybackSettings, VOICE_GROUPS, VolcVoiceName } from '../types';
import { PlayIcon, PauseIcon, SettingsIcon, VolumeIcon, RestartIcon } from './Icons';

// Simple Download Icon
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Key/Gear Icon for API Settings
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
     <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
   </svg>
);

interface ControlBarProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  settings: PlaybackSettings;
  onSettingsChange: (settings: PlaybackSettings) => void;
  onDownload: () => void;
  isDownloading: boolean;
  onOpenApiSettings: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  isLoading = false,
  onPlayPause,
  onRestart,
  settings,
  onSettingsChange,
  onDownload,
  isDownloading,
  onOpenApiSettings
}) => {
  
  return (
    <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <VolumeIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              DaFei<span className="text-primary">TTS</span>
            </h1>
          </div>
          {/* Mobile Play Button */}
          <div className="flex items-center gap-2 md:hidden">
             <button 
                onClick={onRestart}
                className="w-10 h-10 bg-gray-100 text-gray-600 hover:text-primary rounded-full flex items-center justify-center"
             >
                <RestartIcon className="w-5 h-5" />
             </button>
             <button 
                onClick={onPlayPause}
                disabled={isLoading}
                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
             >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-1" />
                )}
             </button>
          </div>
        </div>

        {/* Center: Playback Controls & Slider */}
        <div className="flex items-center gap-6 flex-1 justify-center w-full md:w-auto order-3 md:order-2">
          
           <div className="hidden md:flex items-center gap-3">
             <button 
              onClick={onRestart}
              className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-full"
              title="Restart"
             >
               <RestartIcon className="w-6 h-6" />
             </button>
             
             {/* Desktop Play Button */}
             <button 
              onClick={onPlayPause}
              disabled={isLoading}
              className="w-12 h-12 bg-primary hover:bg-active text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex-shrink-0 disabled:opacity-70 disabled:cursor-wait"
            >
               {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  isPlaying ? <PauseIcon className="w-5 h-5 fill-current" /> : <PlayIcon className="w-5 h-5 fill-current ml-1" />
                )}
            </button>
           </div>

          {/* Speed Slider */}
          <div className="flex flex-col w-full max-w-[200px] gap-1">
             <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Speed</span>
                <span>{settings.rate.toFixed(1)}x</span>
             </div>
             <input 
               type="range" 
               min="0.8" 
               max="2.0" 
               step="0.1" 
               value={settings.rate}
               onChange={(e) => onSettingsChange({...settings, rate: parseFloat(e.target.value)})}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-active"
             />
          </div>
        </div>

        {/* Right: Voices & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end order-2 md:order-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
           
           {/* Voice Selector */}
           <div className="relative group flex items-center gap-2">
             <button 
               onClick={onOpenApiSettings}
               className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-100 rounded-lg"
               title="API Key 设置"
             >
                <KeyIcon className="w-5 h-5" />
             </button>

             <div className="relative">
                <SettingsIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select 
                  className="bg-gray-100 border-none text-sm text-gray-700 rounded-lg pl-8 pr-8 py-2 focus:ring-2 focus:ring-primary outline-none w-[180px] truncate cursor-pointer appearance-none"
                  value={settings.voice}
                  onChange={(e) => onSettingsChange({...settings, voice: e.target.value as VolcVoiceName})}
                >
                  {VOICE_GROUPS.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.voices.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
             </div>
           </div>

           {/* Download Button */}
           <button
             onClick={onDownload}
             disabled={isDownloading}
             className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg"
             title="Download All as MP3"
           >
              {isDownloading ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">MP3</span>
           </button>

        </div>
      </div>
    </div>
  );
};

export default ControlBar;