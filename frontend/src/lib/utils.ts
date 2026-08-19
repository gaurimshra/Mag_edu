export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMastery(score: number): string {
  if (score >= 0.8) return "Mastered";
  if (score >= 0.5) return "Familiar";
  if (score >= 0.25) return "Learning";
  return "New";
}

export function getMasteryColor(score: number): string {
  if (score >= 0.8) return "#2F9E44";
  if (score >= 0.5) return "#3B5BDB";
  if (score >= 0.25) return "#F08C00";
  return "#C92A2A";
}

export function getHeatmapBg(score: number): string {
  if (score >= 0.8) return "#EBFBEE";
  if (score >= 0.6) return "#D3F9D8";
  if (score >= 0.4) return "#FFF3BF";
  if (score >= 0.2) return "#FFE8CC";
  return "#FFF5F5";
}

export function getHeatmapText(score: number): string {
  if (score >= 0.8) return "#2F9E44";
  if (score >= 0.6) return "#37B24D";
  if (score >= 0.4) return "#E67700";
  if (score >= 0.2) return "#F08C00";
  return "#C92A2A";
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function skillIdToTitle(skillId: string): string {
  const parts = skillId.split(".");
  const last = parts[parts.length - 1];
  return last
    .replace(/ch\d+/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
