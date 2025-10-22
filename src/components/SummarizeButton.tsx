import React, { useState, useCallback } from "react";
import type { SummarizeButtonProps, SummaryResult } from "../types";
import { extractContentFromUrls } from "../utils/contentExtractor";
import { generateSummary } from "../utils/openaiClient";
import { validateUrls, validateApiKey } from "../utils/urlValidator";
import "./SummarizeButton.css";
import Modal from "./Modal";

export const SummarizeButton: React.FC<SummarizeButtonProps> = ({
  urls,
  openaiApiKey,
  model = "gpt-3.5-turbo",
  maxTokens = 500,
  temperature = 0.3,
  customStyles,
  buttonText = "Summarize Content",
  loadingText = "Summarizing...",
  domSummary = false,
  summaryClass = "",
  onSummaryComplete,
  onError,
  onProgress,
  className = "",
  disabled = false,
  showProgress = true,
  summaryLength = "medium",
  customPrompt,
  outputFormat = "paragraph",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const updateProgress = useCallback(
    (value: number) => {
      setProgress(value);
      onProgress?.(value);
    },
    [onProgress]
  );

  const handleSummarize = useCallback(
  async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsLoading(true);
      setError(null);
      setSummary(null);
      updateProgress(0);

      let extractedContent = "";

      if (!validateApiKey(openaiApiKey)) {
        throw new Error('Invalid OpenAI API key. It should start with "sk-"');
      }

     
      if (domSummary) {
        const parentDiv = e.currentTarget.closest(`.${summaryClass}`) as HTMLElement | null;
        if (!parentDiv) {
          throw new Error("No parent container found for summarization.");
        }

        extractedContent = parentDiv?.innerText?.trim() ?? "";
        if (!extractedContent) {
          throw new Error("No content found in the DOM container to summarize.");
        }

        updateProgress(50);
      }
      else {
        if (!validateUrls(urls)) {
          throw new Error("Invalid URLs provided. URLs must start with http:// or https://");
        }

        updateProgress(10);
        extractedContent = await extractContentFromUrls(urls ?? null, (extractProgress) => {
          updateProgress(10 + extractProgress * 0.6); // 10% → 70%
        });

        updateProgress(70);
      }

      const summaryResult = await generateSummary({
        content: extractedContent,
        apiKey: openaiApiKey,
        model,
        maxTokens,
        temperature,
        summaryLength,
        customPrompt,
        outputFormat,
      });

      updateProgress(100);
      setSummary(summaryResult);
      onSummaryComplete?.(summaryResult);
      setIsOpen(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate summary. Please try again.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => updateProgress(0), 2000);
    }
  },
  [
    urls,
    openaiApiKey,
    model,
    maxTokens,
    temperature,
    summaryLength,
    customPrompt,
    outputFormat,
    domSummary,
    onSummaryComplete,
    onError,
    updateProgress,
  ]
);

  const buttonClassName = `summarize-button ${className} ${
    isLoading ? "loading" : ""
  } ${disabled ? "disabled" : ""}`.trim();

  return (
    <div className="summarize-button-container">
      <button
        onClick={handleSummarize}
        disabled={disabled || isLoading}
        className={buttonClassName}
        style={customStyles}
        aria-busy={isLoading}
        aria-label={isLoading ? loadingText : buttonText}
      >
        {isLoading ? loadingText : buttonText}
      </button>

      {showProgress && isLoading && progress > 0 && (
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon" aria-hidden="true">
            ⚠️
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* ✅ Show modal when summary is ready */}
      {summary && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="summary-container">
            <h3>Summary</h3>
            <div
              className="summary-content"
              dangerouslySetInnerHTML={{ __html: summary.content }}
            />
            <div className="summary-meta">
              <span>Sources: {summary.sourceCount}</span>
              <span>Words: {summary.wordCount}</span>
              <span>Time: {summary.processingTime}ms</span>
              <span>Model: {summary.model}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SummarizeButton;
