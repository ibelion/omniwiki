import * as fs from 'fs';
import * as path from 'path';

const quotesPath = path.join(__dirname, '..', 'cdn', 'leaguecontent', 'info', 'quotes.json');

// Read the quotes file
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));

// Update each quote's audio path
let updatedCount = 0;
for (const quote of quotes) {
  if (quote.audio && !quote.audio.startsWith('/leaguecontent/')) {
    // Add /leaguecontent/ prefix
    quote.audio = `/leaguecontent/${quote.audio}`;
    updatedCount++;
  }
}

// Write back to file
fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2));

console.log(`✅ Updated ${updatedCount} audio paths in quotes.json`);
