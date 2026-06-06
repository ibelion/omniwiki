import https from 'https';
import fs from 'fs';
import path from 'path';

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

// skinId -> { bundleSplash, cdrSplash }
const skins = [
  { champ: 'Ambessa', bundle: 'champions/Ambessa/images/skins/ambessa_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/Skins/Base/Images/Ambessa_splash_centered_0.jpg' },
  { champ: 'Ambessa', bundle: 'champions/Ambessa/images/skins/chosen_of_the_wolf_ambessa_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/Skins/Skin01/Images/ambessa_splash_centered_1.jpg' },
  { champ: 'Mel', bundle: 'champions/Mel/images/skins/mel_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/Skins/Base/Images/Mel_splash_centered_0.jpg' },
  { champ: 'Mel', bundle: 'champions/Mel/images/skins/arcane_councilor_mel_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/Skins/Skin01/Images/Mel_splash_centered_1.jpg' },
  { champ: 'Mel', bundle: 'champions/Mel/images/skins/prestige_winterblessed_mel_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/Skins/Skin10/Images/mel_splash_centered_10.jpg' },
  { champ: 'Yunara', bundle: 'champions/Yunara/images/skins/yunara_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/Skins/Base/Images/Yunara_splash_centered_0.jpg' },
  { champ: 'Yunara', bundle: 'champions/Yunara/images/skins/spirit_blossom_springs_yunara_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/Skins/Skin01/Images/yunara_splash_centered_1.jpg' },
  { champ: 'Zaahen', bundle: 'champions/Zaahen/images/skins/zaahen_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/Skins/Base/Images/Zaahen_splash_centered_0.jpg' },
  { champ: 'Zaahen', bundle: 'champions/Zaahen/images/skins/immortal_journey_zaahen_splash.jpg', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/Skins/Skin01/Images/zaahen_splash_centered_1.jpg' },
];

for (const skin of skins) {
  const url = cdnUrl(skin.cdr);
  const dest = 'cdn/leaguecontent/' + skin.bundle;
  const code = await downloadFile(url, dest);
  const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  console.log(skin.champ + ': HTTP ' + code + ' ' + Math.round(size/1024) + 'KB -> ' + path.basename(skin.bundle));
}
