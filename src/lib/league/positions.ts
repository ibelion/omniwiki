import fs from "node:fs";
import path from "node:path";

// Loads champions.csv and returns a map: champion name (lowercased) -> positions array
export function loadChampionPositions(
  csvRelativePath: string = "public/leaguecontent/data/champions.csv"
) {
  const workspaceRoot = process.cwd();
  const csvPath = path.join(workspaceRoot, csvRelativePath);

  let content = "";
  try {
    content = fs.readFileSync(csvPath, "utf-8");
  } catch {
    return new Map<string, string[]>();
  }

  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  // Skip header if present (first line contains "name" and "positions")
  const first = lines[0]?.toLowerCase() || "";
  const hasHeader = first.includes("name") && first.includes("positions");
  const startIndex = hasHeader ? 1 : 0;

  const map = new Map<string, string[]>();
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Basic CSV split that tolerates commas inside quotes
    const cols = parseCsvLine(line);
    if (cols.length < 6) continue;
    // CSV columns: 0=id, 1=name, 2=image, 3=splash_image, 4=roles, 5=positions
    const name = (cols[1] || "").trim();
    const positionsRaw = (cols[5] || "").trim();
    if (!name) continue;
    const positions = positionsRaw
      ? positionsRaw
          .split(/\||,/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [];
    map.set(name.toLowerCase(), positions);
  }
  return map;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') {
        result.push(current);
        current = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
