export function toggleTheme() {
  const root = document.documentElement;
  const next = root.classList.contains("dark") ? "light" : "dark";
  root.classList.toggle("dark", next === "dark");
  root.style.colorScheme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

/**
 * Runs before first paint: restores light/dark AND the shared sky palette so
 * the whole UI (including the ambient wash and the banner picker) is correct
 * from the very first frame — no flash of the default Space palette.
 */
export const themeInitScript = `(function(){
var d=document.documentElement;d.classList.add('js');
var accents={space:'#a78bfa',redmoon:'#ff8258',sun:'#ffc46b',sunset:'#ff9066',midnight:'#63d6e8'};
try{
var t=localStorage.getItem('theme');
if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}
d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;
var s=localStorage.getItem('ar_sky_theme');if(!accents[s])s='space';
d.dataset.sky=s;d.style.setProperty('--sky-ambient',accents[s]);
}catch(e){
d.classList.add('dark');d.dataset.sky='space';d.style.setProperty('--sky-ambient',accents.space);
}
})();`;
