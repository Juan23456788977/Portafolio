// Main.js - SPA funcional para gestión de pasantías

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
        
        // ✅ CORRECCIÓN 1: Se verifica si el elemento existe antes de modificarlo.
        const panelContentElement = document.getElementById('panel-content');
        if (panelContentElement) {
          panelContentElement.innerHTML = html;
          cargarPanelModerador();
        } else {
          console.error("Error: No se encontró el elemento 'panel-content'.");
        }
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
    const nav = document.querySelector('.nav-pro');
    if (nav) nav.appendChild(modeBtn);
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
  const ml = document.getElementById('menu-login');
  const mp = document.getElementById('menu-panel');
  const mo = document.getElementById('menu-logout');
  if (ml) ml.style.display = currentUser ? 'none' : '';
  if (mp) mp.style.display = currentUser ? '' : 'none';
  if (mo) mo.style.display = currentUser ? '' : 'none';
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
          // Keep window.currentUser globally accessible for other scripts
          window.currentUser = currentUser;
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
    }).catch(()=>{ hideLoader(); list.innerHTML = "<p>Error cargando testimonios.</p>";});
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
      }).catch(()=>{ hideLoader(); showToast("Error de red", "error"); });
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
      .then((data) => {
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

// ---- Paneles PRO con barra de progreso y administracion completa ----
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

// ---- ADMIN PANEL: formularios, listados y handlers ----
function cargarPanelAdmin() {
  const tabs = [
    {id:"btn-tab-mod", cont:"panel-mod", loader:cargarModeradores},
    {id:"btn-tab-super", cont:"panel-super", loader:cargarSupervisores},
    {id:"btn-tab-emp", cont:"panel-emp", loader:cargarEmpresasAdmin},
    {id:"btn-tab-pas", cont:"panel-pas", loader:cargarPasantesAdmin}
  ];

  // Insertar formularios y listados
  const modEl = document.getElementById('panel-mod');
  const supEl = document.getElementById('panel-super');
  const empEl = document.getElementById('panel-emp');
  const pasEl = document.getElementById('panel-pas');
  if (modEl) modEl.innerHTML = `
    <h3>Agregar Moderador</h3>
    <form id="form-registrar-moderador">
      <input type="text" id="mod-nombre-moderador" placeholder="Nombre completo" required />
      <input type="email" id="mod-email-moderador" placeholder="Correo electrónico" required />
      <input type="password" id="mod-password-moderador" placeholder="Contraseña" required />
      <button type="submit">Agregar Moderador</button>
      <span id="status-registrar-moderador"></span>
    </form>
    <h4>Listado de Moderadores</h4>
    <ul id="listado-moderadores"></ul>
  `;
  if (supEl) supEl.innerHTML = `
    <h3>Agregar Supervisor</h3>
    <form id="form-registrar-supervisor">
      <input type="text" id="mod-nombre-supervisor" placeholder="Nombre completo" required />
      <input type="email" id="mod-email-supervisor" placeholder="Correo electrónico" required />
      <input type="password" id="mod-password-supervisor" placeholder="Contraseña" required />
      <button type="submit">Agregar Supervisor</button>
      <span id="status-registrar-supervisor"></span>
    </form>
    <h4>Listado de Supervisores</h4>
    <ul id="listado-supervisores"></ul>
  `;
  if (empEl) empEl.innerHTML = `
    <h3>Agregar Empresa</h3>
    <form id="form-registrar-empresa-admin">
      <input type="text" id="admin-nombre-empresa" placeholder="Nombre de empresa" required />
      <input type="text" id="admin-importancia-empresa" placeholder="Importancia" required />
      <input type="text" id="admin-ubicacion-empresa" placeholder="Ubicación" required />
      <button type="submit">Agregar Empresa</button>
      <span id="status-registrar-empresa-admin"></span>
    </form>
    <h4>Listado de Empresas</h4>
    <ul id="listado-empresas-admin"></ul>
  `;
  if (pasEl) pasEl.innerHTML = `
    <h3>Agregar Pasante</h3>
    <form id="form-registrar-pasante-admin">
      <input type="text" id="admin-nombre-pasante" placeholder="Nombre completo" required />
      <input type="email" id="admin-email-pasante" placeholder="Correo electrónico" required />
      <input type="password" id="admin-password-pasante" placeholder="Contraseña" required />
      <button type="submit">Agregar Pasante</button>
      <span id="status-registrar-pasante-admin"></span>
    </form>
    <h4>Listado de Pasantes</h4>
    <ul id="listado-pasantes-admin"></ul>
  `;

  // Inicializar pestañas
  tabs.forEach((tab) => {
    const btn = document.getElementById(tab.id);
    if (!btn) return;
    btn.onclick = function() {
      tabs.forEach(t => {
        const contEl = document.getElementById(t.cont);
        if (contEl) contEl.style.display = "none";
        const btnEl = document.getElementById(t.id);
        if (btnEl) btnEl.classList.remove("active");
      });
      const cont = document.getElementById(tab.cont);
      if (cont) cont.style.display = "block";
      btn.classList.add("active");
      if (typeof tab.loader === 'function') tab.loader();
    };
  });

  // Formularios: registrar moderador
  const modForm = document.getElementById('form-registrar-moderador');
  if (modForm) modForm.onsubmit = function(e) {
    e.preventDefault();
    fetch('registrarModerador.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        nombre: document.getElementById('mod-nombre-moderador').value,
        email: document.getElementById('mod-email-moderador').value,
        password: document.getElementById('mod-password-moderador').value
      })
    }).then(r=>r.json()).then(d=>{
      document.getElementById('status-registrar-moderador').textContent = d.message || (d.success ? 'Creado' : 'Error');
      if (d.success) modForm.reset();
      cargarModeradores();
    }).catch(()=>showToast('Error de red', 'error'));
  };

  // registrar supervisor
  const supForm = document.getElementById('form-registrar-supervisor');
  if (supForm) supForm.onsubmit = function(e) {
    e.preventDefault();
    fetch('registrarSupervisor.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        nombre: document.getElementById('mod-nombre-supervisor').value,
        email: document.getElementById('mod-email-supervisor').value,
        password: document.getElementById('mod-password-supervisor').value
      })
    }).then(r=>r.json()).then(d=>{
      document.getElementById('status-registrar-supervisor').textContent = d.message || (d.success ? 'Creado' : 'Error');
      if (d.success) supForm.reset();
      cargarSupervisores();
    }).catch(()=>showToast('Error de red', 'error'));
  };

  // registrar empresa (admin)
  const empForm = document.getElementById('form-registrar-empresa-admin');
  if (empForm) empForm.onsubmit = function(e) {
    e.preventDefault();
    fetch('registrarEmpresa.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        nombre: document.getElementById('admin-nombre-empresa').value,
        importancia: document.getElementById('admin-importancia-empresa').value,
        ubicacion: document.getElementById('admin-ubicacion-empresa').value
      })
    }).then(r=>r.json()).then(d=>{
      document.getElementById('status-registrar-empresa-admin').textContent = d.message || (d.success ? 'Creado' : 'Error');
      if (d.success) empForm.reset();
      cargarEmpresasAdmin();
    }).catch(()=>showToast('Error de red', 'error'));
  };

  // registrar pasante (admin)
  const pasForm = document.getElementById('form-registrar-pasante-admin');
  if (pasForm) pasForm.onsubmit = function(e) {
    e.preventDefault();
    fetch('registrarPasante.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        nombre: document.getElementById('admin-nombre-pasante').value,
        email: document.getElementById('admin-email-pasante').value,
        password: document.getElementById('admin-password-pasante').value
      })
    }).then(r=>r.json()).then(d=>{
      document.getElementById('status-registrar-pasante-admin').textContent = d.message || (d.success ? 'Creado' : 'Error');
      if (d.success) pasForm.reset();
      cargarPasantesAdmin();
    }).catch(()=>showToast('Error de red', 'error'));
  };

  // Delegación de eventos para botones Editar/Eliminar dentro de listados (supervisores, pasantes)
  const supList = document.getElementById('listado-supervisores');
  if (supList) {
    supList.onclick = function(e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains('edit-supervisor')) {
        editarSupervisorPrompt(id);
      } else if (btn.classList.contains('delete-supervisor')) {
        eliminarSupervisor(id);
      }
    };
  }
  const pasList = document.getElementById('listado-pasantes-admin');
  if (pasList) {
    pasList.onclick = function(e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains('edit-pasante')) {
        editarPasantePrompt(id);
      } else if (btn.classList.contains('delete-pasante')) {
        eliminarPasante(id);
      }
    };
  }

  // Cargar la primera pestaña por defecto
  const firstTab = tabs[0];
  if (firstTab && typeof firstTab.loader === 'function') firstTab.loader();
}

// ---- CARGAR LISTADOS (consumir endpoints) ----
function cargarModeradores() {
  showLoader();
  fetch('listarModeradores.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const ul = document.getElementById('listado-moderadores');
      if (!ul) return;
      if (data.success && Array.isArray(data.moderadores)) {
        ul.innerHTML = data.moderadores.map(m => `<li>${m.nombre} — ${m.email}</li>`).join('');
      } else {
        ul.innerHTML = "<li>No hay moderadores.</li>";
      }
    }).catch(()=>{ hideLoader(); });
}
function cargarSupervisores() {
  showLoader();
  fetch('listarSupervisores.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      if (data.success) {
        // Renderiza la lista de supervisores en el DOM
        let html = '';
        data.supervisores.forEach(sup => {
          html += `<li>${sup.nombre} (${sup.email}) - ${sup.empresa || 'Sin empresa'}
            <button onclick="editarSupervisorPrompt(${sup.id})">Editar</button>
            <button onclick="eliminarSupervisor(${sup.id})">Eliminar</button>
          </li>`;
        });
        document.getElementById('listado-supervisores').innerHTML = html;
      } else {
        showToast('Error al cargar supervisores', 'error');
      }
    })
    .catch(() => {
      hideLoader();
      showToast('Error de red', 'error');
    });
}
function cargarEmpresasAdmin() {
  showLoader();
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const ul = document.getElementById('listado-empresas-admin');
      if (!ul) return;
      if (data.success && Array.isArray(data.empresas)) {
        ul.innerHTML = data.empresas.map(emp =>
          `<li><b>${emp.nombre}</b> (${emp.importancia})<br><span style="font-size:.95em;color:#555;">${emp.ubicacion}</span></li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay empresas.</li>";
      }
    }).catch(()=>hideLoader());
}
function cargarPasantesAdmin() {
  showLoader();
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      hideLoader();
      const ul = document.getElementById('listado-pasantes-admin');
      if (!ul) return;
      if (data.success && Array.isArray(data.pasantes)) {
        ul.innerHTML = data.pasantes.map(p =>
          `<li><b>${p.nombre}</b> — ${p.email}
            <div class="small-actions">
              <button class="panel-btn edit-pasante" data-id="${p.id}">Editar</button>
              <button class="panel-btn delete-pasante" data-id="${p.id}">Eliminar</button>
            </div>
          </li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay pasantes.</li>";
      }
    }).catch(()=>hideLoader());
}

// ---- EDITAR / ELIMINAR (prompts + endpoints) ----
function editarSupervisorPrompt(id) {
  if (!id) return;
  // Obtener datos actuales (puedes adaptar para obtener por endpoint si lo prefieres)
  fetch('getSupervisor.php?id=' + encodeURIComponent(id))
    .then(r => r.json())
    .then(data => {
      if (!data.success) return showToast('No se encontró supervisor', 'error');
      const sup = data.supervisor;
      const nuevoNombre = prompt('Nuevo nombre:', sup.nombre);
      const nuevoEmail = prompt('Nuevo email:', sup.email);
      if (nuevoNombre && nuevoEmail) {
        fetch('editarSupervisor.php', {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id, nombre: nuevoNombre, email: nuevoEmail })
        }).then(r=>r.json()).then(d=>{
          showToast(d.message || 'Guardado', d.success ? 'success' : 'error');
          cargarSupervisores();
        }).catch(()=>showToast('Error de red','error'));
      }
    }).catch(()=>showToast('Error al cargar supervisor','error'));
}
function eliminarSupervisor(id) {
  if (!id) return;
  if (!confirm('¿Seguro que deseas eliminar este supervisor?')) return;
  fetch('eliminarSupervisor.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ id })
  }).then(r=>r.json()).then(d=>{
    showToast(d.message || 'Eliminado', d.success ? 'success' : 'error');
    cargarSupervisores();
  }).catch(()=>showToast('Error de red','error'));
}
function editarPasantePrompt(id) {
  if (!id) return;
  fetch('getPasante.php?id=' + encodeURIComponent(id))
    .then(r=>r.json())
    .then(data=>{
      if (!data.success) return showToast('No se encontró pasante', 'error');
      const p = data.pasante;
      const nuevoNombre = prompt('Nuevo nombre:', p.nombre);
      const nuevoEmail = prompt('Nuevo email:', p.email);
      if (nuevoNombre && nuevoEmail) {
        fetch('editarPasante.php', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id, nombre: nuevoNombre, email: nuevoEmail })
        }).then(r=>r.json()).then(d=>{
          showToast(d.message || 'Guardado', d.success ? 'success' : 'error');
          cargarPasantesAdmin();
        }).catch(()=>showToast('Error de red','error'));
      }
    }).catch(()=>showToast('Error al cargar pasante','error'));
}
function eliminarPasante(id) {
  if (!id) return;
  if (!confirm('¿Seguro que deseas eliminar este pasante?')) return;
  fetch('eliminarPasante.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ id })
  }).then(r=>r.json()).then(d=>{
    showToast(d.message || 'Eliminado', d.success ? 'success' : 'error');
    cargarPasantesAdmin();
  }).catch(()=>showToast('Error de red','error'));
}

// ---- MODERADOR PANEL (Demo ya existente) ----
function cargarPanelModerador() {
  showLoader();
  setTimeout(() => {
    hideLoader();
    // si quieres usar datos reales -> fetch listarPasantes.php, listarEmpresas.php
    cargarPasantesModerador();
    cargarEmpresasModerador();
  }, 400);
}
function cargarPasantesModerador() {
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('tabla-moderador') || document.getElementById('listado-pasantes-moderador');
      if (!ul) return;
      if (data.success && Array.isArray(data.pasantes)) {
        ul.innerHTML = `<ul class="panel-list">${data.pasantes.map(p=>
          `<li><span class="panel-icon">📚</span> ${p.nombre} <span class="panel-label">${p.email} — Nota: ${p.nota || '-'} — Horas: ${p.horas_totales || '-'}</span></li>`
        ).join('')}</ul>`;
      } else {
        ul.innerHTML = "<p>No hay pasantes.</p>";
      }
    }).catch(()=>{/*noop*/});
}
function cargarEmpresasModerador() {
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-empresas-moderador') || document.getElementById('tabla-moderador');
      if (!ul) return;
      if (data.success && Array.isArray(data.empresas)) {
        ul.innerHTML = `<ul class="panel-list">${data.empresas.map(emp=>
          `<li><span class="panel-icon">🏢</span> ${emp.nombre} <span class="panel-label">${emp.importancia}</span></li>`
        ).join('')}</ul>`;
      } else {
        ul.innerHTML = "<p>No hay empresas.</p>";
      }
    }).catch(()=>{/*noop*/});
}

// ---- SUPERVISOR / PASANTE PANELS ----
function cargarPanelSupervisor() {
  showLoader();
  fetch('listarPasantesSupervisor.php?email=' + encodeURIComponent(currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      hideLoader();
      const el = document.getElementById('panel-supervisor');
      if (!el) return;
      if (data.success && Array.isArray(data.pasantes) && data.pasantes.length) {
        el.innerHTML = data.pasantes.map(pas =>
          `<div class="card-pro" style="margin-bottom:1em;">
            <b>${pas.nombre}</b> (${pas.email})<br>
            <b>Horas cumplidas:</b> ${pas.horas_cumplidas} / ${pas.horas_totales}<br>
            <div id="evaluacion-pasante-${pas.id}"></div>
          </div>`
        ).join('');
        // Render evaluations for each pasante
        data.pasantes.forEach(p => {
          if (typeof mostrarEvaluacionPasante === 'function') mostrarEvaluacionPasante(p.id);
        });
        // Load chat area for supervisors
        renderSupervisorChatArea();
      } else {
        el.innerHTML = "<p>No supervisas ningún pasante actualmente.</p>";
      }
    }).catch(err=>{
      hideLoader();
      console.error('Error en cargarPanelSupervisor:', err);
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
          const pr = el.querySelector('.progress');
          if (pr) { pr.style.width = percent + "%"; pr.textContent = percent + "%"; }
        }, 80);
      } else {
        el.innerHTML = "<p>No se pudieron cargar tus datos.</p>";
      }
    }).catch(()=>{ hideLoader(); });
}

// ---- CHAT ENTRE SUPERVISORES ----
function renderSupervisorChatArea() {
  const cont = document.getElementById('panel-supervisor');
  if (!cont) return;
  // Append chat container at the end
  const chatWrap = document.createElement('div');
  chatWrap.id = 'chat-supervisores-wrap';
  chatWrap.innerHTML = `
    <h4>Chat entre Supervisores</h4>
    <div id="chat-supervisores"></div>
  `;
  cont.appendChild(chatWrap);
  cargarChatSupervisores();
}
function cargarChatSupervisores() {
  fetch('listarSupervisores.php').then(r => r.json()).then(data=>{
    const chatDiv = document.getElementById('chat-supervisores');
    if (!chatDiv) return;
    if (!data.success) { chatDiv.innerHTML = "<p>No hay supervisores registrados</p>"; return; }
    chatDiv.innerHTML = `
      <select id="destinatario-supervisor">
        ${data.supervisores.map(s=>`<option value="${s.email}">${s.nombre}</option>`).join('')}
      </select>
      <textarea id="mensaje-supervisor" placeholder="Escribe tu mensaje" rows="3"></textarea>
      <button id="btn-enviar-mensaje-supervisor">Enviar</button>
      <div id="mensajes-supervisor" style="margin-top:.8em;max-height:200px;overflow:auto;border-top:1px solid #eee;padding-top:.6em;"></div>
    `;
    const btn = document.getElementById('btn-enviar-mensaje-supervisor');
    if (btn) btn.onclick = enviarMensajeSupervisor;
    cargarMensajesSupervisor();
    // Poll messages every 6s
    if (window._supMsgInterval) clearInterval(window._supMsgInterval);
    window._supMsgInterval = setInterval(cargarMensajesSupervisor, 6000);
  }).catch(()=>{/*no-op*/});
}
function enviarMensajeSupervisor() {
  const destinatario = document.getElementById('destinatario-supervisor')?.value;
  const mensaje = document.getElementById('mensaje-supervisor')?.value;
  if (!destinatario || !mensaje || !window.currentUser) return showToast('Faltan datos para enviar', 'error');
  fetch('mensajesSupervisor.php', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinatario, mensaje, emisor: window.currentUser.email })
  }).then(r=>r.json()).then(data=>{
    if (data.success) {
      document.getElementById('mensaje-supervisor').value = '';
      cargarMensajesSupervisor();
    } else showToast(data.message || 'No enviado', 'error');
  }).catch(()=>showToast('Error de red','error'));
}
function cargarMensajesSupervisor() {
  if (!window.currentUser) return;
  fetch('mensajesSupervisor.php?recibidos=1&emisor=' + encodeURIComponent(window.currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      const div = document.getElementById('mensajes-supervisor');
      if (!div) return;
      if (data.success && Array.isArray(data.mensajes)) {
        div.innerHTML = data.mensajes.map(m=>
          `<div style="padding:.35em 0;border-bottom:1px dashed #eee;"><b>${m.emisor}</b>: ${m.texto} <small style="color:#666;margin-left:.6em;">${m.fecha}</small></div>`
        ).join('');
      } else {
        div.innerHTML = "<div>No hay mensajes.</div>";
      }
    }).catch(()=>{/*noop*/});
}

// ---- EVALUACIÓN DE PASANTES ----
function mostrarEvaluacionPasante(pasanteId) {
  const evalDiv = document.getElementById(`evaluacion-pasante-${pasanteId}`);
  if (!evalDiv) return;
  fetch(`getEvaluacionPasante.php?id=${encodeURIComponent(pasanteId)}`)
    .then(r=>r.json())
    .then(data=>{
      const nota = (data && data.nota) ? data.nota : '';
      const comentario = (data && data.comentario) ? data.comentario : '';
      evalDiv.innerHTML = `
        <div style="margin-top:.5em;">
          <label style="display:block;margin-bottom:.25em;">Calificación final:</label>
          <input type="number" min="0" max="20" id="nota-final-${pasanteId}" value="${nota}">
          <label style="display:block;margin-top:.6em;margin-bottom:.25em;">Comentario:</label>
          <textarea id="comentario-final-${pasanteId}" rows="2">${comentario}</textarea>
          <div style="margin-top:.6em;">
            <button class="panel-btn" onclick="guardarEvaluacionPasante('${pasanteId}')">Guardar evaluación</button>
          </div>
        </div>
      `;
    }).catch(()=>{ evalDiv.innerHTML = "<div>Error cargando evaluación</div>"; });
}
function guardarEvaluacionPasante(pasanteId) {
  const nota = document.getElementById(`nota-final-${pasanteId}`)?.value;
  const comentario = document.getElementById(`comentario-final-${pasanteId}`)?.value;
  if (!pasanteId) return;
  fetch('guardarEvaluacionPasante.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ pasanteId, nota, comentario, evaluador: window.currentUser?.email || '' })
  }).then(r=>r.json()).then(d=>{
    showToast(d.message || 'Evaluación guardada', d.success ? 'success' : 'error');
    if (d.success) {
      // Optionally refresh pasantía info
      if (currentUser && currentUser.role === 'supervisor') cargarPanelSupervisor();
    }
  }).catch(()=>showToast('Error de red','error'));
}

// ---- CARGAR LISTADOS GENERALES (alias para compatibilidad) ----
function cargarEmpresas() { return cargarEmpresasAdmin(); }
function cargarPasantes() { return cargarPasantesAdmin(); }

// ---- INICIALIZACIÓN GLOBAL ----
window.onload = function () {
  autoTheme();
  setupMenu();
  updateMenu();
  renderSection('home');
  window.currentUser = currentUser;
};

// Subir foto de supervisor
const formFoto = document.getElementById('form-foto-supervisor');
if (formFoto) {
  formFoto.onsubmit = async function(e) {
    e.preventDefault();
    const data = new FormData(formFoto);
    const res = await fetch('subirFotoSupervisor.php', { method: 'POST', body: data });
    const json = await res.json();
    if(json.success) {
      showToast('Foto subida correctamente');
      // Actualiza la imagen de perfil si es necesario
    } else {
      showToast(json.message, 'error');
    }
  };
}

/*
// ✅ CORRECCIÓN 2: Se comenta el bloque de código problemático.
// Este fragmento parecía ser un ejemplo incompleto y causaba un error.

// Formulario de edición de moderador
// Si necesitas mostrar este formulario, agrégalo dinámicamente al DOM usando JavaScript, por ejemplo:
 document.getElementById('algún-contenedor').innerHTML = `
  <form id="form-editar-moderador">
     <input type="hidden" name="id" id="moderador-id">
     <input type="text" name="nombre" id="moderador-nombre" placeholder="Nombre" required>
    <input type="email" name="email" id="moderador-email" placeholder="Email" required>
     <button type="submit">Guardar cambios</button>
   </form>
   <button id="btn-eliminar-moderador" style="background:#e14b4b;color:#fff;">Eliminar moderador</button>
 `;
}
*/