import type { ContentExtractionResult } from '../types';

export async function extractContentFromUrls(
  urls: string | string[] | null,
  onProgress?: (progress: number) => void
): Promise<string> {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const results: ContentExtractionResult[] = [];

  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    const progressPercent = Math.round((i / urlArray.length) * 100);
    onProgress?.(progressPercent);

    try {
      const result = await extractContentFromUrl(url);
      results.push(result);
    } catch (error) {
      results.push({
        url: "",
        title: 'Failed to extract',
        content: '',
        wordCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  onProgress?.(100);

  const combinedContent = results
    .filter(result => result.content.length > 0)
    .map(result => {
      const header = `Source: ${result.title} (${result.url})`;
      const separator = '='.repeat(header.length);
      return `${header}\n${separator}\n\n${result.content}`;
    })
    .join('\n\n---\n\n');

  if (!combinedContent) {
    throw new Error('No content could be extracted from any of the provided URLs');
  }

  return combinedContent;
}

async function extractContentFromUrl(url: string | null): Promise<ContentExtractionResult> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url ?? "")}`;

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const htmlContent = data.contents;

    if (!htmlContent) {
      throw new Error('No content received from URL');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      'iframe', 'noscript', 'svg',
      '.advertisement', '.ad', '.ads', '.sidebar', '.popup', 
      '.modal', '.cookie-banner', '.newsletter', '.social-share'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    let title = 'Untitled';
    const titleElement = doc.querySelector('title') || 
                        doc.querySelector('h1') || 
                        doc.querySelector('.title') ||
                        doc.querySelector('[class*="title"]');

    if (titleElement?.textContent) {
      title = titleElement.textContent.trim();
    }

    let content = '';

    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.content',
      '.post',
      '.article',
      '#content'
    ];

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent && element.textContent.trim().length > 200) {
        content = extractTextFromElement(element);
        break;
      }
    }

    if (!content && doc.body) {
      content = extractTextFromElement(doc.body);
    }

    content = cleanText(content);

    if (!content || content.length < 50) {
      throw new Error('Insufficient content extracted from URL');
    }

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    return {
      url: "",
      title,
      content,
      wordCount
    };

  } catch (error) {
    throw new Error(
      `Failed to extract content from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function extractTextFromElement(element: Element): string {
  const textElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote');

  if (textElements.length > 0) {
    return Array.from(textElements)
      .map(el => el.textContent?.trim() || '')
      .filter(text => text.length > 0)
      .join('\n\n');
  }

  return element.textContent || '';
}

function cleanText(text: string): string {
  return text
    // Remove multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Remove multiple newlines (keep max 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

export { extractContentFromUrl };
