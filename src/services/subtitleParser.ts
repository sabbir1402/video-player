import { SubtitleCue, SubtitleTrack } from '../types';

/**
 * Parses timestamp string into seconds
 * Formats supported:
 * 00:01:23,456 (SRT)
 * 00:01:23.456 or 01:23.456 (VTT)
 * 0:01:23.45 (ASS/SSA)
 */
export function parseTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');
  
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(cleaned) || 0;
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number, includeMs = false): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  const msStr = ms.toString().padStart(3, '0');

  if (h > 0) {
    const hStr = h.toString().padStart(2, '0');
    return includeMs ? `${hStr}:${mStr}:${sStr}.${msStr}` : `${hStr}:${mStr}:${sStr}`;
  }
  return includeMs ? `${mStr}:${sStr}.${msStr}` : `${mStr}:${sStr}`;
}

/**
 * Strips formatting tags from subtitle text or cleans them safely
 */
export function cleanSubtitleText(text: string): string {
  if (!text) return '';
  // Strip ASS override tags like {\an8}, {\pos(x,y)}, etc.
  let cleaned = text.replace(/\{[^}]+\}/g, '');
  // Clean line breaks
  cleaned = cleaned.replace(/\\N/g, '\n').replace(/\\n/g, '\n');
  return cleaned.trim();
}

/**
 * Parse SubRip (.SRT) text
 */
export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  let idCounter = 1;
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Line 0 might be index number or timestamp
    let timeLineIdx = 0;
    if (/^\d+$/.test(lines[0].trim())) {
      timeLineIdx = 1;
    }

    if (timeLineIdx >= lines.length) continue;
    const timeLine = lines[timeLineIdx];
    const match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})/);

    if (match) {
      const startTime = parseTimestamp(match[1]);
      const endTime = parseTimestamp(match[2]);
      const text = lines.slice(timeLineIdx + 1).join('\n');
      if (endTime > startTime && text.trim().length > 0) {
        cues.push({
          id: idCounter++,
          startTime,
          endTime,
          text: cleanSubtitleText(text),
        });
      }
    }
  }

  return cues;
}

/**
 * Parse WebVTT (.VTT) text
 */
export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Remove WEBVTT header and metadata
  const body = normalized.replace(/^WEBVTT.*?\n\n/s, '');
  const blocks = body.split(/\n\s*\n/);

  let idCounter = 1;
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (!lines.length) continue;

    let timeLineIdx = 0;
    if (!lines[0].includes('-->') && lines.length > 1 && lines[1].includes('-->')) {
      timeLineIdx = 1;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const parts = timeLine.split('-->');
    if (parts.length === 2) {
      const startStr = parts[0].trim().split(' ')[0];
      const endStr = parts[1].trim().split(' ')[0];
      const startTime = parseTimestamp(startStr);
      const endTime = parseTimestamp(endStr);
      const text = lines.slice(timeLineIdx + 1).join('\n');

      if (endTime > startTime && text.trim().length > 0) {
        cues.push({
          id: idCounter++,
          startTime,
          endTime,
          text: cleanSubtitleText(text),
        });
      }
    }
  }

  return cues;
}

/**
 * Parse Advanced SubStation Alpha (.ASS / .SSA) text
 */
export function parseASS(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvents = false;
  let idCounter = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[Events]')) {
      inEvents = true;
      continue;
    }

    if (inEvents && trimmed.startsWith('Dialogue:')) {
      // Format: Dialogue: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
      const parts = trimmed.substring('Dialogue:'.length).split(',');
      if (parts.length >= 10) {
        const startStr = parts[1]?.trim();
        const endStr = parts[2]?.trim();
        const text = parts.slice(9).join(',');

        const startTime = parseTimestamp(startStr);
        const endTime = parseTimestamp(endStr);

        if (endTime > startTime) {
          cues.push({
            id: idCounter++,
            startTime,
            endTime,
            text: cleanSubtitleText(text),
          });
        }
      }
    }
  }

  return cues;
}

/**
 * Automatically parse subtitles by file extension or content detection
 */
export function parseSubtitleFile(content: string, filename: string): SubtitleTrack {
  const lower = filename.toLowerCase();
  let format: 'srt' | 'vtt' | 'ass' = 'srt';
  let cues: SubtitleCue[] = [];

  if (lower.endsWith('.vtt') || content.startsWith('WEBVTT')) {
    format = 'vtt';
    cues = parseVTT(content);
  } else if (lower.endsWith('.ass') || lower.endsWith('.ssa') || content.includes('[Script Info]')) {
    format = 'ass';
    cues = parseASS(content);
  } else {
    format = 'srt';
    cues = parseSRT(content);
  }

  const name = filename.replace(/\.[^/.]+$/, '');
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    label: name || 'Custom Subtitles',
    lang: 'und',
    format,
    cues,
  };
}

/**
 * Find currently active cues with subtitle sync offset adjustment
 */
export function getActiveCues(cues: SubtitleCue[], currentTime: number, offsetMs = 0): SubtitleCue[] {
  if (!cues || cues.length === 0) return [];
  const adjustedTime = currentTime - offsetMs / 1000;

  return cues.filter(
    (cue) => adjustedTime >= cue.startTime && adjustedTime <= cue.endTime
  );
}
