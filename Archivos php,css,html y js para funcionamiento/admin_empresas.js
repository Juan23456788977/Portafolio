// admin_empresas_ui.js — interfaz ligera para crear/editar empresas con campo "cupo"
// Monta en #panel-mod o contenedor que uses para admin

(function(){
  let initialized = false;
  function el(t,a='',h=''){ const e=document.createElement(t); if(typeof a==='object') Object.keys(a).forEach(k=>e.setAttribute(k,a[k])); if(h) e.innerHTML=h; return e; }

  function mount(container) {
    if (!container || initialized) return;
    initialized = true;
    container.innerHTML = '';
    const header = el('div', { style:'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;' }, '<h3 style="margin:0">Empresas (gestión)</h3>');
    container.appendChild(header);

    const formWrap = el('div',{ style:'background:rgba(0,0,0,0.03);padding:12px;border-radius:8px;margin-bottom:12px;' });
    formWrap.innerHTML = `
      <form id="empresa-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;">
        <input name="id" type="hidden" />
        <label style="grid-column:1/3"><input name="nombre" placeholder="Nombre de la empresa" required style="width:100%"/></label>
        <label><select name="importancia"><option>Importante</option><option>Medio importante</option><option>No tan importante</option></select></label>
        <label><input name="ubicacion" placeholder="Ubicación / ciudad" /></label>
        <label><input name="cupo" type="number" min="0" placeholder="Cupo (dejar vacío = ilimitado)"/></label>
        <div style="grid-column:1/3;display:flex;gap:8px;">
          <button type="submit" id="empresa-save">Guardar</button>
          <button type="button" id="empresa-cancel">Limpiar</button>
        </div>
      </form>
    `;
    container.appendChild(formWrap);

    const status = el('div',{ id:'empresa-status', style:'min-height:18px;margin:8px 0;color:#08304a;font-weight:700;' });
    container.appendChild(status);

    const listWrap = el('div',{ id:'empresa-list' });
    container.appendChild(listWrap);

    const form = document.getElementById('empresa-form');
    const btnCancel = document.getElementById('empresa-cancel');

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      status.textContent = 'Procesando...';
      const fd = new FormData(form);
      const body = {
        id: fd.get('id') || undefined,
        nombre: fd.get('nombre'),
        importancia: fd.get('importancia'),
        ubicacion: fd.get('ubicacion'),
        cupo: fd.get('cupo') === '' ? null : fd.get('cupo')
      };
      try {
        let url = 'registrarEmpresa.php';
        if (body.id) {
          url = 'editarEmpresa.php';
        }
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const j = await res.json();
        status.style.color = j.success ? '#0b6' : '#b00';
        status.textContent = j.message || (j.success ? 'Guardado' : 'Error');
        if (j.success) { form.reset(); loadEmpresas(); }
      } catch (err) {
        status.style.color = '#b00';
        status.textContent = 'Error de red';
      }
    });

    btnCancel.addEventListener('click', () => { form.reset(); form.id.value = ''; status.textContent = ''; });

    async function loadEmpresas() {
      listWrap.innerHTML = 'Cargando...';
      try {
        const res = await fetch('listarEmpresas.php');
        const j = await res.json();
        if (!j.success) { listWrap.innerHTML = '<div>Error al cargar</div>'; return; }
        const arr = j.empresas || [];
        if (!arr.length) { listWrap.innerHTML = '<div>No hay empresas</div>'; return; }
        let html = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th>Nombre</th><th>Importancia</th><th>Ubicación</th><th>Cupo</th><th>Acciones</th></tr></thead><tbody>';
        arr.forEach(e => {
          html += `<tr>
            <td>${escape(e.nombre)}</td>
            <td>${escape(e.importancia)}</td>
            <td>${escape(e.ubicacion)}</td>
            <td>${e.cupo === null ? 'Ilimitado' : escape(e.cupo)}</td>
            <td>
              <button class="btn-edit" data-id="${e.id}">Editar</button>
              <button class="btn-delete" data-id="${e.id}" style="background:#b00;color:white;margin-left:6px;">Eliminar</button>
            </td>
          </tr>`;
        });
        html += '</tbody></table>';
        listWrap.innerHTML = html;

        listWrap.querySelectorAll('.btn-edit').forEach(b => {
          b.onclick = () => editEmpresa(b.dataset.id);
        });
        listWrap.querySelectorAll('.btn-delete').forEach(b => {
          b.onclick = () => deleteEmpresa(b.dataset.id);
        });
      } catch (err) {
        listWrap.innerHTML = '<div>Error de red</div>';
      }
    }

    async function editEmpresa(id) {
      status.textContent = 'Cargando...';
      try {
        const res = await fetch('listarEmpresas.php');
        const j = await res.json();
        if (!j.success) { status.textContent = 'Error'; return; }
        const e = (j.empresas || []).find(x => String(x.id) === String(id));
        if (!e) { status.textContent = 'Empresa no encontrada'; return; }
        form.id.value = e.id;
        form.nombre.value = e.nombre || '';
        form.importancia.value = e.importancia || 'Importante';
        form.ubicacion.value = e.ubicacion || '';
        form.cupo.value = e.cupo === null ? '' : e.cupo;
        status.textContent = 'Editando empresa ' + e.nombre;
      } catch (err) {
        status.textContent = 'Error de red';
      }
    }

    async function deleteEmpresa(id) {
      if (!confirm('Eliminar empresa ID ' + id + '?')) return;
      status.textContent = 'Eliminando...';
      try {
        const res = await fetch('eliminarEmpresa.php', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ id: id })
        });
        const j = await res.json();
        status.style.color = j.success ? '#0b6' : '#b00';
        status.textContent = j.message || (j.success ? 'Eliminada' : 'Error');
        if (j.success) loadEmpresas();
      } catch (err) {
        status.textContent = 'Error de red';
      }
    }

    function escape(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

    loadEmpresas();
  }

  const observer = new MutationObserver((m) => {
    if (initialized) return;
    const panel = document.getElementById('panel-mod') || document.getElementById('panel-emp') || null;
    if (panel) mount(panel);
  });
  observer.observe(document.documentElement || document.body, { childList:true, subtree:true });
  document.addEventListener('DOMContentLoaded', ()=> {
    const panel = document.getElementById('panel-mod') || document.getElementById('panel-emp') || null;
    if (panel) mount(panel);
  });
})();