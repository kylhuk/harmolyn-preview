import React from 'react';

/**
 * Lightweight markdown renderer for chat messages.
 * Supports: **bold**, *italic*, `inline code`, ```code blocks```, and [links](url)
 */
export function renderMarkdown(text: string): React.ReactNode {
  // First, extract code blocks (```)
  const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const textStr = String(text);

  while ((match = codeBlockRegex.exec(textStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderInline(textStr.slice(lastIndex, match.index)));
    }
    parts.push(
      <pre key={`cb-${match.index}`} className="bg-white/5 border border-white/10 rounded-r1 px-4 py-3 my-2 font-mono text-sm text-primary/90 overflow-x-auto whitespace-pre-wrap">
        <code>{match[1].trim()}</code>
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < textStr.length) {
    parts.push(...renderInline(textStr.slice(lastIndex)));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderInline(text: string): React.ReactNode[] {
  // Process inline patterns: bold, italic, inline code, links
  const inlineRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(([^)]+?)\))|(https?:\/\/[^\s<]+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = inlineRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      nodes.push(text.slice(lastIdx, m.index));
    }

    if (m[1]) {
      // **bold**
      nodes.push(<strong key={`b-${m.index}`} className="font-bold text-foreground">{m[2]}</strong>);
    } else if (m[3]) {
      // *italic*
      nodes.push(<em key={`i-${m.index}`} className="italic text-white/80">{m[4]}</em>);
    } else if (m[5]) {
      // `inline code`
      nodes.push(
        <code key={`c-${m.index}`} className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[0.85em] text-primary/80">{m[6]}</code>
      );
    } else if (m[7]) {
      // [link](url)
      nodes.push(
        <a key={`l-${m.index}`} href={m[9]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:brightness-125 transition-all">{m[8]}</a>
      );
    } else if (m[10]) {
      // bare URL
      nodes.push(
        <a key={`u-${m.index}`} href={m[10]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:brightness-125 transition-all">{m[10]}</a>
      );
    }

    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx));
  }

  return nodes;
}
