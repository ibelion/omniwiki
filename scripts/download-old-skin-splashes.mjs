import https from 'https';
import fs from 'fs';
import path from 'path';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error('parse fail for ' + url + ': ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(res.statusCode); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

function cdnUrl(lolPath) {
  const rel = lolPath.replace('/lol-game-data/assets/', '').toLowerCase();
  return 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/' + rel;
}

// skin name -> bundle splash path
const bundlePaths = {
  57002: 'cdn/leaguecontent/champions/Maokai/images/skins/totemic_maokai_splash.jpg',
  103089: 'cdn/leaguecontent/champions/Ahri/images/skins/after_hours_spirit_blossom_springs_ahri_splash.jpg',
  134000: 'cdn/leaguecontent/champions/Syndra/images/skins/syndra_splash.jpg',
  134001: 'cdn/leaguecontent/champions/Syndra/images/skins/justicar_syndra_splash.jpg',
  134002: 'cdn/leaguecontent/champions/Syndra/images/skins/atlantean_syndra_splash.jpg',
  134003: 'cdn/leaguecontent/champions/Syndra/images/skins/queen_of_diamonds_syndra_splash.jpg',
  134004: 'cdn/leaguecontent/champions/Syndra/images/skins/snow_day_syndra_splash.jpg',
  81006: 'cdn/leaguecontent/champions/Ezreal/images/skins/tpa_ezreal_splash.jpg',
  81021: 'cdn/leaguecontent/champions/Ezreal/images/skins/battle_academia_ezreal_splash.jpg',
  14001: 'cdn/leaguecontent/champions/Sion/images/skins/hextech_sion_splash.jpg',
  14030: 'cdn/leaguecontent/champions/Sion/images/skins/high_noon_sion_splash.jpg',
  254048: 'cdn/leaguecontent/champions/Vi/images/skins/arcane_brawler_vi_splash.jpg',
  254049: 'cdn/leaguecontent/champions/Vi/images/skins/t1_vi_splash.jpg',
  222000: 'cdn/leaguecontent/champions/Jinx/images/skins/jinx_splash.jpg',
  222001: 'cdn/leaguecontent/champions/Jinx/images/skins/crime_city_jinx_splash.jpg',
  222002: 'cdn/leaguecontent/champions/Jinx/images/skins/firecracker_jinx_splash.jpg',
  235001: 'cdn/leaguecontent/champions/Senna/images/skins/true_damage_senna_splash.jpg',
  21020: 'cdn/leaguecontent/champions/MissFortune/images/skins/prestige_bewitching_miss_fortune_splash.jpg',
  21041: 'cdn/leaguecontent/champions/MissFortune/images/skins/prestige_broken_covenant_miss_fortune_splash.jpg',
  21050: 'cdn/leaguecontent/champions/MissFortune/images/skins/porcelain_miss_fortune_splash.jpg',
  76000: 'cdn/leaguecontent/champions/Nidalee/images/skins/nidalee_splash.jpg',
  76039: 'cdn/leaguecontent/champions/Nidalee/images/skins/kittalee_splash.jpg',
};

// Champion IDs: Maokai=57, Ahri=103, Syndra=134, Ezreal=81, Sion=14, Vi=254, Jinx=222, Senna=235, MissFortune=21, Nidalee=76
const champIds = [57, 103, 134, 81, 14, 254, 222, 235, 21, 76];

for (const champId of champIds) {
  const d = await fetchJson(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${champId}.json`);
  for (const skin of (d.skins || [])) {
    const dest = bundlePaths[skin.id];
    if (!dest) continue;
    if (!skin.splashPath) { console.log('No splashPath for skin ' + skin.id); continue; }
    const url = cdnUrl(skin.splashPath);
    const code = await downloadFile(url, dest);
    const size = fs.existsSync(dest) ? Math.round(fs.statSync(dest).size / 1024) : 0;
    console.log(skin.id + ': HTTP ' + code + ' ' + size + 'KB -> ' + path.basename(dest));
  }
}
