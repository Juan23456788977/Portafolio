// Carrusel fondo automático
let idx = 0;
const imgs = document.querySelectorAll('.bg-img');
setInterval(() => {
  imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
  idx = (idx + 1) % imgs.length;
}, 5000);