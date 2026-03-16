let currentUser = null;

// ================== HTML SECTIONS =====================
const sectionHtml = {
  home: `
    <div class="home-hero" style="background:linear-gradient(120deg, #fffbe5 60%, #eaf2fb 100%);border-radius:2em;padding:2.4em 2em;box-shadow:0 4px 30px #ffd70015;">
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
};
// ================== SPA RENDER ========================
function renderSection(section) {
  document.getElementById("content").innerHTML = sectionHtml[section] || sectionHtml.home;
  if (section === "login") iniciarLoginForm();
  if (section === "testimonios") iniciarTestimonios();
  if (section === "contacto") iniciarContacto();
  if (section === "panel" && currentUser) {
    document.getElementById("panel-section").innerHTML = panelHtml[currentUser.role] || "<p>Panel no disponible.</p>";
    if (currentUser.role === "admin") iniciarAdminArea();
    if (currentUser.role === "moderador") iniciarModTabs();
    if (currentUser.role === "pasante") mostrarDatosPasante();
    if (currentUser.role === "supervisor") iniciarSupervisorPanel();
  }
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

// ================== LOGIN Y RECUPERAR CLAVE =================
function iniciarLoginForm() {
  const form = document.getElementById('login-form');
  const statusEl = document.getElementById('login-status');
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
          currentUser = data.user;
          statusEl.textContent = "¡Bienvenido!";
          updateMenu();
          setTimeout(() => renderSection('panel'), 700);
        } else {
          statusEl.textContent = data.message || "Credenciales incorrectas";
        }
      })
      .catch(() => statusEl.textContent = "Error de red.");
  };

  // ---- REESTABLECER CONTRASEÑA ----
  const forgotLink = document.getElementById('forgot-link');
  const modal = document.getElementById('modal-reset');
  const closeBtn = document.getElementById('close-reset-modal');
  const resetForm = document.getElementById('reset-form');
  const resetStatus = document.getElementById('reset-status');
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

// ================== TESTIMONIOS =======================
function iniciarTestimonios() {
  const list = document.getElementById('testimonios-list');
  const form = document.getElementById('form-testimonio');
  const status = document.getElementById('testimonio-status');
  let testimonios = [
    { texto: "El sistema hizo mucho más fácil controlar las pasantías.", autor: "Empresa XYZ" },
    { texto: "Me notificaron cada etapa del proceso, ¡excelente!", autor: "Juan P." }
  ];
  function renderTestimonios() {
    list.innerHTML = testimonios.map(t => `
      <div class="testimonio-card">
        "${t.texto}"
        <span class="author">— ${t.autor}</span>
      </div>
    `).join('');
  }
  renderTestimonios();
  form.onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById('test-nombre').value.trim();
    const texto = document.getElementById('test-texto').value.trim();
    if (nombre.length === 0 || texto.length === 0) return;
    testimonios.push({ autor: nombre, texto: texto });
    status.textContent = "¡Gracias por tu testimonio!";
    form.reset();
    renderTestimonios();
    setTimeout(() => { status.textContent = ""; }, 2000);
  };
}

// ========== PANEL ADMIN: MODERADORES/SUPERVISORES/EMPRESAS/PASANTES ==========
function iniciarAdminArea() {
  const tabs = document.querySelectorAll('.panel-tabs button');
  const panelMod = document.getElementById('panel-mod');
  const panelSuper = document.getElementById('panel-supervisores');
  const panelEmp = document.getElementById('panel-empresas');
  const panelPas = document.getElementById('panel-pasantes');
  tabs.forEach(btn => btn.onclick = function () {
    tabs.forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    panelMod.style.display = (this.dataset.tab === "mod") ? "block" : "none";
    panelSuper.style.display = (this.dataset.tab === "supervisores") ? "block" : "none";
    panelEmp.style.display = (this.dataset.tab === "empresas") ? "block" : "none";
    panelPas.style.display = (this.dataset.tab === "pasantes") ? "block" : "none";
  });

  // Agregar moderador
  const formMod = document.getElementById('form-agregar-moderador');
  const statusMod = document.getElementById('admin-status-mod');
  formMod.onsubmit = e => {
    e.preventDefault();
    const nombre = document.getElementById('admin-nombre-moderador').value;
    const email = document.getElementById('admin-email-moderador').value;
    const password = document.getElementById('admin-password-moderador').value;
    fetch('registrarPasante.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre, email, password, role: "moderador"
      })
    })
      .then(res => res.json())
      .then(data => {
        statusMod.textContent = data.message || (data.success ? "Moderador agregado" : "No se pudo agregar");
        if (data.success) formMod.reset();
        cargarModeradores();
        setTimeout(() => { statusMod.textContent = ""; }, 1800);
      });
  };
  cargarModeradores();

  // Agregar supervisor
  const formSuper = document.getElementById('form-agregar-supervisor');
  const statusSuper = document.getElementById('admin-status-supervisor');
  formSuper.onsubmit = e => {
    e.preventDefault();
    const nombre = document.getElementById('admin-nombre-supervisor').value;
    const email = document.getElementById('admin-email-supervisor').value;
    const password = document.getElementById('admin-password-supervisor').value;
    fetch('registrarPasante.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre, email, password, role: "supervisor"
      })
    })
      .then(res => res.json())
      .then(data => {
        statusSuper.textContent = data.message || (data.success ? "Supervisor agregado" : "No se pudo agregar");
        if (data.success) formSuper.reset();
        cargarSupervisores();
        setTimeout(() => { statusSuper.textContent = ""; }, 1800);
      });
  };
  cargarSupervisores();
  cargarEmpresasAdmin();
  cargarPasantesAdmin();
}

function cargarModeradores() {
  fetch('listarModeradores.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-moderadores');
      if (data.success) {
        ul.innerHTML = data.moderadores.map(mod => `<li>${mod.nombre} — ${mod.email}</li>`).join('');
      } else {
        ul.innerHTML = "<li>No hay moderadores.</li>";
      }
    });
}
function cargarSupervisores() {
  fetch('listarSupervisores.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-supervisores');
      if (data.success) {
        ul.innerHTML = data.supervisores.map(sup => `<li>${sup.nombre} — ${sup.email}</li>`).join('');
      } else {
        ul.innerHTML = "<li>No hay supervisores.</li>";
      }
    });
}
function cargarEmpresasAdmin() {
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-empresas-admin');
      if (data.success) {
        ul.innerHTML = data.empresas.map(emp =>
          `<li><b>${emp.nombre}</b> (${emp.importancia})<br><span style="font-size:.97em;color:#555;">${emp.ubicacion}</span></li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay empresas.</li>";
      }
    });
}
function cargarPasantesAdmin() {
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-pasantes-admin');
      if (data.success) {
        ul.innerHTML = data.pasantes.map(p =>
          `<li><b>${p.nombre}</b> (${p.email})<br>Nota: ${p.nota} | Horas: ${p.horas_totales}</li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay pasantes.</li>";
      }
    });
}

// ========== PANEL MODERADOR: PASANTES/EMPRESAS ==========
function iniciarModTabs() {
  const tabs = document.querySelectorAll('.panel-tabs button');
  const panelPas = document.getElementById('panel-pasantes');
  const panelEmp = document.getElementById('panel-empresas');
  tabs.forEach(btn => btn.onclick = function () {
    tabs.forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    panelPas.style.display = (this.dataset.tab === "pasantes") ? "block" : "none";
    panelEmp.style.display = (this.dataset.tab === "empresas") ? "block" : "none";
  });
  iniciarModeradorArea();
}
function iniciarModeradorArea() {
  // Registrar pasante
  const formPasante = document.getElementById('form-registrar-pasante');
  const statusPasante = document.getElementById('status-registrar-pasante');
  formPasante.onsubmit = e => {
    e.preventDefault();
    fetch('registrarPasante.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: formPasante['mod-nombre-pasante'].value,
        email: formPasante['mod-email-pasante'].value,
        password: formPasante['mod-password-pasante'].value,
        nota: formPasante['mod-nota-pasante'].value,
        horasTotales: formPasante['mod-horas-totales'].value
      })
    })
      .then(res => res.json())
      .then(data => {
        statusPasante.textContent = data.message;
        if (data.success) formPasante.reset();
        cargarPasantesModerador();
        setTimeout(() => { statusPasante.textContent = ""; }, 1800);
      });
  };
  cargarPasantesModerador();

  // Registrar empresa
  const formEmpresa = document.getElementById('form-registrar-empresa');
  const statusEmpresa = document.getElementById('status-registrar-empresa');
  formEmpresa.onsubmit = e => {
    e.preventDefault();
    fetch('registrarEmpresa.php', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: formEmpresa['mod-nombre-empresa'].value,
        importancia: formEmpresa['mod-importancia-empresa'].value,
        ubicacion: formEmpresa['mod-ubicacion-empresa'].value
      })
    })
      .then(res => res.json())
      .then(data => {
        statusEmpresa.textContent = data.message;
        if (data.success) formEmpresa.reset();
        cargarEmpresasModerador();
        setTimeout(() => { statusEmpresa.textContent = ""; }, 1800);
      });
  };
  cargarEmpresasModerador();
}
function cargarPasantesModerador() {
  fetch('listarPasantes.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-pasantes-moderador');
      if (data.success) {
        ul.innerHTML = data.pasantes.map(p =>
          `<li><b>${p.nombre}</b> (${p.email})<br>Nota: ${p.nota} | Horas: ${p.horas_totales}</li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay pasantes.</li>";
      }
    });
}
function cargarEmpresasModerador() {
  fetch('listarEmpresas.php')
    .then(r => r.json())
    .then(data => {
      const ul = document.getElementById('listado-empresas-moderador');
      if (data.success) {
        ul.innerHTML = data.empresas.map(emp =>
          `<li><b>${emp.nombre}</b> (${emp.importancia})<br><span style="font-size:.97em;color:#555;">${emp.ubicacion}</span></li>`
        ).join('');
      } else {
        ul.innerHTML = "<li>No hay empresas.</li>";
      }
    });
}

// ========== PANEL PASANTE: DATOS ==========
function mostrarDatosPasante() {
  const cont = document.getElementById('datos-pasante');
  fetch('listarPasantiaUsuario.php?email=' + encodeURIComponent(currentUser.email))
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const p = data.pasante;
        cont.innerHTML = `
        <div style="background:#fffbe5; border-radius:1.1em; padding:1.2em; box-shadow:0 1px 7px #ffd70018;">
          <b>Nombre:</b> ${p.nombre}<br>
          <b>Email:</b> ${p.email}<br>
          <b>Nota:</b> ${p.nota}<br>
          <b>Horas requeridas:</b> ${p.horas_totales}<br>
          <b>Horas cumplidas:</b> ${p.horas_cumplidas}<br>
          <b>Empresa asignada:</b> ${p.asignado_empresa ? p.asignado_empresa : "No asignada"}<br>
          <b>Ubicación empresa:</b> ${p.ubicacion_empresa ? p.ubicacion_empresa : "—"}
          <div style="margin-top:.7em;"><b>Comentarios del supervisor:</b>
            <ul>${(p.comentarios||[]).map(c=>`<li>${c.comentario} <small>(${c.fecha})</small></li>`).join('')}</ul>
          </div>
        </div>
        `;
      } else {
        cont.innerHTML = "<p>No se pudieron cargar tus datos.</p>";
      }
    });
}

// ========== PANEL SUPERVISOR ==========
function iniciarSupervisorPanel() {
  const cont = document.getElementById('listado-pasantes-supervisor');
  cont.innerHTML = "Cargando...";
  fetch('listarPasantesSupervisor.php?email=' + encodeURIComponent(currentUser.email))
    .then(r => r.json())
    .then(data => {
      if (data.success && data.pasantes.length) {
        cont.innerHTML = data.pasantes.map(pas =>
          `<div class="card-pro" style="margin-bottom:1em;">
            <b>${pas.nombre}</b> (${pas.email})<br>
            <b>Horas cumplidas:</b> <span id="horas-${pas.id}">${pas.horas_cumplidas}</span> / ${pas.horas_totales}<br>
            <form class="form-horas-comentario" data-id="${pas.id}" style="margin-top:.6em;">
              <input type="number" min="0" max="${pas.horas_totales}" value="${pas.horas_cumplidas}" name="horas" style="width:70px;" required />
              <input type="text" name="comentario" placeholder="Comentario..." maxlength="120" style="width:60%;" />
              <button type="submit">Actualizar</button>
              <span class="status-horas" style="margin-left:7px;"></span>
            </form>
            <div style="margin-top:.6em;">
              <b>Comentarios:</b>
              <ul id="com-list-${pas.id}" style="font-size:.99em;">
                ${(pas.comentarios || []).map(c => `<li>${c.comentario} <small>(${c.fecha})</small></li>`).join('')}
              </ul>
            </div>
          </div>`
        ).join('');

        // Agregar evento a cada formulario
        document.querySelectorAll('.form-horas-comentario').forEach(form => {
          form.onsubmit = function (e) {
            e.preventDefault();
            const pasId = this.dataset.id;
            const horas = this.horas.value;
            const comentario = this.comentario.value;
            const status = this.querySelector('.status-horas');
            status.textContent = "Enviando...";
            fetch('agregarHorasComentario.php', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ supervisor: currentUser.email, pasante_id: pasId, horas, comentario })
            })
              .then(r => r.json())
              .then(d => {
                status.textContent = d.success ? "Actualizado" : "Error";
                if (d.success) {
                  document.getElementById('horas-' + pasId).textContent = horas;
                  const ul = document.getElementById('com-list-' + pasId);
                  if (comentario)
                    ul.innerHTML = `<li>${comentario} <small>(${(new Date()).toLocaleString()})</small></li>` + ul.innerHTML;
                }
                setTimeout(() => { status.textContent = ""; }, 1800);
              });
          }
        });
      } else {
        cont.innerHTML = "<p>No supervisas ningún pasante actualmente.</p>";
      }
    });
}

// ================== CONTACTO (SOPORTE) =================
function iniciarContacto() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  form.onsubmit = function (e) {
    e.preventDefault();
    const nombre = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const tel = document.getElementById('contact-tel') ? document.getElementById('contact-tel').value.trim() : '';
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

// =========== INICIO ============
window.onload = function () {
  setupMenu();
  updateMenu();
  renderSection('home');
};