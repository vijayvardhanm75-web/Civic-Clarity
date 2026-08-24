/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentInput } from './components/DocumentInput';
import { UrgencyBadge } from './components/UrgencyBadge';
import { SummaryCard } from './components/SummaryCard';
import { ImpactCard } from './components/ImpactCard';
import { ActionChecklist } from './components/ActionChecklist';
import { DeadlinesSection } from './components/DeadlinesSection';
import { GlossarySection } from './components/GlossarySection';
import { ActionBar } from './components/ActionBar';
import { UnreadableWarning } from './components/UnreadableWarning';
import { SampleModal } from './components/SampleModal';
import { HistoryModal } from './components/HistoryModal';
import { SAMPLE_DOCUMENTS, getSampleNoticeImage, getSampleBlurryImage } from './data/sampleDocs';
import { SimplifiedResult, UnreadableResult, SupportedLanguage, TranslatedContent } from './types';
import { AlertCircle, Scale, ShieldCheck } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'civicclarity_history_v2';

export default function App() {
  const [documentText, setDocumentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    fileData: string;
    mimeType: string;
    fileName: string;
    fileSizeFormatted?: string;
    previewUrl?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unreadableResult, setUnreadableResult] = useState<UnreadableResult | null>(null);
  const [currentResult, setCurrentResult] = useState<SimplifiedResult | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // History state (last 3 items)
  const [history, setHistory] = useState<SimplifiedResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved).slice(0, 3));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  const saveToHistory = (item: SimplifiedResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [item, ...filtered].slice(0, 3);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving history:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing history:', e);
    }
  };

  const handleSimplify = async () => {
    const hasText = Boolean(documentText.trim().length >= 5);
    const hasFile = Boolean(selectedFile && selectedFile.fileData);

    if (!hasText && !hasFile) {
      setErrorMessage('Please provide document text or upload a document file to proceed.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setUnreadableResult(null);
    setActiveLanguage('en');

    try {
      const payload = hasFile
        ? {
            fileData: selectedFile?.fileData,
            mimeType: selectedFile?.mimeType,
            fileName: selectedFile?.fileName,
          }
        : {
            documentText: documentText.trim(),
          };

      const response = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to simplify the document.');
      }

      const resultData = await response.json();

      // Check if image legibility check failed
      if (resultData.isLegible === false) {
        setCurrentResult(null);
        setUnreadableResult({
          isLegible: false,
          unreadableReason: resultData.unreadableReason,
          qualityGuidance: resultData.qualityGuidance,
          detectedIssues: resultData.detectedIssues,
          fileName: selectedFile?.fileName || 'Uploaded Document',
        });

        // Scroll to warning state
        setTimeout(() => {
          const warningEl = document.getElementById('unreadable-warning-card');
          if (warningEl) {
            warningEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }

      // Valid readable result
      setUnreadableResult(null);
      setCurrentResult(resultData);
      saveToHistory(resultData);

      // Scroll smoothly down to the analysis result
      setTimeout(() => {
        const resultElement = document.getElementById('civic-analysis-result');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Simplification error:', err);
      setErrorMessage(
        err.message || 'Something went wrong while processing the document. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_DOCUMENTS.find((d) => d.id === sampleId);
    if (!found) return;

    setErrorMessage(null);
    setUnreadableResult(null);
    setCurrentResult(null);

    if (found.type === 'image') {
      let dataUrl = '';
      if (found.id === 'blurry-unreadable-sample') {
        dataUrl = getSampleBlurryImage();
      } else {
        dataUrl = getSampleNoticeImage();
      }

      setSelectedFile({
        fileData: dataUrl,
        mimeType: 'image/jpeg',
        fileName: found.imageFileName || 'Sample_Notice.jpg',
        fileSizeFormatted: '180 KB',
        previewUrl: dataUrl,
      });
      setDocumentText('');
    } else {
      setSelectedFile(null);
      setDocumentText(found.text || '');
    }
  };

  const handleLanguageChange = async (targetLang: SupportedLanguage) => {
    if (!currentResult || targetLang === activeLanguage) return;

    setActiveLanguage(targetLang);

    if (targetLang === 'en') {
      return;
    }

    // Check if translation is already cached
    if (currentResult.translations?.[targetLang]) {
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang,
          summary: currentResult.summary,
          whatThisMeansForYou: currentResult.whatThisMeansForYou,
          urgencyReason: currentResult.urgency.reason,
          actionItems: currentResult.actionItems.map((a) => a.text),
          glossary: currentResult.glossary,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const translationData: TranslatedContent = await response.json();

      setCurrentResult((prev) => {
        if (!prev) return prev;
        const updatedTranslations = {
          ...(prev.translations || {}),
          [targetLang]: translationData,
        };
        const updated = {
          ...prev,
          translations: updatedTranslations,
        };
        saveToHistory(updated);
        return updated;
      });
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectHistoryItem = (item: SimplifiedResult) => {
    setSelectedFile(null);
    setDocumentText(item.originalText || '');
    setCurrentResult(item);
    setUnreadableResult(null);
    setActiveLanguage('en');
    setErrorMessage(null);
    setTimeout(() => {
      const resultElement = document.getElementById('civic-analysis-result');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleReset = () => {
    setDocumentText('');
    setSelectedFile(null);
    setCurrentResult(null);
    setUnreadableResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get active translated or default text
  const currentTranslation = currentResult?.translations?.[activeLanguage];
  const displaySummary = currentTranslation?.summary || currentResult?.summary || '';
  const displayWhatThisMeans =
    currentTranslation?.whatThisMeansForYou || currentResult?.whatThisMeansForYou || '';
  const displayUrgencyReason = currentTranslation?.urgencyReason || currentResult?.urgency.reason;
  const displayActionTexts = currentTranslation?.actionItems;
  const displayGlossary = currentTranslation?.glossary || currentResult?.glossary;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased">
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenSamples={() => setIsSamplesOpen(true)}
      />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:max-w-4xl sm:px-6 sm:py-8 lg:max-w-6xl lg:px-8 lg:py-10 xl:max-w-7xl">
        {/* Civic Trust Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
            Demystify Government & Legal Notices
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
            Upload any circular, tax assessment, summons, or photo of a notice in any language to get an instant, plain-language breakdown with urgency ratings, deadlines, and audio speech.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="text-sm font-medium">
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Core Screen: Input Area (Upload or Paste) */}
        <DocumentInput
          documentText={documentText}
          setDocumentText={setDocumentText}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onSimplify={handleSimplify}
          isLoading={isLoading}
          onSelectSample={handleSelectSample}
        />

        {/* Distinct Unreadable Image Warning State (Critical Requirement) */}
        {unreadableResult && (
          <div className="mt-8">
            <UnreadableWarning
              result={unreadableResult}
              onRetryUpload={() => {
                setUnreadableResult(null);
                setSelectedFile(null);
              }}
              onSelectSample={handleSelectSample}
            />
          </div>
        )}

        {/* Core Results Section (Shown once document is successfully read) */}
        {currentResult && (
          <div id="civic-analysis-result" className="mt-8 space-y-5 pt-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Scale className="h-4 w-4 text-blue-700" />
                <span>Document Analysis & Translation</span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Grounded 100% in document contents
              </span>
            </div>

            {/* 1. Urgency badge at top */}
            <UrgencyBadge
              urgency={currentResult.urgency}
              urgencyReasonDisplay={displayUrgencyReason}
            />

            {/* 2. Summary card (with Listen button & Language Toggle) */}
            <SummaryCard
              summary={displaySummary}
              activeLanguage={activeLanguage}
              onLanguageChange={handleLanguageChange}
              isTranslating={isTranslating}
              detectedSourceLanguage={currentResult.detectedSourceLanguage}
            />

            {/* 3. "What This Means For You" */}
            <ImpactCard
              whatThisMeansForYou={displayWhatThisMeans}
              isTranslating={isTranslating}
            />

            {/* 4. Action items checklist */}
            <ActionChecklist
              actionItems={currentResult.actionItems}
              translatedActionTexts={displayActionTexts}
              hasNoActions={currentResult.hasNoActions}
              isTranslating={isTranslating}
            />

            {/* 5. Deadlines */}
            <DeadlinesSection
              deadlines={currentResult.deadlines}
              hasNoDeadlines={currentResult.hasNoDeadlines}
            />

            {/* 6. Glossary */}
            <GlossarySection
              glossary={currentResult.glossary}
              translatedGlossary={displayGlossary}
              isTranslating={isTranslating}
            />

            {/* Utilities / Action Bar (Copy summary, Print, Reset) */}
            <ActionBar
              result={currentResult}
              activeLanguage={activeLanguage}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Session History Section at bottom */}
        {history.length > 0 && !currentResult && !unreadableResult && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Recent Simplified Documents ({history.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                View all →
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">
                      {item.urgency.level === 'RED' ? '🔴' : item.urgency.level === 'YELLOW' ? '🟡' : '🟢'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.summary}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 shrink-0">Open →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-slate-500 sm:max-w-4xl sm:px-6 lg:max-w-6xl lg:px-8 xl:max-w-7xl">
          <p className="font-medium text-slate-700">CivicClarity — Accessible Civic Transparency</p>
          <p className="mt-1 text-slate-400">
            AI-powered plain language simplification. Always consult official municipal channels or legal counsel for statutory proceedings.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SampleModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelect={handleSelectSample}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
