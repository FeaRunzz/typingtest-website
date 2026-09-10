/* ==========================================================================
   TideType — typing test logic + procedurally synthesized ambience audio.
   No external audio files: every ambience sound is generated in the
   browser with the Web Audio API, so the site stays a handful of static
   files that are simple to deploy anywhere (e.g. Tencent EdgeOne Pages).
   ========================================================================== */

(() => {
    "use strict";

    /* ---------------------------------------------------------------- */
    /* Sentence bank — original copy, no external sources                */
    /* ---------------------------------------------------------------- */

    const SENTENCES = {
        id: [
            "Ombak datang perlahan lalu surut lagi tanpa terburu-buru.",
            "Hujan kecil mengetuk jendela sementara kamu mengetik dengan tenang.",
            "Secangkir kopi hangat menemani jari-jari yang mulai terbiasa.",
            "Hutan pagi terasa sunyi, hanya suara daun yang bergesekan pelan.",
            "Salju turun tanpa suara dan menutupi jalan setapak yang sepi.",
            "Latihan singkat setiap hari lebih berarti daripada latihan panjang sesekali.",
            "Fokus pada napas, lalu biarkan jari bergerak mengikuti irama.",
            "Kesalahan kecil bukan masalah, yang penting terus mengalir.",
            "Ketenangan adalah bagian dari kecepatan, bukan lawannya.",
            "Layar yang sederhana membantu pikiran tetap jernih saat berlatih.",
            "Setiap huruf yang benar adalah langkah kecil menuju kebiasaan baru.",
            "Suara ombak yang jauh membuat waktu terasa berjalan lebih lambat.",
            "Angin sore membawa aroma tanah basah setelah hujan reda.",
            "Malam yang tenang adalah waktu terbaik untuk berlatih tanpa gangguan.",
            "Ritme mengetik yang stabil lebih penting daripada kecepatan sesaat."
        ],
        en: [
            "The tide rolls in slowly and just as slowly rolls back out.",
            "Rain taps the window while your fingers find their quiet rhythm.",
            "A warm cup of coffee waits beside the keyboard, untouched for now.",
            "Morning forests stay hushed, save for the soft rustle of leaves.",
            "Snow falls without a sound and settles on the empty path.",
            "A short daily habit outlasts one long burst of practice.",
            "Breathe once, then let your hands follow their own quiet pace.",
            "A small mistake is nothing to chase, just let the words keep moving.",
            "Calm is part of speed, not the opposite of it.",
            "A plain screen keeps the mind clear enough to actually practice.",
            "Every correct letter is a small step toward a steadier habit.",
            "Distant waves make the minutes feel like they are moving slower.",
            "The evening air still carries the smell of rain on warm stone.",
            "A quiet night is often the best time to type without distraction.",
            "A steady rhythm matters more than any single burst of speed."
        ]
    };

    /* ---------------------------------------------------------------- */
    /* DOM references                                                    */
    /* ---------------------------------------------------------------- */

    const typingText = document.getElementById("typingText");
    const typingInput = document.getElementById("typingInput");
    const typingPanel = document.querySelector(".typing-panel-inner");
    const resultsPanel = document.getElementById("results");
    const restartButton = document.getElementById("restartButton");

    const statWpm = document.getElementById("statWpm");
    const statAccuracy = document.getElementById("statAccuracy");
    const statTime = document.getElementById("statTime");

    const resultWpm = document.getElementById("resultWpm");
    const resultAccuracy = document.getElementById("resultAccuracy");
    const resultChars = document.getElementById("resultChars");

    const durationButtons = document.querySelectorAll("[data-duration]");
    const langButtons = document.querySelectorAll("[data-lang]");
    const themeToggle = document.getElementById("themeToggle");
    const ambienceButtons = document.querySelectorAll(".ambience-pill");
    const volumeSlider = document.getElementById("volumeSlider");

    /* ---------------------------------------------------------------- */
    /* Typing test state                                                 */
    /* ---------------------------------------------------------------- */

    const state = {
        duration: 15,
        lang: "id",
        text: "",
        active: false,
        startTime: 0,
        timer: null,
        timeLeft: 15
    };

    function shuffled(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function buildText(lang) {
        const pool = SENTENCES[lang] || SENTENCES.id;
        const targetLength = 260;
        let text = shuffled(pool).join(" ");
        while (text.length < targetLength) {
            text += " " + shuffled(pool).join(" ");
        }
        return text;
    }

    function renderText(text) {
        typingText.innerHTML = "";
        const fragment = document.createDocumentFragment();
        text.split("").forEach((char) => {
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = char;
            fragment.appendChild(span);
        });
        typingText.appendChild(fragment);
        markCurrent(0);
    }

    function markCurrent(index) {
        const chars = typingText.children;
        for (let i = 0; i < chars.length; i++) {
            chars[i].classList.toggle("is-current", i === index);
        }
    }

    function resetTest({ regenerateText = true } = {}) {
        clearInterval(state.timer);
        state.active = false;
        state.timeLeft = state.duration;
        typingInput.value = "";
        typingInput.disabled = false;

        if (regenerateText) {
            state.text = buildText(state.lang);
            renderText(state.text);
        } else {
            markCurrent(0);
            Array.from(typingText.children).forEach((el) => {
                el.classList.remove("is-correct", "is-incorrect");
            });
        }

        statWpm.textContent = "0";
        statAccuracy.textContent = "100%";
        statTime.textContent = String(state.duration);
        resultsPanel.hidden = true;
    }

    function startTest() {
        state.active = true;
        state.startTime = Date.now();
        state.timer = setInterval(tick, 1000);
    }

    function tick() {
        state.timeLeft -= 1;
        statTime.textContent = String(Math.max(state.timeLeft, 0));
        if (state.timeLeft <= 0) {
            endTest("timeup");
        }
    }

    function computeStats(elapsedMinutes) {
        const chars = Array.from(typingText.children);
        const typedLength = typingInput.value.length;
        let correct = 0;
        for (let i = 0; i < typedLength; i++) {
            if (chars[i] && chars[i].classList.contains("is-correct")) correct++;
        }
        const wpm = elapsedMinutes > 0 ? Math.round((correct / 5) / elapsedMinutes) : 0;
        const accuracy = typedLength > 0 ? Math.round((correct / typedLength) * 100) : 100;
        return { wpm, accuracy, typedLength, correct };
    }

    function endTest(reason) {
        clearInterval(state.timer);
        state.active = false;
        typingInput.disabled = true;

        const elapsedMinutes = reason === "timeup"
            ? state.duration / 60
            : (Date.now() - state.startTime) / 60000;

        const { wpm, accuracy, typedLength } = computeStats(elapsedMinutes);

        statWpm.textContent = String(wpm);
        statAccuracy.textContent = accuracy + "%";
        resultWpm.textContent = String(wpm);
        resultAccuracy.textContent = accuracy + "%";
        resultChars.textContent = String(typedLength);
        resultsPanel.hidden = false;
    }

    function handleInput() {
        const value = typingInput.value;

        if (value.length > state.text.length) {
            typingInput.value = value.slice(0, state.text.length);
            return handleInput();
        }

        if (!state.active && value.length > 0) {
            startTest();
        }

        const chars = typingText.children;
        for (let i = 0; i < chars.length; i++) {
            const el = chars[i];
            el.classList.remove("is-correct", "is-incorrect", "is-current");
            if (i < value.length) {
                el.classList.add(value[i] === state.text[i] ? "is-correct" : "is-incorrect");
            }
        }
        markCurrent(value.length);

        if (state.active) {
            const elapsedMinutes = (Date.now() - state.startTime) / 60000;
            const { wpm, accuracy } = computeStats(elapsedMinutes || 1 / 60);
            statWpm.textContent = String(wpm);
            statAccuracy.textContent = accuracy + "%";
        }

        if (value.length === state.text.length) {
            endTest("completed");
        }
    }

    typingInput.addEventListener("input", handleInput);
    typingPanel.addEventListener("click", () => typingInput.focus());
    restartButton.addEventListener("click", () => resetTest({ regenerateText: true }));

    durationButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            durationButtons.forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            state.duration = Number(btn.dataset.duration);
            resetTest({ regenerateText: false });
        });
    });

    langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            langButtons.forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            state.lang = btn.dataset.lang;
            resetTest({ regenerateText: true });
        });
    });

    /* ---------------------------------------------------------------- */
    /* Theme toggle                                                      */
    /* ---------------------------------------------------------------- */

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        themeToggle.querySelector(".icon-toggle-mark").textContent = theme === "dark" ? "☀" : "☾";
        themeToggle.setAttribute(
            "aria-label",
            theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"
        );
        try {
            localStorage.setItem("tidetype-theme", theme);
        } catch (err) {
            /* localStorage unavailable — theme just won't persist */
        }
    }

    (function initTheme() {
        let saved = "light";
        try {
            saved = localStorage.getItem("tidetype-theme") || "light";
        } catch (err) {
            /* ignore */
        }
        applyTheme(saved);
    })();

    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
    });

    /* ---------------------------------------------------------------- */
    /* Ambience — synthesized entirely with the Web Audio API            */
    /* ---------------------------------------------------------------- */

    let audioCtx = null;
    let masterGain = null;
    let activeAmbience = null; // { stop() }
    let activeKey = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = Number(volumeSlider.value) / 100;
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function makeNoiseBuffer(ctx, color) {
        const duration = 4;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            if (color === "brown") {
                last = (last + 0.02 * white) / 1.02;
                data[i] = last * 3.2;
            } else {
                data[i] = white;
            }
        }
        return buffer;
    }

    function makeNoiseSource(ctx, color) {
        const source = ctx.createBufferSource();
        source.buffer = makeNoiseBuffer(ctx, color);
        source.loop = true;
        return source;
    }

    function scheduleLoop(fn, minSeconds, maxSeconds, isActiveRef) {
        let timeoutId;
        const run = () => {
            if (!isActiveRef.on) return;
            fn();
            const next = (minSeconds + Math.random() * (maxSeconds - minSeconds)) * 1000;
            timeoutId = setTimeout(run, next);
        };
        timeoutId = setTimeout(run, (minSeconds + Math.random() * (maxSeconds - minSeconds)) * 1000);
        return () => clearTimeout(timeoutId);
    }

    function pluckTone(ctx, dest, { freq = 2400, duration = 0.15, type = "sine", peak = 0.15 } = {}) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain).connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
    }

    const AMBIENCE_BUILDERS = {
        rain(ctx, dest) {
            const source = makeNoiseSource(ctx, "white");
            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.value = 700;
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.value = 3200;
            bandpass.Q.value = 0.6;
            const gain = ctx.createGain();
            gain.gain.value = 0.5;

            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.35;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.08;
            lfo.connect(lfoGain).connect(gain.gain);

            source.connect(highpass).connect(bandpass).connect(gain).connect(dest);
            source.start();
            lfo.start();

            return () => {
                source.stop();
                lfo.stop();
            };
        },

        ocean(ctx, dest) {
            const source = makeNoiseSource(ctx, "brown");
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.value = 500;
            const gain = ctx.createGain();
            gain.gain.value = 0.7;

            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.09;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 350;
            lfo.connect(lfoGain).connect(lowpass.frequency);

            source.connect(lowpass).connect(gain).connect(dest);
            source.start();
            lfo.start();

            return () => {
                source.stop();
                lfo.stop();
            };
        },

        forest(ctx, dest) {
            const source = makeNoiseSource(ctx, "brown");
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.value = 900;
            bandpass.Q.value = 0.8;
            const gain = ctx.createGain();
            gain.gain.value = 0.28;
            source.connect(bandpass).connect(gain).connect(dest);
            source.start();

            const isActiveRef = { on: true };
            const cancelChirps = scheduleLoop(
                () => pluckTone(ctx, dest, {
                    freq: 1800 + Math.random() * 1400,
                    duration: 0.12 + Math.random() * 0.08,
                    type: "sine",
                    peak: 0.05 + Math.random() * 0.04
                }),
                2, 6, isActiveRef
            );

            return () => {
                isActiveRef.on = false;
                cancelChirps();
                source.stop();
            };
        },

        cafe(ctx, dest) {
            const source = makeNoiseSource(ctx, "brown");
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.value = 1100;
            const gain = ctx.createGain();
            gain.gain.value = 0.35;
            source.connect(lowpass).connect(gain).connect(dest);
            source.start();

            const isActiveRef = { on: true };
            const cancelClinks = scheduleLoop(
                () => pluckTone(ctx, dest, {
                    freq: 3200 + Math.random() * 1800,
                    duration: 0.08,
                    type: "triangle",
                    peak: 0.06
                }),
                3, 8, isActiveRef
            );

            return () => {
                isActiveRef.on = false;
                cancelClinks();
                source.stop();
            };
        },

        snow(ctx, dest) {
            const source = makeNoiseSource(ctx, "white");
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.value = 2200;
            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.value = 300;
            const gain = ctx.createGain();
            gain.gain.value = 0.14;

            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.06;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.04;
            lfo.connect(lfoGain).connect(gain.gain);

            source.connect(highpass).connect(lowpass).connect(gain).connect(dest);
            source.start();
            lfo.start();

            return () => {
                source.stop();
                lfo.stop();
            };
        }
    };

    function stopAmbience() {
        if (activeAmbience) {
            activeAmbience();
            activeAmbience = null;
        }
        activeKey = null;
        ambienceButtons.forEach((b) => b.classList.remove("is-active"));
    }

    function playAmbience(key) {
        const ctx = getAudioContext();
        stopAmbience();
        const builder = AMBIENCE_BUILDERS[key];
        if (!builder) return;
        activeAmbience = builder(ctx, masterGain);
        activeKey = key;
        ambienceButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.ambience === key));
    }

    ambienceButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.ambience;
            if (activeKey === key) {
                stopAmbience();
            } else {
                playAmbience(key);
            }
        });
    });

    volumeSlider.addEventListener("input", () => {
        if (masterGain) {
            masterGain.gain.value = Number(volumeSlider.value) / 100;
        }
    });

    /* ---------------------------------------------------------------- */
    /* Init                                                              */
    /* ---------------------------------------------------------------- */

    resetTest({ regenerateText: true });
})();
