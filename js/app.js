/*
 * RADIO DECK — application
 *
 * 構成:
 *   1. チャンネルスイッチの生成 (template を複製)
 *   2. 再生 / 停止 (同じスイッチを再クリックで OFF)
 *   3. 回線ヘルスチェック (SCAN)
 *   4. 時計ウィジェット / シグナルビジュアライザ
 *   5. 音量・シャッフル・キーボード操作
 */
(function () {
  "use strict";

  var stations = window.RADIO_STATIONS || [];
  var player = document.getElementById("player");
  var grid = document.getElementById("channelGrid");

  var buttons = [];
  var activeIndex = null;
  var playbackStatus = "IDLE";
  var scanning = false;

  var STORE_VOLUME = "radiodeck.volume";
  var STORE_CHANNEL = "radiodeck.channel";

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
      document.title = "▶ " + stations[activeIndex].name + " — RADIO DECK";
    } else {
      document.title = "RADIO DECK — ラヂオボタン";
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

  function stopPlayback() {
    if (activeIndex !== null) {
      powerOff(buttons[activeIndex]);
    }
    activeIndex = null;
    player.pause();
    player.removeAttribute("src");
    player.load();
    setNowPanel(null, "STANDBY — チャンネルを選択してください", "");
    setPlaybackStatus("IDLE");
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
    buttons[index].classList.remove("is-powering-off");
    buttons[index].classList.add("is-active");
    buttons[index].setAttribute("aria-pressed", "true");

    setNowPanel(index, station.name, station.genre);
    setPlaybackStatus("LOADING");
    writeStore(STORE_CHANNEL, String(index));

    player.src = station.url;
    player.load();

    var playback = player.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        if (activeIndex !== index) return;
        console.warn("Playback failed:", station.name, error);
        setPlaybackStatus("ERROR");
        setChannelState(index, "dead", "playback failed");
      });
    }
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

      timer = window.setTimeout(function () {
        finish("dead", "timeout");
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
   * 再生状態に反応するアンビエント波形 (実スペクトラムは CORS の
   * 制約で全局には使えないため、状態駆動のアニメーションにしている)
   * ------------------------------------------------------------- */
  var energy = 0.12;

  function energyTarget() {
    if (playbackStatus === "PLAYING") return 1;
    if (playbackStatus === "LOADING") return 0.45;
    if (playbackStatus === "ERROR") return 0.05;
    return 0.12;
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

  function drawVisualizer() {
    var canvas = document.getElementById("signalCanvas");
    var context = canvas && canvas.getContext("2d");
    var seconds = Date.now() / 1000;
    var width;
    var height;
    var midY;
    var amp;
    var sweepX;

    if (!canvas || !context) return;

    resizeCanvas(canvas, context);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    midY = height / 2;

    energy += (energyTarget() - energy) * 0.04;
    amp = height * 0.3 * energy + 1.2;

    context.clearRect(0, 0, width, height);

    context.save();
    context.shadowColor = "rgba(79,242,255,.8)";
    context.shadowBlur = 10;
    drawWave(context, width, midY, amp, 2.1, seconds, "rgba(79,242,255,.92)", 1.8);
    context.restore();

    drawWave(context, width, midY, amp * 0.65, 1.4, seconds + 1.7, "rgba(255,179,95,.55)", 1.2);
    drawWave(context, width, midY, amp * 0.4, 3.2, seconds + 4.2, "rgba(79,242,255,.28)", 1);

    /* スイープバー */
    sweepX = ((seconds * 90) % (width + 120)) - 60;
    var sweep = context.createLinearGradient(sweepX - 50, 0, sweepX + 6, 0);
    sweep.addColorStop(0, "rgba(79,242,255,0)");
    sweep.addColorStop(1, "rgba(79,242,255,.22)");
    context.fillStyle = sweep;
    context.fillRect(sweepX - 50, 0, 56, height);

    window.requestAnimationFrame(drawVisualizer);
  }

  /* ---------------------------------------------------------------
   * コンソール操作
   * ------------------------------------------------------------- */
  function applyVolume(value) {
    var slider = document.getElementById("volumeSlider");
    var clamped = Math.min(100, Math.max(0, value));

    player.volume = clamped / 100;
    slider.value = clamped;
    slider.style.setProperty("--vol", clamped + "%");
    document.getElementById("volumeValue").textContent = clamped;
    writeStore(STORE_VOLUME, String(clamped));
  }

  function shuffleChannel() {
    var candidates = [];
    var index;

    buttons.forEach(function (button, buttonIndex) {
      if (buttonIndex !== activeIndex && button.dataset.streamState !== "dead") {
        candidates.push(buttonIndex);
      }
    });
    if (!candidates.length) return;

    index = candidates[Math.floor(Math.random() * candidates.length)];
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
    player.addEventListener("playing", function () {
      setPlaybackStatus("PLAYING");
    });
    player.addEventListener("waiting", function () {
      setPlaybackStatus("LOADING");
    });
    player.addEventListener("pause", function () {
      if (activeIndex !== null) setPlaybackStatus("PAUSED");
    });
    player.addEventListener("error", function () {
      if (activeIndex === null || !player.getAttribute("src")) return;
      setPlaybackStatus("ERROR");
      setChannelState(activeIndex, "dead", "playback failed");
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

  /* 通信量節約モードでは自動スキャンしない (SCAN ボタンで手動実行) */
  var connection = navigator.connection || {};
  if (!connection.saveData) {
    window.setTimeout(scanAllChannels, 800);
  }
})();
