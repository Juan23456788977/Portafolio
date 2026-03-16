// Carrusel fondo
let idx = 0;
const imgs = document.querySelectorAll('.carousel-img');
setInterval(() => {
  imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
  idx = (idx + 1) % imgs.length;
}, 5400);

// Modo claro/oscuro
const themeBtn = document.getElementById('theme-toggle-btn');
themeBtn.onclick = () => {
  document.body.classList.toggle('light-mode');
  themeBtn.textContent = document.body.classList.contains('light-mode') ? "🌞" : "🌙";
};

// Toastify
function showToast(msg, ok=false) {
  Toastify({
    text: msg,
    duration: 3400,
    gravity: "bottom",
    position: "center",
    backgroundColor: ok ? "#232837" : "#c00",
    stopOnFocus: true,
    close: true
  }).showToast();
}

// Validación fuerza contraseña
window.checkStrength = function(input) {
  let val = input.value, msg = "";
  if(val.length<8) msg="Mínimo 8 caracteres";
  else if(!/[A-Z]/.test(val)) msg="Debe tener una mayúscula";
  else if(!/\d/.test(val)) msg="Debe tener un número";
  else msg="¡Fuerte!";
  const el = document.getElementById('pw-strength');
  if(el) {
    el.textContent = msg;
    el.className = 'pw-strength ' + (msg==='¡Fuerte!'?'success':'danger');
  }
};

// Lógica principal
let currentUser = null;
const tooltips = {
    servicios: `<h4>Servicios</h4><p>Soluciones web, marketing digital, consultoría, diseño gráfico, soporte técnico y gestión integral de pasantías.</p>`,
    nosotros: `<h4>Nosotros</h4><p>Equipo dedicado a conectar empresas y talentos, con experiencia en tecnología, educación y gestión profesional.</p>`,
    login: `<h4>Acceso</h4><p>Inicia sesión para gestionar tu perfil, pasantías o administración.</p>`,
    admin: `<h4>Admin</h4><p>Panel exclusivo para administración avanzada de usuarios y contenido.</p>`,
    moderador: `<h4>Moderador</h4><p>Gestiona registros y asignaciones de pasantes y empresas.</p>`
};

function renderMenu() {
    const nav = document.getElementById('nav-bar');
    nav.innerHTML = '';
    nav.appendChild(crearNavButton('Home', 'servicios'));
    nav.appendChild(crearNavButton('Nosotros', 'nosotros'));
    if (currentUser) {
        if (currentUser.role === 'admin') {
            nav.appendChild(crearNavButton('Admin - Gestión', 'admin'));
        } else if (currentUser.role === 'moderador') {
            nav.appendChild(crearNavButton('Moderador - Gestión', 'moderador'));
        }
        const btnLogout = document.createElement('button');
        btnLogout.textContent = `Cerrar sesión (${currentUser.nombre})`;
        btnLogout.className = 'nav-btn';
        btnLogout.onclick = logout;
        nav.appendChild(btnLogout);
    } else {
        nav.appendChild(crearNavButton('Login', 'login'));
    }
}

function crearNavButton(text, page) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.textContent = text;
    btn.dataset.page = page;
    btn.onclick = () => loadPage(page);
    if (tooltips[page]) {
        const tt = document.createElement('div');
        tt.className = 'nav-tooltip';
        tt.innerHTML = tooltips[page];
        btn.appendChild(tt);
    }
    return btn;
}

const pages = {
    servicios: `
        <section class="main-home-section">
        <div class="home-info-box">
            <h2>Bienvenido a la Gestión Profesional de Pasantías</h2>
            <p>
                Conectamos empresas e instituciones educativas con jóvenes talentos en busca de oportunidades para crecer y desarrollarse profesionalmente. Nuestra plataforma facilita el proceso de registro, seguimiento y asignación de pasantes, integrando tecnología, innovación y transparencia.
            </p>
            <h2 style="margin-top:18px;">Servicios para Empresas y Pasantes</h2>
            <p>
                Ofrecemos una amplia gama de servicios personalizados para satisfacer las necesidades específicas de empresas y futuros profesionales. Nuestro objetivo es acompañarte durante todo el proceso, desde el registro hasta la culminación exitosa de la pasantía.
            </p>
            <ul>
                <li><b>Desarrollo Web Profesional:</b> Soluciones digitales modernas, seguras y adaptadas a tu empresa o proyecto.</li>
                <li><b>Marketing Digital y SEO:</b> Estrategias para posicionar tu marca y potenciar tu presencia online.</li>
                <li><b>Consultoría de Negocios:</b> Asesoría personalizada para mejorar tus procesos y resultados.</li>
                <li><b>Diseño Gráfico y Branding:</b> Imagen corporativa profesional y creativa para destacar en el mercado.</li>
                <li><b>Mantenimiento de Dispositivos:</b> Soporte técnico integral y actualización de hardware/software.</li>
                <li><b>Redes y Ofimática:</b> Optimización de redes, trabajo colaborativo y herramientas de productividad.</li>
                <li><b>Gestión de Pasantías:</b> Registro, seguimiento y asignación eficiente de pasantes y empresas.</li>
            </ul>
            <div style="margin-top:25px;">
                <p style="font-size:1.14rem;color:#ffd700;"><b>¿Listo para transformar tu futuro profesional?</b></p>
                <p>Únete a nuestra plataforma y accede a oportunidades exclusivas, asesoría personalizada y una comunidad comprometida con tu éxito.</p>
            </div>
        </div>
        <div class="home-login-container" id="home-login">
            <h3>Iniciar Sesión</h3>
            <form id="login-form-home" aria-label="Formulario de inicio de sesión">
                <input type="email" id="email-login-home" name="email" placeholder="Correo electrónico" required aria-required="true" autocomplete="username"/>
                <input type="password" id="password-login-home" name="password" placeholder="Contraseña" required aria-required="true" autocomplete="current-password"/>
                <select id="role-login-home" name="role" aria-label="Rol" required>
                    <option value="" disabled selected>Selecciona tipo de usuario</option>
                    <option value="pasante">Pasante</option>
                    <option value="moderador">Moderador</option>
                    <option value="admin">Administrador</option>
                </select>
                <button type="submit">Iniciar Sesión</button>
                <p id="login-status-home" role="alert"></p>
            </form>
        </div>
        <div class="home-contact-box">
            <h2 style="font-size:1.45rem;color:#ffd700;text-shadow:0 2px 8px #0007">¿Tienes preguntas? Contáctanos</h2>
            <p>Estamos aquí para ayudarte. Completa el formulario y te responderemos pronto:</p>
            <form id="contact-form" aria-label="Formulario de contacto">
                <input type="text" id="name" name="name" placeholder="Nombre completo" required aria-required="true" />
                <input type="email" id="email" name="email" placeholder="Correo electrónico" required aria-required="true" />
                <textarea id="message" name="message" placeholder="Tu mensaje" rows="5" required aria-required="true"></textarea>
                <button type="submit">Enviar Mensaje</button>
                <p id="form-status" role="alert"></p>
            </form>
        </div>
        </section>
    `,
    nosotros: `<h2>Sobre Nosotros</h2>
        <p>Somos un equipo apasionado y multidisciplinar dedicado a crear soluciones innovadoras que conectan empresas y pasantes. Nuestro compromiso es facilitar el desarrollo profesional y la inserción laboral a través de herramientas tecnológicas modernas y procesos eficientes.</p>
        <p>Con años de experiencia en el sector, nos enorgullecemos de trabajar mano a mano con distintas empresas, universidades y organizaciones para formar pasantes que marcan la diferencia.</p>
        <ul>
            <li>Equipo profesional con experiencia en tecnología, educación y gestión empresarial.</li>
            <li>Plataforma segura y actualizada con las mejores prácticas del mercado.</li>
            <li>Atención personalizada y asesoría continua para empresas y estudiantes.</li>
        </ul>`,
    login: `
        <h2>Iniciar Sesión</h2>
        <form id="login-form" aria-label="Formulario de inicio de sesión">
            <input type="email" id="email-login" name="email" placeholder="Correo electrónico" required aria-required="true" autocomplete="username"/>
            <input type="password" id="password-login" name="password" placeholder="Contraseña" required aria-required="true" autocomplete="current-password"/>
            <select id="role-login" name="role" aria-label="Rol" required>
                <option value="" disabled selected>Selecciona tipo de usuario</option>
                <option value="pasante">Pasante</option>
                <option value="moderador">Moderador</option>
                <option value="admin">Administrador</option>
            </select>
            <button type="submit">Iniciar Sesión</button>
            <p id="login-status" role="alert"></p>
        </form>
    `,
    admin: `
        <h2>Área Administrador</h2>
        <section>
            <h3>Agregar Moderador</h3>
            <form id="form-agregar-moderador" aria-label="Formulario de agregar moderador">
                <input type="text" id="admin-nombre-moderador" placeholder="Nombre completo" required aria-required="true" autocomplete="name" />
                <input type="email" id="admin-email-moderador" placeholder="Correo electrónico" required aria-required="true" autocomplete="email" />
                <input type="password" id="admin-password-moderador" placeholder="Contraseña" required aria-required="true" autocomplete="new-password" />
                <button type="submit">Agregar Moderador</button>
                <p id="admin-status-mod" style="margin-top:8px;"></p>
            </form>
        </section>
    `,
    moderador: `
        <h2>Área de Moderador</h2>
        <section>
            <h3>Registrar Pasante</h3>
            <form id="form-registrar-pasante" aria-label="Formulario de registro de pasantes">
                <input type="text" id="mod-nombre-pasante" placeholder="Nombre completo" required aria-required="true" autocomplete="name" />
                <input type="email" id="mod-email-pasante" placeholder="Correo electrónico" required aria-required="true" autocomplete="email" />
                <input type="password" id="mod-password-pasante" placeholder="Contraseña" required aria-required="true" autocomplete="new-password" />
                <label for="mod-nota-pasante" style="color:#ffd700; font-weight:700;">Nota (0-20):</label>
                <input type="number" id="mod-nota-pasante" min="0" max="20" placeholder="Ej: 18" required aria-required="true" />
                <label for="mod-horas-totales" style="color:#ffd700; font-weight:700;">Horas Totales Requeridas:</label>
                <input type="number" id="mod-horas-totales" min="0" placeholder="Ej: 160" required aria-required="true" />
                <button type="submit">Agregar Pasante</button>
                <p id="status-registrar-pasante"></p>
            </form>
        </section>
        <section style="margin-top: 30px;">
            <h3>Registrar Empresa</h3>
            <form id="form-registrar-empresa" aria-label="Formulario de registro de empresas">
                <input type="text" id="mod-nombre-empresa" placeholder="Nombre de la empresa" required aria-required="true" autocomplete="organization" />
                <select id="mod-importancia-empresa" required aria-required="true" aria-label="Nivel de importancia de la empresa">
                    <option value="" disabled selected>Seleccione nivel de importancia</option>
                    <option value="Importante">Importante</option>
                    <option value="Medio importante">Medio importante</option>
                    <option value="No tan importante">No tan importante</option>
                </select>
                <input type="text" id="mod-ubicacion-empresa" placeholder="Ubicación de la empresa" required aria-required="true" />
                <button type="submit">Agregar Empresa</button>
                <p id="status-registrar-empresa"></p>
            </form>
        </section>
        <section style="margin-top: 40px;">
            <h3>Listado de Pasantes</h3>
            <div id="listado-pasantes-moderador" style="max-height: 240px; overflow-y:auto; text-align:left; background:rgba(255 255 255 / 0.1); padding:10px; border-radius:8px;"></div>
        </section>
        <section style="margin-top: 40px;">
            <h3>Listado de Empresas</h3>
            <ul id="listado-empresas-moderador" style="max-height: 180px; overflow-y:auto; list-style:none; padding-left:0;"></ul>
        </section>
    `,
    testimonios: `
        <h2>Testimonios</h2>
        <section id="testimonios-list"></section>
        <h3>Deja tu testimonio</h3>
        <form id="form-testimonio" autocomplete="off">
            <input type="text" id="test-nombre" placeholder="Tu nombre (o empresa)" required maxlength="50"/>
            <textarea id="test-texto" placeholder="Tu testimonio sobre la plataforma" required maxlength="420" rows="3"></textarea>
            <button type="submit">Enviar Testimonio</button>
            <p id="testimonio-status"></p>
        </form>
    `,
    faq: `<h2>Preguntas Frecuentes</h2>
        <ul>
          <li><b>¿Cómo registro una empresa?</b> Desde el menú de moderador, usa el formulario "Registrar Empresa".</li>
          <li><b>¿Cómo recupero mi contraseña?</b> Usa la opción de recuperación en la pantalla de login.</li>
          <li><b>¿Quién puede ser moderador?</b> Solo los administradores pueden agregar moderadores.</li>
        </ul>`,
    recursos: `
        <h2>Recursos</h2>
        <ul>
          <li><a href="https://www.ejemplo.com/guia-pasantias" target="_blank">Guía de Pasantías</a></li>
          <li><a href="https://www.ejemplo.com/plantilla-cv" target="_blank">Plantilla de Currículum</a></li>
          <li><a href="https://www.ejemplo.com/tips-entrevista" target="_blank">Tips para Entrevistas</a></li>
        </ul>`,
    blog: `<h2>Blog</h2>
        <ul>
          <li><b>5 Claves para tu primera pasantía</b> - <i>Publicado el 04/06/2025</i></li>
          <li><b>Cómo destacar en una entrevista profesional</b></li>
          <li><b>Las empresas buscan nuevos talentos</b></li>
        </ul>`,
    configuracion: `<h2>Configuración</h2>
        <p>Aquí podrás modificar preferencias del sistema (en desarrollo).</p>`
};

function loadPage(page) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = pages[page] || '<p>Página no encontrada.</p>';
    document.querySelectorAll('#nav-bar .nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    switch (page) {
        case 'login': iniciarLoginForm(); break;
        case 'admin': if (!currentUser || currentUser.role !== 'admin') { alert('Acceso denegado.'); loadPage('servicios'); } else iniciarAdminArea(); break;
        case 'moderador': if (!currentUser || currentUser.role !== 'moderador') { alert('Acceso denegado.'); loadPage('servicios'); } else iniciarModeradorArea(); break;
        case 'servicios': iniciarContactForm(); iniciarLoginHome(); break;
        case 'testimonios': iniciarTestimonios(); break;
    }
}

function iniciarContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    if (!form || !statusEl) return;
    form.onsubmit = e => {
        e.preventDefault();
        statusEl.style.color = '#ffd700';
        statusEl.textContent = 'Enviando mensaje...';
        setTimeout(() => {
            statusEl.style.color = '#00ff00';
            statusEl.textContent = 'Gracias por contactarnos. Te responderemos pronto.';
            form.reset();
        }, 1500);
    };
}

function iniciarLoginForm() {
    const form = document.getElementById('login-form');
    const statusEl = document.getElementById('login-status');
    if (!form || !statusEl) return;
    form.onsubmit = e => {
        e.preventDefault();
        statusEl.textContent = 'Verificando...';
        fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form['email-login'].value.trim(),
                password: form['password-login'].value,
                role: form['role-login'].value
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                statusEl.style.color = "#00bb00";
                statusEl.textContent = "¡Bienvenido!";
                renderMenu();
                setTimeout(() => loadPage(currentUser.role), 900);
            } else {
                statusEl.style.color = "#bb0000";
                statusEl.textContent = data.message || "Credenciales incorrectas";
            }
        })
        .catch(() => {
            statusEl.style.color = "#bb0000";
            statusEl.textContent = "Error de red";
        });
    };
}

function iniciarLoginHome() {
    const form = document.getElementById('login-form-home');
    const statusEl = document.getElementById('login-status-home');
    if (!form || !statusEl) return;
    form.onsubmit = e => {
        e.preventDefault();
        statusEl.textContent = 'Verificando...';
        fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form['email-login-home'].value.trim(),
                password: form['password-login-home'].value,
                role: form['role-login-home'].value
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                statusEl.style.color = "#00bb00";
                statusEl.textContent = "¡Bienvenido!";
                renderMenu();
                setTimeout(() => loadPage(currentUser.role), 900);
            } else {
                statusEl.style.color = "#bb0000";
                statusEl.textContent = data.message || "Credenciales incorrectas";
            }
        })
        .catch(() => {
            statusEl.style.color = "#bb0000";
            statusEl.textContent = "Error de red";
        });
    };
}

function logout() {
    currentUser = null;
    renderMenu();
    loadPage('servicios');
}

function iniciarAdminArea() {
    const form = document.getElementById('form-agregar-moderador');
    const statusMod = document.getElementById('admin-status-mod');
    form.onsubmit = e => {
        e.preventDefault();
        fetch('registerModerador.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: document.getElementById('admin-nombre-moderador').value.trim(),
                email: document.getElementById('admin-email-moderador').value.trim(),
                password: document.getElementById('admin-password-moderador').value
            })
        })
        .then(res => res.json())
        .then(data => {
            statusMod.textContent = data.message;
            statusMod.style.color = data.success ? '#00bb00' : '#bb0000';
            if (data.success) form.reset();
        })
        .catch(() => {
            statusMod.textContent = "Error de red";
            statusMod.style.color = "#bb0000";
        });
    };
}

function iniciarModeradorArea() {
    const statusPasante = document.getElementById('status-registrar-pasante');
    const formPasante = document.getElementById('form-registrar-pasante');
    formPasante.onsubmit = e => {
        e.preventDefault();
        fetch('registerPasante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: document.getElementById('mod-nombre-pasante').value.trim(),
                email: document.getElementById('mod-email-pasante').value.trim(),
                password: document.getElementById('mod-password-pasante').value,
                nota: Number(document.getElementById('mod-nota-pasante').value),
                horasTotales: Number(document.getElementById('mod-horas-totales').value)
            })
        })
        .then(res => res.json())
        .then(data => {
            statusPasante.textContent = data.message;
            statusPasante.style.color = data.success ? '#00bb00' : '#bb0000';
            if (data.success) {
                formPasante.reset();
                renderListaPasantesModerador();
            }
        })
        .catch(() => {
            statusPasante.textContent = "Error de red";
            statusPasante.style.color = "#bb0000";
        });
    };
    const statusEmpresa = document.getElementById('status-registrar-empresa');
    const formEmpresa = document.getElementById('form-registrar-empresa');
    formEmpresa.onsubmit = e => {
        e.preventDefault();
        fetch('registerEmpresa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: document.getElementById('mod-nombre-empresa').value.trim(),
                importancia: document.getElementById('mod-importancia-empresa').value,
                ubicacion: document.getElementById('mod-ubicacion-empresa').value.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            statusEmpresa.textContent = data.message;
            statusEmpresa.style.color = data.success ? '#00bb00' : '#bb0000';
            if (data.success) {
                formEmpresa.reset();
                renderListaEmpresasModerador();
            }
        })
        .catch(() => {
            statusEmpresa.textContent = "Error de red";
            statusEmpresa.style.color = "#bb0000";
        });
    };
    renderListaPasantesModerador();
    renderListaEmpresasModerador();
}

function renderListaEmpresasModerador() {
    const listadoEmpresas = document.getElementById('listado-empresas-moderador');
    listadoEmpresas.innerHTML = 'Cargando...';
    fetch('listarEmpresas.php')
        .then(res => res.json())
        .then(data => {
            if(!data.success || !data.empresas.length) {
                listadoEmpresas.textContent = 'No hay empresas registradas.';
                return;
            }
            listadoEmpresas.innerHTML = '';
            data.empresas.forEach(e => {
                listadoEmpresas.innerHTML += `
                <li style="background: rgba(255,255,255,0.10); margin-bottom:8px; border-radius:6px; padding:10px; color:#fff;">
                    <b style="color:#ffd700;">${e.nombre}</b> <br>
                    <b>Importancia:</b> ${e.importancia} <br>
                    <b>Ubicación:</b> ${e.ubicacion}
                </li>
                `;
            });
        });
}

function renderListaPasantesModerador() {
    const listadoPasantes = document.getElementById('listado-pasantes-moderador');
    listadoPasantes.innerHTML = 'Cargando...';
    fetch('listarPasantes.php')
        .then(res => res.json())
        .then(data => {
            if(!data.success || !data.pasantes.length) {
                listadoPasantes.textContent = 'No hay pasantes registrados.';
                return;
            }
            listadoPasantes.innerHTML = '';
            data.pasantes.forEach(p => {
                listadoPasantes.innerHTML += `
                <div style="background: rgba(255,255,255,0.12); margin-bottom:15px; border-radius:8px; padding:16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); color: #fff;">
                    <h4 style="color:#ffd700; margin-bottom:4px;">${p.nombre}</h4>
                    <div><b>Email:</b> ${p.email}</div>
                    <div><b>Nota:</b> ${p.nota}</div>
                    <div><b>Horas Totales:</b> ${p.horas_totales}</div>
                    <div><b>Horas Cumplidas:</b> ${p.horas_cumplidas}</div>
                    <div><b>Empresa Asignada:</b> ${p.asignado_empresa || "Sin asignar"}</div>
                </div>
                `;
            });
        });
}

function iniciarTestimonios() {
    const list = document.getElementById('testimonios-list');
    const form = document.getElementById('form-testimonio');
    const status = document.getElementById('testimonio-status');
    function renderTestimonios() {
        list.innerHTML = "Cargando testimonios...";
        fetch('listarTestimonios.php')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.testimonios.length) {
                    list.innerHTML = data.testimonios.map(t => `
                        <div class="testimonial-block">
                            <span>${t.texto}</span>
                            <span class="author">${t.autor}</span>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = '<p>No hay testimonios aún.</p>';
                }
            });
    }
    renderTestimonios();

    form.onsubmit = function(e) {
        e.preventDefault();
        const nombre = document.getElementById('test-nombre').value.trim();
        const texto = document.getElementById('test-texto').value.trim();
        if (nombre.length === 0 || texto.length === 0) return;
        status.textContent = "Enviando...";
        fetch('guardarTestimonio.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({autor: nombre, texto: texto})
        })
        .then(res => res.json())
        .then(data => {
            status.style.color = data.success ? "#00bb00" : "#bb0000";
            status.textContent = data.message;
            if (data.success) {
                form.reset();
                renderTestimonios();
            }
            setTimeout(()=>{ status.textContent = ""; }, 2500);
        });
    };
}

(function(){
  const toggle = document.getElementById('dropdown-toggle');
  const menu = document.getElementById('dropdown-menu');
  const logoutBtn = document.getElementById('dropdown-logout-btn');
  toggle.onclick = function(e) {
    e.stopPropagation();
    menu.classList.toggle('show');
  };
  document.addEventListener('click', function(e) {
    if (menu.classList.contains('show')) menu.classList.remove('show');
  });
  function updateDropdown() {
    if (typeof currentUser !== "undefined" && currentUser) {
      logoutBtn.style.display = "block";
    } else {
      logoutBtn.style.display = "none";
    }
  }
  updateDropdown();
  const oldRenderMenu = renderMenu;
  renderMenu = function(){
    oldRenderMenu();
    updateDropdown();
  };
  menu.querySelectorAll('button[data-page]').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      menu.classList.remove('show');
      loadPage(this.dataset.page);
    };
  });
  logoutBtn.onclick = function(e) {
    e.stopPropagation();
    menu.classList.remove('show');
    logout();
  };
})();

window.onload = function() {
    renderMenu();
    loadPage('servicios');
};