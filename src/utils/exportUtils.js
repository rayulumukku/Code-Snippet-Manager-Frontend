const EXTENSION_MAP = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  java: 'java',
  go: 'go',
  rust: 'rs',
  ruby: 'rb',
  php: 'php',
  swift: 'swift',
  kotlin: 'kt',
  html: 'html',
  css: 'css',
  sql: 'sql',
  json: 'json',
  xml: 'xml',
  markdown: 'md',
  shell: 'sh',
  other: 'txt',
};

export function getFileExtension(language) {
  return EXTENSION_MAP[language?.toLowerCase()] || 'txt';
}

export function downloadSnippetAsFile(snippet) {
  const ext = getFileExtension(snippet.language);
  const cleanTitle = (snippet.title || 'snippet')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 50);
  const filename = `${cleanTitle}.${ext}`;

  const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSnippetAsJson(snippet) {
  const cleanTitle = (snippet.title || 'snippet')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 50);
  const filename = `${cleanTitle}.json`;

  const payload = {
    title: snippet.title,
    description: snippet.description || '',
    language: snippet.language,
    tags: snippet.tags || [],
    code: snippet.code,
    author: snippet.author?.username || 'Unknown',
    createdAt: snippet.createdAt,
    version: 1,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatAsMarkdown(snippet) {
  const lang = snippet.language === 'other' ? '' : snippet.language;
  let md = `# ${snippet.title}\n\n`;
  if (snippet.description) {
    md += `${snippet.description}\n\n`;
  }
  if (snippet.tags?.length > 0) {
    md += `Tags: ${snippet.tags.map(t => `#${t}`).join(' ')}\n\n`;
  }
  md += `\`\`\`${lang}\n${snippet.code}\n\`\`\`\n`;
  return md;
}
