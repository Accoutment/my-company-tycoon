/* MY COMPANY TYCOON — Co-op boot guard (โหลดก่อนแกนเกม)
   เมื่อเข้าโหมด Co-op (sessionStorage 'mct_coop') ระบบเซฟทั้งหมดของเกม (mct2, mct_idx, mct_slot_*) จะถูกย้ายไปเก็บใต้ชื่อ 'coop:*'
   → ผู้เล่นเลือกช่องเซฟ/เกมใหม่/เล่นต่อได้เหมือนโหมดปกติ แต่เป็นเซฟ Co-op แยกต่างหาก ไม่แตะเซฟเล่นคนเดียว */
(function () {
  try {
    var raw = sessionStorage.getItem('mct_coop'); if (!raw) return;
    window.__COOP_BOOT = JSON.parse(raw);
    sessionStorage.setItem('mct_skip_lobby', '1');            // ข้ามหน้าเมนูหลัก เข้าเกม (ใช้เซฟ Co-op ล่าสุด) แล้วเด้งหน้าต่างห้อง
    var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem, kf = P.key, ld = Object.getOwnPropertyDescriptor(P, 'length');
    var PRE = 'coop:';
    var fam = function (k) { k = String(k); return k === 'mct2' || k === 'mct_idx' || k.indexOf('mct_slot_') === 0; };
    var isLS = function (st) { try { return st === window.localStorage; } catch (e) { return false; } };
    var real = function (st) { var n = ld.get.call(st), a = []; for (var i = 0; i < n; i++) { var k = kf.call(st, i); if (k == null) continue; if (k.indexOf(PRE) === 0) { if (fam(k.slice(PRE.length))) a.push(k.slice(PRE.length)); } else if (!fam(k)) a.push(k); } return a; };
    P.getItem = function (k) { return isLS(this) && fam(k) ? g.call(this, PRE + k) : g.apply(this, arguments); };
    P.setItem = function (k, v) { return isLS(this) && fam(k) ? s.call(this, PRE + k, v) : s.apply(this, arguments); };
    P.removeItem = function (k) { return isLS(this) && fam(k) ? r.call(this, PRE + k) : r.apply(this, arguments); };
    P.key = function (i) { return isLS(this) ? (real(this)[i] == null ? null : real(this)[i]) : kf.call(this, i); };
    Object.defineProperty(P, 'length', { configurable: true, get: function () { return isLS(this) ? real(this).length : ld.get.call(this); } });
  } catch (e) { }
})();
