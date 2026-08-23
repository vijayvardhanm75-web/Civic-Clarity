import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Languages, Loader2, Sparkles, Globe } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface SummaryCardProps {
  summary: string;
  activeLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isTranslating: boolean;
  detectedSourceLanguage?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  activeLanguage,
  onLanguageChange,
  isTranslating,
  detectedSourceLanguage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When summary or language changes, stop current audio
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [summary, activeLanguage]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.92; // Slightly slower, clear civic pace
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    if (activeLanguage === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (activeLanguage === 'kn') {
      utterance.lang = 'kn-IN';
      const knVoice = voices.find((v) => v.lang.startsWith('kn'));
      if (knVoice) utterance.voice = knVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(
        (v) =>
          v.lang.startsWith('en-IN') ||
          v.lang.startsWith('en-GB') ||
          v.lang.startsWith('en-US')
      );
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Plain-Language Summary
              </h3>
              {detectedSourceLanguage && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  <Globe className="h-3 w-3 text-slate-400" />
                  Source: {detectedSourceLanguage}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              9th-grade reading level • Jargon-free
            </p>
          </div>
        </div>

        {/* Listen Button & Language Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TTS Listen Button */}
          {speechSupported && (
            <div className="flex items-center gap-1">
              <button
                id="btn-listen-summary"
                type="button"
                onClick={handleSpeak}
                disabled={isTranslating}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isPlaying
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
                title="Listen to summary using text-to-speech"
              >
                {isPlaying && !isPaused ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                    <span className="flex gap-0.5 items-center ml-1">
                      <span className="h-2 w-0.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                      <span className="h-3 w-0.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                      <span className="h-2 w-0.5 animate-bounce rounded-full bg-white" />
                    </span>
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>🔊 Listen</span>
                  </>
                )}
              </button>

              {isPlaying && (
                <button
                  id="btn-stop-listen"
                  type="button"
                  onClick={handleStop}
                  className="rounded-lg border border-slate-200 bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  title="Stop audio"
                >
                  <VolumeX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Language Toggle (English / Hindi / Kannada) */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => onLanguageChange('en')}
              disabled={isTranslating}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                activeLanguage === 'en'
                  ? 'bg-blue-700 font-semibold text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hi"
              type="button"
              onClick={() => onLanguageChange('hi')}
              disabled={isTranslating}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                activeLanguage === 'hi'
                  ? 'bg-blue-700 font-semibold text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              id="lang-btn-kn"
              type="button"
              onClick={() => onLanguageChange('kn')}
              disabled={isTranslating}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                activeLanguage === 'kn'
                  ? 'bg-blue-700 font-semibold text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
          </div>
        </div>
      </div>

      {/* Summary Text Content */}
      <div className="relative min-h-[65px]">
        {isTranslating ? (
          <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>
              Translating summary into {activeLanguage === 'hi' ? 'Hindi (हिन्दी)' : activeLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' : 'English'}...
            </span>
          </div>
        ) : (
          <p className="text-base sm:text-lg leading-relaxed text-slate-800 font-normal">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};
