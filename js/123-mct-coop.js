/* =====================================================================
   MY COMPANY TYCOON — CO-OP (เล่นกับเพื่อนออนไลน์)
   - ปุ่ม "Co-op เล่นกับเพื่อน" ที่หน้าเมนูแรก → สร้างห้อง / เข้าห้องด้วยรหัส → ตั้งชื่อ ศาสนา ตัวละคร
   - ผู้เล่นทุกคนรันเกมเต็มของตัวเอง; เซิร์ฟเวอร์ (server/server.js) ซิงก์: ตำแหน่ง/ฉาก, แชต, เงินกลาง, เควสต์ร่วม, อีเวนต์คัตซีน
   - ตัวเลือกห้อง (ผู้สร้างเลือก): เงิน รวม/แยก · ออฟฟิศ รวม/แยก · เควสต์ รวม/แยก
   - Co-op ไม่อ่าน/ไม่เขียนเซฟเล่นคนเดียว (ดู 122-mct-coop-boot.js)
   โหลดต่อท้ายสุดของ index.html
   ===================================================================== */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const BOOT = window.__COOP_BOOT || null;
  const QKEYS = ['st', 'fl', 'cl', 'rel', 'met', 'cs', 'rn', 'gn', 'gh'];
  const PLACE_TH = { office: 'ในบริษัท', street: 'ถนนคนเดิน', condo: 'คอนโด', hall: 'ทางเดินคอนโด', sea: 'ทะเล', beach: 'ชายหาด', farm: 'ไร่ผัก', frst: 'ป่าแม่น้ำ', dpfr: 'ป่าลึก', cave: 'ถ้ำเหมือง', stst: 'สถานีรถไฟ', stin: 'ชานชาลา', carst: 'โชว์รูม', aqst: 'อควาเรียม', aqin: 'ในอควาเรียม', cardst: 'ร้านการ์ด', snkst: 'สนุกเกอร์', ncst: 'NICECLUB', ride: 'บนรถ' };
  const REL_TH = { buddhism: 'พุทธ', christianity: 'คริสต์', islam: 'อิสลาม', none: 'ไม่นับถือ' };
  const MODE_TH = { shared: 'รวมกัน', split: 'แยกกัน' };

  /* ---------------------------------------------------------------- server url */
  function serverUrl() {
    let o = ''; try { o = localStorage.getItem('mct_coop_srv') || ''; } catch (e) { }
    if (o) return o;
    if ((location.protocol === 'http:' || location.protocol === 'https:') && !/github\.io$/i.test(location.hostname))
      return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    return window.MCT_COOP_SERVER || '';
  }

  /* ---------------------------------------------------------------- css */
  const css = document.createElement('style');
  css.textContent = `
  #coopBtn{position:absolute;left:50%;bottom:3.2%;transform:translateX(-50%);z-index:5;font-family:'Kanit',sans-serif;font-weight:800;font-size:clamp(13px,2.1vmin,20px);color:#fff7d6;background:linear-gradient(#3b7be0,#2552a8);border:3px solid #10265a;border-radius:10px;padding:.55em 1.3em;cursor:pointer;box-shadow:0 4px 0 #10265a,0 0 18px rgba(80,140,255,.55);text-shadow:0 2px #10265a}
  #coopBtn:hover{filter:brightness(1.12)}#coopBtn:active{transform:translateX(-50%) translateY(3px);box-shadow:0 1px 0 #10265a}
  #coopMenu{position:fixed;inset:0;z-index:100001;display:none;align-items:center;justify-content:center;background:rgba(5,8,20,.82);font-family:'Kanit',system-ui,sans-serif;color:#f8edcf;padding:10px;box-sizing:border-box}
  #coopMenu.show{display:flex}
  #coopMenu .cp{width:min(560px,96vw);max-height:94vh;overflow:auto;background:#1c2246;border:4px solid #f5c45b;border-radius:14px;padding:16px 18px;box-shadow:0 0 0 4px #49301e,0 10px 40px #000a}
  #coopMenu h2{margin:0 0 8px;font-size:22px;color:#ffda83;text-shadow:0 2px #49301e}
  #coopMenu label{display:block;margin:10px 0 4px;font-size:13px;color:#cfd8ff}
  #coopMenu input,#coopMenu select{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:7px 9px;border-radius:8px;border:2px solid #4b5aa8;background:#0f1430;color:#fff}
  #coopMenu .tabs{display:flex;gap:8px;margin:6px 0}
  #coopMenu .tab,#coopMenu .cb{font:inherit;font-weight:700;cursor:pointer;border-radius:9px;border:2px solid #10265a;padding:8px 14px;color:#fff;background:#3a4380}
  #coopMenu .tab{flex:1}#coopMenu .tab.on{background:#2f8f4e;border-color:#0f3d20}
  #coopMenu .go{width:100%;margin-top:14px;background:linear-gradient(#f5c45b,#d98a2c);color:#3b2410;border-color:#8b541d;font-size:18px}
  #coopMenu .gh{background:#5b3a3a;margin-top:8px;width:100%}
  #coopMenu .row3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  #coopMenu .chars{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;max-height:170px;overflow:auto;padding:4px}
  #coopMenu .ch{border:3px solid transparent;border-radius:10px;background:#0f1430;padding:3px;cursor:pointer;text-align:center;font-size:10px;line-height:1.1}
  #coopMenu .ch img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:7px;image-rendering:pixelated;background:#222}
  #coopMenu .ch.on{border-color:#ffda83;box-shadow:0 0 10px #ffda83aa}
  #coopMenu .msg{min-height:22px;margin-top:8px;color:#ff9c9c;font-size:14px}
  #coopMenu details{margin-top:10px;font-size:13px;color:#aab4e6}
  #coopHud{position:fixed;left:8px;top:56px;z-index:4990;font-family:'Kanit',system-ui,sans-serif;font-size:13px;color:#fff;user-select:none}
  #coopHud .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(18,26,66,.88);border:2px solid #5b78d6;border-radius:10px;padding:4px 10px;cursor:pointer;font-weight:700}
  #coopHud .chip i{font-style:normal;color:#ffda83;letter-spacing:2px}
  #coopHud .pn{display:none;margin-top:6px;width:min(280px,80vw);background:rgba(18,26,66,.94);border:2px solid #5b78d6;border-radius:10px;padding:8px}
  #coopHud.open .pn{display:block}
  #coopHud .pl{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px solid #ffffff22}
  #coopHud .pl small{color:#9fb3ff}#coopHud .pl b.me{color:#ffda83}
  #coopHud .opts{font-size:11px;color:#9fb3ff;margin:4px 0}
  #coopHud .chat{max-height:90px;overflow:auto;font-size:12px;margin:6px 0;color:#e8edff}
  #coopHud input{width:100%;box-sizing:border-box;font:inherit;font-size:13px;padding:4px 6px;border-radius:6px;border:2px solid #4b5aa8;background:#0f1430;color:#fff}
  #coopHud button{font:inherit;font-weight:700;font-size:12px;cursor:pointer;border-radius:7px;border:2px solid #10265a;background:#3a4380;color:#fff;padding:3px 9px;margin-top:6px;margin-right:4px}
  #coopOverlay{position:fixed;left:0;top:0;pointer-events:none;z-index:6}
  #coopWin{position:fixed;inset:0;z-index:99999;background:rgba(5,8,20,.78);display:none;align-items:center;justify-content:center;font-family:Kanit,sans-serif}#coopWin.show{display:flex}
  #coopWin .w{width:min(420px,92vw);background:#141a33;border:3px solid #e0b030;border-radius:14px;padding:18px;color:#fff;text-align:center}#coopWin h2{margin:0 0 6px;font-size:20px;color:#ffd35c}
  #coopWin .code{font-size:42px;font-weight:800;letter-spacing:8px;color:#fff;background:#0b1024;border-radius:10px;padding:6px;margin:8px 0;cursor:pointer}
  #coopWin .pl{text-align:left;padding:5px 8px;margin:4px 0;background:#1f2850;border-radius:8px;font-size:14px}#coopWin .op{font-size:13px;color:#ffe9a8;margin:8px 0}
  #coopWin button{font:inherit;font-weight:700;cursor:pointer;border-radius:9px;border:2px solid #10265a;background:#3a4380;color:#fff;padding:8px 14px;margin:6px 4px 0}#coopWin button.go{background:#e0b030;color:#241800;border-color:#7a5a00;font-size:16px}

  /* ---- สไตล์ให้เหมือนเมนูเกม (พิกเซล/ขอบหนา/ปุ่มนูน) ---- */
  #coopBtn{position:absolute!important;left:41.7%!important;top:91.9%!important;bottom:auto!important;transform:none!important;width:21.8%!important;height:7.4%!important;display:flex!important;align-items:center;gap:8px;padding:0 .6em!important;box-sizing:border-box;font:800 clamp(12px,1.9vw,22px) 'Kanit',sans-serif!important;color:#fff!important;background:#2fae58!important;border:4px solid #0a0820!important;border-radius:6px!important;cursor:pointer;text-shadow:2px 2px 0 rgba(0,0,0,.45);box-shadow:inset 0 -6px 0 rgba(0,0,0,.28),inset 0 4px 0 rgba(255,255,255,.35),0 6px 0 #0a0820!important;transition:transform .1s,filter .1s}
  #coopBtn .ic{width:1.6em;text-align:center}#coopBtn .tx{flex:1;text-align:center;line-height:1.05}
  #coopBtn:hover{transform:translateY(-3px) scale(1.04)!important;filter:brightness(1.15)}#coopBtn:active{transform:translateY(4px) scale(.97)!important;box-shadow:inset 0 -2px 0 rgba(0,0,0,.28),0 1px 0 #0a0820!important}
  #coopMenu,#coopWin{font-family:'Kanit',sans-serif}
  #coopMenu .cp,#coopWin .w{background:#221a4a!important;border:4px solid #0a0820!important;box-shadow:0 0 0 3px #ffcc2e,0 10px 0 6px #0a0820!important;border-radius:6px!important}
  #coopMenu h2,#coopWin h2{color:#ffcc2e!important;text-align:center;text-shadow:none!important}
  #coopMenu input,#coopMenu select{background:#0f0b2a!important;color:#fff;border:2px solid #5a4ea0!important;border-radius:4px!important}
  #coopMenu .tab,#coopMenu .cb,#coopWin button,#coopHud button{border:4px solid #0a0820!important;border-radius:6px!important;font-weight:800!important;color:#fff!important;text-shadow:2px 2px 0 rgba(0,0,0,.45);box-shadow:inset 0 -5px 0 rgba(0,0,0,.28),inset 0 3px 0 rgba(255,255,255,.35),0 5px 0 #0a0820;background:#2f7dff!important}
  #coopMenu .tab.on{background:#2fae58!important}
  #coopMenu .go,#coopWin button.go{background:#f5a21c!important;color:#fff!important}
  #coopMenu .gh{background:#7b8196!important}
  #coopWin button#cwNew{background:#e8393f!important}
  #coopMenu .tab:active,#coopMenu .cb:active,#coopWin button:active{transform:translateY(3px)}
  #coopMenu .ch{border:3px solid #0a0820!important;background:#0f0b2a!important;border-radius:6px!important}#coopMenu .ch.on{border-color:#ffcc2e!important;box-shadow:0 0 0 2px #ffcc2e,0 0 12px #ffcc2e99!important}
  #coopMenu .chars{max-height:none!important;grid-template-columns:repeat(3,minmax(0,104px))!important;justify-content:center}
  #coopMenu .ch div{font-size:14px!important;font-weight:700;margin-top:3px}
  #coopWin .code{background:#0f0b2a!important;border:3px solid #5a4ea0;border-radius:4px!important;color:#ffcc2e!important}
  #coopWin .pl{background:#0f0b2a!important;border-radius:4px!important}
  #coopHud .chip,#coopHud .pn{background:#221a4a!important;border:3px solid #0a0820!important;box-shadow:0 0 0 2px #ffcc2e!important;border-radius:6px!important}
  `;
  document.head.appendChild(css);

  /* ================================================================ LOBBY (before entering the game) */
  const CHAR_TH = { 'blue-suit-male': 'ผู้ชาย', 'mild-formal': 'ผู้หญิง', 'rei': 'Rei' };
  function charList() {
    try { return Object.keys(CHAR_TH).filter(k => CHAR_ASSETS[k] && CHAR_ASSETS[k].portrait && CHAR_ASSETS[k].frames); } catch (e) { return []; }
  }
  function relList() {
    try { return REL.IDS.map(id => [id, (REL.RDEF && REL.RDEF[id] && REL.RDEF[id].name) || REL_TH[id] || id]); } catch (e) { return Object.entries(REL_TH); }
  }
  function buildMenu() {
    const m = document.createElement('div'); m.id = 'coopMenu';
    const chars = charList(); let pick = (localStorage.getItem('mct_coop_char') && chars.includes(localStorage.getItem('mct_coop_char'))) ? localStorage.getItem('mct_coop_char') : (chars[0] || '');
    let mode = 'create';
    m.innerHTML = `<div class="cp">
      <h2>🤝 Co-op · เล่นกับเพื่อน</h2>
      <div class="tabs"><button class="tab on" data-m="create">สร้างห้อง</button><button class="tab" data-m="join">เข้าห้องเพื่อน</button></div>
      <div id="cpJoin" style="display:none"><label>รหัสห้อง</label><input id="cpCode" maxlength="5" placeholder="เช่น B7MEG" style="text-transform:uppercase;letter-spacing:4px;font-size:22px;text-align:center" autocomplete="off"></div>
      <div id="cpCreate"><label>ตั้งค่าห้อง (เปลี่ยนไม่ได้หลังสร้าง)</label><div class="row3">
        <div><small>💰 เงิน</small><select id="cpMoney"><option value="split">แยกกัน</option><option value="shared">รวมกัน</option></select></div>
        <div><small>🏢 ออฟฟิศ</small><select id="cpOffice"><option value="split">แยกกัน</option><option value="shared">รวมกัน</option></select></div>
        <div><small>📜 เควสต์</small><select id="cpQuest"><option value="split">แยกกัน</option><option value="shared">รวมกัน</option></select></div></div></div>
      <label>ชื่อของคุณ</label><input id="cpName" maxlength="14" placeholder="ชื่อ CEO" autocomplete="off">
      <label>ศาสนา</label><select id="cpRel"></select>
      <label>ตัวละคร</label><div class="chars" id="cpChars"></div>
      <div class="msg" id="cpMsg"></div>
      <button class="cb go" id="cpGo">เข้าสู่เกม</button>
      <button class="cb gh" id="cpClose">ปิด</button>
      <details><summary>ตั้งค่าเซิร์ฟเวอร์ (ขั้นสูง)</summary><label>ที่อยู่เซิร์ฟเวอร์ (ws:// หรือ wss://)</label><input id="cpSrv" placeholder="ว่าง = ใช้ค่าเริ่มต้น" autocomplete="off"></details>
    </div>`;
    document.body.appendChild(m);
    const q = s => m.querySelector(s);
    q('#cpName').value = localStorage.getItem('mct_coop_name') || '';
    q('#cpSrv').value = localStorage.getItem('mct_coop_srv') || '';
    q('#cpRel').innerHTML = relList().map(([id, n]) => `<option value="${id}">${n}</option>`).join('');
    q('#cpRel').value = localStorage.getItem('mct_coop_rel') || 'none';
    const grid = q('#cpChars');
    function drawChars() {
      grid.innerHTML = chars.map(k => `<div class="ch${k === pick ? ' on' : ''}" data-k="${k}"><img src="${CHAR_ASSETS[k].portrait}" alt=""><div>${CHAR_TH[k] || k}</div></div>`).join('');
      grid.querySelectorAll('.ch').forEach(e => e.onclick = () => { pick = e.dataset.k; drawChars(); });
    }
    drawChars();
    m.querySelectorAll('.tab').forEach(b => b.onclick = () => {
      mode = b.dataset.m; m.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === b));
      q('#cpJoin').style.display = mode === 'join' ? 'block' : 'none'; q('#cpCreate').style.display = mode === 'create' ? 'block' : 'none'; q('#cpMsg').textContent = '';
    });
    q('#cpClose').onclick = () => m.classList.remove('show');
    m.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') m.classList.remove('show'); }, true);
    m.addEventListener('keyup', e => e.stopPropagation(), true);
    q('#cpGo').onclick = () => {
      const msg = t => { q('#cpMsg').textContent = t; };
      const name = q('#cpName').value.trim(); if (name.length < 2) return msg('ใส่ชื่ออย่างน้อย 2 ตัวอักษร');
      if (!pick) return msg('เลือกตัวละครก่อน');
      const srv = q('#cpSrv').value.trim(); try { srv ? localStorage.setItem('mct_coop_srv', srv) : localStorage.removeItem('mct_coop_srv'); } catch (e) { }
      const url = serverUrl(); if (!url) return msg('ยังไม่ได้ตั้งที่อยู่เซิร์ฟเวอร์ (ขั้นสูง)');
      const rel = q('#cpRel').value;
      try { localStorage.setItem('mct_coop_name', name); localStorage.setItem('mct_coop_rel', rel); localStorage.setItem('mct_coop_char', pick); } catch (e) { }
      const code = q('#cpCode').value.trim().toUpperCase(); if (mode === 'join' && code.length < 4) return msg('ใส่รหัสห้อง');
      msg('กำลังเชื่อมต่อ... (ถ้าเซิร์ฟเวอร์หลับ อาจรอ 30–60 วินาที)'); q('#cpGo').disabled = true;
      let ws, done = false;
      const fail = t => { if (done) return; done = true; msg(t); q('#cpGo').disabled = false; try { ws.close(); } catch (e) { } };
      const timer = setTimeout(() => fail('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง'), 70000);
      try { ws = new WebSocket(url); } catch (e) { clearTimeout(timer); return fail('ที่อยู่เซิร์ฟเวอร์ไม่ถูกต้อง'); }
      ws.onopen = () => ws.send(JSON.stringify(mode === 'create'
        ? { t: 'create', name, rel, char: pick, money: 30000, opts: { money: q('#cpMoney').value, office: q('#cpOffice').value, quest: q('#cpQuest').value } }
        : { t: 'join', code, name, rel, char: pick }));
      ws.onerror = () => { clearTimeout(timer); fail('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'); };
      ws.onmessage = ev => {
        let r; try { r = JSON.parse(ev.data); } catch (e) { return; }
        if (r.t === 'err') { clearTimeout(timer); return fail(r.msg || 'ผิดพลาด'); }
        if (r.t === 'room' && !done) {
          done = true; clearTimeout(timer);
          q('#cpMsg').style.color = '#9dffb0'; q('#cpMsg').textContent = 'รหัสห้อง ' + r.code + ' · กำลังเข้าเกม...';
          try { sessionStorage.setItem('mct_coop', JSON.stringify({ code: r.code, name, rel, char: pick, url })); sessionStorage.setItem('mct_coop_win', '1'); } catch (e) { }
          try { ws.close(); } catch (e) { }
          setTimeout(() => location.reload(), 400);
        }
      };
    };
    return m;
  }
  function initLobbyButton() {
    const L = $('lobby'); if (!L || $('coopBtn')) return;
    const b = document.createElement('button'); b.id = 'coopBtn'; b.type = 'button'; b.innerHTML = '<span class="ic">🤝</span><span class="tx">Co-op เล่นกับเพื่อน</span>';
    (L.querySelector('.lz-stage') || L).appendChild(b);
    let menu = null; b.onclick = () => { menu = menu || buildMenu(); menu.classList.add('show'); };
  }

  /* ================================================================ IN-GAME (co-op session) */
  const Co = { ws: null, on: false, you: 0, host: 0, code: '', opts: null, others: new Map(), chat: [], prevMoney: 0, prevQ: {}, evh: {} };
  window.COOP = Co;
  const mine = () => { try { const s = window.__CEO_CTX.st; return s.active ? (s.place || 'office') : 'office'; } catch (e) { return 'office'; } };
  const send = o => { if (Co.ws && Co.ws.readyState === 1) Co.ws.send(JSON.stringify(o)); };
  Co.send = send;
  Co.sendEv = (k, d) => send({ t: 'ev', k, d });                   // อีเวนต์/คัตซีน ส่งถึงคนในออฟฟิศ/ฉากเดียวกัน
  Co.onEv = (k, fn) => { Co.evh[k] = fn; };
  const toast = t => { try { window.__CEO_CTX ? __CEO_CTX.toast(t) : window.toast && window.toast(t); } catch (e) { try { window.toast(t); } catch (_) { } } };

  function upsert(p) {
    const o = Co.others.get(p.id) || { x: 0, y: 0, tx: 0, ty: 0, scene: 'office', row: 0, col: 0, say: '', sayT: 0 };
    Object.assign(o, { id: p.id, name: p.name, rel: p.rel, char: p.char, office: p.office });
    Co.others.set(p.id, o); return o;
  }
  function applyRoom(m) {
    Co.you = m.you; Co.host = m.host; Co.code = m.code; Co.opts = m.opts; Co.others.clear();
    m.players.forEach(upsert);
    try { if (!S.coopInit) { S.coopInit = 1; S.ceo = BOOT.name; if (BOOT.rel && BOOT.rel !== 'none' && window.REL && S.rg && !S.rg.religionId) S.rg.religionId = BOOT.rel; } else if (!S.ceo) S.ceo = BOOT.name; } catch (e) { }
    Co.sleepN = 0; Co.sleepTot = m.players.length + 1; Co.sleepNames = [];
    if (m.clock && Co.host !== Co.you) applyClock(m.clock, true);
    if (m.biz && m.opts.office === 'shared' && Co.host !== Co.you) { for (const k in m.biz) applyBiz(k, m.biz[k]); }
    if (m.opts.money === 'shared' && m.money != null) { try { S.money = m.money; } catch (e) { } }
    Co.prevMoney = (typeof S !== 'undefined') ? S.money : 0;
    if (m.opts.quest === 'shared') { QKEYS.forEach(k => { const t = (m.quest || {})[k]; if (t && S.q) { S.q[k] = S.q[k] || {}; for (const id in t) S.q[k][id] = t[id]; } }); }
    snapQ();
    renderHud(); toast('เข้าห้อง ' + m.code + ' แล้ว');
    try { if (sessionStorage.getItem('mct_coop_win') === '1') { sessionStorage.removeItem('mct_coop_win'); setTimeout(showRoomWin, 600); } } catch (e) { }
  }
  function snapQ() {
    Co.prevQ = {};
    try { QKEYS.forEach(k => { const t = S.q && S.q[k]; if (t && typeof t === 'object') { Co.prevQ[k] = {}; for (const id in t) Co.prevQ[k][id] = JSON.stringify(t[id]); } }); } catch (e) { }
  }
  function onMsg(m) {
    switch (m.t) {
      case 'room': applyRoom(m); break;
      case 'join': upsert(m.p); Co.sleepTot = Co.others.size + 1; toast(m.p.name + ' เข้าห้อง'); renderHud(); break;
      case 'leave': { const o = Co.others.get(m.id); Co.others.delete(m.id); Co.host = m.host; if (o) toast(o.name + ' ออกจากห้อง'); renderHud(); break; }
      case 'snap': {
        const seen = new Set();
        for (const e of m.list) {
          const [id, scene, x, y, row, col, flip, office] = e; const o = Co.others.get(id); if (!o) continue; seen.add(id);
          if (o.scene !== scene || Math.hypot(o.x - x, o.y - y) > 300) { o.x = x; o.y = y; }
          o.scene = scene; o.tx = x; o.ty = y; o.row = row; o.col = col; o.office = office; o.seen = performance.now();
        }
        break;
      }
      case 'chat': {
        Co.chat.push((m.name || '?') + ': ' + m.text); if (Co.chat.length > 30) Co.chat.shift();
        const o = Co.others.get(m.id); if (o) { o.say = m.text; o.sayT = 5; }
        renderHud(); break;
      }
      case 'money': if (m.by !== Co.you && Co.opts && Co.opts.money === 'shared') { try { S.money += m.d; Co.prevMoney = S.money; } catch (e) { } } break;
      case 'quest': if (m.by !== Co.you && Co.opts && Co.opts.quest === 'shared') {
        try { S.q[m.k] = S.q[m.k] || {}; if (m.v === null) delete S.q[m.k][m.id]; else S.q[m.k][m.id] = m.v; (Co.prevQ[m.k] = Co.prevQ[m.k] || {})[m.id] = m.v === null ? undefined : JSON.stringify(m.v); } catch (e) { }
      } break;
      case 'clk': applyClock(m, false); break;
      case 'biz': if (Co.opts && Co.opts.office === 'shared') applyBiz(m.k, m.v); break;
      case 'sleepers': Co.sleepN = m.n; Co.sleepTot = m.total; Co.sleepNames = m.names || []; if (m.ids && m.ids.length && !m.ids.includes(Co.you)) toast('🛏️ ' + (m.names || []).join(', ') + ' เข้านอน (' + m.n + '/' + m.total + ') · ต้องนอนครบทุกคนถึงจะเช้า'); renderHud(); break;
      case 'dawn': Co.dawn = 1; Co.sleepN = 0; Co.sleepNames = []; Co.sleeping = false; renderHud(); break;
      case 'ev': { const h = Co.evh[m.k]; if (h) try { h(m.d, m); } catch (e) { } break; }
      case 'err': toast(m.msg || 'Co-op error'); break;
    }
  }

  /* ---------------------------------------------------------------- clock / business / sleep sync */
  const BIZ_SKIP = { name: 1, money: 1, day: 1, t: 1, speed: 1, paused: 1, dl: 1, rg: 1, ceoRPG: 1, q: 1, ceo: 1, coopInit: 1, over: 1 };
  Co.bizLast = {};
  Co.isFollower = () => !!(Co.on && Co.opts && Co.opts.office === 'shared' && Co.host && Co.host !== Co.you);
  function applyClock(c, force) {
    try {
      if (typeof S === 'undefined' || !S) return;
      const f = Co.isFollower();
      if (S.day !== c.day) { if (f || force) { S.day = c.day; S.t = c.tm; try { if (typeof z === 'function') S.today = z(); } catch (e) { } } }
      else if (f || force || Math.abs(S.t - c.tm) >= 2) S.t = c.tm;
    } catch (e) { }
  }
  function applyBiz(k, v) {
    try { if (BIZ_SKIP[k] || typeof S === 'undefined') return; S[k] = v; Co.bizLast[k] = JSON.stringify(v); } catch (e) { }
  }
  setInterval(() => {                                               // 1) host = นาฬิกาห้อง  2) ออฟฟิศรวม: ธุรกิจจากโฮสต์ → ทุกคน, การกระทำของคนอื่น → ส่งกลับ
    if (!Co.on || typeof S === 'undefined' || !S) return;
    if (Co.host === Co.you) send({ t: 'clk', day: S.day, tm: Math.round(S.t * 10) / 10 });
    if (Co.opts && Co.opts.office === 'shared') {
      if (Co.isFollower()) { try { S.paused = 1; } catch (e) { } }    // ผู้ตามไม่จำลองธุรกิจเอง ใช้ของโฮสต์
      const base = Co.isFollower() && !Co.bizInit; if (base) Co.bizInit = 1;
      for (const k in S) {
        if (BIZ_SKIP[k]) continue;
        let j; try { j = JSON.stringify(S[k]); } catch (e) { continue; }
        if (j === undefined || j === Co.bizLast[k]) continue;
        if (base) { Co.bizLast[k] = j; continue; }
        if (j.length > 380000) continue;
        Co.bizLast[k] = j; send({ t: 'biz', k, v: S[k] });
      }
    }
  }, 1000);
  Co.sleepGate = function (z, ti) {                                 // เรียกจากแกนเกมตอนนอน: true = ข้ามไปเช้าได้
    Co.sleepTot = Co.others.size + 1;
    if (!Co.on || Co.sleepTot <= 1) { return true; }
    if (Co.dawn) { Co.dawn = 0; Co.sleeping = false; return true; }
    if (Co.wake) { Co.wake = 0; Co.sleeping = false; send({ t: 'sleep', v: 0 }); try { const st = window.__CEO_CTX.st; st.sleep = null; st.keys = {}; st.x = z.fx; st.y = z.fy; } catch (e) { } return false; }
    if (!Co.sleeping) { Co.sleeping = true; send({ t: 'sleep', v: 1 }); renderHud(); }
    try { if (ti) ti.textContent = '😴 นอนรอเพื่อน (' + Co.sleepN + '/' + Co.sleepTot + ') · ต้องนอนครบทุกคนถึงจะเช้า'; } catch (e) { }
    return false;
  };
  setInterval(() => { try { if (Co.sleeping && !window.__CEO_CTX.st.sleep) { Co.sleeping = false; send({ t: 'sleep', v: 0 }); renderHud(); } } catch (e) { } }, 500);

  /* ---------------------------------------------------------------- own avatar = chosen character */
  function buildAvatar() {
    try {
      const pack = CHAR_IMAGES[BOOT.char]; if (!pack) return true;
      const rows = pack.frames; if (!rows || rows.length < 4) return true;
      for (const r of rows) for (const im of r) if (!(im.complete && im.naturalWidth)) return false;
      const W = 1536, H = 480, cw = W / 16, ch = H / 4, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      for (let r = 0; r < 4; r++) { const fr = rows[[0, 2, 1, 3][r]]; for (let c = 0; c < 16; c++) { const f = fr[c === 0 ? 0 : (c - 1) % Math.min(4, fr.length)]; const sc = Math.min(cw / f.naturalWidth, ch / f.naturalHeight); g.drawImage(f, c * cw + (cw - f.naturalWidth * sc) / 2, r * ch + (ch - f.naturalHeight * sc), f.naturalWidth * sc, f.naturalHeight * sc); } }
      cv.complete = true; cv.naturalWidth = W; cv.naturalHeight = H;
      CEOI = cv; return true;
    } catch (e) { console.warn('[coop avatar]', e); return true; }
  }
  /* buildAvatar() ปิดไว้: ชนกับระบบชุด (wardrobe) ที่สลับ CEOI เหมือนกัน และเสี่ยงทำให้ฉากดำ */

  function connect() {
    const url = BOOT.url || serverUrl();
    try { Co.ws = new WebSocket(url); } catch (e) { toast('Co-op: เชื่อมต่อไม่ได้'); return; }
    Co.ws.onopen = () => { Co.on = true; send({ t: 'join', code: BOOT.code, name: BOOT.name, rel: BOOT.rel, char: BOOT.char }); };
    Co.ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; } onMsg(m); };
    Co.ws.onclose = () => { const was = Co.on; Co.on = false; Co.others.clear(); renderHud(); if (was) { toast('Co-op: การเชื่อมต่อหลุด กำลังต่อใหม่...'); setTimeout(connect, 2500); } };
  }
  function leaveCoop() { try { sessionStorage.removeItem('mct_coop'); sessionStorage.removeItem('mct_skip_lobby'); } catch (e) { } location.reload(); }

  /* ---------------------------------------------------------------- per-tick sync */
  setInterval(() => {
    if (!Co.on) return;
    let st = { x: 0, y: 0, dir: 0, frame: 0, moving: 0 }; try { st = window.__CEO_CTX.st; } catch (e) { }
    send({ t: 'st', scene: mine(), x: Math.round(st.x), y: Math.round(st.y), row: (st.dir | 0) & 3, col: st.moving ? ((st.frame | 0) & 3) : 0 });
    // shared money: send deltas
    if (Co.opts && Co.opts.money === 'shared' && typeof S !== 'undefined') {
      const d = S.money - Co.prevMoney;
      if (Math.abs(d) >= 1) { send({ t: 'money', d }); Co.prevMoney = S.money; }
    }
  }, 100);
  setInterval(() => {                                               // shared quests: diff S.q tables
    if (!Co.on || !Co.opts || Co.opts.quest !== 'shared') return;
    try {
      QKEYS.forEach(k => {
        const t = S.q && S.q[k]; if (!t || typeof t !== 'object') return;
        const prev = Co.prevQ[k] = Co.prevQ[k] || {};
        for (const id in t) { const j = JSON.stringify(t[id]); if (prev[id] !== j) { prev[id] = j; send({ t: 'quest', k, id, v: t[id] }); } }
        for (const id in prev) if (prev[id] !== undefined && !(id in t)) { prev[id] = undefined; send({ t: 'quest', k, id, v: null }); }
      });
    } catch (e) { }
  }, 400);

  /* ---------------------------------------------------------------- HUD */
  let hud = null, hudOpen = false;
  function renderHud() {
    if (!Co.on && !Co.code) return;
    if (!hud) {
      hud = document.createElement('div'); hud.id = 'coopHud'; document.body.appendChild(hud);
      hud.addEventListener('keydown', e => e.stopPropagation(), true); hud.addEventListener('keyup', e => e.stopPropagation(), true);
    }
    const o = Co.opts || {}, me = 'คุณ (' + (BOOT.name || '') + ')', my = mine();
    const rows = [`<div class="pl"><b class="me">${esc(me)}${Co.host === Co.you ? ' 👑' : ''}</b><small>${esc(PLACE_TH[my] || my)}</small></div>`]
      .concat([...Co.others.values()].map(p => `<div class="pl"><b>${esc(p.name)}${Co.host === p.id ? ' 👑' : ''}</b><small>${esc(REL_TH[p.rel] || '')} · ${esc(PLACE_TH[p.scene] || p.scene || '')}${p.scene === 'office' && Co.opts && Co.opts.office === 'shared' ? ' 🏢' : ''}</small></div>`));
    const keepIn = hud.querySelector('input') && document.activeElement === hud.querySelector('input'), val = hud.querySelector('input') ? hud.querySelector('input').value : '';
    hud.className = hudOpen ? 'open' : '';
    hud.innerHTML = `<div class="chip" id="cpChip">🤝 <i>${esc(Co.code)}</i> · ${Co.others.size + 1} คน ${Co.on ? '' : '⚠️'}</div>
      <div class="pn">${rows.join('')}
      ${Co.sleepNames && Co.sleepNames.length ? `<div class="opts">🛏️ นอนแล้ว ${Co.sleepN}/${Co.sleepTot}: ${esc(Co.sleepNames.join(', '))}</div>` : ''}${Co.sleeping ? '<button id="cpWake">⏰ ตื่นก่อน</button>' : ''}
      <div class="opts">💰 เงิน${MODE_TH[o.money] || ''} · 🏢 ออฟฟิศ${MODE_TH[o.office] || ''} · 📜 เควสต์${MODE_TH[o.quest] || ''}</div>
      <div class="chat" id="cpLog">${Co.chat.slice(-8).map(esc).join('<br>')}</div>
      <input id="cpSay" maxlength="120" placeholder="พิมพ์แล้วกด Enter" autocomplete="off">
      <button id="cpWin">หน้าต่างห้อง</button><button id="cpCopy">คัดลอกรหัส</button><button id="cpLeave">ออกจากห้อง</button></div>`;
    hud.querySelector('#cpChip').onclick = () => { hudOpen = !hudOpen; renderHud(); };
    const inp = hud.querySelector('#cpSay'); inp.value = val; if (keepIn) inp.focus();
    inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter' && inp.value.trim()) { send({ t: 'chat', text: inp.value.trim() }); inp.value = ''; } };
    hud.querySelector('#cpWin').onclick = () => showRoomWin();
    const wk = hud.querySelector('#cpWake'); if (wk) wk.onclick = () => { Co.wake = 1; };
    hud.querySelector('#cpCopy').onclick = () => { try { navigator.clipboard.writeText(Co.code); toast('คัดลอกรหัสห้องแล้ว'); } catch (e) { toast('รหัสห้อง ' + Co.code); } };
    hud.querySelector('#cpLeave').onclick = () => { if (confirm('ออกจากห้อง Co-op และกลับหน้าเมนู?')) leaveCoop(); };
    const lg = hud.querySelector('#cpLog'); if (lg) lg.scrollTop = 1e6;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  setInterval(() => { if (hud && hudOpen) renderHud(); }, 2000);

  /* ---------------------------------------------------------------- draw other players on top of the scene canvas */
  let ov = null, octx = null;
  function loop(t) {
    requestAnimationFrame(loop);
    if (!Co.on) return;
    const dt = 0.016;
    for (const o of Co.others.values()) { const k = 1 - Math.pow(0.0005, dt); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; if (o.sayT > 0) o.sayT -= dt; }
    let ctx; try { ctx = window.__CEO_CTX; } catch (e) { return; }
    const cvs = $('ceoSceneCanvas'), wrap = $('ceoSceneCanvasWrap');
    if (!ctx || !cvs || !wrap) return;
    if (!ov) { ov = document.createElement('canvas'); ov.id = 'coopOverlay'; ov.width = 960; ov.height = 600; document.body.appendChild(ov); octx = ov.getContext('2d'); }
    const rc = cvs.getBoundingClientRect(); ov.style.left = rc.left + 'px'; ov.style.top = rc.top + 'px'; ov.style.width = rc.width + 'px'; ov.style.height = rc.height + 'px'; ov.style.display = rc.width > 0 ? 'block' : 'none';
    octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, 960, 600);
    const st = ctx.st; if (!st || !st.active) return;
    const here = st.place || 'office', z = st.zoom || 1;
    if (here === 'sea' || here === 'ride') return;            // ฉากเหล่านี้ใช้กล้องของตัวเอง (แสดงในรายชื่อห้องแทน)
    octx.save(); octx.scale(z, z); octx.translate(-Math.round(st.camX || 0), -Math.round(st.camY || 0));
    const list = [...Co.others.values()].filter(o => o.scene === here && o.seen && performance.now() - o.seen < 3000).sort((a, b) => a.y - b.y);
    for (const o of list) drawRemote(octx, o);
    octx.restore();
  }
  function drawRemote(g, o) {
    const x = Math.round(o.x), y = Math.round(o.y);
    g.fillStyle = 'rgba(0,0,0,.30)'; g.beginPath(); g.ellipse(x, y - 1, 18, 7, 0, 0, Math.PI * 2); g.fill();
    let drawn = false;
    try {
      const pack = CHAR_IMAGES[o.char], rows = pack && pack.frames;
      if (rows && rows.length) {
        const row = [0, 2, 1, 3][o.row & 3], frames = rows[row] || rows[0];
        const im = frames && (frames[(o.col | 0) % Math.min(4, frames.length)] || frames[0]);
        if (im && im.complete && im.naturalWidth) { g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, 64, 80, x - 30.4, y - 81.6, 60.8, 83.6); g.imageSmoothingEnabled = true; drawn = true; }
      }
    } catch (e) { }
    if (!drawn) { g.fillStyle = '#7fb4ff'; g.fillRect(x - 12, y - 56, 24, 40); g.fillStyle = '#f1c9a5'; g.fillRect(x - 9, y - 76, 18, 20); }
    g.font = 'bold 13px Kanit,sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.85)'; g.fillStyle = '#fff';
    g.strokeText(o.name, x, y - 88); g.fillText(o.name, x, y - 88);
    if (o.sayT > 0 && o.say) { const w = Math.min(220, g.measureText(o.say).width + 16); g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(x - w / 2, y - 122, w, 22); g.fillStyle = '#111'; g.font = '12px Kanit,sans-serif'; g.fillText(o.say.slice(0, 40), x, y - 106); }
  }


  /* ---------------------------------------------------------------- cutscene bridge (ออฟฟิศรวม: คัตซีนเชื่อมกัน) */
  const cutBusy = () => { try { return !!(typeof CUT !== 'undefined' && CUT.on); } catch (e) { return false; } };
  function replay(fn) { if (cutBusy() || mine() !== 'office') return; Co.replaying = true; try { fn(); } catch (e) { console.error('[coop replay]', e); } Co.replaying = false; }
  function installCutHooks() {
    const shared = () => Co.on && Co.opts && Co.opts.office === 'shared' && !Co.replaying && mine() === 'office';
    const wrap = (name, key) => {
      const f = window[name]; if (typeof f !== 'function' || f.__coop) return;
      const w = function () { if (shared()) Co.sendEv(key, {}); return f.apply(this, arguments); }; w.__coop = 1; window[name] = w;
    };
    wrap('playTeeCutscene', 'tee'); wrap('playMysteryCutscene', 'mystery');
    try {                                                         // โจร / รปภ.จับโจร: runner อยู่ใน closure → ดักผ่านเสียงคัตซีน 'thief'
      const ta = window.TycoonAudio;
      if (ta && typeof ta.cutscene === 'function' && !ta.cutscene.__coop) {
        const f = ta.cutscene;
        ta.cutscene = function (n) { if (n === 'thief' && shared()) Co.sendEv('thief', { kind: (window.THIEF && THIEF.guarded && THIEF.guarded()) ? 'catch' : 'theft' }); return f.apply(this, arguments); };
        ta.cutscene.__coop = 1;
      }
    } catch (e) { }
    Co.onEv('tee', () => replay(() => playTeeCutscene(0)));
    Co.onEv('mystery', () => replay(() => playMysteryCutscene(0)));
    Co.onEv('thief', d => replay(() => THIEF.play(d && d.kind === 'catch' ? 'catch' : 'theft', 120, { preview: true })));
  }

  /* ---------------------------------------------------------------- room window (เด้งทันทีหลังสร้าง/เข้าห้อง) */
  let rw = null;
  function showRoomWin() {
    if (!rw) { rw = document.createElement('div'); rw.id = 'coopWin'; document.body.appendChild(rw); rw.addEventListener('keydown', e => e.stopPropagation(), true); rw.addEventListener('keyup', e => e.stopPropagation(), true); }
    const o = Co.opts || {}, mineName = BOOT.name || '';
    const rows = [`<div class="pl"><b>${esc(mineName)} (คุณ)${Co.host === Co.you ? ' 👑' : ''}</b></div>`].concat([...Co.others.values()].map(p => `<div class="pl"><b>${esc(p.name)}${Co.host === p.id ? ' 👑' : ''}</b> · ${esc(REL_TH[p.rel] || '')}</div>`));
    rw.innerHTML = `<div class="w"><h2>🤝 ห้อง Co-op</h2><div>ส่งรหัสนี้ให้เพื่อน (แตะเพื่อคัดลอก)</div><div class="code" id="cwCode">${esc(Co.code)}</div>
      ${rows.join('')}<div class="op">💰 เงิน${MODE_TH[o.money] || ''} · 🏢 ออฟฟิศ${MODE_TH[o.office] || ''} · 📜 เควสต์${MODE_TH[o.quest] || ''}</div>
      <button class="go" id="cwGo">▶ เริ่มเล่น</button><button id="cwNew">เริ่มเกมใหม่ (ล้างเซฟ Co-op)</button></div>`;
    rw.classList.add('show');
    rw.querySelector('#cwCode').onclick = () => { try { navigator.clipboard.writeText(Co.code); toast('คัดลอกรหัสห้องแล้ว'); } catch (e) { } };
    rw.querySelector('#cwGo').onclick = () => rw.classList.remove('show');
    rw.querySelector('#cwNew').onclick = () => { if (!confirm('ล้างเซฟ Co-op ทั้งหมดแล้วเริ่มเกมใหม่?')) return; try { const ks = []; for (let i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i)); ks.forEach(k => { if (k === 'mct2' || k === 'mct_idx' || String(k).indexOf('mct_slot_') === 0) localStorage.removeItem(k); }); sessionStorage.setItem('mct_skip_lobby', '1'); sessionStorage.setItem('mct_coop_win', '0'); } catch (e) { } window.__resetting = 1; location.reload(); };
  }
  Co.showRoomWin = showRoomWin;

  /* ---------------------------------------------------------------- start */
  if (BOOT) {
    window.__coopRoomJoined = false;
    connect(); requestAnimationFrame(loop); setTimeout(installCutHooks, 1500); setTimeout(installCutHooks, 6000);
    // กันเผลอปิดแท็บ: เตือนครั้งเดียว
    window.addEventListener('beforeunload', e => { if (Co.on) { e.preventDefault(); e.returnValue = ''; } });
  } else {
    if ($('lobby')) initLobbyButton(); else document.addEventListener('DOMContentLoaded', initLobbyButton);
  }
})();
