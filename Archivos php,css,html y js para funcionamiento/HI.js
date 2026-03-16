let currentUser = null;

const sectionHtml = {
  home: `
    <div class="home-hero" style="background:linear-gradient(120deg, #fffbe5 60%, #eaf2fb 100%);border-radius:2em;padding:2.4em 2em;box-shadow:0 4px 30px #ffd70015;display:flex;align-items:center;">
      <div class="home-hero-img" style="flex:0 0 200px;margin-right:2em;">
        <img src="https://cdn.pixabay.com/photo/2017/01/10/19/05/laptop-1976102_1280.png" alt="Ilustración Pasantía" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 6px 16px #00336622);"/>
      </div>
      <div class="home-hero-content" style="flex:1;">
        <h1 style="font-size:2.4em;font-weight:900;color:#003366;margin-bottom:0.2em;letter-spacing:.01em;line-height:1.1;">Gestiona tus <span style="color:#ffd700;">Pasantías</span> <br>de forma <span style="color:#ffd700;">profesional</span></h1>
        <h3 style="color:#506080;font-weight:500;margin-bottom:1.1em;">Plataforma simple y moderna para empresas, instituciones y estudiantes.</h3>
        <ul style="color:#003366;font-size:1.13em;margin-bottom:1em;">
          <li>✔ Gestión centralizada y seguimiento en tiempo real.</li>
          <li>✔ Reportes claros y automatización de asignaciones.</li>
          <li>✔ Soporte, notificaciones y control de horas cumplidas.</li>
        </ul>
        <a class="home-cta-btn" href="#" onclick="document.querySelector('[data-section=login]').click();return false;" style="background:linear-gradient(90deg,#ffd700 75%,#4f8cff 100%);color:#232323;border:none;border-radius:1.3em;font-weight:800;box-shadow:0 1px 8px #ffd70028;cursor:pointer;padding:1em 2.2em;font-size:1.15em;text-align:center;text-decoration:none;transition:background .2s,color .13s,transform .13s;">Iniciar sesión</a>
      </div>
    </div>
  `,
  servicios: `
    <section class="main-centered-section">
      <h2 style="color:#ab9000;">Servicios</h2>
      <div class="cards-pro">
        <div class="card-pro">
          <b>Gestión de Pasantías</b>
          <p>Registra, asigna y monitorea estudiantes y empresas de manera sencilla.</p>
        </div>
        <div class="card-pro">
          <b>Reportes Inteligentes</b>
          <p>Visualiza el avance y resultados de los programas con reportes claros.</p>
        </div>
        <div class="card-pro">
          <b>Automatización</b>
          <p>Procesos automáticos que ahorran tiempo y reducen errores.</p>
        </div>
      </div>
    </section>
  `,
  testimonios: `
    <section class="main-centered-section testimonios-section">
      <h2 style="color:#ab9000;">Testimonios</h2>
      <div id="testimonios-list"></div>
      <hr>
      <form id="form-testimonio" style="margin-top:1.3em;">
        <input type="text" id="test-nombre" placeholder="Tu nombre (o empresa)" required maxlength="50" />
        <textarea id="test-texto" placeholder="Tu testimonio sobre la plataforma" required maxlength="420" rows="3"></textarea>
        <button type="submit">Enviar Testimonio</button>
        <p id="testimonio-status"></p>
      </form>
    </section>
  `,
  contacto: `
    <section class="main-centered-section contacto-section">
      <h2 style="color:#ab9000;">Contacto / Soporte</h2>
      <form id="contact-form" style="max-width:420px;margin:0 auto;">
        <input type="text" id="contact-name" placeholder="Tu nombre" required maxlength="50" />
        <input type="email" id="contact-email" placeholder="Tu correo" required maxlength="60" />
        <input type="text" id="contact-tel" placeholder="Teléfono (opcional)" maxlength="20" />
        <textarea id="contact-msg" placeholder="Escribe tu mensaje" required maxlength="420" rows="3"></textarea>
        <button type="submit">Enviar Mensaje</button>
        <p id="contact-status"></p>
      </form>
    </section>
  `,
  faq: `
    <section class="main-centered-section faq-section">
      <h2 style="color:#ab9000;">Preguntas Frecuentes</h2>
      <div class="faq-list">
        <details class="faq-item">
          <summary>¿Cómo registro mi empresa?</summary>
          <p>Solicita acceso y sigue el proceso guiado desde el panel de control.</p>
        </details>
        <details class="faq-item">
          <summary>¿Puedo automatizar las asignaciones?</summary>
          <p>Sí, la plataforma sugiere las mejores coincidencias automáticamente.</p>
        </details>
        <details class="faq-item">
          <summary>¿Es seguro?</summary>
          <p>Trabajamos bajo buenas prácticas y cifrado de datos para tu tranquilidad.</p>
        </details>
      </div>
    </section>
  `,
  login: `
    <section class="main-centered-section">
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
    <section class="main-centered-section">
      <div id="panel-content"></div>
    </section>
  `
};

function renderSection(section) {
  document.getElementById("content").innerHTML = sectionHtml[section] || sectionHtml.home;
  if (section === "login") iniciarLoginForm();
  if (section === "testimonios") iniciarTestimonios();
  if (section === "contacto") iniciarContacto();
  if (section === "panel" && currentUser) iniciarPanel();
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
    };
  });
  const logout = document.getElementById('logout-link');
  if (logout) {
    logout.onclick = (e) => {
      e.preventDefault();
      currentUser = null;
      updateMenu();
      renderSection('home');
    };
  }
}
function updateMenu() {
  document.getElementById('menu-login').style.display = currentUser ? 'none' : '';
  document.getElementById('menu-panel').style.display = currentUser ? '' : 'none';
  document.getElementById('menu-logout').style.display = currentUser ? '' : 'none';
}

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
    fetch('login.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = data.user; // debe incluir {email, role}
          statusEl.textContent = "¡Bienvenido!";
          updateMenu();
          setTimeout(() => renderSection('panel'), 700);
        } else {
          statusEl.textContent = data.message || "Credenciales incorrectas";
        }
      })
      .catch(() => statusEl.textContent = "Error de red.");
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
    fetch('enviar_reset.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        resetStatus.textContent = data.success
          ? "Si tu correo está registrado, recibirás un enlace para reestablecer tu contraseña."
          : data.message || "No se pudo enviar el correo.";
        resetStatus.style.color = data.success ? "#00bb00" : "#d00000";
        if (data.success) resetForm.reset();
        setTimeout(() => { modal.style.display = "none"; resetStatus.textContent = ""; }, 2500);
      })
      .catch(() => {
        resetStatus.textContent = "Error de red.";
        resetStatus.style.color = "#d00000";
      });
  };
}

// TESTIMONIOS
function iniciarTestimonios() {
  const list = document.getElementById('testimonios-list');
  const form = document.getElementById('form-testimonio');
  const status = document.getElementById('testimonio-status');
  if (!list || !form || !status) return;
  fetch('listarTestimonios.php')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        list.innerHTML = data.testimonios.map(t => `
          <div class="testimonio-card">
            "${t.texto}"
            <span class="author">— ${t.autor}</span>
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
    fetch('agregarTestimonio.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, texto })
    })
      .then(r => r.json())
      .then(data => {
        status.textContent = data.success ? "¡Gracias por tu testimonio!" : (data.message || "Error al guardar.");
        form.reset();
        setTimeout(iniciarTestimonios, 800);
        setTimeout(() => { status.textContent = ""; }, 2000);
      });
  };
}

// CONTACTO
function iniciarContacto() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form || !status) return;
  form.onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const tel = document.getElementById('contact-tel').value.trim();
    const mensaje = document.getElementById('contact-msg').value.trim();
    status.textContent = "Enviando...";
    status.style.color = "#ab9000";
    fetch('enviar_contacto.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, tel, msg: mensaje })
    })
      .then(res => res.json())
      .then(data => {
        status.textContent = data.success ? "¡Gracias! Tu mensaje ha sido enviado." : "Hubo un error. Inténtalo de nuevo.";
        status.style.color = data.success ? "#00bb00" : "#d00000";
        if (data.success) form.reset();
        setTimeout(() => { status.textContent = ""; }, 3500);
      })
      .catch(() => {
        status.textContent = "Hubo un error. Inténtalo de nuevo.";
        status.style.color = "#d00000";
      });
  };
}

// PANEL SEGÚN ROL
function iniciarPanel() {
  let html = `<div class="panel-welcome">¡Bienvenido, <b>${currentUser.email}</b>! <span class="panel-role">${currentUser.role.toUpperCase()}</span></div>`;
  if (currentUser.role === "admin") {
    html += `
      <div class="role-card">
        <div class="role-title">Panel Administrador</div>
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
    html += `<div class="role-card"><div class="role-title">Panel Moderador</div>
      <div id="panel-moderador"></div></div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelModerador();
  }
  else if (currentUser.role === "supervisor") {
    html += `<div class="role-card"><div class="role-title">Panel Supervisor</div>
      <div id="panel-supervisor"></div></div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelSupervisor();
  }
  else if (currentUser.role === "pasante") {
    html += `<div class="role-card"><div class="role-title">Panel Pasante</div>
      <div id="panel-pasante"></div></div>`;
    document.getElementById('panel-content').innerHTML = html;
    cargarPanelPasante();
  }
}

// FUNCIONES DE CARGA DE PANELES (AJUSTA LOS PHP A TU BACKEND)
function cargarPanelAdmin() {
  // Tabs
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
  fetch('listarModeradores.php')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('panel-mod');
      if (data.success) {
        el.innerHTML = `<b>Moderadores:</b><ul>${data.moderadores.map(m=>`<li>${m.nombre} (${m.email})</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay moderadores.</p>";
      }
    });
}
function cargarSupervisores() {
  fetch('listarSupervisores.php')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('panel-super');
      if (data.success) {
        el.innerHTML = `<b>Supervisores:</b><ul>${data.supervisores.map(s=>`<li>${s.nombre} (${s.email})</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay supervisores.</p>";
      }
    });
}
function cargarEmpresas() {
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('panel-emp');
      if (data.success) {
        el.innerHTML = `<b>Empresas:</b><ul>${data.empresas.map(e=>`<li>${e.nombre} (${e.importancia})</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay empresas.</p>";
      }
    });
}
function cargarPasantes() {
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('panel-pas');
      if (data.success) {
        el.innerHTML = `<b>Pasantes:</b><ul>${data.pasantes.map(p=>`<li>${p.nombre} (${p.email}) - Horas: ${p.horas_totales}</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = "<p>No hay pasantes.</p>";
      }
    });
}
function cargarPanelModerador() {
  fetch('listarEmpresas.php')
    .then(r=>r.json())
    .then(data=>{
      const el = document.getElementById('panel-moderador');
      el.innerHTML = "<b>Empresas:</b><ul>" + (data.success ? data.empresas.map(e=>`<li>${e.nombre} (${e.importancia})</li>`).join('') : "No hay empresas.") + "</ul>";
    });
}
function cargarPanelSupervisor() {
  fetch('listarPasantesSupervisor.php?email=' + encodeURIComponent(currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      const el = document.getElementById('panel-supervisor');
      if (data.success && data.pasantes.length) {
        el.innerHTML = `<b>Tus pasantes:</b><ul>` + data.pasantes.map(p=>`<li>${p.nombre} (${p.email}) - Horas: ${p.horas_cumplidas}/${p.horas_totales}</li>`).join('') + "</ul>";
      } else {
        el.innerHTML = "<p>No supervisas ningún pasante actualmente.</p>";
      }
    });
}
function cargarPanelPasante() {
  fetch('listarPasantiaUsuario.php?email=' + encodeURIComponent(currentUser.email))
    .then(r=>r.json())
    .then(data=>{
      const el = document.getElementById('panel-pasante');
      if (data.success) {
        const p = data.pasante;
        el.innerHTML = `<div>
        <b>Nombre:</b> ${p.nombre}<br>
        <b>Email:</b> ${p.email}<br>
        <b>Nota:</b> ${p.nota}<br>
        <b>Horas requeridas:</b> ${p.horas_totales}<br>
        <b>Horas cumplidas:</b> ${p.horas_cumplidas}<br>
        <b>Empresa asignada:</b> ${p.asignado_empresa || "No asignada"}<br>
        <b>Ubicación empresa:</b> ${p.ubicacion_empresa || "—"}
        </div>`;
      } else {
        el.innerHTML = "<p>No se pudieron cargar tus datos.</p>";
      }
    });
}

window.onload = function () {
  setupMenu();
  updateMenu();
  renderSection('home');
};