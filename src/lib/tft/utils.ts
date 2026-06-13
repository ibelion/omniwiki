export const TFT_TIER_STYLES: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-[#12122a] text-[#8892f0]",
  3: "bg-[#1c0e2a] text-[#c084fc]",
  4: "bg-[#1c1208] text-[#d4933a]",
};

export const TFT_COST_COLORS: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-[#0e1c14] text-[#4caf72]",
  3: "bg-[#12122a] text-[#8892f0]",
  4: "bg-[#1c0e2a] text-[#c084fc]",
  5: "bg-[#1c1208] text-[#d4933a]",
};

export function stripTFTTokens(html: string): string {
  return html
    .replace(/@\w+@/g, '')
    .replace(/\{i:[^}]*\}/g, '')
    .replace(/<(?!\/?(?:br|b|strong)\b)[^>]+>/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
