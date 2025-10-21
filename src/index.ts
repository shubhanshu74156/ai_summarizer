// Main component export
export { SummarizeButton, SummarizeButton as default } from './components/SummarizeButton';

// Type exports
export type { 
  SummarizeButtonProps, 
  SummaryResult, 
  ContentExtractionResult,
  OpenAIConfig,
  SourceInfo
} from './types';

// Utility exports for advanced usage
export { 
  extractContentFromUrls,
  extractContentFromUrl
} from './utils/contentExtractor';

export { 
  generateSummary 
} from './utils/openaiClient';

export { 
  validateUrls, 
  validateApiKey, 
  sanitizeUrls,
  isValidUrl
} from './utils/urlValidator';

// CSS import (users need to import this separately)
import './components/SummarizeButton.css';
