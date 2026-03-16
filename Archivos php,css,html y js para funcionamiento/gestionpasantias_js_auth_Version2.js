const pages = {
  home: `
    <section class="section">
      <h2>Bienvenido a PasantiConnect</h2>
      <p>La plataforma moderna para la gestión de pasantías y empresas.</p>
    </section>
  `,
  empresas: `
    <section class="section">
      <h2>Empresas</h2>
      <p>Listado de empresas registradas próximamente...</p>
    </section>
  `,
  contacto: `
    <section class="section">
      <h2>Contacto</h2>
      <form id="contact-form">
        <input type="text" name="nombre" placeholder="Tu nombre" required />
        <input type="email" name="email" placeholder="Tu correo" required />
        <textarea name="mensaje" placeholder="Mensaje" required></textarea>
        <button type="submit">Enviar</button>
      </form>
      <div id="contact-status"></div>
    </section>
  `,
  login: `
    <section class="section">
      <h2>Iniciar Sesión</h2>
      <form id="login-form">
        <input type="email" name="email" placeholder="Correo" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <div id="login-status"></div>
    </section>
  `
};

function showPage(page) {
  const main = document.getElementById('main-content');
  main.innerHTML = pages[page] || "<section class='section'><h2>Página no encontrada</h2></section>";
}

document.addEventListener('DOMContentLoaded', () => {
  showPage('home');

  document.getElementById('main-nav').addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.dataset.page) {
      e.preventDefault();
      showPage(e.target.dataset.page);
    }
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.toggleAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? null : 'light');
  });

  document.body.addEventListener('submit', async function(e) {
    if(e.target.id === 'login-form') {
      e.preventDefault();
      const status = document.getElementById('login-status');
      status.textContent = 'Cargando...';
      const form = e.target;
      const res = await fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: form.email.value,
          password: form.password.value
        })
      });
      const data = await res.json();
      status.textContent = data.success ? '¡Bienvenido!' : (data.message || 'Error');
    }
    if(e.target.id === 'contact-form') {
      e.preventDefault();
      const status = document.getElementById('contact-status');
      status.textContent = 'Enviando...';
      const form = e.target;
      const res = await fetch('gestionpasantias_api_send_support_mail_Version3.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          nombre: form.nombre.value,
          email: form.email.value,
          mensaje: form.mensaje.value
        })
      });
      const data = await res.json();
      status.textContent = data.success ? '¡Mensaje enviado!' : (data.message || 'Error');
    }
  });
});