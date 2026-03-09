import { useState, useRef, useCallback, useEffect } from 'react';
import { PlaybackSettings, DoubaoCredentials } from '../types';
import { generateVolcAudioV3 } from '../utils/volcengine';

interface UseVolcSpeechProps {
  onEnd: () => void;
  credentials: DoubaoCredentials;
  onError: (msg: string) => void;
}

export const useSpeechSynthesis = ({ onEnd, credentials, onError }: UseVolcSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlaying(false);
        onEnd();
      };
      // Handle playback errors
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error", e);
        setIsPlaying(false);
        setIsLoading(false);
      };
    }
    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };
  }, [onEnd]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying && audioRef.current.src) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  }, [isPlaying]);

  const speakSentence = useCallback(async (
    text: string,
    settings: PlaybackSettings
  ) => {
    if (!audioRef.current) return;
    if (!text.trim()) {
        onEnd();
        return;
    }

    // Stop previous
    audioRef.current.pause();
    setIsPlaying(false);
    setIsLoading(true);

    try {
        // V3 API returns a Blob directly
        const blob = await generateVolcAudioV3(text, settings.voice, credentials, settings.rate);
        
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        
        const newUrl = URL.createObjectURL(blob);
        setAudioUrl(newUrl);
        
        audioRef.current.src = newUrl;
        audioRef.current.playbackRate = 1.0; // Speed is already set via API speed_ratio
        audioRef.current.volume = settings.volume; 
        
        await audioRef.current.play();
        setIsPlaying(true);
    } catch (e) {
        console.error("Doubao V3 Playback Failed", e);
        const err = e as Error;
        onError(err.message || "Failed to play audio");
    } finally {
        setIsLoading(false);
    }
  }, [credentials, audioUrl, onError, onEnd]);

  return {
    isPlaying,
    isLoading,
    speakSentence,
    pause,
    resume,
    stop
  };
};