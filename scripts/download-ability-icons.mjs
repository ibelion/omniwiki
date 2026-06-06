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

const mapping = {
  Ambessa: {
    passive: { bundle: 'drakehound_s_step.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/HUD/Icons2D/Icon_Ambessa_Passive.png' },
    Q: { bundle: 'cunning_sweep_sundering_slam.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/HUD/Icons2D/Icon_Ambessa_Q1.png' },
    W: { bundle: 'repudiation.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/HUD/Icons2D/Icon_Ambessa_W.png' },
    E: { bundle: 'lacerate.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/HUD/Icons2D/Icon_Ambessa_E.png' },
    R: { bundle: 'public_execution.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Ambessa/HUD/Icons2D/Icon_Ambessa_R.png' },
  },
  Mel: {
    passive: { bundle: 'searing_brilliance.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/HUD/Icons2D/Mel_Passive.png' },
    Q: { bundle: 'radiant_volley.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/HUD/Icons2D/Mel_Q.png' },
    W: { bundle: 'rebuttal.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/HUD/Icons2D/Mel_W.png' },
    E: { bundle: 'solar_snare.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/HUD/Icons2D/Mel_E.png' },
    R: { bundle: 'golden_eclipse.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Mel/HUD/Icons2D/Mel_R.png' },
  },
  Yunara: {
    passive: { bundle: 'vow_of_the_first_lands.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/HUD/Icons2D/Yunara_Passive.png' },
    Q: { bundle: 'cultivation_of_spirit.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/HUD/Icons2D/Yunara_Q.png' },
    W: { bundle: 'arc_of_judgment_arc_of_ruin.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/HUD/Icons2D/Yunara_W.png' },
    E: { bundle: 'kanmei_s_steps_untouchable_shadow.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/HUD/Icons2D/Yunara_E.png' },
    R: { bundle: 'transcend_one_s_self.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Yunara/HUD/Icons2D/Yunara_R.png' },
  },
  Zaahen: {
    passive: { bundle: 'cultivation_of_war.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/HUD/Icons2D/ZaahenP.png' },
    Q: { bundle: 'the_darkin_glaive.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/HUD/Icons2D/ZaahenQ.png' },
    W: { bundle: 'dreaded_return.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/HUD/Icons2D/ZaahenW.png' },
    E: { bundle: 'aureate_rush.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/HUD/Icons2D/ZaahenE.png' },
    R: { bundle: 'grim_deliverance.png', cdr: '/lol-game-data/assets/ASSETS/Characters/Zaahen/HUD/Icons2D/ZaahenR.png' },
  },
};

for (const [champ, slots] of Object.entries(mapping)) {
  for (const [slot, info] of Object.entries(slots)) {
    const url = cdnUrl(info.cdr);
    const dest = 'cdn/leaguecontent/champions/' + champ + '/images/abilities/' + info.bundle;
    const code = await downloadFile(url, dest);
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    console.log(champ + ' ' + slot + ': HTTP ' + code + ' ' + size + 'b -> ' + info.bundle);
  }
}
