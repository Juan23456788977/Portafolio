/* moderator_panel_ui.js - versión corregida
   Cambios clave:
   - Todas las llamadas fetch incluyen credentials: 'same-origin' para enviar cookies de sesión.
   - Mejor manejo de errores y mensajes devueltos por el servidor.
   - Registrar supervisor ahora reporta errores claros.
   - Envío de chat usa POST a messages.php y refresca conversación automáticamente.
*/

(function(){
  const cfgFetch = (opts = {}) => {
    return Object.assign({ credentials: 'same-origin', headers: { 'Accept': 'application/json' } }, opts);
  };

  function create(tag, attrs = {}, html = '') {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
    if (html) e.innerHTML = html;
    return e;
  }

  // Simplified mount logic (assume panel exists)
  function tryMount() {
    const panel = document.getElementById('panel-moderador') || document.getElementById('panel-mod');
    if (!panel) return;
    mount(panel);
  }

  function mount(container) {
    if (container.dataset.mounted) return;
    container.dataset.mounted = '1';
    container.classList.add('mp-panel');
    container.innerHTML = ''; // simple reset, you may adapt

    const header = create('div', { class: 'mp-header' });
    header.innerHTML = `<div><h3>Panel Moderador</h3><div class="mp-sub">Gestiona supervisores y chat</div></div>`;
    container.appendChild(header);

    const status = create('div', { class: 'mp-status', style: 'display:none' });
    container.appendChild(status);

    const tabs = create('div', { class: 'mp-tabs' });
    ['Pasantes','Supervisores','Empresas','Chat'].forEach((t,i) => {
      const b = create('button', { class: 'mp-tab' + (i===0 ? ' active' : ''), 'data-tab': t.toLowerCase() }, t);
      tabs.appendChild(b);
    });
    container.appendChild(tabs);

    const body = create('div', { class: 'mp-body' });
    container.appendChild(body);

    const formCol = create('div', { class: 'mp-form' });
    const listCol = create('div', { class: 'mp-list' });
    body.appendChild(formCol);
    body.appendChild(listCol);
    listCol.innerHTML = '<div id="mp-list-box"></div>';

    // Initial tab: Supervisores tab creation button needs to work
    buildSupervisoresForm(formCol);
    loadSupervisores();

    tabs.querySelectorAll('.mp-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('.mp-tab').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        status.style.display = 'none';
        if (tab === 'supervisores') {
          buildSupervisoresForm(formCol);
          loadSupervisores();
        } else if (tab === 'pasantes') {
          // reuse previous implementation or call loadPasantes etc.
          buildPasantesPlaceholder(formCol);
          loadPasantes();
        } else if (tab === 'empresas') {
          buildEmpresasForm(formCol);
          loadEmpresas();
        } else if (tab === 'chat') {
          buildChatForm(formCol);
          loadChatUI();
        }
      });
    });

    // ---------- Builders ----------
    function buildSupervisoresForm(target) {
      target.innerHTML = '';
      target.appendChild(create('h4', {}, 'Registrar Supervisor'));
      const f = create('form', { id: 'mp-form-supervisor' });
      f.innerHTML = `
        <div class="row"><input name="nombre" placeholder="Nombre completo" required /></div>
        <div class="row"><input name="email" placeholder="Email" type="email" required /></div>
        <div class="row"><input name="password" placeholder="Contraseña (opcional)" type="password" /></div>
        <div class="row"><button type="submit">Crear supervisor</button></div>
      `;
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(f);
        const payload = { nombre: fd.get('nombre').trim(), email: fd.get('email').trim(), password: fd.get('password') || '' };
        try {
          const resp = await fetch('registrarSupervisor.php', cfgFetch({
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, cfgFetch().headers),
            body: JSON.stringify(payload)
          }));
          const j = await resp.json();
          if (!resp.ok && !j.success) {
            showStatus(j.message || 'Error del servidor al crear supervisor', false);
            return;
          }
          if (j.success) {
            showStatus('Supervisor creado correctamente', true);
            f.reset();
            loadSupervisores();
          } else {
            showStatus(j.message || 'No se pudo crear supervisor', false);
          }
        } catch (err) {
          console.error(err);
          showStatus('Error de red al crear supervisor', false);
        }
      });
      target.appendChild(f);
    }

    function buildPasantesPlaceholder(target) {
      target.innerHTML = '<h4>Pasantes</h4><p>Formulario de pasantes (no implementado en esta instancia)</p>';
    }

    function buildEmpresasForm(target) {
      target.innerHTML = '<h4>Empresas</h4><p>Formulario empresas (placeholder)</p>';
    }

    function buildChatForm(target) {
      target.innerHTML = '<h4>Chat</h4><p>Selecciona un usuario desde la lista a la derecha para chatear.</p>';
    }

    // ---------- Loaders ----------
    async function loadSupervisores() {
      const box = document.getElementById('mp-list-box');
      box.innerHTML = 'Cargando supervisores...';
      try {
        const resp = await fetch('listarSupervisores.php', cfgFetch());
        const j = await resp.json();
        if (!j.success) {
          box.innerHTML = '<div class="mp-card">Error: ' + (j.message || 'no se pudo cargar') + '</div>';
          return;
        }
        const arr = j.supervisores || [];
        box.innerHTML = '';
        if (!arr.length) { box.innerHTML = '<div class="mp-card">No hay supervisores</div>'; return; }
        arr.forEach(p => {
          const card = create('div', { class: 'mp-card' });
          const info = create('div', { class: 'meta' });
          info.innerHTML = `<b>${escapeHtml(p.nombre)}</b><div>${escapeHtml(p.email)}</div>`;
          const actions = create('div', { class: 'mp-actions' });
          const btnEdit = create('button', { class: 'btn-sm btn-edit', 'data-id': p.id }, 'Editar');
          const btnChat = create('button', { class: 'btn-sm btn-chat', 'data-id': p.id }, 'Chat');
          const btnDel = create('button', { class: 'btn-sm btn-delete', 'data-id': p.id }, 'Eliminar');
          actions.appendChild(btnEdit); actions.appendChild(btnChat); actions.appendChild(btnDel);
          card.appendChild(info); card.appendChild(actions);
          box.appendChild(card);

          btnEdit.addEventListener('click', () => editarUsuarioPrompt(p.id));
          btnDel.addEventListener('click', () => eliminarUsuarioConfirm(p.id));
          btnChat.addEventListener('click', () => openChatWith(p.id));
        });
      } catch (err) {
        console.error(err);
        document.getElementById('mp-list-box').innerHTML = '<div class="mp-card">Error de red</div>';
      }
    }

    // Pasantes & Empresas loaders placeholders (implementaciones previas pueden reusar)
    async function loadPasantes() {
      const box = document.getElementById('mp-list-box');
      box.innerHTML = '<div class="mp-card">Funcionalidad pasantes (placeholder)</div>';
    }
    async function loadEmpresas() {
      const box = document.getElementById('mp-list-box');
      box.innerHTML = '<div class="mp-card">Funcionalidad empresas (placeholder)</div>';
    }

    // ---------- Chat logic ----------
    async function loadChatUI() {
      const box = document.getElementById('mp-list-box');
      box.innerHTML = `
        <div class="mp-chat-area">
          <div class="mp-chat-users" id="mp-chat-users">Cargando usuarios...</div>
          <div style="flex:1;display:flex;flex-direction:column;">
            <div class="mp-chat-window" id="mp-chat-window">Selecciona un usuario</div>
            <div class="mp-chat-input" style="margin-top:8px;">
              <input id="mp-chat-input" placeholder="Mensaje..." style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);color:#e6f0ff" />
              <button id="mp-chat-send" class="btn-sm btn-chat">Enviar</button>
            </div>
          </div>
        </div>
      `;
      await loadChatUsers();
      document.getElementById('mp-chat-send').addEventListener('click', sendChatMessage);
      document.getElementById('mp-chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
    }

    async function loadChatUsers() {
      const usersDiv = document.getElementById('mp-chat-users');
      usersDiv.innerHTML = 'Cargando usuarios...';
      try {
        const resp = await fetch('listarUsuarios.php', cfgFetch());
        const j = await resp.json();
        if (!j.success) {
          usersDiv.innerHTML = 'Error: ' + (j.message || '');
          return;
        }
        let arr = j.users || [];
        arr = arr.filter(u => u.role !== 'admin'); // opcional
        if (!arr.length) { usersDiv.innerHTML = '<div>No hay usuarios disponibles</div>'; return; }
        usersDiv.innerHTML = arr.map(u => `<div class="mp-user-item" data-id="${u.id}" style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;"><b>${escapeHtml(u.nombre)}</b><div style="color:var(--muted);font-size:.9rem">${escapeHtml(u.role)} — ${escapeHtml(u.email)}</div></div>`).join('');
        usersDiv.querySelectorAll('.mp-user-item').forEach(el => el.addEventListener('click', () => openChatWith(el.dataset.id)));
      } catch (err) {
        console.error(err);
        usersDiv.innerHTML = 'Error de red';
      }
    }

    let chatWithId = null;
    async function openChatWith(id) {
      chatWithId = id;
      const win = document.getElementById('mp-chat-window');
      win.innerHTML = 'Cargando conversación...';
      try {
        const resp = await fetch('messages.php?conversation_with=' + encodeURIComponent(id), cfgFetch());
        const j = await resp.json();
        if (!j.success) {
          win.innerHTML = '<div>' + (j.message || 'No hay conversación') + '</div>';
          return;
        }
        const msgs = j.messages || [];
        win.innerHTML = msgs.map(m => {
          const isMe = String(m.sender_id) !== String(id) && String(m.sender_id) === String(m.sender_id) && m.sender_id != null && false; // dummy, we'll style simply
          return `<div style="margin-bottom:8px;"><div style="display:inline-block;padding:8px;border-radius:8px;background:${m.sender_id==id ? '#1b2540' : '#163b1a'}">${escapeHtml(m.message)}<div style="font-size:11px;color:var(--muted);margin-top:6px;">${escapeHtml(m.created_at||'')} — ${escapeHtml(m.sender_nombre||'')}</div></div></div>`;
        }).join('');
        win.scrollTop = win.scrollHeight;
      } catch (err) {
        console.error(err);
        win.innerHTML = 'Error de red';
      }
    }

    async function sendChatMessage() {
      const input = document.getElementById('mp-chat-input');
      const text = input.value.trim();
      if (!text) { showStatus('Escribe un mensaje', false); return; }
      if (!chatWithId) { showStatus('Selecciona un usuario para enviar', false); return; }

      try {
        const resp = await fetch('messages.php', cfgFetch({
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, cfgFetch().headers),
          body: JSON.stringify({ recipient_id: chatWithId, message: text })
        }));
        const j = await resp.json();
        if (j.success) {
          input.value = '';
          // recargar conversación para ver el nuevo mensaje
          openChatWith(chatWithId);
        } else {
          showStatus(j.message || 'No se pudo enviar', false);
        }
      } catch (err) {
        console.error(err);
        showStatus('Error de red al enviar', false);
      }
    }

    // ---------- Edit / Delete helpers ----------
    async function editarUsuarioPrompt(id) {
      try {
        const r = await fetch('getUser.php?id=' + encodeURIComponent(id), cfgFetch());
        const j = await r.json();
        if (!j.success) return showStatus('No se pudo cargar usuario', false);
        const u = j.user;
        const nombre = prompt('Nombre', u.nombre || '');
        if (nombre === null) return;
        const email = prompt('Email', u.email || '');
        if (email === null) return;
        const payload = { id: id, nombre: nombre, email: email };
        const up = await fetch('editarUsuario.php', cfgFetch({
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, cfgFetch().headers),
          body: JSON.stringify(payload)
        }));
        const uj = await up.json();
        if (uj.success) { showStatus('Usuario actualizado', true); loadSupervisores(); }
        else showStatus(uj.message || 'No se actualizó', false);
      } catch (err) {
        console.error(err);
        showStatus('Error de red', false);
      }
    }

    function eliminarUsuarioConfirm(id) {
      if (!confirm('¿Eliminar este usuario?')) return;
      fetch('eliminarUsuario.php', cfgFetch({
        method: 'POST',
        headers: Object.assign({ 'Content-Type':'application/json' }, cfgFetch().headers),
        body: JSON.stringify({ id: id })
      })).then(r => r.json()).then(j => {
        if (j.success) { showStatus('Eliminado', true); loadSupervisores(); }
        else showStatus(j.message || 'No eliminado', false);
      }).catch(err => { console.error(err); showStatus('Error de red', false); });
    }

    // ---------- Util ----------
    function showStatus(msg, ok) {
      status.style.display = 'block';
      status.textContent = msg;
      status.style.background = ok ? 'linear-gradient(90deg, rgba(18,184,134,0.12), rgba(18,184,134,0.06))' : 'linear-gradient(90deg, rgba(224,75,75,0.12), rgba(224,75,75,0.06))';
      setTimeout(() => { status.style.display = 'none'; }, 3000);
    }

    function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryMount);
  else tryMount();
  const mo = new MutationObserver(tryMount);
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();