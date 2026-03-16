const sectionHtml = {
  home: `<section></section>`,
  servicios: `<section><h2>Servicios</h2><p>Contenido de servicios aquí.</p></section>`,
  login: `<section><h2>Login</h2></section>`
};

function renderSection(section) {
  document.getElementById("content").innerHTML = sectionHtml[section] || sectionHtml.home;
  if (section === "home") {
    document.getElementById('carrusel-bg').style.display = "";
    document.getElementById('home-glass-login').style.display = "";
    startCarrusel();
  } else {
    document.getElementById('carrusel-bg').style.display = "none";
    document.getElementById('home-glass-login').style.display = "none";
  }
}

function startCarrusel() {
  if (window._carruselHomeInterval) return;
  let idx = 0;
  const imgs = document.querySelectorAll('.carrusel-img');
  window._carruselHomeInterval = setInterval(() => {
    imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
    idx = (idx + 1) % imgs.length;
  }, 4400);
}

window.onload = function() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      renderSection(link.getAttribute('data-section'));
    };
  });
  renderSection('home');
};