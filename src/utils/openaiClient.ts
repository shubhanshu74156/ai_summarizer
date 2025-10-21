import type { OpenAIConfig, SummaryResult, SourceInfo } from '../types';

export async function generateSummary(config: OpenAIConfig): Promise<SummaryResult> {
  const startTime = Date.now();

  const prompt = buildPrompt(config);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, accurate, and well-structured summaries of web content. Focus on extracting key information, main arguments, and important conclusions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const summaryContent = data.choices?.[0]?.message?.content?.trim();

    if (!summaryContent) {
      throw new Error('No summary content generated from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    const wordCount = summaryContent.split(/\s+/).filter((word: string | any[]) => word.length > 0).length;
    const sources = extractSourceInfo(config.content);

    return {
      content: formatSummary(summaryContent, config.outputFormat),
      sourceCount: sources.length,
      wordCount,
      processingTime,
      sources,
      model: config.model
    };

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate summary: Unknown error occurred');
  }
}

function buildPrompt(config: OpenAIConfig): string {
  const lengthInstructions = {
    short: 'in 2-3 concise sentences',
    medium: 'in 1-2 well-developed paragraphs',
    long: 'in 3-4 detailed paragraphs with comprehensive analysis'
  };

  const formatInstructions = {
    paragraph: 'Write the summary as flowing, well-structured paragraphs.',
    bullets: 'Present the summary as clear bullet points, with each point capturing a key insight.',
    numbered: 'Present the summary as numbered points in order of importance.'
  };

  // Use custom prompt if provided
  if (config.customPrompt) {
    return `${config.customPrompt}

${formatInstructions[config.outputFormat]}

Content to summarize:
${config.content}`;
  }

  // Default prompt
  return `Please create a comprehensive summary of the following content ${lengthInstructions[config.summaryLength]}. ${formatInstructions[config.outputFormat]}

Focus on:
- Main themes and key points
- Important arguments and conclusions
- Significant data or findings
- Actionable insights (if applicable)

If multiple sources are provided, synthesize the information cohesively and note any contrasting viewpoints.

Content to summarize:
${config.content}`;
}

function formatSummary(content: string, format: 'paragraph' | 'bullets' | 'numbered'): string {
  if (format === 'paragraph') {
    // Return as-is for paragraph format
    return content.replace(/\n/g, '<br><br>');
  }

  // Try to detect if content already has list format
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Clean bullet markers or numbers
  const cleanedLines = lines.map(line => {
    // Remove common list markers
    return line
      .replace(/^[-•*]\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim();
  }).filter(line => line.length > 0);

  if (format === 'bullets') {
    return '<ul>' + cleanedLines.map(line => `<li>${line}</li>`).join('') + '</ul>';
  }

  if (format === 'numbered') {
    return '<ol>' + cleanedLines.map(line => `<li>${line}</li>`).join('') + '</ol>';
  }

  return content;
}

function extractSourceInfo(content: string): SourceInfo[] {
  const sources: SourceInfo[] = [];

  // Match pattern: "Source: Title (URL)"
  const sourcePattern = /Source: (.+?) \((.+?)\)/g;
  let match;

  while ((match = sourcePattern.exec(content)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();

    // Calculate approximate word count for this source
    // Find content between this source and the next
    const sourceIndex = match.index;
    const nextMatch = sourcePattern.exec(content);
    const endIndex = nextMatch ? nextMatch.index : content.length;
    sourcePattern.lastIndex = sourceIndex + match[0].length;

    const sourceContent = content.substring(sourceIndex, endIndex);
    const wordCount = sourceContent.split(/\s+/).length;

    sources.push({
      title,
      url,
      wordCount
    });
  }

  return sources;
}
