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
 * Runs before first paint: restores the saved light/dark theme (or the OS
 * preference) with no flash of the wrong colours. Also flags .js so the
 * scroll-reveal styles only hide content when JS is actually running.
 */
export const themeInitScript = `(function(){
var d=document.documentElement;d.classList.add('js');
try{
var t=localStorage.getItem('theme');
if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}
d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;
}catch(e){
d.classList.add('dark');d.style.colorScheme='dark';
}
})();`;
