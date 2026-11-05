/*
 * RADIO DECK — channel table
 *
 * すべて HTTPS の長期運用ストリームに統一。
 * 局を追加する場合はこの配列に { name, genre, url } を足すだけでよい。
 * ボタンやヘルスチェックは js/app.js が自動生成する。
 */
window.RADIO_STATIONS = [
  // ---- Shoutcast directory picks + bermuda.funk ----
  { name: "MC Community Radio", genre: "AMBIENT", url: "https://radio00.inithosting.com:8000/radio.mp3" },
  { name: "Ambient Sleeping Pill", genre: "AMBIENT", url: "https://radio.stereoscenic.com:443/asp-h" },
  { name: "Hirschmilch Chillout", genre: "AMBIENT", url: "https://hirschmilch.de:7000/chillout.aac" },
  { name: "100% ACID JAZZ", genre: "ACID JAZZ", url: "https://mpc1.mediacp.eu:8356/stream" },
  { name: "Hirschmilch Psytrance", genre: "PROGRESSIVE", url: "https://hirschmilch.de:7000/psytrance.aac" },
  { name: "Radio Chef Popular Romania", genre: "COUNTRY", url: "https://radio.sonicpanel.ro:8110/stream" },
  { name: "bermuda.funk", genre: "COMMUNITY", url: "https://streaming.fueralle.org/bermudafunk_high" },
  { name: "ESOTERICA.FM LOUNGE", genre: "LOUNGE", url: "https://radio.esoterica.fm.br:8008/stream" },
  { name: "Best 70s", genre: "70S", url: "https://c4.auracast.net:8040/radio.mp3" },
  { name: "Best Dance Radio", genre: "DANCE", url: "https://c3.auracast.net:8020/radio.mp3" },
  { name: "Sucesso FM", genre: "COUNTRY", url: "https://streaming.engelhosting.com.br:10032/stream" },
  { name: "FSJ Radio - XRN Australia", genre: "FUNK", url: "https://us01.xrn.com.au:8050/FsjSd" },
  { name: "RadioFTB.net - Dance,Disco Polo 90s", genre: "DANCE", url: "https://play.radioftb.net:8022/stream" },
  { name: "Quisqueya Fm", genre: "CLASSIC JAZZ", url: "https://protvradiostream.com:8620/stream" },
  { name: "Deja Vu Rádió Szeged", genre: "DANCE", url: "https://adas.dejavuradio.hu:8178/dejavuradiolq" },
  { name: "OK PLUS Radio", genre: "SOFT ROCK", url: "https://stream.okplus.rs:8000/radio.mp3" },
  { name: "La Que Suena", genre: "LATIN DANCE", url: "https://stream.serviciospararadios.es:8090/laquesuena.mp3" },
  { name: "70s Persian Music (GLWiZ)", genre: "70S", url: "https://shoutcast2.glwiz.com:8000/KMspersian.mp3" },
  { name: "HeadBangersRadio.COm", genre: "HEAVY METAL", url: "https://mcp1.myshoutca.st:8088/stream" },
  { name: "Ios Explorer Radio", genre: "ROCK", url: "https://a8.asurahosting.com:8650/radio.mp3" },
  { name: "101ROCK", genre: "CLASSIC ROCK", url: "https://sh.onweb.gr:9110/stream" },
  { name: "RadioFTB.net - Flash FM", genre: "DANCE", url: "https://play.radioftb.net:8008/stream" },
  { name: "East Coast Radio Canada", genre: "CELTIC", url: "https://a5.asurahosting.com:6770/radio.mp3" },
  { name: "OK BOEM Radio", genre: "TRADITIONAL FOLK", url: "https://stream.okplus.rs:8060/radio.mp3" },
  { name: "Bass Station DnB on MixLive.ie", genre: "DRUM AND BASS", url: "https://stream.mixlive.net:8050/radio.mp3" },
  { name: "Hirschmich Radio Organic House", genre: "HOUSE", url: "https://hirschmilch.de:7000/organic-house.aac" },

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
