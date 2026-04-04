// ===================================================
// quiz.js — logic ทั้งหมดของ quiz
// ต้องโหลดหลัง data.js เสมอ
// ===================================================

let scores, cur, log;
let started = false;

// ---------- init ----------
function init() {
  scores = { octopus:0, shark:0, sealion:0, dolphin:0, jellyfish:0, clownfish:0, manta:0, puffer:0 };
  cur = 0;
  started = false;
  log = [];
  updateProgress();
  document.getElementById('chat-log').innerHTML = '';
  document.getElementById('choices').innerHTML = '';
  document.getElementById('screen-chat').classList.add('active');
  document.getElementById('screen-result').classList.remove('active');
  showIntro();
}


function showIntro() {
  const chat = document.getElementById('chat-log');
  const choices = document.getElementById('choices');

  chat.innerHTML = '';
  choices.innerHTML = '';

  // ข้อความเปิด (ใช้ QUESTIONS[0])
  log.push({ role: 'system', text: QUESTIONS[0].sys });
  renderLog();

  // ปุ่มเริ่ม
  const btn = document.createElement('button');
  btn.className = 'choice-btn';
  btn.textContent = 'กดดู';

  btn.onclick = () => {
    started = true;
    log.push({ role: 'user', text: 'กดดู' });
    renderLog();

    setTimeout(() => {
      cur = 0; // 👈 เริ่มที่คำถามจริง
      updateProgress();
      showQuestion(cur);
    }, 400);
  };

  choices.appendChild(btn);

  updateProgress(); // จะเป็น 0/ทั้งหมด
}

function restart() {
  init();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- progress ----------
function updateProgress() {
  const pct = (cur / QUESTIONS.length) * 100;
  document.getElementById('prog').style.width = pct + '%';
  document.getElementById('prog-num').textContent = cur + ' / ' + QUESTIONS.length;
}

// ---------- chat ----------
function renderLog() {
  const el = document.getElementById('chat-log');
  el.innerHTML = '';
  log.forEach(m => {
    const d = document.createElement('div');
    d.className = 'msg ' + m.role;
    if (m.role === 'system') {
      d.innerHTML = `
        <div class="sender-label">DR. ABYSSIA // DEEP SEA LAB</div>
        <div class="bubble">${m.text.replace(/\n/g, '<br>')}</div>`;
    } else {
      d.innerHTML = `<div class="bubble">${m.text}</div>`;
    }
    el.appendChild(d);
  });
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
}

function showTyping(callback) {
  const el = document.getElementById('chat-log');
  const d = document.createElement('div');
  d.className = 'msg system';
  d.id = 'typing-ind';
  d.innerHTML = `
    <div class="sender-label">DR. ABYSSIA // DEEP SEA LAB</div>
    <div class="typing-bubble">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>`;
  el.appendChild(d);
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  setTimeout(() => {
    const t = document.getElementById('typing-ind');
    if (t) t.remove();
    callback();
  }, 850);
}

// ---------- question ----------
function showQuestion(idx) {
  document.getElementById('choices').innerHTML = '';

  showTyping(() => {
    const q = QUESTIONS[idx];
    log.push({ role: 'system', text: q.sys });
    renderLog();

    
    if (!q.choices || q.choices.length === 0) {
      setTimeout(() => {
        cur++;
        updateProgress();
        showQuestion(cur);
      }, 900);
    } else {
      renderChoices(q.choices);
    }
  });
}

function renderChoices(choices) {
  const el = document.getElementById('choices');
  el.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.text;
    btn.onclick = () => pick(c);
    el.appendChild(btn);
  });
}


// ---------- pick answer ----------
function pick(choice) {
  document.getElementById('choices').innerHTML = '';
  log.push({ role: 'user', text: choice.text });
  renderLog();

  // ✅ ถ้ามี next = แทรกเข้า flow
  if (choice.next) {
    QUESTIONS.splice(cur + 1, 0, choice.next);
  }

  // ✅ เก็บคะแนน
  if (choice.s) {
    Object.entries(choice.s).forEach(([key, val]) => {
      scores[key] += val;
    });
  }

  cur++;
  updateProgress();

  if (cur < QUESTIONS.length) {
    showQuestion(cur);
  } else {
    setTimeout(showResult, 400);
  }
}
// ---------- result ----------

function showResult() {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = CREATURES[sorted[0][0]];
  const sec = CREATURES[sorted[1][0]];

  document.getElementById('screen-chat').classList.remove('active');
  document.getElementById('screen-result').classList.add('active');

  document.getElementById('result-card').innerHTML = `
    <div class="result-hero">
      <span class="creature-emoji-big">${top.emoji}</span>
      <div class="creature-name-big">${top.th}</div>
      <div class="creature-en">${top.en}</div>
    </div>
    <div class="result-body">
      <div class="tags">
        ${top.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="section-label"> "บุคลิกของเจ้า?" </div>
      <div class="desc-text">${top.desc}</div>

      <div class="divider"></div>
      
      <div class="section-label"> "จุดแข็งความรัก?" </div>
<div class="desc-text">
  <ul>
    ${(top.loveStrength || []).map(item => `<li>${item}</li>`).join('')}
  </ul>
</div>

      <div class="section-label"> "จุดอ่อนความรัก?" </div>
      <div class="desc-text">
        <ul>
        ${(top.loveWeakness || []).map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="section-label"> "ความลึกซึ้งภายใน" </div>
      <div class="desc-text">${top.deep || '-'}</div>

      <div class="divider"></div>
      <div class="compat-grid">
        <div class="compat-item">
          <div class="section-label"> "เข้ากันได้ดีกับ?" </div>
          <div class="compat-val">${top.compat}</div>
        </div>
        <div class="compat-item">
          <div class="section-label"> "สัตว์น้ำรอง?" </div>
          <div class="compat-val">${sec.emoji} ${sec.th}</div>
        </div>
      </div>
    </div>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// ---------- bubble background ----------
function makeBubbles() {
  const wrap = document.getElementById('bubbles');
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'bubble-particle';
    const sz = 6 + Math.random() * 20;
    b.style.cssText = `
      width: ${sz}px;
      height: ${sz}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 14}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${0.3 + Math.random() * 0.4};
    `;
    wrap.appendChild(b);
  }
}

// ---------- start ----------
makeBubbles();
init();
