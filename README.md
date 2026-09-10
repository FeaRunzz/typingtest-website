# 🌊 TideType

> *A calm place to improve your typing.*

TideType adalah website **Typing Test** dengan konsep **chill dan minimalis**, yang aku rancang agar pengguna dapat berlatih mengetik sambil menikmati suasana yang tenang melalui berbagai pilihan ambience seperti hujan, ombak, hutan, dan cafe.

Proyek ini dibuat sebagai bagian dari perjalanan saya dalam mempelajari **HTML, CSS, JavaScript, Git, dan GitHub** secara bertahap.

---

## 🎯 Tujuan Proyek

Saya ingin membuat website typing test yang tidak hanya berfungsi sebagai alat latihan mengetik, tetapi juga memberikan pengalaman yang nyaman dan santai.

---

## ✨ Konsep

Berbeda dengan website typing test pada umumnya, TideType mengusung konsep:

- 🌊 Nuansa yang tenang
- 🎧 Ambience yang dapat dipilih pengguna
- 🎨 Tampilan minimalis
- 📖 Fokus pada pengalaman mengetik
- 🚫 Tanpa elemen yang mengganggu fokus

---

### Status Fitur

- [x] Typing Area
- [x] Timer (15s / 30s / 60s)
- [x] WPM Counter
- [x] Accuracy
- [x] Restart Button
- [x] Dark Mode (toggle, tersimpan di localStorage)
- [x] Ocean Ambience 🌊
- [x] Rain Ambience 🌧
- [x] Forest Ambience 🌲
- [x] Cafe Ambience ☕
- [x] Snow Ambience ❄
- [x] Volume Slider 🔊
- [ ] Dynamic Background
- [ ] Smooth Animation

Semua suara ambience **disintesis langsung di browser** dengan Web Audio API (noise + filter + LFO) — bukan file audio yang di-embed. Jadi seluruh proyek tetap cuma 3 file statis (`index.html`, `style/style.css`, `script/script.js`), tanpa build step, gampang di-deploy ke static hosting seperti **Tencent EdgeOne**.

---

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties untuk light/dark theme)
- Vanilla JavaScript (tanpa framework, tanpa build step)
- Web Audio API untuk sintesis ambience

---


## 📅 Learning Journey

Project ini dikembangkan secara bertahap.

Saya sengaja tidak langsung membuat website hingga selesai agar benar-benar memahami setiap konsep HTML, CSS, JavaScript, Git, dan GitHub.

Setiap commit merupakan bagian dari proses belajar.

---

## 📌 Roadmap

### Phase 1
- [x] Setup Project
- [x] HTML Structure

### Phase 2
- [x] CSS Layout
- [x] Responsive Design

### Phase 3
- [x] JavaScript Logic

### Phase 4
- [x] Ambience System

### Phase 5
- [x] UI Improvements

### Phase 6
- [ ] Deploy ke Tencent EdgeOne

---

## 👨‍💻 Author

**Fadhil**

GitHub:
https://github.com/FeaRunzz

---

## ⭐ Status

✅ Fitur inti typing test sudah jalan (area ketik, timer, WPM, akurasi, restart, dark mode, ambience). Tahap berikutnya: deploy ke Tencent EdgeOne.