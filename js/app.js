
// ---------- Login ----------
async function sha256(t){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
// ---------- Login ----------
function abrir(){ document.body.classList.remove('locked'); }
try { if (sessionStorage.getItem('ok') === '1') abrir(); } catch(e) {}
document.getElementById('pista').textContent = CONFIG.pistaLogin || '';

document.getElementById('formLogin').addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('usuario').value.trim().toLowerCase();
  const c = document.getElementById('clave').value.trim();
  const error = document.getElementById('errorLogin');

  // Aquí ponemos la validación directa sin códigos raros
  // Tu usuario será "guadalupe" y la contraseña "4dejunio"
  if (u === 'guadalupe' && c === '4dejunio'){
    try { sessionStorage.setItem('ok', '1'); } catch(e) {}
    error.hidden = true; abrir(); window.scrollTo(0, 0); iniciarMusica();
  } else {
    error.hidden = false;
  }
});

// ---------- Galería de fotos ----------
function reducir(file, cb){
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, 900 / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = im.width * s; c.height = im.height * s;
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.8));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
const galeria = document.getElementById('galeria');
CONFIG.fotos.forEach((f, i) => {
  const key = 'foto' + i;
  const fig = document.createElement('figure'); fig.className = 'slot';
  const marco = document.createElement('div'); marco.className = 'marco';
  const pie = document.createElement('figcaption'); pie.textContent = f.texto;
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cambiar';
  btn.addEventListener('click', () => input.click());

  function mostrar(src){
    marco.innerHTML = '';
    if (!src){
      marco.textContent = '♥'; marco.classList.add('sinfoto'); btn.textContent = '+ Agregar foto'; return;
    }
    marco.classList.remove('sinfoto');
    const im = document.createElement('img'); im.alt = f.texto;
    im.addEventListener('error', () => mostrar(null));
    im.src = src;
    marco.appendChild(im); btn.textContent = 'Cambiar foto';
  }
  let guardada = null;
  try { guardada = localStorage.getItem(key); } catch(e) {}
  mostrar(guardada || f.archivo);

  input.addEventListener('change', () => {
    if (!input.files[0]) return;
    reducir(input.files[0], url => {
      try { localStorage.setItem(key, url); }
      catch(e) { alert('No hay espacio para guardar esta foto en este dispositivo. Colócala en la carpeta "img" y regístrala en js/config.js.'); }
      mostrar(url);
    });
  });
  fig.append(marco, pie, btn, input);
  galeria.appendChild(fig);
});

// ---------- Carrusel ----------
const slots = [...galeria.children];
const puntos = document.getElementById('puntos');
const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let idx = 0, timer = null;
function ir(n){
  idx = (n + slots.length) % slots.length;
  slots.forEach((el, i) => {
    const d = (i - idx + slots.length) % slots.length;
    el.classList.toggle('activo', d === 0);
    el.classList.toggle('p1', d === 1);
    el.classList.toggle('p2', d === 2);
    el.inert = d !== 0;
  });
  [...puntos.children].forEach((d, i) => d.classList.toggle('on', i === idx));
  document.getElementById('cuenta').textContent = (idx + 1) + ' / ' + slots.length;
}
function iniciar(){ clearInterval(timer); if (!reducido) timer = setInterval(() => ir(idx + 1), 5000); }
slots.forEach((_, i) => {
  const d = document.createElement('button');
  d.type = 'button'; d.className = 'punto'; d.setAttribute('aria-label', 'Foto ' + (i + 1));
  d.addEventListener('click', () => { ir(i); iniciar(); });
  puntos.appendChild(d);
});
document.getElementById('prev').addEventListener('click', () => { ir(idx - 1); iniciar(); });
document.getElementById('next').addEventListener('click', () => { ir(idx + 1); iniciar(); });
galeria.addEventListener('mouseenter', () => clearInterval(timer));
galeria.addEventListener('mouseleave', iniciar);
let x0 = null;
galeria.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; clearInterval(timer); }, {passive:true});
galeria.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 40) ir(idx + (dx < 0 ? 1 : -1));
  iniciar();
});
ir(0); iniciar();

// ---------- Música ----------
const audio = document.getElementById('musica');
const btnM = document.getElementById('btnMusica');
if (CONFIG.musica && CONFIG.musica.archivo){ audio.src = CONFIG.musica.archivo; audio.volume = 0.5; btnM.title = CONFIG.musica.titulo || 'Música'; }
else { btnM.hidden = true; }
audio.addEventListener('error', () => { btnM.hidden = true; });
function estadoMusica(){
  btnM.classList.toggle('sonando', !audio.paused);
  btnM.setAttribute('aria-label', audio.paused ? 'Reproducir música' : 'Pausar música');
}
audio.addEventListener('play', estadoMusica);
audio.addEventListener('pause', estadoMusica);
btnM.addEventListener('click', () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
function iniciarMusica(){ if (audio.src) audio.play().catch(() => {}); }

// ---------- Contenido ----------
document.getElementById('monograma').textContent = CONFIG.nombre[0] + ' ♥ ' + CONFIG.tuNombre[0];
document.getElementById('frase').textContent = '“' + CONFIG.frase + '”';
document.getElementById('fraseAutor').textContent = '— ' + CONFIG.tuNombre;
document.getElementById('titulo').textContent = "Para ti, " + CONFIG.nombre;
document.title = "Para " + CONFIG.nombre + " ♥";

// Razones
const razones = document.getElementById('razones');
CONFIG.razones.forEach(r => {
  const b = document.createElement('button');
  b.className = 'reason';
  b.setAttribute('aria-expanded', 'false');
  const t = document.createElement('span'); t.className = 'title'; t.textContent = r.titulo;
  const p = document.createElement('span'); p.className = 'body'; p.textContent = r.texto;
  b.append(t, p);
  b.addEventListener('click', () => {
    b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
  razones.appendChild(b);
});

// Carta
const carta = document.getElementById('carta');
CONFIG.carta.forEach(txt => {
  const p = document.createElement('p'); p.textContent = txt; carta.appendChild(p);
});
const firma = document.createElement('p');
firma.className = 'sign'; firma.textContent = "Con amor, " + CONFIG.tuNombre;
carta.appendChild(firma);

// Contador correlativo desde el 4 de junio de 2026
// Contador correlativo desde el 4 de junio de 2026 a las 12:00 PM (mediodía)
function actualizar(){
  // Cambiamos a "T12:00:00" para que inicie a las 12:00 pm (mediodía)
  const inicio = new Date(CONFIG.fechaInicio + "T12:00:00");
  const ahora = new Date();
  const contador = document.getElementById('contador');

  if (ahora < inicio) {
    contador.innerHTML = `<div><b>0</b><span>años</span></div>
      <div><b>0</b><span>meses</span></div>
      <div><b>0</b><span>días</span></div>
      <div><b>0</b><span>horas</span></div>
      <div><b>0</b><span>minutos</span></div>
      <div><b>0</b><span>segundos</span></div>`;
    document.getElementById('fraseContador').textContent = 'Nuestro tiempo juntos está por comenzar ♥';
    return;
  }

  // Calcula años y meses de calendario, y luego el tiempo restante exacto.
  let cursor = new Date(inicio);
  let anios = 0, meses = 0;
  while (true) {
    const siguiente = new Date(cursor);
    siguiente.setFullYear(siguiente.getFullYear() + 1);
    if (siguiente <= ahora) { cursor = siguiente; anios++; }
    else break;
  }
  while (true) {
    const siguiente = new Date(cursor);
    siguiente.setMonth(siguiente.getMonth() + 1);
    if (siguiente <= ahora) { cursor = siguiente; meses++; }
    else break;
  }

  let restante = ahora - cursor;
  const dias = Math.floor(restante / 86400000);
  restante -= dias * 86400000;
  const horas = Math.floor(restante / 3600000);
  restante -= horas * 3600000;
  const minutos = Math.floor(restante / 60000);
  restante -= minutos * 60000;
  const segundos = Math.floor(restante / 1000);

  contador.innerHTML =
    `<div><b>${anios}</b><span>años</span></div>
     <div><b>${meses}</b><span>meses</span></div>
     <div><b>${dias}</b><span>días</span></div>
     <div><b>${horas}</b><span>horas</span></div>
     <div><b>${minutos}</b><span>minutos</span></div>
     <div><b>${segundos}</b><span>segundos</span></div>`;
  document.getElementById('fraseContador').textContent =
    'Cada segundo a tu lado es un recuerdo que quiero seguir construyendo contigo. ♥';
}
actualizar();
setInterval(actualizar, 1000);

// Corazones flotantes
function lluvia(){
  for (let i = 0; i < 24; i++){
    setTimeout(() => {
      const h = document.createElement('span');
      h.className = 'heart'; h.textContent = '♥';
      h.style.left = Math.random() * 100 + 'vw';
      h.style.fontSize = (14 + Math.random() * 26) + 'px';
      h.style.animationDuration = (4 + Math.random() * 4) + 's';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 8500);
    }, i * 140);
  }
}
document.getElementById('btnCorazones').addEventListener('click', lluvia);
