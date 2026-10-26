/* THE FINAL BUILD v3 (how it is organised)
   b() draws a coloured box: every illustration is made of these.  go() switches scene.
   say() shows dialogue.  A{} = what happens when you click each object.
   S = the state: hidden scores imp/sto/int + choices.  R_ = the 4 development rounds.
   The preview inside the PC (pvHTML) is the game Kabir is making, and it changes with S. */
const $ = q => document.querySelector(q), G = $("#game"), R = $("#room");
const b = (x, y, w, h, bg, x2 = "", c = "") => `<i class="${c}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};${x2}"></i>`;
const hs = (id, x, y, w, h) => `<i class="hs" id="h-${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></i>`;
const stu = (x, y, s, sit) => `<div class="stu" style="left:${x}px;top:${y}px;transform:scale(${s})">` +
  b(14, 40, 34, 48, "#2f6b2f", "border-radius:8px") + b(6, 44, 14, 36, "#1a1a1e", "border-radius:6px") + b(16, 6, 30, 30, "#d9a77a", "border-radius:50%") +
  b(14, 2, 34, 14, "#7a4a2a", "border-radius:14px 14px 4px 4px") + b(38, 18, 4, 4, "#222") +
  (sit ? b(40, 56, 30, 9, "#2f6b2f", "border-radius:5px") + b(14, 86, 44, 12, "#15151a") + b(48, 86, 12, 40, "#15151a")
       : b(16, 86, 12, 40, "#15151a") + b(32, 86, 12, 40, "#15151a")) + "</div>";
let S, ph = 0, zoomed = false;
const init = () => { S = {r:0, imp:0, sto:0, int:0, rumor:0, bug:0, ai:0, boss:0, seen:{}, tab:"brief", t:[], o:[], tq:0, hrs:12, sw:0, ew:0, end:"", why:"", asst:0, pk:-1, fx:0, dl:0, dlt:"", look:"", last:null}; };

/* ---------- dialogue, buttons, fades ---------- */
let Q = [], cb = null;
function say(lines, done) { Q = lines.slice(); cb = done || null; G.classList.add("talk"); nx(); }
function AN() {   // where each speaker's head is (game pixels) in the scene that is showing
  const on = document.querySelector(".sc.on"), id = on ? on.id : "";
  if (id === "s1") return {Kabir:[540, 262]};
  if (id === "s2") return {Kabir:[290, 205]};
  if (id === "s3") return zoomed ? {} : {Kabir:[608, 398]};
  if (id === "s6") return {Kabir:[131, 246], "Ms. Rao":[327, 318], "Mr. D’Souza":[487, 318], "Prof. Iqbal":[647, 318]};
  return {};
}
function place(b, a) {   // put a bubble above a head, with its little pointer aimed at it
  b.style.left = "0"; b.style.top = "0"; const w = b.offsetWidth, h = b.offsetHeight, L = Math.max(12, Math.min(948 - w, a[0] - w / 2));
  b.style.left = L + "px"; b.style.top = Math.max(12, a[1] - h - 18) + "px"; b.style.setProperty("--px", Math.max(12, Math.min(w - 28, a[0] - L - 8)) + "px");
}
function nx() {
  if (!Q.length) { G.classList.remove("talk"); $("#dlg").hidden = true; const f = cb; cb = null; if (f) f(); return; }
  const l = Q.shift(), a = AN()[l[0]], b = $("#bub"); snd(520, .04);
  $("#who").textContent = a ? l[0] : ""; $("#txt").textContent = l[1]; $("#dlg").hidden = false; b.classList.toggle("nar", !a);
  if (a) place(b, a); else { b.style.left = "0"; b.style.top = "24px"; b.style.left = Math.round((960 - b.offsetWidth) / 2) + "px"; }
}
$("#dlg").onclick = nx;
addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !$("#dlg").hidden && !MG.on) { e.preventDefault(); nx(); } });
function btn(t, f) { const n = $("#nb"); n.textContent = t; n.hidden = false; n.onclick = () => { n.hidden = true; f(); }; }
const nob = () => { $("#nb").hidden = true; };
let AC, MUTE = 0;
function snd(f, d = .08, ty = "square", v = .04) { if (MUTE) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = ty; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(AC.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.stop(AC.currentTime + d); } catch (e) {} }
$("#mute").onclick = () => { MUTE = !MUTE; $("#mute").textContent = MUTE ? "🔇" : "🔊"; };
let ct; function chap(t, sub) { const e = $("#chap"); e.innerHTML = t + (sub ? "<small>" + sub + "</small>" : ""); e.classList.add("on"); snd(330, .3, "triangle", .03); clearTimeout(ct); ct = setTimeout(() => e.classList.remove("on"), 1600); }
let tt; function toast(t) { snd(660, .06); const e = $("#toast"), a = AN().Kabir; e.textContent = t; e.classList.toggle("nar", !a); e.classList.add("on"); if (a) place(e, a); else { e.style.left = "240px"; e.style.top = "24px"; } clearTimeout(tt); tt = setTimeout(() => e.classList.remove("on"), 3400); }
const T = f => { G.classList.add("f"); setTimeout(() => { f(); G.classList.remove("f"); }, 560); };
const scene = id => document.querySelectorAll(".sc").forEach(s => s.classList.toggle("on", s.id === id));
function fit() { $("#wrap").style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 960, innerHeight / 540) * 0.98})`; }
addEventListener("resize", fit); fit();

/* ---------- the game inside the game (live preview) ---------- */
function pvAll() { ["#pvc", "#pv2c"].forEach(q => { const k = $(q); if (k) drawPv(k.getContext("2d")); }); }

/* ---------- build all scenes ---------- */
function build() {
  // SCENE 1: college corridor at sunset
  $("#s1").innerHTML = b(0, 0, 960, 400, "linear-gradient(#f0c79a,#e3a57a)") + [50, 240, 430].map(x => b(x, 50, 150, 200, "linear-gradient(#ff9a56,#ffd59a)", "border:8px solid #8a5a3c;box-sizing:border-box") + b(x + 50, 150, 50, 50, "#fff3c4", "border-radius:50%") + b(x + 71, 50, 8, 200, "#8a5a3c")).join("") +
    [0, 1, 2, 3].map(i => b(770 + i * 48, 90, 44, 310, "#4e7a8c", "border:3px solid #38596a;box-sizing:border-box") + b(780 + i * 48, 130, 24, 6, "#2a4655")).join("") +
    b(0, 400, 960, 140, "linear-gradient(#a8744d,#7e5434)") + b(0, 450, 960, 4, "#0003") +
    `<i class="hs" id="h-post" style="left:640px;top:120px;width:100px;height:140px;background:linear-gradient(#ff7a45,#2b1d4a);border:4px solid #f4ecd8;box-sizing:border-box;color:#fff3d6;font:900 20px/1 Impact,sans-serif;padding:12px 6px;text-align:center">GAME<br>CRAFT<small id="np" style="display:block;font:700 9px Consolas,monospace;margin-top:12px"></small></i>` +
    stu(500, 270, 1.3, 0) +
    `<div class="a" style="left:0;top:300px;animation:sc 9s linear infinite;width:2000px">` + b(960, 0, 40, 120, "#3b2a3a", "border-radius:18px 18px 0 0") + b(1050, 10, 40, 110, "#2b3a4a", "border-radius:18px 18px 0 0") + `</div>`;
  // SCENE 2: bus, over-the-shoulder shot from behind Kabir (back of head, hands, phone)
  const city = [...Array(16)].map((_, i) => `<div style="width:${50 + i * 17 % 40}px;height:${60 + i * 37 % 90}px;background:${i % 2 ? "#6c6f8d" : "#58607f"};margin-right:6px"></div>`).join("");
  const poles = [...Array(10)].map(() => `<div style="width:8px;height:200px;background:#2b2630;margin-right:150px"></div>`).join("");
  const sk = "rotate(-5deg)";
  $("#s2").innerHTML = `<div id="busin">` + b(0, 0, 960, 540, "#4a3a35") + b(70, 50, 820, 230, "linear-gradient(#ff9a56,#ffd59a)") +
    `<div class="a" style="left:70px;top:50px;width:820px;height:230px;overflow:hidden"><div class="lay" style="bottom:40px;animation-duration:26s">${city}${city}</div><div class="lay" style="bottom:0;animation-duration:7s">${poles}${poles}</div></div>` +
    b(62, 42, 836, 8, "#2b2224") + b(62, 280, 836, 10, "#2b2224") + b(478, 42, 8, 248, "#2b2224") + b(0, 290, 960, 250, "#3a2c30") +
    b(260, 300, 560, 240, "#7a3f4d", "border-radius:30px 30px 0 0") + b(440, 268, 200, 70, "#6a3443", "border-radius:30px") + b(850, 40, 10, 500, "#9aa0a8") +
    b(60, 430, 520, 130, "#2f6b2f", "border-radius:140px 140px 0 0") + b(215, 404, 190, 60, "#245524", "border-radius:50%") + b(120, 440, 26, 110, "#1a1a1e") +
    b(250, 360, 80, 60, "#d9a77a") + b(190, 215, 200, 190, "#7a4a2a", "border-radius:50% 50% 46% 46%") + b(176, 300, 26, 42, "#d9a77a", "border-radius:50%") +
    b(360, 452, 200, 44, "#2f6b2f", "border-radius:22px;transform:rotate(-6deg);transform-origin:0 50%") + b(450, 480, 240, 40, "#2f6b2f", "border-radius:20px;transform:rotate(-4deg);transform-origin:0 50%") +
    b(560, 300, 130, 230, "#111", "border-radius:18px;box-shadow:0 0 24px #ffb86c88;transform:" + sk) +
    b(568, 312, 114, 206, "linear-gradient(160deg,#ff7a45,#c2306b 55%,#2b1d4a)", "border-radius:12px;transform:" + sk) +
    `<div class="a" style="left:576px;top:344px;transform:${sk};color:#fff3d6;font:900 30px/1 Impact,sans-serif">GAME<br>CRAFT</div><div class="a" style="left:578px;top:420px;transform:${sk};color:#fff3d6;font:700 10px Consolas,monospace">DUE TOMORROW · 10:00</div>` +
    b(546, 430, 32, 64, "#d9a77a", "border-radius:16px") + b(674, 440, 30, 56, "#d9a77a", "border-radius:15px") + hs("ph2", 556, 296, 140, 238) + `</div>`;
  $("#s2").innerHTML += b(0, 0, 960, 540, "radial-gradient(#0000 55%,#0008)", "pointer-events:none");
  // SCENE 3: the bedroom is pixel art on a 240x135 canvas (roomDraw). Kabir sits with his back to us, as in the reference.
  R.innerHTML = `<canvas id="rc" width="240" height="135"></canvas><div id="mon"><div id="ide" data-m="desk"><div id="dsk">GAME<br>CRAFT</div>` +
    `<div class="tb"><span class="tab on" data-t="brief">COMPETITION BRIEF</span><span class="tab" data-t="proj">KABIR’S PROJECT</span><span id="clk2"></span><span id="msg"></span></div>` +
    `<div class="bf"><h2>GAME CRAFT</h2><p>2D game development competition</p><ul><li>Story driven. Level based.</li><li>Be ready to explain your story, your code and your tools.</li><li>Judged on polish, originality, gameplay, stability, presentation</li><li>You have 12 hours. Every task costs hours.</li><li>Deadline: tomorrow, 10:00 a.m.</li></ul><button class="card" id="bgo"><b>Open my project →</b><small>Start building tonight</small></button></div>` +
    `<div class="ed"><div id="pvw"><canvas id="pvc" width="480" height="270"></canvas></div><div id="pn"><h3 id="ph"></h3><p id="pq"></p><div id="pc"></div></div><div id="ste"></div><div class="pbar"><i id="pbi" style="width:0"></i></div></div></div></div>`;
  const rc = $("#rc"), at = e => { const r = rc.getBoundingClientRect(); return objAt((e.clientX - r.left) / r.width * 240, (e.clientY - r.top) / r.height * 135); };
  rc.onmousemove = e => { HOV = G.classList.contains("talk") || zoomed ? "" : at(e); rc.style.cursor = HOV ? "pointer" : "default"; };
  rc.onmouseleave = () => { HOV = ""; };
  rc.onclick = e => { if (G.classList.contains("talk") || zoomed) return; const k = at(e); if (k && A[k]) A[k](); };
  $("#bgo").onclick = () => tabTo("proj"); $("#ide").onclick = e => { const t = e.target.closest(".tab"); if (t && zoomed) tabTo(t.dataset.t); };
  // SCENE 6: presentation hall
  const jd = (x, hair, shirt) => b(x, 330, 34, 34, "#d9a77a", "border-radius:50%") + b(x - 2, 324, 38, 16, hair, "border-radius:16px 16px 4px 4px") + b(x - 14, 362, 62, 52, shirt, "border-radius:20px 20px 0 0");
  $("#hall").innerHTML = b(0, 0, 960, 360, "linear-gradient(#cfd6e4,#aab4c8)") + b(0, 360, 960, 180, "#5a4b44") +
    b(250, 40, 460, 259, "#f4f4f0", "border:6px solid #333;box-sizing:border-box") + `<canvas id="pv2c" width="480" height="270" style="position:absolute;left:256px;top:46px;width:448px;height:252px;image-rendering:pixelated"></canvas>` +
    b(100, 305, 90, 115, "#7b5a3c") + stu(100, 250, 1, 0) +
    jd(310, "#7a4a2a", "#8a3a5a") + jd(470, "#7a7a7a", "#3a5a8a") + jd(630, "#1c1c1c", "#4a6a4a") + b(250, 412, 520, 56, "#8a6a4a");
  $("#ttl").insertAdjacentHTML("afterbegin", [...Array(16)].map((_, i) => b(i * 64, 330 + (i * 53) % 90, 58, 300, i % 2 ? "#1b1030" : "#241540") + [0, 1, 2].map(j => b(i * 64 + 10 + (j % 2) * 26, 350 + (i * 53) % 90 + j * 30, 8, 10, "#ffcf7a")).join("")).join("") + b(700, 70, 110, 110, "#ffe9a8", "border-radius:50%;opacity:.85"));
  $("#s1").insertAdjacentHTML("beforeend", [...Array(14)].map((_, i) => `<i class="mote" style="left:${(i * 71) % 900}px;top:${(i * 47) % 380}px;animation-delay:${i * 0.7}s"></i>`).join(""));
  pvAll();
}

/* ---------- scene 1 -> 3: announcement, bus, phone, room ---------- */
const POST = [["Poster", "GAME CRAFT: 2D game competition. Story driven, level based. Entries due tomorrow, 10 a.m."], ["Kabir", "Tomorrow. Of course. …I’m entering. Future me can deal with it."]];
function start() {
  init(); $("#ttl").style.display = "none"; build(); scene("s1"); chap("Chapter 1", "The announcement");
  say([["Kabir", "The cleaner’s taking the notices down. Run!"]], () => mgOpen("dash"));
}
function bus() {
  T(() => { scene("s2"); chap("Chapter 2", "Bus 21"); say([["Kabir", "Forty minutes of potholes. Might as well check the poster. Again."]]); });
}
function phoneZoom() { $("#busin").classList.add("zoom"); setTimeout(() => $("#pos").classList.add("on"), 1300); }
function toRoom() {
  ide("desk"); $("#pos").classList.remove("on"); scene("s3"); R.classList.add("zm", "nt"); void R.offsetWidth; R.classList.remove("nt");
  setTimeout(() => { R.classList.remove("zm"); zoomed = false; }, 900); setTimeout(() => ide("brief"), 1300);
  setTimeout(() => say([["Kabir", "Home. Open the project, or check the room first."]]), 3000);
}

/* ---------- objects in the room ---------- */
const look = (k, l) => { S.seen[k] = 1; S.last = {k, t: l[0][1]}; toast(l[0][1]); };
/* ---------- bedroom pixel art ----------
   Every object is a list of pixel rects [x, y, w, h, colour]. The SAME list is drawn, outlined when you hover it,
   and used for clicking, so the clickable shape is exactly the visible shape. */
const RB0 = [[0,0,240,88,"#1d2447"],[0,0,240,6,"#161b38"],[0,88,240,47,"#6a4228"],[0,86,240,3,"#2c1c14"]];
const RB1 = [[4,102,64,30,"#8a2a2a"],[4,102,64,2,"#d9a050"],[4,130,64,2,"#d9a050"],[10,108,52,18,"#a83a32"],[28,112,14,6,"#d9a050"],
  [70,10,22,28,"#22305a"],[72,12,18,24,"#2f4378"],[76,16,10,10,"#ffb04a"],[74,30,14,2,"#f4ecd8"],
  [150,12,22,26,"#4a2a6a"],[152,14,18,22,"#6a3a9a"],[154,18,14,2,"#ff3ea5"],[154,24,14,2,"#2de2e6"],[154,30,14,2,"#ff3ea5"],
  [18,80,204,34,"#a8743c"],[18,112,204,3,"#c8904c"],[18,115,204,2,"#5a3a22"],[24,117,26,8,"#7a5230"],[28,120,18,2,"#c8a060"],
  [128,92,44,10,"#3a3a44"],[129,93,42,8,"#55556a"],[178,94,6,9,"#3a3a44"]];
const OBJ = {
  books: [[4,30,52,3,"#5a3a22"],[4,52,52,3,"#5a3a22"],[8,20,6,10,"#c04a4a"],[16,22,6,8,"#4a9a5a"],[28,16,12,14,"#7a7a8a"],[44,22,10,8,"#3a3a4a"],[6,40,4,12,"#c04a4a"],[10,42,4,10,"#4a7ac0"],[14,38,4,14,"#d0b040"],[18,41,4,11,"#4aa060"],[22,39,4,13,"#8a4ac0"],[26,43,6,9,"#c06a2a"],[34,41,5,11,"#4a7ac0"]],
  clock: [[102,10,12,12,"#6a4a30"],[104,12,8,8,"#f4ecd8"],[107,13,1,4,"#222"],[107,16,3,1,"#222"]],
  win: [[186,70,52,4,"#8a6a48"],[188,8,48,64,"#6a4a30"],[192,12,40,56,"#0c1630"],[194,50,8,18,"#16224a"],[204,42,10,26,"#1a2a56"],[216,48,8,20,"#16224a"],[226,36,6,32,"#1a2a56"],[196,46,2,2,"#ffcf7a"],[206,46,2,2,"#ffcf7a"],[208,54,2,2,"#ffcf7a"],[218,54,2,2,"#ffcf7a"],[228,42,2,2,"#ffcf7a"],[211,12,2,56,"#6a4a30"],[192,38,40,2,"#6a4a30"],[232,8,8,64,"#8a3a4a"],[196,62,6,8,"#b8603a"],[194,54,10,9,"#3f8a4e"]],
  cat: [[20,112,22,10,"#d9832a"],[16,114,6,8,"#d9832a"],[17,111,2,3,"#d9832a"],[21,111,2,3,"#d9832a"],[26,112,2,10,"#a8601a"],[31,112,2,10,"#a8601a"],[36,112,2,10,"#a8601a"],[42,116,8,3,"#d9832a"],[18,117,3,1,"#3a2a1a"]],
  lamp: [[28,106,14,3,"#3a3a40"],[34,76,2,30,"#8a8a90"],[28,72,12,3,"#8a8a90"],[18,62,22,10,"#e8a040"],[20,62,18,2,"#ffd080"]],
  note: [[36,92,22,18,"#e8d8a8"],[36,92,2,18,"#8a5a3a"],[40,96,14,1,"#6a5a4a"],[40,99,10,1,"#6a5a4a"],[44,103,8,5,"#b8a888"],[60,94,2,14,"#e8c04a"]],
  phones: [[70,98,14,3,"#1a1a1e"],[68,100,4,8,"#1a1a1e"],[82,100,4,8,"#1a1a1e"],[69,102,2,4,"#e8742c"],[83,102,2,4,"#e8742c"]],
  ph: [[96,100,6,10,"#1a1a1e"],[97,101,4,7,"#2a4a6a"]],
  cof: [[196,92,12,12,"#2a8a4a"],[208,95,3,6,"#2a8a4a"],[198,94,8,3,"#4a2a18"],[196,92,12,1,"#5ac080"]],
  mon: [[116,36,72,43,"#15151a"],[120,40,64,36,"#0e1a2e"],[146,79,12,5,"#2a2a30"],[138,83,28,2,"#2a2a30"]]
};
const BB = {}; for (const k in OBJ) { let y0 = 999, x1 = 0; for (const r of OBJ[k]) { y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[0] + r[2]); } BB[k] = [x1, y0]; }
const rects = (c, a) => { for (const r of a) { c.fillStyle = r[4]; c.fillRect(r[0], r[1], r[2], r[3]); } };
function objAt(x, y) { const ks = Object.keys(OBJ).reverse(); for (const k of ks) for (const r of OBJ[k]) if (x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]) return k; return ""; }
let HOV = "", RT = 0;
function roomDraw(c) {
  RT++; c.imageSmoothingEnabled = false; rects(c, RB0);
  for (let y = 92; y < 135; y += 6) { c.fillStyle = "#5a361f"; c.fillRect(0, y, 240, 1); }
  rects(c, RB1); for (const k in OBJ) rects(c, OBJ[k]);
  if (HOV) { c.fillStyle = "#ffe9a8"; for (const r of OBJ[HOV]) c.fillRect(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2); rects(c, OBJ[HOV]); }   // outline = object grown by 1px, then redrawn
  const a = (RT >> 3) & 1;   // Kabir from behind: chair, hoodie, hair, arms typing
  rects(c, [[128,118,48,17,"#3a2a22"],[132,120,40,15,"#2f6b2f"],[132,120,40,3,"#3f8a3f"],[136,120,3,15,"#1a1a1e"],[165,120,3,15,"#1a1a1e"],[142,118,20,5,"#245524"],[148,116,8,4,"#e8b890"],[141,109,2,6,"#e8b890"],[161,109,2,6,"#e8b890"],[142,104,20,13,"#7a4a2a"],[144,102,16,3,"#7a4a2a"],[146,100,6,3,"#8a5a34"],[135,100,5,22,"#2f6b2f"],[164,100,5,22,"#2f6b2f"],[135,98 + a,5,3,"#e8b890"],[164,98 + 1 - a,5,3,"#e8b890"]]);
  for (let i = 0; i < 18; i++) { c.fillStyle = "#7a9ad0"; c.fillRect(192 + ((i * 13 + RT * 0.9) % 40 | 0), 12 + ((i * 29 + RT * 3) % 56 | 0), 1, 3); }   // rain on the glass
  if (!ph) { c.fillStyle = "rgba(255,255,255,.45)"; for (let i = 0; i < 3; i++) c.fillRect(200 + (i % 2) * 3, 90 - ((RT / 6 + i * 6) % 16 | 0), 1, 2); }   // steam
  c.fillStyle = "rgba(255,240,200,.7)"; const zy = 106 - ((RT / 20) % 8 | 0), zx = 22 + ((RT / 30) % 8 | 0); c.fillRect(zx, zy, 3, 1); c.fillRect(zx + 1, zy + 1, 1, 1); c.fillRect(zx, zy + 2, 3, 1);   // the cat's Z
  let g;
  if (!S.lampOff) { g = c.createRadialGradient(30, 70, 2, 30, 70, 80); g.addColorStop(0, "rgba(255,190,90,.45)"); g.addColorStop(1, "rgba(255,190,90,0)"); c.fillStyle = g; c.fillRect(0, 0, 240, 135); }
  else { c.fillStyle = "rgba(10,14,40,.45)"; c.fillRect(0, 0, 240, 135); }
  g = c.createRadialGradient(152, 58, 2, 152, 58, 65); g.addColorStop(0, "rgba(120,190,255,.22)"); g.addColorStop(1, "rgba(120,190,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 240, 135);
  if (ph) { c.fillStyle = "rgba(8,10,30,.25)"; c.fillRect(0, 0, 240, 135); }
  if ((RT >> 5) & 1) for (const k in OBJ) if (!S.seen[k]) rects(c, [[BB[k][0] - 2, BB[k][1] - 4, 3, 3, "#ffd166"]]);   // blinking dots = not examined yet
}
function roomLoop() { requestAnimationFrame(roomLoop); const k = $("#rc"); if (k && $("#s3").classList.contains("on")) roomDraw(k.getContext("2d")); }

/* ---------- what Kabir says / does for each object ---------- */
const bs = (k, a, b) => look(k, [["Kabir", ph ? b : a]]);
const A = {
  post() { if (S.pd) return say([["Kabir", "Read it twice. The third time won’t move the deadline."]]); S.pd = 1; say(POST, () => btn("Head home →", bus)); },
  ph2() { nob(); phoneZoom(); },
  cof() { if (!ph && !S.pour) { S.pour = 1; return mgOpen("pour"); } bs("cof", "Awake enough to make bad decisions.", S.cof === "perfect" ? "Empty. A perfect pour deserved better." : S.imp >= S.int ? "Empty. The sparkles took three cups." : "Empty. At least the work was honest."); },
  note() { S.idea = 1; bs("note", "Page one: a lighthouse keeper who talks to the sea. Not a judges’ idea. Mine.", "Page four: ‘finish it’. Underlined twice. Never a good sign."); },
  cat() { bs("cat", "Mochi’s asleep. I’m the one who’s tired. Unfair.", "Mochi has no deadline. I’m taking notes."); },
  lamp() { S.lampOff = !S.lampOff; look("lamp", [["Kabir", S.lampOff ? "Lights off. Dramatic. Worse for typing." : ph ? "3 a.m. light. Flattering to nobody." : "Warm light, late hour. Perfect for bad ideas."]]); },
  clock() { bs("clock", "11:48. Deadline: 10 a.m. Math is not my friend.", "3:12. The clock didn’t read the poster either."); },
  win() { bs("win", "Rain on the city lights. Very cinematic. Not helping.", "Someone across the street is awake too. A student, or a villain."); },
  books() { bs("books", "Three books on game design. Zero chapters read.", "I finally opened one. It said ‘playtest early’. Rude."); },
  phones() { bs("phones", "Noise cancelling. The noise is mostly in my head.", "No music tonight. Just the rain and the fan."); },
  ph() { if (S.r >= 2 && !S.rumor) { S.rumor = 1; return look("ph", [["Nina", "Nina: heard Ms. Rao loves shiny stuff and a twist ending. no loose ends. just saying."]]); } bs("ph", S.rumor ? "Nina’s text. I can’t tell if it’s advice or bait." : "The poster’s still open. Checking it every four minutes doesn’t slow the deadline.", "No new messages. Nobody is coming to save the build."); },
  mon() { if (S.shipped) return say([["Kabir", "It’s done. Sleep is the next level."]]); R.classList.add("zm"); zoomed = true; ide(S.tab === "proj" ? (ph ? "done" : "edit") : "brief"); btn("◀ Back to room", back); }
};
function tabTo(t) { ide(t === "brief" ? "brief" : (ph ? "done" : "edit")); }
function back() { R.classList.remove("zm"); zoomed = false; nob(); }
G.addEventListener("click", e => { const h = e.target.closest(".hs"); if (h && !G.classList.contains("talk") && !zoomed) { const k = h.id.slice(2); if (A[k]) A[k](); } });
$("#reg").onclick = toRoom;
$("#go").onclick = start;

/* ---------- the editor: four rounds of decisions ---------- */
const R_ = [
 {t: "Hour 1 · The look", q: "The project is a gray room with a desk in it. What should it feel like?", c: [
  {h: "Neon arcade", d: "Bright and loud. What judges might like.", tg: "▲", f() { S.imp += 2; S.look = "neon"; }, l: "Shiny. Judges like shiny. Statistically. Probably."},
  {mine: 1, h: "The lighthouse game", d: "Kabir’s original idea.", f() { S.sto += 2; S.look = "warm"; }, l: "Salt, lamps, a patient sea. Mine."},
  {h: "Plain but clear", d: "Readable. Nothing hiding.", f() { S.int += 2; S.look = "plain"; }, l: "Ugly-honest. Like my first résumé."}]},
 {t: "Hour 3 · The flicker", q: "Test run: the hero hits things that aren’t there. One hour. Where does it go?", c: [
  {h: "Particle effects", d: "Sparkles hide a lot.", tg: "▲", f() { S.imp += 2; S.fx = 1; }, l: "Sparkles. They’re doing heavy work covering the flicker."},
  {h: "Write the first scene", d: "Give the room a voice.", f() { S.sto += 2; S.dl = 1; S.dlt = "Somebody has to start the game."; S.sw = 1; }, l: "He talks now. He’s funnier than me."},
  {h: "Playtest the collision bug", d: "Run the level and see it yourself.", mg: 1}]},
 {t: "Hour 5 · The plan wobbles", q: "You’re behind. What gets the next two hours?", c: [
  {h: "Add a boss fight", d: "Not in the plan. Impressive.", tg: "▲", f() { S.imp += 1; S.boss = 1; }, l: "A boss. In a bedroom game. Why not."},
  {h: "Write the ending", d: "Finish the story.", f() { S.sto += 2; S.ew = 1; }, l: "An ending. Even I wasn’t sure I’d get one."},
  {h: "Playtest the enemy AI", d: "It chases forever. Survive it.", mg: 2}]},
 {t: "Hour 7 · The last screen", q: "How does the game end?", c: [
  {typ: "The last door opens onto the first level.", h: "A twist", d: "The last door opens onto the first level.", tg: "▲", f() { S.imp += 2; S.dl = 1; S.dlt = "The last door opens onto the first level."; S.end = "twist"; }, l: "A loop. Clever. Slightly smug."},
  {typ: "He turns off the lamp and goes to sleep.", h: "A quiet ending", d: "He turns off the lamp.", f() { S.int += 2; S.dl = 1; S.dlt = "He turns off the lamp and goes to sleep."; S.end = "quiet"; }, l: "Lights out. Nobody gasps. That’s fine."},
  {typ: "Who was this for?", h: "An open question", d: "The screen asks who it was for.", tg: "▼", f() { S.sto += 2; S.dl = 1; S.dlt = "Who was this for?"; S.end = "ask"; }, l: "Left it open. If asked, I’ll call it deliberate."}]}];
const COST = [[2, 2, 2], [2, 2, 3], [3, 2, 3], [2, 2, 2]];   // hours each card costs; you start with 12
function ide(m) {
  $("#ide").dataset.m = m; document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", (t.dataset.t === "brief") === (m === "brief"))); if (m === "desk") return; if (m === "brief") { S.tab = "brief"; return; } S.tab = "proj";
  $("#clk2").textContent = "hours left: " + S.hrs;
  $("#msg").textContent = S.r >= 2 && !S.rumor ? "📱 1 new message" : "";
  const c = $("#pc"), pb = $("#pbi"); pb.style.width = (S.r * 25 - (S.boss ? 8 : 0)) + "%"; pvAll();
  if (m === "done") {
    $("#ph").textContent = "Final build"; $("#pq").textContent = "Script, line 14:";
    $("#ste").textContent = "“" + (S.last ? S.last.t : "Bus 21. Forty minutes of potholes and self-doubt.") + "”   (author: unknown)";
    S.dl = 1; S.dlt = "“" + (S.last ? S.last.t : "Bus 21. Forty minutes of potholes and self-doubt.") + "”"; pvAll();
    c.innerHTML = '<button class="card" id="ship"><b>Ship it →</b><small>Submit the build</small></button>';
    $("#ship").onclick = ship; pb.style.width = "100%";
    if (!S.ds) { S.ds = 1; setTimeout(() => say([["Kabir", "I never typed that line. …Ship it. Strange can be a style."]]), 1900); }
    return;
  }
  const r = R_[S.r];
  if (S.r === 1 && !S.bs) { S.bs = 1; S.bug = 1; pvAll(); say([["Kabir", "Test run… why does the hero hit things that aren’t there?"]]); }
  if (S.r === 2 && !S.as) { S.as = 1; S.ai = 1; pvAll(); say([["Kabir", "The enemy never gives up. Not even for lunch."]]); }
  if (!r) { $("#ph").textContent = "All tasks done"; $("#pq").textContent = S.hrs + " hours left to rehearse. Compile?"; c.innerHTML = '<button class="card" id="bld"><b>Build →</b><small>Compile the project</small></button>'; $("#bld").onclick = night; return; }
  $("#ph").textContent = r.t; $("#pq").textContent = r.q; S.tq = Date.now();
  $("#ste").textContent = S.r === 1 ? "evaluator › 1 observer connected." : S.r === 2 ? "evaluator › " + S.o[0] + " first, then " + S.o[1] + ". interesting order." : S.r === 3 ? (S.rumor ? "evaluator › you read the message. look at the cards." : "evaluator › you never read the message. i can’t tell what you’ll do.") : "";
  c.innerHTML = r.c.map((x, i) => `<button class="card" data-i="${i}"><span class="hh">−${COST[S.r][i]}h</span>${S.idea && x.mine ? '<span class="tg">♥ your idea</span>' : ""}${S.rumor && x.tg ? `<span class="tg">${x.tg} judges</span>` : ""}<b>${x.h}</b><small>${x.d}</small></button>`).join("");
  c.querySelectorAll(".card").forEach(k => k.onclick = () => { const i = +k.dataset.i, x = r.c[i]; if (S.pk === S.r) return; S.pk = S.r; S.hrs -= COST[S.r][i]; S.o.push(x.h); S.t.push(((Date.now() - S.tq) / 1000).toFixed(1)); if (x.mg) return mgOpen(x.mg === 1 ? "run" : "arena"); x.f(); S.r++; ide("edit"); if (x.typ) { S.rl = x.l; return mgOpen("type", x.typ); } say([["Kabir", x.l]]); });
}
function night() {
  T(() => { chap("Chapter 4", "3:12 a.m."); ph = 1; S.r = 4; zoomed = false; R.classList.add("nt"); R.classList.remove("zm"); void R.offsetWidth; R.classList.remove("nt"); nob();
    say([["", "3:12 a.m. The build compiles. The coffee does not."]]); });
}
function ship() {
  S.shipped = 1; back(); say([["Kabir", "Submitted. Morning problem."]], () => btn("Sleep →", morning));
}

/* ---------- presentation day, evaluation, reveal ---------- */
const ASK = [["Because I thought you’d like it.", () => { S.imp += 2; S.why = "like"; return ["Ms. Rao", "That’s honest. And a little sad."]; }],
  ["Because I wanted to make it.", () => { S.int += 2; S.why = "want"; return ["Mr. D’Souza", "Say that again, slower. We rarely hear it."]; }],
  ["Honestly? The deadline chose for me.", () => { S.sto += 1; S.why = "time"; return ["Prof. Iqbal", "We’ve all met that deadline."]; }]];
function morning() {
  T(() => {
    scene("s6"); pvAll(); chap("Chapter 5", "Presentation day");
    const a = attrs(), L = [["", "10 a.m. Presentation hall. Kabir hits Run."],
      ["Ms. Rao", (a.polish >= 8 ? "The lighting and shine carry the room." : a.polish >= 5 ? "Nicely finished in places." : "It’s plain. Choice, or deadline?") + (S.boss ? " A boss fight in a bedroom game? Bold." : "")],
      ["Mr. D’Souza", (a.originality >= 7 ? "I cared about him by the last screen." : a.originality >= 4 ? "A familiar story, told with some heart." : "Nothing happens. Very neatly.") + (S.cut ? " And the last line stops mid-sen…" : "")],
      ["Prof. Iqbal", (S.bug ? "He walked into a wall that wasn’t there." : S.ai ? "The enemy never lets go. That’s a verdict, not a fight." : a.stability >= 7 && a.gameplay >= 6 ? "Collisions exact, enemy fair. Someone playtested this." : "It runs. I’m encouraged.") + " One question: why this game?"]];
    say(L, () => { const a = $("#ask"); a.innerHTML = ASK.map((x, i) => `<button data-i="${i}">${x[0]}</button>`).join(""); a.classList.add("on");
      a.querySelectorAll("button").forEach(k => k.onclick = () => { a.classList.remove("on"); verdict(ASK[+k.dataset.i][1]()); }); });
  });
}
/* ---------- judging ----------
   Five qualities (0-10) come from what you actually did. Each judge weighs them differently; the total is their average.
   Rival teams are fixed scores, so the result is deterministic: to win you need a balanced build, not just one strength. */
const cl = v => Math.max(0, Math.min(10, v));
function attrs() {
  const L = S.look, rh = Math.floor(Math.max(0, S.hrs) / 2);   // spare hours become rehearsal time
  return {
    polish: cl(2 + (L === "neon" ? 4 : L === "warm" ? 2 : 0) + (S.fx ? 2 : 0) + (S.boss ? 1 : 0) + (S.end === "twist" ? 1 : 0)),
    originality: cl(2 + (L === "warm" ? 3 : L === "plain" ? 1 : 0) + (S.idea && L === "warm" ? 2 : 0) + (S.sw ? 2 : 0) + (S.ew ? 1 : 0) + (S.end === "ask" ? 2 : S.end ? 1 : 0) + (S.why === "want" ? 1 : 0)),
    gameplay: cl(3 + (S.fixed ? 2 : 0) + (S.fixedAI ? 2 : 0) + (S.boss ? 1 : 0) + (L === "plain" ? 1 : 0)),
    stability: cl(8 - (S.bug ? 3 : 0) - (S.ai ? 3 : 0) - (S.cut ? 2 : 0) - (S.boss ? 1 : 0)),
    presentation: cl(2 + (L === "neon" ? 2 : 1) + (S.sw ? 1 : 0) + (S.end && !S.cut ? 1 : 0) - (S.cut ? 1 : 0) + (S.why === "like" ? 2 : S.why === "want" ? 1 : 0) + rh)
  };
}
const JW = {"Ms. Rao": {polish: .5, presentation: .3, stability: .2}, "Mr. D’Souza": {originality: .55, presentation: .25, gameplay: .2}, "Prof. Iqbal": {stability: .45, gameplay: .4, polish: .15}};
const RIVALS = [["Glitch & Tea", 6.8], ["Neon Owls", 6.4], ["Null Pointers", 5.8]];
function judge() { const a = attrs(), j = {}; let t = 0; for (const n in JW) { j[n] = Object.keys(JW[n]).reduce((s, k) => s + a[k] * JW[n][k], 0); t += j[n]; } return {a, j, total: Math.round((t / 3 + 1.2) * 10) / 10}; }
function showPanel(html, bt, f, cls) { const p = $("#pnl"); p.className = cls || ""; p.innerHTML = html + `<button class="big" id="pnb">${bt}</button>`; p.hidden = false; $("#pnb").onclick = () => { p.hidden = true; f(); }; }
function verdict(reply) {
  const J = judge(), place = 1 + RIVALS.filter(r => r[1] >= J.total).length, win = place === 1;
  const chase = (S.look === "neon" ? 1 : 0) + (S.fx ? 1 : 0) + (S.boss ? 1 : 0) + (S.end === "twist" ? 1 : 0) + (S.why === "like" ? 1 : 0);
  const E = win && S.rumor && chase >= 2 ? "A" : (!S.rumor && (S.int >= Math.max(S.imp, S.sto) || (S.idea && S.look === "warm")) ? "B" : "C");
  S.J = J; S.place = place; S.E = E;
  say([reply, ["Prof. Iqbal", "We’ve scored it. Kabir’s build placed " + ["", "first", "second", "third", "fourth"][place] + "."]], () => scoreCard(E));
}
function scoreCard(E) {
  const J = S.J, a = J.a, bar = v => "█".repeat(Math.round(v)) + "░".repeat(10 - Math.round(v));
  const rows = [["Polish", a.polish], ["Originality", a.originality], ["Gameplay", a.gameplay], ["Stability", a.stability], ["Presentation", a.presentation]].map(([n, v]) => `<div class="rw">${n.padEnd(13)}${bar(v)} ${v}</div>`).join("");
  const js = Object.keys(J.j).map(n => `<div class="rw">${n.padEnd(13)}${(J.j[n] + 1.2).toFixed(1)}</div>`).join("");
  const me = "Kabir’s build", board = RIVALS.concat([[me, J.total]]).sort((x, y) => y[1] - x[1] || (x[0] === me ? 1 : -1)).map((r, i) => `<div class="rw${r[0] === me ? " me" : ""}">${i + 1}. ${r[0].padEnd(15)}${r[1].toFixed(1)}</div>`).join("");
  showPanel(`<h2>Scorecard</h2><div class="cols"><div><b>YOUR BUILD</b>${rows}<b>THE JUDGES</b>${js}</div><div><b>LEADERBOARD</b>${board}<p class="dim">Hours left at submission: ${S.hrs}. Each judge weighs the five qualities differently.</p></div></div>`, "Continue", () => evCard(E));
}
function evCard(E) {
  const rows = S.o.map((o, i) => `<div class="rw">decision ${i + 1} · ${o} · ${S.t[i]}s</div>`).join("");
  const notes = [S.rumor ? "you read the message about what the judges like" : "you never read what the judges might like", S.idea ? "you read your own first idea" : "you never opened the notebook", S.asst ? "you skipped " + S.asst + " challenge" + (S.asst > 1 ? "s" : "") : "you played every challenge yourself"].map(x => `<div class="rw">· ${x}</div>`).join("");
  showPanel(`<h2>The evaluator</h2><p>Kabir’s game has been keeping notes. Not on Kabir.</p>${rows}${notes}<p>Every one of these was decided by whoever was holding the keyboard.</p>`, "Run the build again", () => say([["Kabir", "…Why is it restarting?"]], () => { $("#hall").classList.add("zm"); setTimeout(() => reveal(E), 2000); }));
}
function finalCard() {
  const E = S.E, J = S.J, pl = ["", "1st", "2nd", "3rd", "4th"][S.place];
  const T = {A: ["Ending A · The Perfect Submission", "Kabir won, with a build shaped by what the judges liked. In a notebook somewhere, a lighthouse keeper is still waiting for his game."],
    B: ["Ending B · The Original Vision", "Kabir placed " + pl + ". Not the score he pictured. But every part of the build knows what it is for, and it is his."],
    C: ["Ending C · The Final Build", "Kabir placed " + pl + ". Under the judges on the poster there is a new line: ‘JUDGE: YOU’. You decided every part of what was scored. What you do with that is the last choice."]}[E];
  showPanel(`<h2>${T[0]}</h2><p>${T[1]}</p><p class="dim">Score ${J.total.toFixed(1)} · ${pl} of 4 · polish ${J.a.polish} · originality ${J.a.originality} · gameplay ${J.a.gameplay} · stability ${J.a.stability} · presentation ${J.a.presentation}</p>`, "Play again", () => location.reload(), "f" + E);
}
function reveal(E) {
  T(() => {
    G.classList.add("nested", "end" + E); scene("s1"); chap({A: "Ending A", B: "Ending B", C: "Ending C"}[E], {A: "The perfect submission", B: "The original vision", C: "The final build"}[E]); $("#hall").classList.remove("zm");
    $("#np").textContent = {A: "JUDGES LIKE: SHINY", B: "MAKE IT YOURS", C: "JUDGE: YOU"}[E];
    const F = {A: "A student about to win by building what the judges liked. His first idea is crossed out in the notebook.", B: "A student about to lose by building what he wanted. In his notebook: the first idea, finished.", C: "A student reading a poster. Under the judges, a new name: ‘JUDGE: YOU’."}[E];
    S.F = F;
    say([["", "The project starts in a corridor, with a poster. It’s the first level of the game you began."]], () => mgOpen("dash", {nested: 1}));
  });
}

/* ---------- MINIGAMES ----------
   One overlay, five short tests. mgOpen(mode, arg) starts one:
   dash = run to the poster (level 1)      run = the collision bug (the red boxes ARE the bug)
   arena = the enemy AI bug (it chases forever)      type = write the last line before the hours run out
   pour = stop the coffee at the green line.  Each mode has a STEP (rules) and a DRAW (picture); DONE says what it changes in the story. */
const MG = {on:0, k:{}, mode:"", loop:0}, GY = 440, PW = 26, PH = 46, GR = 0.5;
/* One pixel-art world, drawn the same way in the editor preview, the test levels and the presentation.
   Sprites are rows of letters (one letter = one 4x4 pixel); colours come from PAL. */
const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return "rgb(" + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",") + ")"; };
const PAL = {h:"#7a4a2a", s:"#e8b890", e:"#1a1a1e", g:"#2f6b2f", G:"#245524", b:"#1a1a1e", p:"#15151a", w:"#e8e8e8", r:"#d62839", W:"#ffffff"};
const NPC = Object.assign({}, PAL, {g:"#3a4a8a", G:"#2a3a6a", h:"#2a1c14", p:"#3a3a4a"});
const SPH = ["..hhhh..", ".hhhhhh.", ".hssses.", "..ssss..", "bgggggg.", "bggGGgg.", "bggggggs", ".gggggg.", ".pppppp."];
const SPH_A = SPH.concat([".pp..pp.", ".pp..pp.", ".ww..ww."]), SPH_B = SPH.concat(["..pppp..", "..pppp..", "..wwww.."]), SPH_J = SPH.concat(["pp....pp", ".pp..pp.", "ww....ww"]);
const SPB = ["..r..r..", ".rrrrrr.", "rrWrrWrr", "rrrrrrrr", ".r.rr.r.", "r..rr..r"];
function spr(c, rows, x, y, k = 4, pal = PAL, flip) { x = Math.round(x / 4) * 4; y = Math.round(y / 4) * 4; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[flip ? r.length - 1 - i : i]; if (ch !== ".") { c.fillStyle = pal[ch]; c.fillRect(x + i * k, y + j * k, k, k); } } }); }
function world(c, o) {
  const L = {neon:["#1b0f3a","#7a2aa0","#3a1a6e","#5a2a8a","#ff3ea5","#3a1a6e","#5b2a9e"], warm:["#1f2a52","#e8995a","#2a3a63","#1d2a44","#ffcf7a","#3b5a3a","#5a3a28"], plain:["#8fb0cc","#e6eef2","#a8b8a0","#8fa488","#fff3d6","#6a9a5a","#8a6a4a"], none:["#a9a9a9","#d4d4d4","#b5b5b5","#9a9a9a","#eee","#8a8a8a","#777"]}[o.look || "none"], cam = o.cam || 0, now = Date.now();
  for (let i = 0; i < 9; i++) { c.fillStyle = mix(L[0], L[1], i / 8); c.fillRect(0, i * 52, 960, 52); }
  c.fillStyle = L[4]; for (let dy = -40; dy <= 40; dy += 4) { const w = Math.round(Math.sqrt(1600 - dy * dy) / 4) * 4; c.fillRect(720 - w, 120 + dy, 2 * w, 4); }
  c.fillStyle = L[2]; for (let x = 0; x < 960; x += 16) { const X = x + cam * 0.2, h = Math.round((70 + Math.sin(X * 0.011) * 30 + Math.sin(X * 0.027) * 16) / 4) * 4; c.fillRect(x, GY - 40 - h, 16, h + 40); }
  if (o.look === "warm") { c.fillStyle = "#e8e0d0"; c.fillRect(780, GY - 230, 40, 230); c.fillStyle = "#c04a3a"; c.fillRect(780, GY - 190, 40, 24); c.fillRect(780, GY - 120, 40, 24); c.fillStyle = "#ffe08a"; c.fillRect(784, GY - 262, 32, 28); c.fillStyle = "#3a3a4a"; c.fillRect(776, GY - 270, 48, 8); }
  const m0 = Math.floor(cam * 0.5 / 48);
  for (let i = m0; i < m0 + 22; i++) {
    const x = Math.round((i * 48 - cam * 0.5) / 4) * 4, h = 48 + Math.abs((i * 37) % 5) * 20; c.fillStyle = L[3];
    if (o.look === "neon") { c.fillRect(x, GY - h, 40, h); c.fillStyle = L[4]; for (let j = 12; j < h - 8; j += 24) c.fillRect(x + 8 + Math.abs(i + j) % 3 * 12, GY - h + j, 8, 8); }
    else if (o.look === "warm") { for (let r = 0; r < 4; r++) c.fillRect(x + r * 4, GY - 16 * (r + 1), 40 - r * 8, 16); }
    else c.fillRect(x, GY - h * 0.5, 40, h * 0.5);
  }
  c.fillStyle = L[5]; c.fillRect(0, GY, 960, 8); c.fillStyle = L[6]; c.fillRect(0, GY + 8, 960, 100);
  c.fillStyle = "rgba(0,0,0,.18)"; for (let x = -(Math.round(cam / 4) * 4 % 64); x < 960; x += 64) { c.fillRect(x, GY + 24, 32, 8); c.fillRect(x + 32, GY + 56, 32, 8); }
  c.save(); c.translate(-Math.round(cam / 4) * 4, 0);
  const pad = o.pad || [14, 12], f = o.hb || 0;
  for (const b of o.obs || []) {
    if (b.t === "s") { c.fillStyle = "#d8d8e0"; for (let k = 0; k < b.w; k += 12) { c.beginPath(); c.moveTo(b.x + k, GY); c.lineTo(b.x + k + 6, GY - b.h); c.lineTo(b.x + k + 12, GY); c.fill(); } }
    else if (b.t === "p") spr(c, SPH_A, b.x, GY - 48, 4, NPC, true);
    else { c.fillStyle = "#8a5a3c"; c.fillRect(b.x, GY - b.h, b.w, b.h); c.fillStyle = "#5e3a28"; c.fillRect(b.x, GY - b.h, b.w, 4); c.fillRect(b.x, GY - 4, b.w, 4); c.fillRect(b.x, GY - b.h, 4, b.h); c.fillRect(b.x + b.w - 4, GY - b.h, 4, b.h); c.fillRect(b.x + 4, GY - b.h / 2 - 2, b.w - 8, 4); c.fillStyle = "#c89a6a"; c.fillRect(b.x + 8, GY - b.h + 8, 4, 4); }
    if (f > 0) { const px = pad[0] * f, py = pad[1] * f; c.fillStyle = "rgba(214,40,57,.25)"; c.strokeStyle = "#d62839"; c.lineWidth = 3; c.setLineDash([8, 6]); c.fillRect(b.x - px, GY - b.h - py, b.w + 2 * px, b.h + py); c.strokeRect(b.x - px, GY - b.h - py, b.w + 2 * px, b.h + py); c.setLineDash([]); }
  }
  if (o.end) {
    if (o.poster) { c.fillStyle = "#ff7a45"; c.fillRect(o.end, GY - 160, 72, 104); c.fillStyle = "#2b1d4a"; c.fillRect(o.end, GY - 160, 72, 8); c.fillStyle = "#fff3d6"; c.font = "900 20px Impact,sans-serif"; c.fillText("GAME", o.end + 10, GY - 118); c.fillText("CRAFT", o.end + 6, GY - 94); }
    else { c.fillStyle = "#fff"; c.fillRect(o.end, GY - 120, 6, 120); c.fillStyle = L[4]; c.fillRect(o.end + 6, GY - 120, 48, 28); }
  }
  const h = o.hero; if (h) spr(c, h.air ? SPH_J : h.mv ? ((now >> 7) & 1 ? SPH_A : SPH_B) : SPH_A, h.x - 3, h.y - 2 + (h.bob ? ((now >> 8) & 1) * 4 : 0), 4, PAL, h.flip);
  c.restore();
}
function drawPv(c) {   // the game Kabir is building, as it looks right now
  c.setTransform(.5, 0, 0, .5, 0, 0); c.imageSmoothingEnabled = false; const now = Date.now();
  world(c, {look: S.look, cam: 0, hero: {x: 230, y: GY - PH, bob: 1}, obs: [{x: 400, t: "p", w: 32, h: 48}, {x: 540, t: "c", w: 40, h: 40}, {x: 700, t: "s", w: 36, h: 28}], end: 840, poster: true, hb: S.bug ? 1 : 0});
  if (S.ai) { c.strokeStyle = "#d62839"; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(270, 420); c.lineTo(640, 420); c.stroke(); c.setLineDash([]); spr(c, SPB, 640, GY - 24, 4); }
  if (S.boss) spr(c, SPB, 640, GY - 120, 12);
  if (S.fx) { c.fillStyle = "#fff"; for (let i = 0; i < 16; i++) c.fillRect(((i * 97) % 900) + ((now >> 6) % 20), (i * 53 + (now >> 4)) % 380, 4, 4); }
  c.fillStyle = "#000a"; c.fillRect(0, 0, 960, 56); c.fillStyle = "#fff3d6"; c.font = "700 34px 'Courier New',monospace"; c.fillText("THE FINAL BUILD", 24, 40); c.font = "700 20px 'Courier New',monospace"; c.fillStyle = "#ffd166"; c.fillText(({neon: "neon edition", warm: "lighthouse edition", plain: "plain edition"})[S.look] || "prototype", 640, 38);
  if (S.dl) { c.fillStyle = "#000c"; c.fillRect(24, 456, 912, 64); c.fillStyle = "#fff"; c.font = "700 26px 'Courier New',monospace"; c.fillText(S.dlt, 40, 496); }
}
const KM = {ArrowLeft:"l", KeyA:"l", ArrowRight:"r", KeyD:"r", ArrowUp:"u", KeyW:"u", Space:"u", ArrowDown:"d", KeyS:"d"};
const RUN = {dash:{END:2100, pad:[0,0], OB:[[480,"p"],[900,"p"],[1320,"p"],[1740,"p"]]}, run:{END:2700, pad:[14,12], OB:[[420,"c"],[760,"s"],[1100,"t"],[1420,"c"],[1760,"s"],[2100,"t"],[2420,"c"]]}};
const OD = {c:[40,40], s:[36,28], t:[40,58], p:[32,48]};
addEventListener("keydown", e => {
  if (!MG.on) return;
  if (KM[e.code]) { MG.k[KM[e.code]] = 1; e.preventDefault(); }
  if (MG.mode === "type" && MG.s === "play" && e.key.length === 1) { e.preventDefault(); typeKey(e.key); }
});
addEventListener("keyup", e => { if (KM[e.code]) MG.k[KM[e.code]] = 0; });
addEventListener("keydown", e => { if (e.key === "Escape" && !MG.on && !$("#dlg").hidden) { Q.length = 0; nx(); } });   // Esc skips dialogue
document.querySelectorAll("#mgc button").forEach(x => { const k = x.dataset.k; x.onpointerdown = () => { MG.k[k] = 1; }; x.onpointerup = x.onpointerleave = () => { MG.k[k] = 0; }; });
$("#cv").onclick = () => { if (MG.on && MG.mode === "pour" && MG.s === "play") MG.k.u = 1; };
function mgPanel(h, t, bt, f) {
  const p = $("#mgp"); p.innerHTML = `<h3 style="margin:0 0 8px;color:#ffd166">${h}</h3><p style="margin:0 0 14px">${t}</p><button class="big" id="mgb">${bt}</button>`;
  p.style.display = "block"; $("#mgb").onclick = () => { p.style.display = "none"; f(); };
}
function mgOpen(mode, arg) {
  nob(); Object.assign(MG, {on:1, k:{}, mode, arg, s:"intro", fl:0, t:0, n:0, cut:0, lv:0, asst:0});
  $("#mg").style.display = "block"; $("#mgc").style.display = (mode === "type" || mode === "pour") ? "none" : "flex";
  const bt = document.querySelectorAll("#mgc button"); bt[2].style.display = mode === "arena" ? "" : "none"; bt[3].textContent = mode === "arena" ? "▲" : "⤒ JUMP";
  let h, t, nest = arg && arg.nested;
  if (mode === "dash" || mode === "run") { MG.c = RUN[mode]; MG.p = {x:60, y:GY - PH, vy:0}; MG.OB = MG.c.OB.map(([x, ty]) => ({x, t:ty, w:OD[ty][0], h:OD[ty][1]})); }
  if (mode === "dash") { h = nest ? "Level 1 · The Announcement" : "The poster’s coming down"; t = nest ? "Your game, running on the projector. You know this level." : "A cleaner is taking the notices down. Reach the poster first."; }
  if (mode === "run") { h = "Test run"; t = "The hero keeps hitting things that aren’t there. The <b>red boxes</b> show what the game thinks he’s touching. Reach the flag."; }
  if (mode === "arena") { MG.h = {x:480, y:300}; MG.e = {x:150, y:120}; h = "Enemy AI test"; t = "The enemy locks onto the hero and never gives up. Survive 8 seconds. Tip: run in big circles."; }
  if (mode === "type") { h = "Write the last line"; t = "Type it before the hours run out."; }
  if (mode === "pour") { h = "Pour the coffee"; t = "Press <b>Space</b> or click to stop at the green line."; }
  const how = mode === "arena" ? "WASD / arrows or the buttons" : (mode === "run" || mode === "dash") ? "A / D or ◀ ▶ to move · W / Space / ⤒ to jump" : "";
  mgPanel(h, t + (how ? "<br><small>" + how + "</small>" : ""), "Start", () => { MG.s = "play"; snd(440, .1); });
  tick(++MG.loop);
}
function mgClose() { MG.on = 0; MG.k = {}; $("#mg").style.display = "none"; $("#mgp").style.display = "none"; }
function fin(h, t, bt) { snd(880, .25, "triangle"); mgPanel(h, t, bt, () => { const m = MG.mode, a = MG.arg; mgClose(); DONE[m](a); }); }
const DONE = {   // what each minigame changes in the story
  dash(a) { if (a && a.nested) return say([["", S.F], ["", "Kabir built this game. You made every choice in it. Now you’ve judged it."]], () => finalCard()); say([["Kabir", "Made it. The poster’s still up."]]); },
  run() { if (!MG.asst) S.int += 2; S.bug = 0; S.fixed = 1; S.r++; ide("edit"); say([["Kabir", "Hitboxes match. He only dies when he should now."]]); btn("◀ Back to room", back); },
  arena() { if (!MG.asst) S.int += 2; S.ai = 0; S.fixedAI = 1; S.r++; ide("edit"); say([["Kabir", "He gives up when I’m far away. Healthy boundaries."]]); btn("◀ Back to room", back); },
  type(a) { if (MG.cut) { S.cut = 1; S.dlt = a.slice(0, MG.n) + "…"; } else if (!MG.asst) S.int += 1; pvAll(); say([["Kabir", MG.cut ? "…It ends mid-sen. Deadlines, huh." : S.rl]]); btn("◀ Back to room", back); },
  pour(a) { S.cof = a; toast(a === "perfect" ? "Perfect pour. The only flawless thing I’ll make today." : a === "spill" ? "Half on the desk. Consistent." : "A bit short. Fine. Fine."); }
};
function typeKey(key) {
  if (key.toLowerCase() === MG.arg[MG.n].toLowerCase()) { MG.n++; snd(600 + MG.n * 10, .03, "square", .02); if (MG.n >= MG.arg.length) { MG.s = "end"; fin("Shipped", "Last line written.", "Continue"); } }
  else { MG.fl = 12; snd(110, .08, "sawtooth"); }
}
function runStep() {
  const p = MG.p, k = MG.k, c = MG.c; if (MG.fl > 0) MG.fl--;
  if (MG.s === "fix") { if (++MG.t === 70) fin("Fixed", "The hitboxes now match the sprites.", "Back to the editor"); return; }
  if (MG.s !== "play") return;
  p.x = Math.max(20, Math.min(c.END + 60, p.x + ((k.r ? 1 : 0) - (k.l ? 1 : 0)) * 4.2));
  if (k.u && p.y >= GY - PH && p.vy === 0) { p.vy = -14.5; snd(520, .08, "square", .03); }
  p.vy += GR; p.y += p.vy; if (p.y >= GY - PH) { p.y = GY - PH; p.vy = 0; }
  for (const o of MG.OB) if (p.x + PW > o.x - c.pad[0] && p.x < o.x + o.w + c.pad[0] && p.y + PH > GY - o.h - c.pad[1]) { MG.fl = 30; snd(120, .2, "sawtooth"); p.x = Math.max(60, o.x - 220); p.y = GY - PH; p.vy = 0; break; }
  if (p.x >= c.END) { MG.t = 0; if (MG.mode === "run") MG.s = "fix"; else { MG.s = "end"; fin("Made it", "Level complete.", "Continue"); } }
}
const STEP = {run: runStep, dash: runStep,
  arena() {
    const k = MG.k, h = MG.h, e = MG.e; if (MG.fl > 0) MG.fl--;
    if (MG.s === "fix") { MG.t++; e.x += Math.cos(MG.t / 12) * 1.4; e.y += Math.sin(MG.t / 9) * 1.4; if (MG.t === 90) fin("Fixed", "The enemy now chases only inside its range, then goes back to patrolling.", "Back to the editor"); return; }
    if (MG.s !== "play") return;
    h.x = Math.max(130, Math.min(830, h.x + ((k.r ? 1 : 0) - (k.l ? 1 : 0)) * 3.4)); h.y = Math.max(90, Math.min(470, h.y + ((k.d ? 1 : 0) - (k.u ? 1 : 0)) * 3.4));
    const dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy) || 1; e.x += dx / d * 2.0; e.y += dy / d * 2.0;
    if (d < 26) { MG.fl = 30; snd(120, .2, "sawtooth"); h.x = 480; h.y = 300; e.x = 150; e.y = 120; MG.t = 0; return; }
    if (++MG.t >= 480) { MG.s = "fix"; MG.t = 0; }
  },
  type() { if (MG.fl > 0) MG.fl--; if (MG.s !== "play") return; if (++MG.t >= 960) { MG.s = "end"; MG.cut = 1; fin("Out of time", "The hours ran out. Whatever you typed is what ships.", "Continue"); } },
  pour() {
    if (MG.s !== "play") return; MG.t++; const lv = Math.min(1, MG.t / 150); MG.lv = lv;
    if (MG.k.u || lv >= 1) { const r = Math.abs(lv - 0.8) <= 0.06 ? "perfect" : lv > 0.86 ? "spill" : "short"; MG.s = "end"; MG.pr = r; snd(r === "perfect" ? 880 : 150, .2, "triangle");
      setTimeout(() => { if (MG.on && MG.mode === "pour") { mgClose(); DONE.pour(r); } }, 900); }
  }};
function mgSkip() {   // safe exit: never blocks the story; the evaluator notices it
  if (!MG.on || MG.s === "end" || MG.s === "fix") return;
  S.asst++; MG.asst = 1; const m = MG.mode;
  if (m === "run" || m === "arena") { MG.s = "fix"; MG.t = 0; }
  else if (m === "dash") { MG.s = "end"; fin("Made it", "Skipped with assist.", "Continue"); }
  else if (m === "type") { MG.n = MG.arg.length; MG.cut = 0; MG.s = "end"; fin("Shipped", "Line filled in for you.", "Continue"); }
  else if (m === "pour") { MG.s = "end"; MG.pr = "short"; setTimeout(() => { if (MG.on) { mgClose(); DONE.pour("short"); } }, 300); }
}
function tick(id) { if (!MG.on || id !== MG.loop) return; STEP[MG.mode](); draw(); requestAnimationFrame(() => tick(id)); }
function draw() {
  const c = $("#cv").getContext("2d"), m = MG.mode; c.setTransform(1, 0, 0, 1, 0, 0);
  const pal = m === "dash" ? ["#f0c79a", "#e3a57a", "#7e5434", "#ff7a45"] : {neon:["#24104a", "#3a1a6e", "#5b2a9e", "#ff3ea5"], warm:["#e0a878", "#f0c79a", "#6b4630", "#ffcf7a"]}[S.look] || ["#cfd6e4", "#e6e4dd", "#777", "#333"];
  if (m === "run" || m === "dash") drawRun(c, pal); else if (m === "arena") drawArena(c, pal); else if (m === "type") drawType(c); else drawPour(c, pal);
  if (MG.fl > 0 && m !== "pour") { c.fillStyle = "rgba(214,40,57," + MG.fl / 60 + ")"; c.fillRect(0, 0, 960, 540); if (m !== "type") { c.fillStyle = "#fff"; c.font = "700 40px Consolas,monospace"; c.fillText(m === "arena" ? "CAUGHT" : "COLLISION", 360, 110); } }
}
function hud(c, label, frac) { c.fillStyle = "#000a"; c.fillRect(0, 0, 960, 34); c.fillStyle = "#fff3"; c.fillRect(20, 12, 300, 10); c.fillStyle = "#ffd166"; c.fillRect(20, 12, 300 * Math.max(0, Math.min(1, frac)), 10); c.fillStyle = "#f4ecd8"; c.font = "700 14px Consolas,monospace"; c.fillText(label, 340, 22); }
function drawRun(c) {
  const p = MG.p, cm = MG.c, f = MG.mode === "run" ? (MG.s === "fix" ? Math.max(0, 1 - MG.t / 50) : 1) : 0;
  if (MG.k.l && !MG.k.r) MG.flip = 1; if (MG.k.r) MG.flip = 0;
  world(c, {look: MG.mode === "dash" ? "warm" : S.look, cam: Math.max(0, p.x - 300), hero: {x: p.x, y: p.y, mv: MG.k.l || MG.k.r, air: p.y < GY - PH - 1, flip: MG.flip}, obs: MG.OB, hb: f, pad: cm.pad, end: cm.END, poster: MG.mode === "dash"});
  hud(c, MG.mode === "dash" ? "Level 1 · reach the poster" : "FinalBuild.proj · test run", p.x / cm.END);
  if (MG.s === "fix") { c.fillStyle = "#7be0a0"; c.font = "700 30px Consolas,monospace"; c.fillText("hitbox = sprite ✓", 340, 110); }
}
function drawArena(c) {
  c.fillStyle = "#232846"; c.fillRect(0, 0, 960, 540);
  for (let x = 110; x < 850; x += 40) for (let y = 70; y < 490; y += 40) { c.fillStyle = ((x + y) / 40) % 2 ? "#2e3558" : "#343c64"; c.fillRect(x, y, 40, 40); }
  c.strokeStyle = "#ffd166"; c.lineWidth = 4; c.strokeRect(110, 70, 740, 420);
  const h = MG.h, e = MG.e, fix = MG.s === "fix";
  c.setLineDash([8, 6]); c.lineWidth = 3; c.strokeStyle = fix ? "#7be0a0" : "#d62839"; c.beginPath();
  if (fix) c.arc(e.x, e.y, 220, 0, 7); else { c.moveTo(e.x, e.y); c.lineTo(h.x, h.y); } c.stroke(); c.setLineDash([]);
  spr(c, SPB, e.x - 16, e.y - 12, 4); spr(c, SPH_A, h.x - 16, h.y - 24, 4);
  c.font = "700 15px Consolas,monospace"; c.fillStyle = fix ? "#7be0a0" : "#ffb3b3"; c.fillText(fix ? "ai: chase if near, else patrol ✓" : "ai: target = hero (always)", 130, 110);
  hud(c, "FinalBuild.proj · enemy test", fix ? 1 : MG.t / 480);
}
function drawType(c) {
  c.fillStyle = "#12151f"; c.fillRect(0, 0, 960, 540); c.fillStyle = "#1e2230"; c.fillRect(60, 90, 840, 300);
  c.font = "700 14px Consolas,monospace"; c.fillStyle = "#ffb347"; c.fillText("FinalBuild.proj › ending.txt", 80, 120);
  c.font = "700 32px Consolas,monospace"; const a = MG.arg, w = c.measureText("M").width;
  c.fillStyle = "#7be0a0"; c.fillText(a.slice(0, MG.n), 80, 260); c.fillStyle = "#6b7390"; c.fillText(a.slice(MG.n), 80 + MG.n * w, 260);
  if (Math.floor(Date.now() / 400) % 2) { c.fillStyle = "#ffd166"; c.fillRect(80 + MG.n * w, 232, 3, 36); }
  c.fillStyle = "#fff3"; c.fillRect(80, 340, 800, 8); c.fillStyle = MG.t > 720 ? "#d62839" : "#ffd166"; c.fillRect(80, 340, 800 * Math.max(0, 1 - MG.t / 960), 8);
  c.font = "14px Consolas,monospace"; c.fillStyle = "#b9bdd0"; c.fillText("hours left", 80, 372);
}
function drawPour(c, pal) {
  c.fillStyle = pal[0]; c.fillRect(0, 0, 960, 540); c.fillStyle = pal[2]; c.fillRect(0, 440, 960, 100);
  const x = 430, top = 200, bot = 420, ih = bot - top;
  c.fillStyle = "#5a3a22"; c.fillRect(x + 4, bot - MG.lv * ih, 92, MG.lv * ih);
  c.fillStyle = "rgba(123,224,160,.35)"; c.fillRect(x - 20, bot - 0.86 * ih, 140, 0.12 * ih); c.strokeStyle = "#7be0a0"; c.lineWidth = 2; c.strokeRect(x - 20, bot - 0.86 * ih, 140, 0.12 * ih);
  c.strokeStyle = "#f4ecd8"; c.lineWidth = 5; c.strokeRect(x, top, 100, ih);
  c.fillStyle = "#000a"; c.fillRect(0, 0, 960, 34); c.fillStyle = "#f4ecd8"; c.font = "700 14px Consolas,monospace"; c.fillText("Space / click to stop", 20, 22);
  if (MG.s === "end") { c.font = "900 46px Impact,sans-serif"; c.fillStyle = MG.pr === "perfect" ? "#7be0a0" : "#ff8a8a"; c.fillText(MG.pr === "perfect" ? "PERFECT" : MG.pr === "spill" ? "SPILLED" : "SHORT", 400, 120); }
}
$("#mgskip").onclick = mgSkip;
roomLoop();
setInterval(() => { if ($("#s3").classList.contains("on") || $("#s6").classList.contains("on")) pvAll(); }, 250);
