/*
 * RADIO BUTTON — application
 *
 * 構成:
 *   1. チャンネルスイッチの生成 (template を複製)
 *   2. 再生 / 停止 (同じスイッチを再クリックで OFF)
 *      - CORS 対応局は playerCors + Web Audio で実スペクトラムを解析
 *      - 非対応局は playerPlain に自動フォールバック (解析なしで再生)
 *   3. 回線ヘルスチェック (SCAN)
 *   4. 時計ウィジェット / シグナルビジュアライザ
 *   5. 音量・シャッフル・キーボード操作
 */
(function () {
  "use strict";

  var stations = window.RADIO_STATIONS || [];
  var playerCors = document.getElementById("playerCors");
  var playerPlain = document.getElementById("playerPlain");
  var grid = document.getElementById("channelGrid");

  var buttons = [];
  var activeIndex = null;
  var currentElement = null;
  var playbackStatus = "IDLE";
  var scanning = false;

  var audioCtx = null;
  var analyser = null;
  var freqData = null;

  var STORE_VOLUME = "radiodeck.volume";
  var STORE_CHANNEL = "radiodeck.channel";

  /* iOS WebKit は MediaElementAudioSourceNode がストリーミング音源で
     正しく動かない (解析データが常にゼロ / 音声が無音化することがある)
     ため、iOS では Web Audio を使わず通常再生に固定する */
  var IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function channelLabel(index) {
    return "CH " + pad2(index + 1);
  }

  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* プライベートモード等では保存しない */
    }
  }

  /* ---------------------------------------------------------------
   * NOW PLAYING パネル
   * ------------------------------------------------------------- */
  function setNowPanel(index, name, genre) {
    document.getElementById("nowChannel").textContent =
      index === null ? "CH --" : channelLabel(index);
    document.getElementById("nowName").textContent = name;
    document.getElementById("nowGenre").textContent = genre || "";
  }

  function setPlaybackStatus(status) {
    var statusEl = document.getElementById("nowStatus");
    var led = document.getElementById("signalLed");
    var live = status === "PLAYING";
    var error = status === "ERROR";

    playbackStatus = status;
    statusEl.textContent = status;
    statusEl.classList.toggle("is-live", live);
    statusEl.classList.toggle("is-error", error);
    led.classList.toggle("is-live", live);
    led.classList.toggle("is-error", error);

    if (live && activeIndex !== null) {
      document.title = "▶ " + stations[activeIndex].name + " — RADIO BUTTON";
    } else {
      document.title = "RADIO BUTTON — ラヂオボタン";
    }
  }

  /* ---------------------------------------------------------------
   * Web Audio 解析器
   * createMediaElementSource は CORS 承認済みメディアしか解析できない
   * (未承認だと出力が無音化される) ため、crossorigin 付きの
   * playerCors だけをグラフに接続する。
   * ------------------------------------------------------------- */
  function ensureAudioGraph() {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (IS_IOS || !AudioContextClass) return;

    if (!audioCtx) {
      try {
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        freqData = new Uint8Array(analyser.frequencyBinCount);
        audioCtx.createMediaElementSource(playerCors).connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (error) {
        console.warn("Web Audio unavailable:", error);
        audioCtx = null;
        analyser = null;
        return;
      }
    }

    /* iOS などはユーザー操作内で resume する必要がある */
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  /* ---------------------------------------------------------------
   * スイッチ生成と ON/OFF
   * ------------------------------------------------------------- */
  function powerOff(button) {
    button.classList.remove("is-active");
    button.classList.add("is-powering-off");
    button.setAttribute("aria-pressed", "false");
    window.setTimeout(function () {
      button.classList.remove("is-powering-off");
    }, 620);
  }

  function stopElement(element) {
    element.pause();
    element.removeAttribute("src");
    element.load();
  }

  function stopPlayback() {
    if (activeIndex !== null) {
      powerOff(buttons[activeIndex]);
    }
    activeIndex = null;
    currentElement = null;
    stopElement(playerCors);
    stopElement(playerPlain);
    setNowPanel(null, "STANDBY — チャンネルを選択してください", "");
    setPlaybackStatus("IDLE");
  }

  function startPlayback(index, element) {
    currentElement = element;
    element.src = stations[index].url;
    element.load();

    var playback = element.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        if (activeIndex !== index || currentElement !== element) return;
        if (error && error.name === "AbortError") return;

        if (element === playerCors && error && error.name === "NotSupportedError") {
          fallbackToPlain(index);
          return;
        }
        console.warn("Playback failed:", stations[index].name, error);
        setPlaybackStatus("ERROR");
        setChannelState(index, "dead", "playback failed");
      });
    }
  }

  /* CORS 経由で読めなかった局を通常再生でリトライする */
  function fallbackToPlain(index) {
    stations[index].noCors = true;
    currentElement = null;
    stopElement(playerCors);
    startPlayback(index, playerPlain);
  }

  function playChannel(index) {
    var station = stations[index];
    if (!station) return;

    /* 点灯中のスイッチを再クリック → 消灯 (トグル動作) */
    if (index === activeIndex) {
      stopPlayback();
      return;
    }

    if (activeIndex !== null) {
      powerOff(buttons[activeIndex]);
    }

    activeIndex = index;
    currentElement = null;
    stopElement(playerCors);
    stopElement(playerPlain);

    buttons[index].classList.remove("is-powering-off");
    buttons[index].classList.add("is-active");
    buttons[index].setAttribute("aria-pressed", "true");

    setNowPanel(index, station.name, station.genre);
    setPlaybackStatus("LOADING");
    writeStore(STORE_CHANNEL, String(index));

    ensureAudioGraph();
    startPlayback(index, station.noCors || !analyser ? playerPlain : playerCors);
  }

  function renderChannelButtons() {
    var template = document.getElementById("switchTemplate");

    stations.forEach(function (station, index) {
      var node = template.content.firstElementChild.cloneNode(true);

      node.querySelector(".switch-label").textContent = channelLabel(index);
      node.title = channelLabel(index) + " " + station.name + " [" + station.genre + "]";
      node.setAttribute(
        "aria-label",
        channelLabel(index) + " " + station.name
      );
      node.addEventListener("click", function () {
        playChannel(index);
      });

      grid.appendChild(node);
      buttons[index] = node;
    });
  }

  /* ---------------------------------------------------------------
   * ヘルスチェック (SCAN)
   * ------------------------------------------------------------- */
  function updateHealthSummary() {
    var ok = 0;
    var dead = 0;

    buttons.forEach(function (button) {
      var state = button.dataset.streamState;
      if (state === "ok") ok += 1;
      if (state === "dead") dead += 1;
    });

    document.getElementById("healthSummary").innerHTML =
      'LINK <b class="ok">OK ' + ok + '</b> / <b class="ng">NG ' + dead + "</b>";
  }

  function setChannelState(index, state, detail) {
    var button = buttons[index];
    var base = button.getAttribute("aria-label");

    button.classList.remove("stream-checking", "stream-ok", "stream-dead", "stream-unknown");
    button.classList.add("stream-" + state);
    button.dataset.streamState = state;
    button.title = base + (detail ? " — " + detail : state === "ok" ? " — LINK OK" : "");

    updateHealthSummary();
  }

  /* ミュートした audio 要素で実ストリームを短時間だけ再生してみる。
     CORS の制約を受けずに到達性を判定できる。 */
  function checkChannel(index) {
    return new Promise(function (resolve) {
      var probe = document.createElement("audio");
      var finished = false;
      var timer = null;
      var interval = null;

      function finish(state, detail) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        window.clearInterval(interval);
        probe.pause();
        probe.removeAttribute("src");
        probe.load();
        setChannelState(index, state, detail);
        resolve();
      }

      setChannelState(index, "checking", "checking...");

      probe.muted = true;
      probe.preload = "none";
      probe.src = stations[index].url;

      probe.addEventListener("error", function () {
        finish("dead", "unreachable");
      });

      var playback = probe.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function (error) {
          if (error && error.name === "NotAllowedError") {
            finish("unknown", "autoplay blocked");
          }
        });
      }

      interval = window.setInterval(function () {
        if (probe.error) {
          finish("dead", "unreachable");
        } else if (!probe.paused && probe.readyState >= 3 && probe.currentTime > 0.2) {
          finish("ok");
        }
      }, 200);

      /* タイムアウトは「死んでいる証拠」にはならない (遅い回線や
         モバイルの自動再生制限でも起きる) ので unknown 扱いにする */
      timer = window.setTimeout(function () {
        finish("unknown", "timeout");
      }, 8000);
    });
  }

  function scanAllChannels() {
    if (scanning) return;

    var scanButton = document.getElementById("scanButton");
    var nextIndex = 0;
    var active = 0;
    var maxActive = 5;

    scanning = true;
    scanButton.disabled = true;
    scanButton.textContent = "⟳ SCANNING";

    function runNext() {
      if (nextIndex >= stations.length && active === 0) {
        scanning = false;
        scanButton.disabled = false;
        scanButton.textContent = "⟳ SCAN";
        return;
      }
      while (active < maxActive && nextIndex < stations.length) {
        active += 1;
        checkChannel(nextIndex).then(function () {
          active -= 1;
          runNext();
        });
        nextIndex += 1;
      }
    }

    runNext();
  }

  /* ---------------------------------------------------------------
   * 時計ウィジェット
   * ------------------------------------------------------------- */
  var WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function renderClock() {
    var now = new Date();
    var colon = '<span class="colon">:</span>';

    document.getElementById("clockTime").innerHTML =
      pad2(now.getHours()) + colon + pad2(now.getMinutes()) + colon + pad2(now.getSeconds());
    document.getElementById("clockDate").textContent =
      now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) +
      " " + WEEKDAYS[now.getDay()];
  }

  /* ---------------------------------------------------------------
   * シグナルビジュアライザ
   * CORS 対応局の再生中は実際の周波数スペクトラムを描画し、
   * それ以外 (フォールバック再生・待機中) は状態駆動の
   * アンビエント波形にフォールバックする。
   * ------------------------------------------------------------- */
  var energy = 0.12;

  function energyTarget() {
    if (playbackStatus === "PLAYING") return 1;
    if (playbackStatus === "LOADING") return 0.45;
    if (playbackStatus === "ERROR") return 0.05;
    return 0.16;
  }

  function resizeCanvas(canvas, context) {
    var ratio = window.devicePixelRatio || 1;
    var width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    var height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawWave(context, width, midY, amp, speed, seconds, color, lineWidth) {
    var x;
    var y;

    context.beginPath();
    for (x = 0; x <= width; x += 4) {
      y = midY
        + Math.sin(x * 0.021 + seconds * speed) * amp
        + Math.sin(x * 0.047 - seconds * speed * 0.6) * amp * 0.45;
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  function drawAmbient(context, width, height, seconds) {
    var midY = height / 2;
    var amp = height * 0.3 * energy + 2.2;
    var sweepX = ((seconds * 90) % (width + 120)) - 60;
    var sweep;

    /* エラー時は警告らしい赤の細かい波にして「壊れて静止」に見せない */
    if (playbackStatus === "ERROR") {
      drawWave(context, width, midY, 1.6, 9, seconds, "rgba(255,83,100,.85)", 1.4);
      drawWave(context, width, midY, 1, 13, seconds + 2.4, "rgba(255,83,100,.35)", 1);
      return;
    }

    context.save();
    context.shadowColor = "rgba(79,242,255,.8)";
    context.shadowBlur = 10;
    drawWave(context, width, midY, amp, 2.1, seconds, "rgba(79,242,255,.92)", 1.8);
    context.restore();

    drawWave(context, width, midY, amp * 0.65, 1.4, seconds + 1.7, "rgba(255,179,95,.55)", 1.2);
    drawWave(context, width, midY, amp * 0.4, 3.2, seconds + 4.2, "rgba(79,242,255,.28)", 1);

    sweep = context.createLinearGradient(sweepX - 50, 0, sweepX + 6, 0);
    sweep.addColorStop(0, "rgba(79,242,255,0)");
    sweep.addColorStop(1, "rgba(79,242,255,.22)");
    context.fillStyle = sweep;
    context.fillRect(sweepX - 50, 0, 56, height);
  }

  /* 実スペクトラム: 周波数分布を上下対称の滑らかなリボン曲線で描く。
     解析器がゼロしか返さない場合 (iOS WebKit の既知の制約) は false を
     返し、呼び出し元がアンビエント波形へフォールバックする。 */
  var SPECTRUM_POINTS = 36;
  var spectrumValues = new Float32Array(SPECTRUM_POINTS);
  var silentFrames = 0;

  function traceRibbon(context, xs, ys, midY, sign, connect) {
    var count = xs.length;
    var i;

    if (connect) {
      context.lineTo(xs[0], midY + ys[0] * sign);
    } else {
      context.moveTo(xs[0], midY + ys[0] * sign);
    }
    for (i = 1; i < count - 1; i += 1) {
      context.quadraticCurveTo(
        xs[i], midY + ys[i] * sign,
        (xs[i] + xs[i + 1]) / 2, midY + (ys[i] + ys[i + 1]) / 2 * sign
      );
    }
    context.lineTo(xs[count - 1], midY + ys[count - 1] * sign);
  }

  function drawSpectrum(context, width, height) {
    var midY = height / 2;
    var maxIndex = freqData.length - 4;
    var xs = [];
    var ys = [];
    var sum = 0;
    var i;
    var t;
    var value;
    var gradient;

    analyser.getByteFrequencyData(freqData);
    for (i = 0; i < freqData.length; i += 1) {
      sum += freqData[i];
    }

    /* 完全な無音が続く = 解析器が機能していない環境とみなす */
    if (sum < 1) {
      silentFrames += 1;
      if (silentFrames > 30) return false;
    } else {
      silentFrames = 0;
    }

    for (i = 0; i < SPECTRUM_POINTS; i += 1) {
      t = i / (SPECTRUM_POINTS - 1);
      /* 低域に寄りがちなので対数寄りにサンプリングし、両端を絞る */
      value = freqData[Math.floor(Math.pow(t, 1.6) * maxIndex) + 2] / 255;
      /* コントラストを上げて音の強弱を波の起伏に出やすくする */
      value = Math.pow(value, 1.35);
      value *= 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * t), 0.7);
      /* 時間方向にもならして波をとろりと動かす */
      spectrumValues[i] += (value - spectrumValues[i]) * 0.28;
      xs.push(t * width);
      ys.push(Math.max(1.5, spectrumValues[i] * (midY - 3)));
    }

    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255,179,95,.34)");
    gradient.addColorStop(0.5, "rgba(79,242,255,.4)");
    gradient.addColorStop(1, "rgba(255,179,95,.34)");

    context.beginPath();
    traceRibbon(context, xs, ys, midY, -1);
    traceRibbon(
      context,
      xs.slice().reverse(),
      ys.slice().reverse(),
      midY,
      1,
      true
    );
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    /* 上側の輪郭線だけネオン発光させる */
    context.save();
    context.shadowColor = "rgba(79,242,255,.85)";
    context.shadowBlur = 9;
    context.beginPath();
    traceRibbon(context, xs, ys, midY, -1);
    context.strokeStyle = "rgba(79,242,255,.95)";
    context.lineWidth = 1.6;
    context.stroke();
    context.restore();

    context.beginPath();
    traceRibbon(context, xs, ys, midY, 1);
    context.strokeStyle = "rgba(255,179,95,.5)";
    context.lineWidth = 1.1;
    context.stroke();

    return true;
  }

  var spectrumBroken = false;

  function renderVisualizerFrame() {
    var canvas = document.getElementById("signalCanvas");
    var context = canvas && canvas.getContext("2d");
    var seconds = Date.now() / 1000;
    var width;
    var height;
    var live;
    var drawn = false;

    if (!canvas || !context) return;

    resizeCanvas(canvas, context);
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    energy += (energyTarget() - energy) * 0.04;
    context.clearRect(0, 0, width, height);

    live = !spectrumBroken
      && analyser
      && currentElement === playerCors
      && playbackStatus === "PLAYING";

    if (live) {
      drawn = drawSpectrum(context, width, height);
      if (!drawn) {
        context.clearRect(0, 0, width, height);
      }
    }
    if (!drawn) {
      drawAmbient(context, width, height, seconds);
    }
  }

  var frameCount = 0;

  function drawVisualizer() {
    /* 描画中に何が起きてもループ自体は止めない (先に次フレームを予約) */
    window.requestAnimationFrame(drawVisualizer);
    frameCount += 1;
    try {
      renderVisualizerFrame();
    } catch (error) {
      if (!spectrumBroken) {
        spectrumBroken = true;
        console.warn("Visualizer fell back to ambient mode:", error);
      }
    }
  }

  /* requestAnimationFrame が動かない環境向けの保険。
     フレームが1秒以上進まなければ setInterval 駆動に切り替え、
     rAF が復活したら自動で解除する */
  function startVisualizerWatchdog() {
    var lastCount = -1;
    var fallbackTimer = null;

    window.setInterval(function () {
      var stalled = frameCount === lastCount;
      lastCount = frameCount;

      if (stalled && fallbackTimer === null) {
        fallbackTimer = window.setInterval(function () {
          try {
            renderVisualizerFrame();
          } catch (error) {
            /* 描画は諦めるがタイマーは維持しない */
            window.clearInterval(fallbackTimer);
            fallbackTimer = null;
          }
        }, 40);
      } else if (!stalled && fallbackTimer !== null) {
        window.clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    }, 1200);
  }

  /* ---------------------------------------------------------------
   * コンソール操作
   * ------------------------------------------------------------- */
  function applyVolume(value) {
    var slider = document.getElementById("volumeSlider");
    var clamped = Math.min(100, Math.max(0, value));

    playerCors.volume = clamped / 100;
    playerPlain.volume = clamped / 100;
    slider.value = clamped;
    slider.style.setProperty("--vol", clamped + "%");
    document.getElementById("volumeValue").textContent = clamped;
    writeStore(STORE_VOLUME, String(clamped));
  }

  function shuffleChannel() {
    var preferred = [];
    var fallback = [];
    var pool;
    var index;

    buttons.forEach(function (button, buttonIndex) {
      if (buttonIndex === activeIndex) return;
      fallback.push(buttonIndex);
      if (button.dataset.streamState !== "dead") {
        preferred.push(buttonIndex);
      }
    });

    /* NG 局を避けつつ、候補が無くても必ずどこかを選ぶ */
    pool = preferred.length ? preferred : fallback;
    if (!pool.length) return;

    index = pool[Math.floor(Math.random() * pool.length)];
    playChannel(index);
    buttons[index].focus();
  }

  function bindConsole() {
    document.getElementById("stopButton").addEventListener("click", stopPlayback);
    document.getElementById("shuffleButton").addEventListener("click", shuffleChannel);
    document.getElementById("scanButton").addEventListener("click", scanAllChannels);
    document.getElementById("volumeSlider").addEventListener("input", function (event) {
      applyVolume(Number(event.target.value));
    });
  }

  function bindKeyboard() {
    document.addEventListener("keydown", function (event) {
      if (event.target !== document.body) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        playChannel(activeIndex === null ? 0 : (activeIndex + 1) % stations.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        playChannel(
          activeIndex === null
            ? stations.length - 1
            : (activeIndex - 1 + stations.length) % stations.length
        );
      } else if (event.key === " ") {
        event.preventDefault();
        if (activeIndex !== null) {
          stopPlayback();
        } else {
          shuffleChannel();
        }
      }
    });
  }

  function bindPlayerEvents() {
    [playerCors, playerPlain].forEach(function (element) {
      element.addEventListener("playing", function () {
        if (element !== currentElement) return;
        setPlaybackStatus("PLAYING");
      });
      element.addEventListener("waiting", function () {
        if (element !== currentElement) return;
        setPlaybackStatus("LOADING");
      });
      element.addEventListener("pause", function () {
        if (element !== currentElement || activeIndex === null) return;
        /* メディアエラー直後にも pause が飛んでくるので ERROR を上書きしない */
        if (playbackStatus === "ERROR" || element.error) return;
        setPlaybackStatus("PAUSED");
      });
      element.addEventListener("error", function () {
        if (element !== currentElement || activeIndex === null) return;
        if (!element.getAttribute("src")) return;

        /* crossorigin 付きで読めない = CORS 非対応局の可能性が高いので
           通常の audio 再生でリトライする */
        if (element === playerCors) {
          fallbackToPlain(activeIndex);
          return;
        }
        setPlaybackStatus("ERROR");
        setChannelState(activeIndex, "dead", "playback failed");
      });
    });
  }

  function restoreSession() {
    var rawVolume = readStore(STORE_VOLUME);
    var rawChannel = readStore(STORE_CHANNEL);
    var storedVolume = rawVolume === null ? NaN : Number(rawVolume);
    var storedChannel = rawChannel === null ? NaN : Number(rawChannel);

    applyVolume(Number.isFinite(storedVolume) ? storedVolume : 80);

    /* 自動再生はブラウザ側で拒否されるため、前回局の表示だけ復元する */
    if (Number.isFinite(storedChannel) && stations[storedChannel]) {
      setNowPanel(storedChannel, "LAST — " + stations[storedChannel].name, stations[storedChannel].genre);
      document.getElementById("nowStatus").textContent = "READY";
    }
  }

  /* ---------------------------------------------------------------
   * 起動
   * ------------------------------------------------------------- */
  renderChannelButtons();
  bindPlayerEvents();
  bindConsole();
  bindKeyboard();
  restoreSession();

  renderClock();
  window.setInterval(renderClock, 250);
  window.requestAnimationFrame(drawVisualizer);
  startVisualizerWatchdog();

  /* 通信量節約モードでは自動スキャンしない (SCAN ボタンで手動実行) */
  var connection = navigator.connection || {};
  if (!connection.saveData) {
    window.setTimeout(scanAllChannels, 800);
  }
})();
