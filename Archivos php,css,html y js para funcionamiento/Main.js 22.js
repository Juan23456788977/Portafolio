// ---- DARK MODE, TOAST, LOADER ----
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}
function autoTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) setTheme(stored);
  else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function showToast(msg, type="success", duration=2500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-15px) scale(.97)";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
function showLoader() {
  if (!document.getElementById('loader-bg')) {
    const loader = document.createElement('div');
    loader.id = 'loader-bg';
    loader.innerHTML = `<div class="loader-spin"></div>`;
    document.body.appendChild(loader);
  }
}
function hideLoader() {
  const loader = document.getElementById('loader-bg');
  if (loader) loader.remove();
}

// ---- MENÚ HAMBURGUESA ----
document.addEventListener('DOMContentLoaded', function () {
  var menu = document.getElementById('main-menu');
  var burger = document.getElementById('hamburger-menu');
  if (burger && menu) {
    burger.onclick = function () {
      menu.classList.toggle('active');
      burger.setAttribute('aria-label', menu.classList.contains('active') ? "Cerrar menú" : "Abrir menú");
    };
    document.addEventListener('click', function(e){
      if(window.innerWidth <= 900 && menu.classList.contains('active')) {
        if(!menu.contains(e.target) && e.target !== burger){
          menu.classList.remove('active');
          burger.setAttribute('aria-label', "Abrir menú");
        }
      }
    });
  }
});

// ---- CARRUSEL HERO ----
const heroImages = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
];
let heroIndex = 0;
let heroInterval = null;
function startHeroCarousel() {
  if (heroInterval) clearInterval(heroInterval);
  const imgElement = document.getElementById("hero-carousel");
  if (!imgElement) return;
  heroIndex = 0;
  imgElement.src = heroImages[0];
  heroInterval = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroImages.length;
    imgElement.style.opacity = "0.5";
    setTimeout(() => {
      imgElement.src = heroImages[heroIndex];
      imgElement.style.opacity = "1";
    }, 400);
  }, 3400);
}

// ---- PANEL MODERADOR DEMO ----
function panelModeradorHTML() {
  return `
    <div class="role-card moderador">
      <div class="role-title"><span class="icon">🛡️</span> Panel Moderador</div>
      <div class="panel-tools">
        <input type="text" id="mod-buscar" placeholder="Buscar por nombre, email o empresa..." />
        <select id="mod-filtrar-estado">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
          <option value="suspendido">Suspendidos</option>
        </select>
        <button class="panel-btn" id="mod-exportar">Exportar CSV</button>
      </div>
      <div id="tabla-moderador"></div>
    </div>
  `;
}
function cargarPanelModerador() {
  showLoader();
  setTimeout(() => {
    hideLoader();
    const data = [
      {nombre:"Juan Pérez", email:"juan@empresa.com", empresa:"TechSoft", estado:"pendiente"},
      {nombre:"Ana López", email:"ana@empresa.com", empresa:"BigData SA", estado:"aprobado"},
      {nombre:"Carlos Ruiz", email:"carlos@empresa.com", empresa:"InnovaTec", estado:"suspendido"},
      {nombre:"Maria Diaz", email:"maria@empresa.com", empresa:"BigData SA", estado:"rechazado"},
    ];
    renderTablaModerador(data);
    document.getElementById('mod-buscar').oninput = function() {
      renderTablaModerador(data, this.value, document.getElementById('mod-filtrar-estado').value);
    };
    document.getElementById('mod-filtrar-estado').onchange = function() {
      renderTablaModerador(data, document.getElementById('mod-buscar').value, this.value);
    };
    document.getElementById('mod-exportar').onclick = function() {
      showToast("Exportación CSV simulada", "success");
    };
  }, 700);
}
function renderTablaModerador(datos, buscar="", estado="") {
  let rows = datos.filter(d => 
    (!buscar || [d.nombre, d.email, d.empresa].some(val=>val.toLowerCase().includes(buscar.toLowerCase())))
    && (!estado || d.estado === estado)
  ).map((d,idx) => `
    <tr>
      <td>${d.nombre}</td>
      <td>${d.email}</td>
      <td>${d.empresa}</td>
      <td>
        <span class="panel-badge ${d.estado==='aprobado'?'success':d.estado==='pendiente'?'info':d.estado==='rechazado'?'danger':'inactive'}">${d.estado.charAt(0).toUpperCase()+d.estado.slice(1)}</span>
      </td>
      <td>
        <button class="panel-btn success" title="Aprobar" ${d.estado!=='pendiente'?'disabled':''}>✔️</button>
        <button class="panel-btn danger" title="Rechazar" ${d.estado!=='pendiente'?'disabled':''}>✖️</button>
        <button class="panel-btn warning" title="Suspender" ${d.estado==='suspendido'?'disabled':''}>⏸️</button>
        <button class="panel-btn" title="Editar">✏️</button>
        <button class="panel-btn" title="Ver logs">📋</button>
        <button class="panel-btn" title="Mensaje">💬</button>
      </td>
    </tr>
  `).join("");
  if (!rows) rows = `<tr><td colspan="5">No hay datos para mostrar.</td></tr>`;
  document.getElementById('tabla-moderador').innerHTML = `
    <table style="width:100%;border-collapse:separate;border-spacing:0 7px;">
      <thead>
        <tr style="background:var(--secondary);color:var(--primary);font-weight:700;"><td>Nombre</td><td>Email</td><td>Empresa</td><td>Estado</td><td>Acciones</td></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ---- SPA SECTIONS ----
let currentUser = null;
const sectionHtml = {
  home: `
    <section class="hero-pro fade-panel" id="hero">
      <div class="hero-content">
        <h1>Gestión de Pasantías Profesionales</h1>
        <p>Conecta estudiantes y empresas con una plataforma ágil, moderna y confiable.</p>
        <a href="#" class="cta-pro" id="btn-iniciar-sesion">Iniciar sesión</a>
      </div>
      <div class="hero-img">
        <img id="hero-carousel" src="${heroImages[0]}" alt="Hero" />
      </div>
    </section>
  `,
  servicios: `
    <section class="main-centered-section fade-panel" id="servicios">
      <h2>Servicios</h2>
      <div class="cards-pro">
        <div class="card-pro" tabindex="0">
          <svg width="32" height="32" fill="none" stroke="#04344c" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="4"/><path d="M16 3v4"/></svg>
          <h3>Gestión de Pasantías</h3>
          <p>Registro, asignación y seguimiento de estudiantes y empresas.</p>
        </div>
        <div class="card-pro" tabindex="0">
          <svg width="32" height="32" fill="none" stroke="#0e72b5" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/></svg>
          <h3>Reportes y Analíticas</h3>
          <p>Visualiza el avance y los resultados de tus programas de pasantías.</p>
        </div>
        <div class="card-pro" tabindex="0">
          <svg width="32" height="32" fill="none" stroke="#f7c873" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M5 12h14"/></svg>
          <h3>Automatización</h3>
          <p>Procesos automáticos para ahorrar tiempo y reducir errores.</p>
        </div>
      </div>
    </section>
  `,
  testimonios: `
    <section class="main-centered-section fade-panel" id="testimonios">
      <h2>
        <svg width="28" height="28" fill="none" stroke="#04344c" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 20A7.5 7.5 0 0112 13a7.5 7.5 0 016.5 7"/></svg>
        Testimonios
      </h2>
      <div class="testimonios-grid" id="testimonios-list"></div>
      <hr>
      <form id="form-testimonio" style="margin-top:1.3em;">
        <input type="text" id="test-nombre" placeholder="Tu nombre (o empresa)" required maxlength="50" />
        <textarea id="test-texto" placeholder="Tu testimonio sobre la plataforma" required maxlength="420" rows="3"></textarea>
        <button type="submit">Enviar Testimonio</button>
        <p id="testimonio-status"></p>
      </form>
    </section>
  `,
  faq: `
    <section class="main-centered-section fade-panel" id="faq">
      <h2>Preguntas Frecuentes</h2>
      <ul class="faq-list">
        <li>
          <b>¿Cómo registro mi empresa?</b>
          <span>Solicita acceso y sigue el proceso guiado desde el panel de control.</span>
        </li>
        <li>
          <b>¿Puedo automatizar las asignaciones?</b>
          <span>Sí, la plataforma sugiere las mejores coincidencias automáticamente.</span>
        </li>
        <li>
          <b>¿Es seguro?</b>
          <span>Trabajamos bajo buenas prácticas y cifrado de datos para tu tranquilidad.</span>
        </li>
      </ul>
    </section>
  `,
  contacto: `
    <section class="main-centered-section fade-panel" id="contacto">
      <h2>Contacto</h2>
      <form id="contact-form">
        <input type="text" id="contact-name" placeholder="Nombre completo" required />
        <input type="email" id="contact-email" placeholder="Correo electrónico" required />
        <textarea id="contact-msg" placeholder="Cuéntanos tu consulta" rows="4" required></textarea>
        <button type="submit">Enviar mensaje</button>
        <p id="contact-status"></p>
      </form>
    </section>
  `,
  login: `
    <section class="main-centered-section fade-panel">
      <h2>Iniciar Sesión</h2>
      <form id="login-form">
        <input type="email" name="email-login" placeholder="Correo" required maxlength="60" autocomplete="username"/>
        <input type="password" name="password-login" placeholder="Contraseña" required maxlength="40" autocomplete="current-password"/>
        <select name="role-login">
          <option value="admin">Administrador</option>
          <option value="moderador">Moderador</option>
          <option value="pasante">Pasante</option>
          <option value="supervisor">Supervisor</option>
        </select>
        <button type="submit">Ingresar</button>
        <p id="login-status"></p>
        <a href="#" id="forgot-link">¿Olvidaste tu contraseña?</a>
      </form>
      <div id="modal-reset" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;align-items:center;justify-content:center;background:#0008;">
        <div style="background:#fff;padding:2em;border-radius:.7em;max-width:350px;margin:auto;position:relative;">
          <button id="close-reset-modal" style="position:absolute;top:8px;right:8px;">&times;</button>
          <h3>Reestablecer Contraseña</h3>
          <form id="reset-form">
            <input type="email" id="reset-email" placeholder="Tu correo" required>
            <button type="submit">Enviar enlace</button>
            <p id="reset-status"></p>
          </form>
        </div>
      </div>
    </section>
  `,
  panel: `
    <div class="panel-area fade-panel">
      <div id="panel-content"></div>
    </div>
  `
};

// ---- SPA NAVIGATION + PANEL DEMOS ----
function renderSection(section) {
  showLoader();
  setTimeout(() => {
    document.getElementById("content").innerHTML = sectionHtml[section] || sectionHtml.home;
    hideLoader();
    if (section === "home") startHeroCarousel();
    if (section === "panel") {
      if (currentUser && currentUser.role) {
        iniciarPanel();
      } else {
        let html = `
          <div class="panel-welcome">
            ¡Bienvenido, <b>moderador@ejemplo.com</b>!
            <span class="panel-role">MODERADOR</span>
          </div>
          ${panelModeradorHTML()}
        `;
        document.getElementById('panel-content').innerHTML = html;
        cargarPanelModerador();
      }
    }
    if (section === "login") iniciarLoginForm && iniciarLoginForm();
    if (section === "testimonios") iniciarTestimonios && iniciarTestimonios();
    if (section === "contacto") iniciarContacto && iniciarContacto();
    if (section === "home") {
      const btn = document.getElementById("btn-iniciar-sesion");
      if (btn) btn.onclick = function(e) {
        e.preventDefault();
        document.querySelector('[data-section="login"]').click();
      };
    }
  }, 350);
}
function setupMenu() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      renderSection(section);
      window.scrollTo(0, 0);
      var menu = document.getElementById('main-menu');
      var burger = document.getElementById('hamburger-menu');
      if(window.innerWidth <= 900 && menu && burger){
        menu.classList.remove('active');
        burger.setAttribute('aria-label', "Abrir menú");
      }
    };
  });
  let modeBtn = document.getElementById('mode-toggle-btn');
  if (!modeBtn) {
    modeBtn = document.createElement('button');
    modeBtn.className = 'mode-toggle-btn';
    modeBtn.id = 'mode-toggle-btn';
    modeBtn.innerHTML = '🌙';
    document.querySelector('.nav-pro').appendChild(modeBtn);
  }
  modeBtn.onclick = function () {
    toggleTheme();
    modeBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    showToast(document.documentElement.getAttribute('data-theme') === 'dark'
      ? "Modo oscuro activado" : "Modo claro activado", "success");
  };
  modeBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  const logout = document.getElementById('logout-link');
  if (logout) {
    logout.onclick = (e) => {
      e.preventDefault();
      currentUser = null;
      updateMenu();
      showToast("Sesión cerrada", "success");
      renderSection('home');
    };
  }
}
function updateMenu() {
  document.getElementById('menu-login').style.display = currentUser ? 'none' : '';
  document.getElementById('menu-panel').style.display = currentUser ? '' : 'none';
  document.getElementById('menu-logout').style.display = currentUser ? '' : 'none';
}

// ---- Login y recuperación ----
function iniciarLoginForm() {
  const form = document.getElementById('login-form');
  const statusEl = document.getElementById('login-status');
  if (!form || !statusEl) return;
  form.onsubmit = e => {
    e.preventDefault();
    const email = form['email-login'].value.trim();
    const password = form['password-login'].value;
    const role = form['role-login'].value;
    statusEl.textContent = 'Verificando...';
    showLoader();
    fetch('login.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    })
      .then(res => res.json())
      .then(data => {
        hideLoader();
        if (data.success) {
          currentUser = data.user;
          statusEl.textContent = "¡Bienvenido!";
          updateMenu();
          showToast("Ingreso correcto", "success");
          setTimeout(() => renderSection('panel'), 700);
        } else {
          statusEl.textContent = data.message || "Credenciales incorrectas";
          showToast(data.message || "Credenciales incorrectas", "error");
        }
      })
      .catch(() => {
        hideLoader();
        statusEl.textContent = "Error de red.";
        showToast("Error de red", "error");
      });
  };

  const forgotLink = document.getElementById('forgot-link');
  const modal = document.getElementById('modal-reset');
  const closeBtn = document.getElementById('close-reset-modal');
  const resetForm = document.getElementById('reset-form');
  const resetStatus = document.getElementById('reset-status');
  if (!forgotLink || !modal || !closeBtn || !resetForm || !resetStatus) return;
  forgotLink.onclick = function (e) {
    e.preventDefault();
    modal.style.display = "flex";
    document.getElementById('reset-email').focus();
  };
  closeBtn.onclick = function () { modal.style.display = "none"; resetStatus.textContent = ""; resetForm.reset(); }
  modal.onclick = function (e) {
    if (e.target === modal) { modal.style.display = "none"; resetStatus.textContent = ""; resetForm.reset(); }
  }
  resetForm.onsubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    resetStatus.textContent = "Enviando enlace de recuperación...";
    showLoader();
    fetch('enviar_reset.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        hideLoader();
        resetStatus.textContent = data.success
          ? "Si tu correo está registrado, recibirás un enlace para reestablecer tu contraseña."
          : data.message || "No se pudo enviar el correo.";
        resetStatus.style.color = data.success ? "#0e72b5" : "#e14b4b";
        showToast(data.success ? "Enlace enviado a tu correo" : "No se pudo enviar el correo", data.success ? "success" : "error");
        if (data.success) resetForm.reset();
        setTimeout(() => { modal.style.display = "none"; resetStatus.textContent = ""; }, 2500);
      })
      .catch(() => {
        hideLoader();
        resetStatus.textContent = "Error de red.";
        showToast("Error de red", "error");
        resetStatus.style.color = "#e14b4b";
      });
  };
}

// ---- Testimonios ----
function iniciarTestimonios() {
  const list = document.getElementById('testimonios-list');
  const form = document.getElementById('form-testimonio');
  const status = document.getElementById('testimonio-status');
  if (!list || !form || !status) return;
  showLoader();
  fetch('listarTestimonios.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      if (data.success) {
        list.innerHTML = data.testimonios.map(t => `
          <div class="testimonial-block">
            <div class="test-author">
              <svg width="21" height="21" fill="none" stroke="#04344c" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 20A7.5 7.5 0 0112 13a7.5 7.5 0 016.5 7"/></svg>
              <span><b>${t.autor}</b></span>
            </div>
            <p>“${t.texto}”</p>
          </div>
        `).join('');
      } else {
        list.innerHTML = "<p>No hay testimonios todavía.</p>";
      }
    });
  form.onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById('test-nombre').value.trim();
    const texto = document.getElementById('test-texto').value.trim();
    if (nombre.length === 0 || texto.length === 0) return;
    showLoader();
    fetch('agregarTestimonio.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, texto })
    })
      .then(r => r.json())
      .then(data => {
        hideLoader();
        status.textContent = data.success ? "¡Gracias por tu testimonio!" : (data.message || "Error al guardar.");
        showToast(data.success ? "¡Testimonio enviado!" : "Error al guardar", data.success ? "success" : "error");
        form.reset();
        setTimeout(iniciarTestimonios, 800);
        setTimeout(() => { status.textContent = ""; }, 1800);
      });
  };
}

// ---- Contacto ----
function iniciarContacto() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form || !status) return;
  form.onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const mensaje = document.getElementById('contact-msg').value.trim();
    status.textContent = "Enviando...";
    status.style.color = "#04344c";
    showLoader();
    fetch('enviar_contacto.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, msg: mensaje })
    })
      .then(res => res.json())
      .then(data => {
        hideLoader();
        status.textContent = data.success ? "¡Gracias! Tu mensaje ha sido enviado." : "Hubo un error. Inténtalo de nuevo.";
        status.style.color = data.success ? "#0e72b5" : "#e14b4b";
        showToast(data.success ? "Mensaje enviado" : "Error al enviar", data.success ? "success" : "error");
        if (data.success) form.reset();
        setTimeout(() => { status.textContent = ""; }, 2500);
      })
      .catch(() => {
        hideLoader();
        status.textContent = "Hubo un error. Inténtalo de nuevo.";
        showToast("Error de red", "error");
        status.style.color = "#e14b4b";
      });
  };
}

// ---- Paneles PRO con barra de progreso ----
function iniciarPanel() {
  let html = `
    <div class="panel-welcome">
      ¡Bienvenido, <b>${currentUser.email}</b>!
      <span class="panel-role">${currentUser.role.toUpperCase()}</span>
    </div>
  `;
  if (currentUser.role === "admin") {
    html += `
      <div class="role-card admin">
        <div class="role-title"><span class="icon">⚙️</span> Panel Administrador</div>
        <div class="panel-tabs">
          <button id="btn-tab-mod" class="active">Moderadores</button>
          <button id="btn-tab-super">Supervisores</button>
          <button id="btn-tab-emp">Empresas</button>
          <button id="btn-tab-pas">Pasantes</button>
        </div>
        <div id="panel-mod" class="role-section"></div>
        <div id="panel-super" class="role-section" style="display:none"></div>
        <div id="panel-emp" class="role-section" style="display:none"></div>
        <div id="panel-pas" class="role-section" style="display:none"></div>
      </div>
    `;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelAdmin();
  }
  else if (currentUser.role === "moderador") {
    html += `<div class="role-card moderador">
      <div class="role-title"><span class="icon">🛡️</span> Panel Moderador</div>
      <div id="panel-moderador"></div>
    </div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelModerador();
  }
  else if (currentUser.role === "supervisor") {
    html += `<div class="role-card supervisor">
      <div class="role-title"><span class="icon">🧑‍🏫</span> Panel Supervisor</div>
      <div id="panel-supervisor"></div>
    </div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelSupervisor();
  }
  else if (currentUser.role === "pasante") {
    html += `<div class="role-card pasante">
      <div class="role-title"><span class="icon">📚</span> Panel Pasante</div>
      <div id="panel-pasante"></div>
    </div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelPasante();
  }
}

function cargarPanelAdmin() {
  const tabs = [
    {id:"btn-tab-mod", cont:"panel-mod", loader:cargarModeradores},
    {id:"btn-tab-super", cont:"panel-super", loader:cargarSupervisores},
    {id:"btn-tab-emp", cont:"panel-emp", loader:cargarEmpresas},
    {id:"btn-tab-pas", cont:"panel-pas", loader:cargarPasantes}
  ];
  tabs.forEach((tab,i) => {
    document.getElementById(tab.id).onclick = function() {
      tabs.forEach(t => {
        document.getElementById(t.cont).style.display = "none";
        document.getElementById(t.id).classList.remove("active");
      });
      document.getElementById(tab.cont).style.display = "block";
      document.getElementById(tab.id).classList.add("active");
      tab.loader();
    };
  });
  tabs[0].loader();
}
function cargarModeradores() {
  showLoader();
  fetch('listarModeradores.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const el = document.getElementById('panel-mod');
      if (data.success && Array.isArray(data.moderadores) && data.moderadores.length) {
        el.innerHTML = `<ul class="panel-list">${data.moderadores.map(m=>
          `<li><span class="panel-icon">🛡️</span> ${m.nombre} <span class="panel-label">${m.email}</span></li>`
        ).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay moderadores.</p>";
      }
    });
}
function cargarSupervisores() {
  showLoader();
  fetch('listarSupervisores.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const el = document.getElementById('panel-super');
      if (data.success && Array.isArray(data.supervisores) && data.supervisores.length) {
        el.innerHTML = `<ul class="panel-list">${data.supervisores.map(s=>
          `<li><span class="panel-icon">🧑‍🏫</span> ${s.nombre} <span class="panel-label">${s.email}</span></li>`
        ).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay supervisores.</p>";
      }
    });
}
function cargarEmpresas() {
  showLoader();
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const el = document.getElementById('panel-emp');
      if (data.success && Array.isArray(data.empresas) && data.empresas.length) {
        el.innerHTML = `<ul class="panel-list">${data.empresas.map(e=>
          `<li><span class="panel-icon">🏢</span> ${e.nombre} <span class="panel-label">${e.importancia}</span></li>`
        ).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay empresas.</p>";
      }
    });
}
function cargarPasantes() {
  showLoader();
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const el = document.getElementById('panel-pas');
      if (data.success && Array.isArray(data.pasantes) && data.pasantes.length) {
        el.innerHTML = `<ul class="panel-list">${data.pasantes.map(p=>
          `<li><span class="panel-icon">📚</span> ${p.nombre} <span class="panel-label">${p.email} — Horas: ${p.horas_totales}</span></li>`
        ).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay pasantes.</p>";
      }
    });
}
function cargarPanelSupervisor() {
  showLoader();
  fetch('listarPasantesSupervisor.php?email=' + encodeURIComponent(currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      hideLoader();
      const el = document.getElementById('panel-supervisor');
      if (data.success && Array.isArray(data.pasantes) && data.pasantes.length) {
        el.innerHTML = `<ul class="panel-list">${data.pasantes.map(p=>
          `<li><span class="panel-icon">📚</span> ${p.nombre} <span class="panel-label">${p.email} — ${p.horas_cumplidas}/${p.horas_totales} horas</span></li>`
        ).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No supervisas ningún pasante actualmente.</p>";
      }
    });
}
function cargarPanelPasante() {
  showLoader();
  fetch('listarPasantiaUsuario.php?email=' + encodeURIComponent(currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      hideLoader();
      const el = document.getElementById('panel-pasante');
      if (data.success && data.pasante) {
        const p = data.pasante;
        let percent = 0;
        if (parseFloat(p.horas_totales) > 0)
          percent = Math.min(100, Math.round((parseFloat(p.horas_cumplidas) / parseFloat(p.horas_totales)) * 100));
        el.innerHTML = `<ul class="panel-list">
          <li><span class="panel-icon">📛</span> <b>Nombre:</b> ${p.nombre}</li>
          <li><span class="panel-icon">✉️</span> <b>Email:</b> ${p.email}</li>
          <li><span class="panel-icon">📈</span> <b>Nota:</b> ${p.nota}</li>
          <li><span class="panel-icon">⏳</span> <b>Horas requeridas:</b> ${p.horas_totales}</li>
          <li><span class="panel-icon">✅</span> <b>Horas cumplidas:</b> ${p.horas_cumplidas}</li>
          <li><span class="panel-icon">🏢</span> <b>Empresa asignada:</b> ${p.asignado_empresa || "No asignada"}</li>
          <li><span class="panel-icon">📍</span> <b>Ubicación empresa:</b> ${p.ubicacion_empresa || "—"}</li>
        </ul>
        <div class="progress-section">
          <div class="progress-label">Progreso de pasantía</div>
          <div class="progress-bar"><div class="progress" style="width:0%">${percent}%</div></div>
        </div>`;
        setTimeout(() => {
          el.querySelector('.progress').style.width = percent + "%";
          el.querySelector('.progress').textContent = percent + "%";
        }, 80);
      } else {
        el.innerHTML = "<p>No se pudieron cargar tus datos.</p>";
      }
    });
}
// Donde tienes tu tabla/lista de pasantes (por ejemplo en cargarPanelPasantes o similar):
const html = `
  <div style="margin-bottom:1.3em;">
    <button class="panel-btn" id="descargar-pasantes-pdf">Descargar PDF Pasantes</button>
    <button class="panel-btn" id="descargar-pasantes-csv">Descargar CSV Pasantes</button>
  </div>
  <table>...tu tabla de pasantes...</table>
`;
document.getElementById('panel-pasantes').innerHTML = html;
document.getElementById('descargar-pasantes-pdf').onclick = function() {
  descargarPasantesPDF(datosPasantesPanel); // o el array JS que usas para la tabla
}
document.getElementById('descargar-pasantes-csv').onclick = function() {
  descargarPasantesCSV(datosPasantesPanel);
}

window.onload = function () {
  autoTheme();
  setupMenu();
  updateMenu();
  renderSection('home');
};
// ---- EXPORTAR PASANTES PDF/CSV (AGREGADO) ----
function descargarPasantesPDF(pasantes) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("No se pudo cargar jsPDF. ¿Tienes conexión a internet?", "error");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.text("Lista de Pasantes", 14, 18);
  const rows = pasantes.map(p => [
    p.nombre,
    p.email,
    p.anio || "",
    p.nota || "",
    p.horas_totales || "",
    p.horas_cumplidas || "",
    p.asignado_empresa || ""
  ]);
  if (doc.autoTable) {
    doc.autoTable({
      head: [["Nombre", "Email", "Año", "Nota", "Horas Totales", "Horas Cumplidas", "Empresa"]],
      body: rows,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] }
    });
  }
  doc.save("lista_pasantes.pdf");
}

function descargarPasantesCSV(pasantes) {
  let csv = "Nombre,Email,Año,Nota,Horas Totales,Horas Cumplidas,Empresa\n";
  pasantes.forEach(p => {
    csv += [
      p.nombre, p.email, p.anio||"", p.nota||"", p.horas_totales||"", p.horas_cumplidas||"", p.asignado_empresa||""
    ].map(v => `"${(v+'').replace(/"/g,'""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csv], {type: "text/csv"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "lista_pasantes.csv";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}