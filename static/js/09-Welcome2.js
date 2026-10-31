// Assumes h = React.createElement, E = React.useEffect, plus your existing Scene and Logo.
// Uses your existing keyframes: wd (fade/rise in) and gl (glow pulse).
 
const GOLD = '#f2b872', PINK = '#ff6f91', CREAM = '#fde3ea';
 
// extra animations just for this screen (soft floating + slow shimmer)
const CSS = `
@keyframes w2float { 0%,100% { translate: 0 0 } 50% { translate: 0 -14px } }
@keyframes w2spin  { to { rotate: 360deg } }
@keyframes w2shine { 0% { background-position: 0% 50% } 100% { background-position: 200% 50% } }
.w2-title-gold {
  background: linear-gradient(90deg,#f2b872,#ffe2b8,#f2b872,#ffd08a,#f2b872);
  background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  animation: w2shine 6s linear infinite;
}
`;
 
// floating glass panel (left "Research Paper", right chart)
const glass = {
  position: 'absolute', border: '1px solid #f2b87233', borderRadius: 16,
  background: 'linear-gradient(145deg,#ff6f9124,#8a1c4a14)', backdropFilter: 'blur(6px)',
  boxShadow: '0 24px 70px #0009, inset 0 0 34px #ff6f9114',
};
 
function Welcome2({ go }) {
  E(() => { window.addEventListener('keydown', go); return () => window.removeEventListener('keydown', go); }, []);
 
  return h('div', {
    role: 'button', tabIndex: 0, 'aria-label': '', onClick: go,
    style: { position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'pointer', background: '#16050f', color: CREAM },
  },
    h('style', null, CSS),
    h(Scene),
 
    // deep vignette + warm glows behind the panels and the center
    h('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 14% 45%,#b01a4e55,transparent 42%),radial-gradient(ellipse at 86% 55%,#b01a4e55,transparent 42%),radial-gradient(ellipse at 50% 42%,#f2b87218,transparent 38%),radial-gradient(ellipse at center,#16050f88 20%,#16050fee 92%)' } }),
 
    // flowing wave lines
    h('svg', { viewBox: '0 0 1600 800', preserveAspectRatio: 'none', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .75 } },
      h('path', { d: 'M0 250 C 250 330, 380 520, 620 470 S 1000 600, 1600 360', fill: 'none', stroke: PINK, strokeWidth: 1.3, opacity: .6 }),
      h('path', { d: 'M0 300 C 280 360, 420 560, 650 500 S 1050 640, 1600 420', fill: 'none', stroke: GOLD, strokeWidth: 1, opacity: .45 }),
      h('path', { d: 'M0 200 C 300 280, 400 480, 600 440 S 1100 560, 1600 300', fill: 'none', stroke: PINK, strokeWidth: .8, opacity: .35 })),
 
    // glowing dots
    [[7, 18, 6], [3, 28, 5], [22, 66, 7], [14, 70, 5], [81, 24, 6], [93, 64, 8], [58, 16, 4], [70, 80, 5], [34, 84, 4]].map(([x, y, s], i) =>
      h('span', { key: i, style: { position: 'absolute', left: x + '%', top: y + '%', width: s, height: s, borderRadius: '50%', background: GOLD, boxShadow: `0 0 ${s * 3}px ${GOLD}`, animation: `gl ${2.4 + i * .3}s infinite` } })),
 
    // left floating "Research Paper"
    h('div', { style: { position: 'absolute', left: '6%', top: '28%', animation: 'w2float 7s ease-in-out infinite' } },
      h('div', { style: { ...glass, position: 'relative', width: 250, height: 190, transform: 'rotate(-17deg) skewX(-6deg)', padding: 18, animation: 'wd 1s .4s backwards' } },
        h('div', { style: { fontSize: 14, color: PINK, marginBottom: 12, fontFamily: 'cursive, serif' } }, 'Research Paper'),
        [100, 92, 100, 70].map((w, i) => h('div', { key: i, style: { height: 6, width: w + '%', margin: '9px 0', borderRadius: 4, background: '#ff6f9188' } })),
        h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 44, marginTop: 14 } },
          [14, 22, 30, 40].map((x, i) => h('i', { key: i, style: { width: 8, height: x, background: PINK, borderRadius: 2 } }))))),
 
    // right floating chart panels
    h('div', { style: { position: 'absolute', right: '5%', top: '26%', animation: 'w2float 8s ease-in-out -2s infinite' } },
      h('div', { style: { ...glass, position: 'relative', width: 240, height: 190, transform: 'rotate(7deg)', padding: 18, animation: 'wd 1s .5s backwards' } },
        h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 9, height: '100%' } },
          [20, 32, 28, 45, 58, 70, 92].map((x, i) => h('i', { key: i, style: { flex: 1, height: x + '%', background: 'linear-gradient(#ff6f91,#8a1c4a)', borderRadius: 3 } }))))),
    h('div', { style: { position: 'absolute', right: '3%', top: '50%', animation: 'w2float 6s ease-in-out -4s infinite' } },
      h('div', { style: { ...glass, position: 'relative', width: 120, height: 90, transform: 'rotate(5deg)', animation: 'wd 1s .7s backwards' } },
        h('svg', { viewBox: '0 0 120 90', width: '100%', height: '100%' },
          h('path', { d: 'M15 60 L45 35 L75 55 L105 25 M45 35 L60 75', stroke: PINK, strokeWidth: 1.2, fill: 'none' }),
          [[15, 60], [45, 35], [75, 55], [105, 25], [60, 75]].map(([x, y], i) => h('circle', { key: i, cx: x, cy: y, r: 4, fill: PINK }))))),
 
    // hero (centered, no top bar)
    h('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 6vw', zIndex: 2 } },
 
      // logo with glow + slowly rotating dashed ring
      h('div', { style: { position: 'relative', display: 'grid', placeItems: 'center', width: 150, height: 150, marginBottom: 30, animation: 'wd .9s .1s backwards' } },
        h('span', { style: { position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle,#b01a4e99,transparent 68%)', filter: 'blur(10px)' } }),
        h('span', { style: { position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed #f2b87277', animation: 'w2spin 40s linear infinite' } }),
        h('span', { style: { position: 'relative', display: 'grid', placeItems: 'center', width: 112, height: 112, borderRadius: '50%', border: '1.5px solid #f2b872aa', background: 'linear-gradient(145deg,#ffffff14,#ffffff05)', backdropFilter: 'blur(6px)', boxShadow: '0 0 50px #b01a4e77, inset 0 0 20px #f2b87222' } },
          h(Logo, { s: 54 }))),
 
      // brand
      h('div', { className: 'serif', style: { fontSize: 22, fontWeight: 600, letterSpacing: '.04em', marginBottom: 6, animation: 'wd .9s .2s backwards' } }, 'Research', h('span', { style: { color: GOLD } }, 'AI')),
      h('div', { style: { fontSize: 12, letterSpacing: '.3em', textTransform: 'uppercase', color: GOLD, opacity: .85, marginBottom: 26, animation: 'wd .9s .3s backwards' } }, 'Data-Driven Agentic Literature Reviewer'),
 
      // headline
      h('h1', { className: 'serif', style: { fontSize: 'clamp(36px,6vw,82px)', lineHeight: 1.12, fontWeight: 600, textShadow: '0 4px 40px #000b', animation: 'wd .9s .4s backwards' } },
        h('div', { style: { color: CREAM } }, 'From research questions to'),
        h('div', { className: 'w2-title-gold' }, 'evidence-based insights.')),
 
      // gold divider
      h('div', { style: { width: 110, height: 2, margin: '30px 0 24px', background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, animation: 'wd .9s .8s backwards' } }),
 
      // subtitle
      h('p', { style: { maxWidth: 640, fontSize: 'clamp(15px,1.7vw,20px)', lineHeight: 1.8, color: '#fde3ecc8', animation: 'wd .9s .9s backwards' } },
        'Find relevant papers, analyze methods and results, and get data-driven recommendations for your next experiment.')));
}
 