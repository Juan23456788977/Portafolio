const loginForm = `<form id="login-form" autocomplete="off" spellcheck="false">
  <input type="email" name="email" placeholder="Correo electrónico" required>
  <input type="password" name="password" placeholder="Contraseña" required>
  <button type="submit">Iniciar sesión</button>
  <div class="loader" id="login-loader"></div>
  <div class="form-actions">
    ¿No tienes cuenta? <a id="show-register">Regístrate</a> <br>
    <a id="show-recover">¿Olvidaste tu contraseña?</a>
  </div>
</form>
<button class="google-btn" id="google-signin">
  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="glogo"> Iniciar sesión con Google
</button>
`;
const registerForm = `<form id="register-form" autocomplete="off" spellcheck="false">
  <input type="text" name="nombre" placeholder="Nombre completo" required>
  <input type="email" name="email" placeholder="Correo electrónico" required>
  <input type="password" name="password" placeholder="Contraseña" required oninput="checkStrength(this)">
  <div id="pw-strength" class="pw-strength danger">Mínimo 8 caracteres, una mayúscula y un número.</div>
  <button type="submit">Crear cuenta</button>
  <div class="loader" id="register-loader"></div>
  <div class="form-actions">
    ¿Ya tienes cuenta? <a id="show-login">Inicia sesión</a>
  </div>
</form>`;
const recoverForm = `<form id="recover-form" autocomplete="off" spellcheck="false">
  <input type="email" name="recover-email" placeholder="Correo electrónico" required>
  <button type="submit">Enviar enlace de recuperación</button>
  <div class="loader" id="recover-loader"></div>
  <div class="form-actions">
    <a id="show-login2">Volver al login</a>
  </div>
</form>`;

function showTab(tab) {
  let html = "";
  if(tab==="login") html = loginForm;
  else if(tab==="register") html = registerForm;
  else html = recoverForm;
  document.getElementById('panel-content').innerHTML = html;
  setTab(tab);
  setTimeout(()=>initForms(), 50);
}
function setTab(tab) {
  document.getElementById('tab-login').classList.toggle('selected', tab==="login");
  document.getElementById('tab-register').classList.toggle('selected', tab==="register");
  document.getElementById('tab-recover').classList.toggle('selected', tab==="recover");
}
document.getElementById('tab-login').onclick = ()=>showTab("login");
document.getElementById('tab-register').onclick = ()=>showTab("register");
document.getElementById('tab-recover').onclick = ()=>showTab("recover");

// Dark mode
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
    backgroundColor: ok ? "#232837" : "#3a2323",
    stopOnFocus: true,
    close: true
  }).showToast();
}

// Password strength
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

// Formularios
function initForms() {
  // Login
  const lf = document.getElementById('login-form');
  if(lf) {
    lf.onsubmit = function(e) {
      e.preventDefault();
      document.getElementById('login-loader').style.display="block";
      fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: this.email.value.trim(),
          password: this.password.value
        })
      })
      .then(r=>r.json())
      .then(data=>{
        document.getElementById('login-loader').style.display="none";
        if(data.success) {
          showToast('¡Bienvenido!', true);
          setTimeout(()=>window.location.href='/dashboard', 900);
        } else {
          showToast(data.message || 'Usuario o contraseña inválidos', false);
        }
      }).catch(()=>{
        document.getElementById('login-loader').style.display="none";
        showToast("Fallo de red");
      });
    };
    if(document.getElementById('show-register')) document.getElementById('show-register').onclick = ()=>showTab("register");
    if(document.getElementById('show-recover')) document.getElementById('show-recover').onclick = ()=>showTab("recover");
    if(document.getElementById('google-signin')) {
      document.getElementById('google-signin').onclick = ()=>{ showToast('Pronto login social aquí'); };
    }
  }
  // Register
  const rf = document.getElementById('register-form');
  if(rf) {
    rf.onsubmit = function(e) {
      e.preventDefault();
      const pw = this.password.value;
      if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw)) {
        showToast("La contraseña debe ser fuerte.", false);
        return;
      }
      document.getElementById('register-loader').style.display="block";
      fetch('register.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          nombre: this.nombre.value,
          email: this.email.value.trim(),
          password: this.password.value
        })
      })
      .then(r=>r.json())
      .then(data=>{
        document.getElementById('register-loader').style.display="none";
        showToast(data.message, data.success);
        if(data.success) setTimeout(()=>showTab("login"), 1800);
      })
      .catch(()=>{
        document.getElementById('register-loader').style.display="none";
        showToast("Fallo de red");
      });
    };
    if(document.getElementById('show-login')) document.getElementById('show-login').onclick = ()=>showTab("login");
  }
  // Recover
  const recf = document.getElementById('recover-form');
  if(recf) {
    recf.onsubmit = function(e) {
      e.preventDefault();
      document.getElementById('recover-loader').style.display="block";
      fetch('recover.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email: this['recover-email'].value.trim()
        })
      })
      .then(r=>r.json())
      .then(data=>{
        document.getElementById('recover-loader').style.display="none";
        showToast(data.message, data.success);
        if(data.success) setTimeout(()=>showTab("login"), 2000);
      })
      .catch(()=>{
        document.getElementById('recover-loader').style.display="none";
        showToast("Fallo de red");
      });
    };
    if(document.getElementById('show-login2')) document.getElementById('show-login2').onclick = ()=>showTab("login");
  }
}
showTab("login");