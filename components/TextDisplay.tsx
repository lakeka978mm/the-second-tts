import React, { useRef, useEffect } from 'react';
import { SentenceToken } from '../types';

interface TextDisplayProps {
  sentences: SentenceToken[];
  currentSentenceIndex: number;
  currentWordIndex: number;
  onSentenceClick: (index: number) => void;
  // Added optional prop for word level precision
  onWordClick?: (sentenceIndex: number, wordIndex: number) => void;
  isEditing: boolean;
  rawText: string;
  onTextChange: (text: string) => void;
}

const TextDisplay: React.FC<TextDisplayProps> = ({
  sentences,
  currentSentenceIndex,
  currentWordIndex,
  onSentenceClick,
  onWordClick,
  isEditing,
  rawText,
  onTextChange
}) => {
  const activeSentenceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSentenceIndex]);

  if (isEditing) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <textarea
          className="w-full h-[60vh] p-6 text-lg text-gray-700 bg-white rounded-2xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-loose font-serif transition-shadow"
          placeholder="Paste text..."
          value={rawText}
          onChange={(e) => onTextChange(e.target.value)}
        />
        <div className="mt-4 text-center text-gray-500 text-sm">Switch to "Play Mode" to listen.</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 min-h-[60vh]">
        <div className="prose prose-lg max-w-none leading-loose text-gray-700 font-serif">
          {sentences.length === 0 ? (
            <p className="text-gray-400 italic text-center">No text to display.</p>
          ) : (
            sentences.map((sentence, sIndex) => {
              const isActiveSentence = sIndex === currentSentenceIndex;
              return (
                <span
                  key={sentence.id}
                  ref={isActiveSentence ? activeSentenceRef : null}
                  // Fallback if clicking the space between words
                  onClick={() => onSentenceClick(sIndex)} 
                  className={`transition-colors duration-150 rounded px-1 ${isActiveSentence ? 'bg-blue-50/30' : ''}`}
                >
                  {sentence.words.map((word, wIndex) => {
                    const isActiveWord = isActiveSentence && wIndex === currentWordIndex;
                    return (
                      <span key={`${sentence.id}-w-${wIndex}`}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onWordClick) {
                                onWordClick(sIndex, wIndex);
                            } else {
                                onSentenceClick(sIndex);
                            }
                          }}
                          className={`
                            cursor-pointer transition-all duration-75 rounded px-0.5
                            ${isActiveWord ? 'bg-primary text-white font-medium shadow-sm scale-110 inline-block mx-0.5' : 'hover:bg-gray-100 hover:text-primary'}
                            ${!isActiveWord && isActiveSentence ? 'text-gray-900' : ''}
                          `}
                        >
                          {word.text}
                        </span>
                        {' '} 
                      </span>
                    );
                  })}
                </span>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-8 h-20"></div>
    </div>
  );
};

export default TextDisplay;