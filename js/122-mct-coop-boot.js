/* MY COMPANY TYCOON — Co-op boot guard (โหลดก่อนแกนเกม)
   เมื่อเข้าโหมด Co-op (sessionStorage 'mct_coop') เกมจะเริ่มจากเซฟใหม่ และ "ไม่อ่าน/ไม่เขียน" เซฟเดิมของผู้เล่น
   (mct2, mct_idx, mct_slot_*) เพื่อไม่ให้เซฟเล่นคนเดียวถูกทับ */
(function () {
  try {
    var raw = sessionStorage.getItem('mct_coop'); if (!raw) return;
    window.__COOP_BOOT = JSON.parse(raw);
    sessionStorage.setItem('mct_skip_lobby', '1');            // ข้ามหน้าเมนูแรก เข้าเกมเลย
    var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem;
    var blk = function (st, k) { return st === window.localStorage && (k === 'mct2' || k === 'mct_idx' || String(k).indexOf('mct_slot_') === 0); };
    P.getItem = function (k) { if (blk(this, k)) return null; return g.apply(this, arguments); };
    P.setItem = function (k, v) { if (blk(this, k)) return; return s.apply(this, arguments); };
    P.removeItem = function (k) { if (blk(this, k)) return; return r.apply(this, arguments); };
  } catch (e) { }
})();
