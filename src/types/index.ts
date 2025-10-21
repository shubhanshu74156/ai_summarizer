export interface SummarizeButtonProps {
  // Required props
  urls?: string | string[] | null;
  openaiApiKey: string;

  // Optional OpenAI configuration
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview' | string;
  maxTokens?: number;
  summaryLength?: 'short' | 'medium' | 'long';
  outputFormat?: 'paragraph' | 'bullets' | 'numbered';
  customPrompt?: string;
  temperature?: number;
  domSummary?: boolean;
  summaryClass?: string | null;

  // UI customization
  buttonText?: string;
  loadingText?: string;
  className?: string;
  customStyles?: React.CSSProperties;
  disabled?: boolean;
  showProgress?: boolean;

  // Callbacks
  onSummaryComplete?: (summary: SummaryResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export interface SummaryResult {
  content: string;
  sourceCount: number;
  wordCount: number;
  processingTime: number;
  sources: SourceInfo[];
  model: string;
}

export interface SourceInfo {
  url: string;
  title: string;
  wordCount: number;
  error?: string;
}

export interface ContentExtractionResult {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  error?: string;
}

export interface OpenAIConfig {
  content: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  summaryLength: 'short' | 'medium' | 'long';
  customPrompt?: string;
  outputFormat: 'paragraph' | 'bullets' | 'numbered';
}
