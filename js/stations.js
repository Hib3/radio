/*
 * RADIO DECK — channel table
 *
 * すべて HTTPS の長期運用ストリームに統一。
 * 局を追加する場合はこの配列に { name, genre, url } を足すだけでよい。
 * ボタンやヘルスチェックは js/app.js が自動生成する。
 */
window.RADIO_STATIONS = [
  // ---- SomaFM (San Francisco) ----
  { name: "SomaFM Groove Salad",        genre: "AMBIENT",    url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "SomaFM Deep Space One",      genre: "SPACE",      url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { name: "SomaFM Drone Zone",          genre: "AMBIENT",    url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { name: "SomaFM Space Station",       genre: "SPACE",      url: "https://ice1.somafm.com/spacestation-128-mp3" },
  { name: "SomaFM Vaporwaves",          genre: "VAPOR",      url: "https://ice1.somafm.com/vaporwaves-128-mp3" },
  { name: "SomaFM Synphaera",           genre: "ELECTRONIC", url: "https://ice1.somafm.com/synphaera-128-mp3" },
  { name: "SomaFM DEF CON Radio",       genre: "HACKER",     url: "https://ice1.somafm.com/defcon-128-mp3" },
  { name: "SomaFM Secret Agent",        genre: "LOUNGE",     url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { name: "SomaFM Underground 80s",     genre: "80S",        url: "https://ice1.somafm.com/u80s-128-mp3" },
  { name: "SomaFM PopTron",             genre: "ELECTROPOP", url: "https://ice1.somafm.com/poptron-128-mp3" },
  { name: "SomaFM Beat Blender",        genre: "DEEP HOUSE", url: "https://ice1.somafm.com/beatblender-128-mp3" },
  { name: "SomaFM Fluid",               genre: "FUTURE SOUL",url: "https://ice1.somafm.com/fluid-128-mp3" },
  { name: "SomaFM Lush",                genre: "CHILL VOCAL",url: "https://ice1.somafm.com/lush-128-mp3" },
  { name: "SomaFM Sonic Universe",      genre: "JAZZ",       url: "https://ice1.somafm.com/sonicuniverse-128-mp3" },
  { name: "SomaFM Illinois St. Lounge", genre: "RETRO",      url: "https://ice1.somafm.com/illstreet-128-mp3" },
  { name: "SomaFM Boot Liquor",         genre: "AMERICANA",  url: "https://ice1.somafm.com/bootliquor-128-mp3" },
  { name: "SomaFM Seven Inch Soul",     genre: "SOUL",       url: "https://ice1.somafm.com/7soul-128-mp3" },
  { name: "SomaFM Left Coast 70s",      genre: "70S",        url: "https://ice1.somafm.com/seventies-128-mp3" },
  { name: "SomaFM Metal Detector",      genre: "METAL",      url: "https://ice1.somafm.com/metal-128-mp3" },
  { name: "SomaFM Black Rock FM",       genre: "ROCK",       url: "https://ice1.somafm.com/brfm-128-mp3" },
  { name: "SomaFM Mission Control",     genre: "SPACE",      url: "https://ice1.somafm.com/missioncontrol-128-mp3" },
  { name: "SomaFM Suburbs of Goa",      genre: "WORLD",      url: "https://ice1.somafm.com/suburbsofgoa-128-mp3" },
  { name: "SomaFM ThistleRadio",        genre: "CELTIC",     url: "https://ice1.somafm.com/thistle-128-mp3" },
  { name: "SomaFM Folk Forward",        genre: "FOLK",       url: "https://ice1.somafm.com/folkfwd-128-mp3" },
  { name: "SomaFM Dub Step Beyond",     genre: "DUBSTEP",    url: "https://ice1.somafm.com/dubstep-128-mp3" },
  { name: "SomaFM cliqhop idm",         genre: "IDM",        url: "https://ice1.somafm.com/cliqhop-128-mp3" },

  // ---- FIP / Radio France (Paris) ----
  { name: "FIP",                        genre: "ECLECTIC",   url: "https://icecast.radiofrance.fr/fip-midfi.mp3" },
  { name: "FIP Rock",                   genre: "ROCK",       url: "https://icecast.radiofrance.fr/fiprock-midfi.mp3" },
  { name: "FIP Jazz",                   genre: "JAZZ",       url: "https://icecast.radiofrance.fr/fipjazz-midfi.mp3" },
  { name: "FIP Groove",                 genre: "GROOVE",     url: "https://icecast.radiofrance.fr/fipgroove-midfi.mp3" },
  { name: "FIP Electro",                genre: "ELECTRO",    url: "https://icecast.radiofrance.fr/fipelectro-midfi.mp3" },
  { name: "FIP Monde",                  genre: "WORLD",      url: "https://icecast.radiofrance.fr/fipworld-midfi.mp3" },
  { name: "FIP Reggae",                 genre: "REGGAE",     url: "https://icecast.radiofrance.fr/fipreggae-midfi.mp3" },
  { name: "FIP Nouveautés",             genre: "NEW",        url: "https://icecast.radiofrance.fr/fipnouveautes-midfi.mp3" },

  // ---- Nightride FM (synth network) ----
  { name: "Nightride FM",               genre: "SYNTHWAVE",  url: "https://stream.nightride.fm/nightride.mp3" },
  { name: "ChillSynth FM",              genre: "CHILLSYNTH", url: "https://stream.nightride.fm/chillsynth.mp3" },
  { name: "Datawave FM",                genre: "DATAWAVE",   url: "https://stream.nightride.fm/datawave.mp3" },
  { name: "SpaceSynth FM",              genre: "SPACESYNTH", url: "https://stream.nightride.fm/spacesynth.mp3" },
  { name: "DarkSynth FM",               genre: "DARKSYNTH",  url: "https://stream.nightride.fm/darksynth.mp3" },
  { name: "HorrorSynth FM",             genre: "HORROR",     url: "https://stream.nightride.fm/horrorsynth.mp3" },
  { name: "EBSM FM",                    genre: "EBSM",       url: "https://stream.nightride.fm/ebsm.mp3" },
  { name: "Rekt FM",                    genre: "REKT",       url: "https://stream.nightride.fm/rekt.mp3" },

  // ---- Radio Paradise (California) ----
  { name: "Radio Paradise Main Mix",    genre: "ECLECTIC",   url: "https://stream.radioparadise.com/mp3-128" },
  { name: "Radio Paradise Mellow",      genre: "MELLOW",     url: "https://stream.radioparadise.com/mellow-128" },
  { name: "Radio Paradise Rock",        genre: "ROCK",       url: "https://stream.radioparadise.com/rock-128" },
  { name: "Radio Paradise Global",      genre: "GLOBAL",     url: "https://stream.radioparadise.com/global-128" },

  // ---- Misc. long-runners ----
  /* /stream は Ogg Vorbis で iOS Safari が非対応のため MP3 の /fallback を使う */
  { name: "LISTEN.moe J-POP",           genre: "J-POP",      url: "https://listen.moe/fallback" },
  { name: "LISTEN.moe K-POP",           genre: "K-POP",      url: "https://listen.moe/kpop/fallback" },
  { name: "KEXP 90.3 Seattle",          genre: "INDIE",      url: "https://kexp.streamguys1.com/kexp160.aac" },
  { name: "Dance Wave!",                genre: "DANCE",      url: "https://dancewave.online/dance.mp3" }
];
