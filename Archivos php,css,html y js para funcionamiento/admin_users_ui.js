// Interfaz administrativa para gestionar usuarios (añadir / editar / eliminar)
// Monta automáticamente cuando el panel del admin aparece (no hace falta editar Main.js)

(function(){
  let initialized = false;

  function createEl(tag, attrs = {}, txt = '') {
    const el = document.createElement(tag);
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    if (txt) el.innerHTML = txt;
    return el;
  }

  function mountAdminUI(container) {
    if (!container || initialized) return;
    initialized = true;

    // Cabecera
    container.innerHTML = '';
    const header = createEl('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;' });
    header.innerHTML = '<h3 style="margin:0">Gestión de Usuarios (Admin)</h3>';
    container.appendChild(header);

    // Formulario añadir/editar
    const formWrap = createEl('div', { style: 'background: rgba(0,0,0,0.04); padding:12px; border-radius:8px; margin-bottom:12px;' });
    formWrap.innerHTML = `
      <form id="admin-user-form" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;align-items:center;">
        <input name="id" type="hidden" />
        <label style="grid-column:1/3"><b>Rol:</b>
          <select name="role" required>
            <option value="pasante">Pasante</option>
            <option value="moderador">Moderador</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </label>
        <label><input name="nombre" placeholder="Nombre completo" required /></label>
        <label><input name="email" type="email" placeholder="Correo electrónico" required /></label>
        <label><input name="password" type="password" placeholder="Contraseña (solo si quieres cambiar)" /></label>
        <label><input name="nota" type="number" min="0" max="20" placeholder="Nota (pasante)" /></label>
        <label><input name="horas_totales" type="number" min="0" placeholder="Horas totales (pasante)" /></label>
        <label><input name="asignado_empresa" placeholder="Empresa asignada" /></label>
        <label><input name="ubicacion_empresa" placeholder="Ubicación empresa" /></label>
        <div style="grid-column:1/3;display:flex;gap:8px;">
          <button id="admin-user-save" type="submit">Agregar / Guardar</button>
          <button id="admin-user-cancel" type="button">Limpiar</button>
        </div>
      </form>
    `;
    container.appendChild(formWrap);

    // Estado
    const status = createEl('div', { id: 'admin-user-status', style: 'min-height:20px;margin:10px 0;color:#08304a;font-weight:700;' });
    container.appendChild(status);

    // Tabla/listado
    const tableWrap = createEl('div', { style: 'margin-top:8px;' });
    tableWrap.innerHTML = `<div style="margin-bottom:8px;"><input id="admin-user-filter" placeholder="Buscar por nombre o email" style="padding:6px;width:60%"/><button id="admin-refresh" style="margin-left:8px;padding:6px 10px;">Refrescar</button></div>
      <div id="admin-user-list" style="max-height:420px;overflow:auto;border-radius:8px;"></div>`;
    container.appendChild(tableWrap);

    // Eventos
    const form = document.getElementById('admin-user-form');
    const btnCancel = document.getElementById('admin-user-cancel');
    const statusEl = document.getElementById('admin-user-status');
    const filterEl = document.getElementById('admin-user-filter');
    const refreshBtn = document.getElementById('admin-refresh');

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      statusEl.textContent = 'Procesando...';
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v,k) => payload[k] = v);

      // Si viene id => edición, sino creación
      if (payload.id) {
        // editar -> llamar editarUsuario.php
        const res = await fetch('editarUsuario.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const j = await res.json();
        statusEl.style.color = j.success ? '#0b6' : '#b00';
        statusEl.textContent = j.message || (j.success ? 'Actualizado' : 'No actualizado');
        if (j.success) { form.reset(); loadUsers(); }
        return;
      } else {
        // creación -> usa registrarPasante.php (este endpoint acepta role y crea usuarios)
        // Nota: registrarPasante.php en tu repo soporta role distinto a pasante
        const body = {
          nombre: payload.nombre,
          email: payload.email,
          password: payload.password || Math.random().toString(36).slice(-8),
          role: payload.role
        };
        if (payload.role === 'pasante') {
          body.nota = payload.nota || null;
          body.horasTotales = payload.horas_totales || null; // registrarPasante.php espera 'horasTotales'
        }
        try {
          const res = await fetch('registrarPasante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const j = await res.json();
          statusEl.style.color = j.success ? '#0b6' : '#b00';
          statusEl.textContent = j.message || (j.success ? 'Usuario creado' : 'Error al crear');
          if (j.success) { form.reset(); loadUsers(); }
        } catch (err) {
          statusEl.style.color = '#b00';
          statusEl.textContent = 'Error de red';
        }
      }
    });

    btnCancel.addEventListener('click', function(){
      form.reset();
      form.querySelector('input[name=id]').value = '';
      statusEl.textContent = '';
    });

    filterEl.addEventListener('input', function(){ loadUsers(this.value); });
    refreshBtn.addEventListener('click', function(){ loadUsers(filterEl.value); });

    // Cargar lista
    async function loadUsers(filter = '') {
      const listDiv = document.getElementById('admin-user-list');
      listDiv.innerHTML = 'Cargando...';
      try {
        const res = await fetch('listarUsuarios.php');
        const j = await res.json();
        if (!j.success) { listDiv.innerHTML = '<div>Error al cargar</div>'; return; }
        let arr = j.users || [];
        if (filter) {
          const q = filter.toLowerCase();
          arr = arr.filter(u => (u.nombre||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
        }
        if (!arr.length) { listDiv.innerHTML = '<div>No hay usuarios</div>'; return; }

        let html = '<table style="width:100%;border-collapse:collapse;"><thead><tr style="text-align:left;border-bottom:1px solid #ddd;"><th>Nombre</th><th>Email</th><th>Rol</th><th>Nota</th><th>Horas</th><th>Empresa</th><th>Acciones</th></tr></thead><tbody>';
        arr.forEach(u => {
          html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:8px 6px;">${escapeHtml(u.nombre||'')}</td>
            <td style="padding:8px 6px;">${escapeHtml(u.email||'')}</td>
            <td style="padding:8px 6px;">${escapeHtml(u.role||'')}</td>
            <td style="padding:8px 6px;">${u.nota || ''}</td>
            <td style="padding:8px 6px;">${u.horas_totales || ''}</td>
            <td style="padding:8px 6px;">${escapeHtml(u.asignado_empresa||'')}</td>
            <td style="padding:8px 6px;">
              <button class="btn-edit" data-id="${u.id}" style="margin-right:6px;">Editar</button>
              <button class="btn-delete" data-id="${u.id}" style="background:#b00;color:#fff;">Eliminar</button>
            </td>
          </tr>`;
        });
        html += '</tbody></table>';
        listDiv.innerHTML = html;

        // Delegación botones
        listDiv.querySelectorAll('.btn-edit').forEach(b => {
          b.onclick = () => editUser(b.dataset.id);
        });
        listDiv.querySelectorAll('.btn-delete').forEach(b => {
          b.onclick = () => deleteUser(b.dataset.id);
        });
      } catch (err) {
        document.getElementById('admin-user-list').innerHTML = '<div>Error de red</div>';
      }
    }

    async function editUser(id) {
      statusEl.textContent = 'Cargando datos...';
      try {
        const res = await fetch('getUser.php?id=' + encodeURIComponent(id));
        const j = await res.json();
        if (!j.success) { statusEl.style.color = '#b00'; statusEl.textContent = j.message || 'No encontrado'; return; }
        const u = j.user;
        form['id'].value = u.id;
        form['nombre'].value = u.nombre || '';
        form['email'].value = u.email || '';
        form['role'].value = u.role || 'pasante';
        form['nota'].value = u.nota || '';
        form['horas_totales'].value = u.horas_totales || '';
        form['asignado_empresa'].value = u.asignado_empresa || '';
        form['ubicacion_empresa'].value = u.ubicacion_empresa || '';
        statusEl.style.color = '#08304a';
        statusEl.textContent = 'Editando usuario id ' + u.id + ' — guarda para aplicar cambios';
      } catch (err) {
        statusEl.style.color = '#b00';
        statusEl.textContent = 'Error de red';
      }
    }

    async function deleteUser(id) {
      if (!confirm('¿Eliminar usuario ID ' + id + '? Esta acción no se puede deshacer.')) return;
      statusEl.textContent = 'Eliminando...';
      try {
        const res = await fetch('eliminarUsuario.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        });
        const j = await res.json();
        statusEl.style.color = j.success ? '#0b6' : '#b00';
        statusEl.textContent = j.message || (j.success ? 'Eliminado' : 'No eliminado');
        if (j.success) loadUsers(filterEl.value);
      } catch (err) {
        statusEl.style.color = '#b00';
        statusEl.textContent = 'Error de red';
      }
    }

    function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

    // carga inicial
    loadUsers();

    // Exponer refresco para debugging
    window.adminUsersReload = loadUsers;
  }

  // Observador: cuando aparezca el contenedor del panel admin (panel-mod) se monta la UI.
  const observer = new MutationObserver((mutations) => {
    if (initialized) return;
    const panel = document.getElementById('panel-mod') || document.getElementById('panel-emp') || document.getElementById('panel-usuario-admin') || null;
    if (panel) {
      // montamos UI dentro de panel-mod (si tu Main.js ya rellenó algo, lo sustituimos)
      mountAdminUI(panel);
    }
  });

  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // Por si el panel ya existe al cargar este script
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('panel-mod') || document.getElementById('panel-emp') || null;
    if (panel) mountAdminUI(panel);
  });
})();