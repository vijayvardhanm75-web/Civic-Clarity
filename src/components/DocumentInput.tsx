import React, { useState, useRef, DragEvent } from 'react';
import {
  Sparkles,
  Trash2,
  ArrowRight,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
  Eye,
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, getSampleNoticeImage, getSampleBlurryImage } from '../data/sampleDocs';

interface DocumentInputProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  selectedFile: {
    fileData: string;
    mimeType: string;
    fileName: string;
    fileSizeFormatted?: string;
    previewUrl?: string;
  } | null;
  setSelectedFile: (file: {
    fileData: string;
    mimeType: string;
    fileName: string;
    fileSizeFormatted?: string;
    previewUrl?: string;
  } | null) => void;
  onSimplify: () => void;
  isLoading: boolean;
  onSelectSample: (sampleId: string) => void;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  documentText,
  setDocumentText,
  selectedFile,
  setSelectedFile,
  onSimplify,
  isLoading,
  onSelectSample,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>(
    selectedFile ? 'upload' : documentText ? 'paste' : 'upload'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const wordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;
  const charCount = documentText.length;

  const handleFileProcess = (file: File) => {
    setUploadError(null);

    // Validate type
    const validMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!validMimeTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      setUploadError('Please upload a valid document format: PDF, JPG, or PNG.');
      return;
    }

    // Limit size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds 20MB limit. Please choose a smaller photo or PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      setSelectedFile({
        fileData: resultStr,
        mimeType: file.type || 'image/jpeg',
        fileName: file.name,
        fileSizeFormatted: sizeFormatted,
        previewUrl: file.type.startsWith('image/') ? resultStr : undefined,
      });
      setInputMode('upload');
    };

    reader.onerror = () => {
      setUploadError('Failed to read the selected file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const hasValidInput = Boolean(
    (inputMode === 'upload' && selectedFile) ||
    (inputMode === 'paste' && documentText.trim().length >= 10)
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
      {/* Header & Quick Sample Buttons */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Submit Government or Legal Document</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload photos, scans, PDFs, or paste text in English, Hindi, Kannada, or regional languages
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 self-start sm:self-auto">
            <button
              type="button"
              id="tab-upload-mode"
              onClick={() => setInputMode('upload')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File / Photo</span>
            </button>
            <button
              type="button"
              id="tab-paste-mode"
              onClick={() => setInputMode('paste')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                inputMode === 'paste'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paste Text</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Selector Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Test Samples:
          </span>
          {SAMPLE_DOCUMENTS.map((doc) => {
            const isRed = doc.urgencyHint === 'RED';
            const isYellow = doc.urgencyHint === 'YELLOW';
            const isGreen = doc.urgencyHint === 'GREEN';
            const isUnreadable = doc.urgencyHint === 'UNREADABLE';

            const badgeColor = isRed
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
              : isYellow
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
              : isGreen
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200';

            return (
              <button
                key={doc.id}
                type="button"
                id={`sample-btn-${doc.id}`}
                onClick={() => {
                  onSelectSample(doc.id);
                  if (doc.type === 'image') {
                    setInputMode('upload');
                  } else {
                    setInputMode('paste');
                  }
                }}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${badgeColor}`}
                title={doc.description}
              >
                {doc.type === 'image' ? '🖼️ ' : ''}
                {isRed ? '🔴 ' : isYellow ? '🟡 ' : isGreen ? '🟢 ' : '⚠️ '}
                {doc.title.split(' ')[0]} {doc.type === 'image' && isUnreadable ? 'Blurry (Test)' : doc.type === 'image' ? 'Photo Notice' : doc.id.includes('kannada') ? 'Kannada' : doc.id.includes('tax') ? 'Tax (7d)' : doc.id.includes('pension') ? 'Pension' : 'Water'}
              </button>
            );
          })}
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Mode 1: Upload File or Phone Photo */}
      {inputMode === 'upload' && (
        <div>
          {selectedFile ? (
            /* Selected File Card Preview */
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {selectedFile.previewUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
                      <img
                        src={selectedFile.previewUrl}
                        alt="Uploaded document thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <FileText className="h-7 w-7" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-800 uppercase">
                        {selectedFile.mimeType.includes('pdf') ? 'PDF Document' : 'Photo / Image'}
                      </span>
                      {selectedFile.fileSizeFormatted && (
                        <span className="text-xs text-slate-500 font-mono">
                          {selectedFile.fileSizeFormatted}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                      {selectedFile.fileName}
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready for clarity check & translation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Change File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.005]'
                  : 'border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm group-hover:scale-105 transition">
                <FileUp className="h-7 w-7" />
              </div>

              <h3 className="mt-3.5 text-base sm:text-lg font-bold text-slate-900">
                Upload Scanned Notice or Photo
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                Drag and drop your file here, or click to browse. We accept <strong className="font-semibold text-slate-700">PDF, JPG, and PNG</strong> documents.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs group-hover:bg-blue-800 transition">
                  <Upload className="h-3.5 w-3.5" />
                  Browse Document
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  <Camera className="h-3.5 w-3.5 text-blue-600" />
                  Camera Photo
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                Supports phone camera captures • Multi-language OCR • Max 20MB
              </p>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Mode 2: Paste Raw Text */}
      {inputMode === 'paste' && (
        <div className="relative">
          <textarea
            id="document-text-input"
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste full text here from a notice letter, official PDF copy, SMS circular, or court document..."
            rows={7}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          />

          {documentText.length > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                id="clear-input-btn"
                type="button"
                onClick={() => setDocumentText('')}
                disabled={isLoading}
                className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Controls & Submit Button */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {inputMode === 'paste' ? (
            <span>
              <strong className="font-semibold text-slate-700">{wordCount}</strong> words (
              <span className="font-mono text-slate-600">{charCount}</span> chars)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Automated image legibility & OCR validation
            </span>
          )}
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Plain 9th-grade language
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="simplify-doc-btn"
            type="button"
            onClick={onSimplify}
            disabled={isLoading || !hasValidInput}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Analyzing & Translating Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Simplify Document</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
