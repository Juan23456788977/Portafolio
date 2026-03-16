// panel.js — versión corregida y lista para pegar
// Incluye corrección para que use `conversation_with` (si el servidor lo requiere)
// Mejoras:
// - defensas ante respuestas vacías/errores
// - evita insertar HTML con valores no escapados
// - usa creación de DOM y event listeners en lugar de onclick inline
// - incluye credentials para que las llamadas envíen cookies de sesión (same-origin)
// - manejo de errores en fetch y logs útiles

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ========== EDICIÓN/ELIMINACIÓN DE SUPERVISORES ==========
async function cargarSupervisores() {
  try {
    const res = await fetch('listarSupervisores.php', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));

    const ul = document.getElementById('listado-supervisores');
    if (!ul) return console.warn('Elemento #listado-supervisores no encontrado');

    ul.innerHTML = ''; // limpiar

    const arr = Array.isArray(data.supervisores) ? data.supervisores : [];
    if (!data.success || arr.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay supervisores.';
      ul.appendChild(li);
      return;
    }

    arr.forEach(sup => {
      const li = document.createElement('li');
      const nameNode = document.createElement('span');
      nameNode.innerHTML = `${escapeHtml(sup.nombre)} — ${escapeHtml(sup.email)} `;
      li.appendChild(nameNode);

      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Editar';
      btnEdit.addEventListener('click', () => editarSupervisorPrompt(sup));
      li.appendChild(btnEdit);

      const btnDel = document.createElement('button');
      btnDel.textContent = 'Eliminar';
      btnDel.style.marginLeft = '8px';
      btnDel.addEventListener('click', () => eliminarSupervisor(sup.id));
      li.appendChild(btnDel);

      ul.appendChild(li);
    });
  } catch (err) {
    console.error('cargarSupervisores error:', err);
  }
}
function editarSupervisorPrompt(sup) {
  // Sup puede ser objeto o id
  const nombre = sup.nombre ?? '';
  const email = sup.email ?? '';
  const id = sup.id ?? sup;
  const nuevoNombre = prompt('Nuevo nombre:', nombre);
  const nuevoEmail = prompt('Nuevo email:', email);
  if (nuevoNombre && nuevoEmail) {
    editarSupervisor(id, nuevoNombre, nuevoEmail);
  }
}
async function editarSupervisor(id, nombre, email) {
  try {
    const res = await fetch('editarSupervisor.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre, email })
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Respuesta inválida' }));
    alert(data.message || (data.success ? 'Supervisor editado' : 'Error al editar'));
    cargarSupervisores();
  } catch (err) {
    console.error('editarSupervisor error:', err);
    alert('Error de red al editar supervisor');
  }
}
async function eliminarSupervisor(id) {
  if (!confirm('¿Seguro que deseas eliminar este supervisor?')) return;
  try {
    const res = await fetch('eliminarSupervisor.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Respuesta inválida' }));
    alert(data.message || (data.success ? 'Supervisor eliminado' : 'Error al eliminar'));
    cargarSupervisores();
  } catch (err) {
    console.error('eliminarSupervisor error:', err);
    alert('Error de red al eliminar supervisor');
  }
}

// ========== EDICIÓN/ELIMINACIÓN DE PASANTES ==========
async function cargarPasantesAdmin() {
  try {
    const res = await fetch('listarPasantes.php', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));

    const ul = document.getElementById('listado-pasantes-admin');
    if (!ul) return console.warn('Elemento #listado-pasantes-admin no encontrado');

    ul.innerHTML = '';

    const arr = Array.isArray(data.pasantes) ? data.pasantes : [];
    if (!data.success || arr.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay pasantes.';
      ul.appendChild(li);
      return;
    }

    arr.forEach(p => {
      const li = document.createElement('li');
      const nameNode = document.createElement('span');
      nameNode.innerHTML = `${escapeHtml(p.nombre)} — ${escapeHtml(p.email)} `;
      li.appendChild(nameNode);

      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Editar';
      btnEdit.addEventListener('click', () => editarPasantePrompt(p));
      li.appendChild(btnEdit);

      const btnDel = document.createElement('button');
      btnDel.textContent = 'Eliminar';
      btnDel.style.marginLeft = '8px';
      btnDel.addEventListener('click', () => eliminarPasante(p.id));
      li.appendChild(btnDel);

      ul.appendChild(li);
    });
  } catch (err) {
    console.error('cargarPasantesAdmin error:', err);
  }
}
function editarPasantePrompt(p) {
  const nombre = p.nombre ?? '';
  const email = p.email ?? '';
  const id = p.id ?? p;
  const nuevoNombre = prompt('Nuevo nombre:', nombre);
  const nuevoEmail = prompt('Nuevo email:', email);
  if (nuevoNombre && nuevoEmail) {
    editarPasante(id, nuevoNombre, nuevoEmail);
  }
}
async function editarPasante(id, nombre, email) {
  try {
    const res = await fetch('editarPasante.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre, email })
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Respuesta inválida' }));
    alert(data.message || (data.success ? 'Pasante editado' : 'Error al editar'));
    cargarPasantesAdmin();
  } catch (err) {
    console.error('editarPasante error:', err);
    alert('Error de red al editar pasante');
  }
}
async function eliminarPasante(id) {
  if (!confirm('¿Seguro que deseas eliminar este pasante?')) return;
  try {
    const res = await fetch('eliminarPasante.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Respuesta inválida' }));
    alert(data.message || (data.success ? 'Pasante eliminado' : 'Error al eliminar'));
    cargarPasantesAdmin();
  } catch (err) {
    console.error('eliminarPasante error:', err);
    alert('Error de red al eliminar pasante');
  }
}

// ========== CHAT ENTRE SUPERVISORES (corrección conversation_with) ==========
async function cargarChatSupervisores() {
  try {
    const res = await fetch('listarSupervisores.php', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    const chatDiv = document.getElementById('chat-supervisores');
    if (!chatDiv) return console.warn('Elemento #chat-supervisores no encontrado');

    chatDiv.innerHTML = ''; // limpiar

    const arr = Array.isArray(data.supervisores) ? data.supervisores : [];
    if (!data.success || arr.length === 0) {
      chatDiv.innerHTML = '<div>No hay supervisores para chatear.</div>';
      return;
    }

    // Usar el id del supervisor como value (server suele esperar conversation_with)
    const select = document.createElement('select');
    select.id = 'destinatario-supervisor';
    arr.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id ?? ''; // <-- ahora usamos id
      opt.textContent = s.nombre ?? s.email ?? '(sin nombre)';
      // guardamos el email en dataset por si el servidor necesita el email
      if (s.email) opt.dataset.email = s.email;
      select.appendChild(opt);
    });
    chatDiv.appendChild(select);

    const textarea = document.createElement('textarea');
    textarea.id = 'mensaje-supervisor';
    textarea.placeholder = 'Escribe tu mensaje';
    textarea.style.display = 'block';
    textarea.style.width = '100%';
    textarea.style.marginTop = '8px';
    chatDiv.appendChild(textarea);

    const btn = document.createElement('button');
    btn.textContent = 'Enviar';
    btn.style.marginTop = '8px';
    btn.addEventListener('click', enviarMensajeSupervisor);
    chatDiv.appendChild(btn);

    const mensajesDiv = document.createElement('div');
    mensajesDiv.id = 'mensajes-supervisor';
    mensajesDiv.style.marginTop = '12px';
    chatDiv.appendChild(mensajesDiv);

    // Cargar mensajes para el conversation_with seleccionado (si hay)
    // También añadimos listener para cambiar la conversación cuando se seleccione otro destinatario
    select.addEventListener('change', () => cargarMensajesSupervisor());
    cargarMensajesSupervisor();
  } catch (err) {
    console.error('cargarChatSupervisores error:', err);
  }
}

async function enviarMensajeSupervisor() {
  const select = document.getElementById('destinatario-supervisor');
  const textarea = document.getElementById('mensaje-supervisor');
  if (!select || !textarea) return;
  const destinatarioId = select.value;
  const destinatarioEmail = select.selectedOptions?.[0]?.dataset?.email ?? '';
  const mensaje = textarea.value.trim();
  if (!mensaje) return alert('Escribe un mensaje antes de enviar.');

  const emisorEmail = window.currentUser?.email ?? null;
  if (!emisorEmail) return alert('No estás autenticado. Inicia sesión para enviar mensajes.');

  try {
    // Enviamos conversation_with (id) porque muchos endpoints esperan ese parámetro.
    // También enviamos destinatario/email por si el servidor lo utiliza.
    const payload = {
      conversation_with: destinatarioId,
      destinatario: destinatarioId,
      destinatario_email: destinatarioEmail,
      mensaje: mensaje,
      emisor: emisorEmail
    };

    const res = await fetch('mensajesSupervisor.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({ success: false }));
    if (!data.success) {
      console.warn('No se pudo enviar mensaje:', data);
      alert(data.message || 'No se pudo enviar el mensaje');
      return;
    }
    textarea.value = '';
    // recargar la conversación actual
    cargarMensajesSupervisor();
  } catch (err) {
    console.error('enviarMensajeSupervisor error:', err);
    alert('Error de red al enviar mensaje');
  }
}

async function cargarMensajesSupervisor() {
  try {
    const select = document.getElementById('destinatario-supervisor');
    const emisorEmail = window.currentUser?.email ?? '';
    const div = document.getElementById('mensajes-supervisor');
    if (!div) return console.warn('Elemento #mensajes-supervisor no encontrado');

    if (!emisorEmail) {
      div.innerHTML = '<div>Inicia sesión para ver tus mensajes.</div>';
      return;
    }
    // Si existe select, tomar el conversation_with (id)
    const conversationWith = select?.value ?? '';
    if (!conversationWith) {
      div.innerHTML = '<div>Selecciona un destinatario para ver la conversación.</div>';
      return;
    }

    // Llamada GET incluyendo conversation_with
    const url = 'mensajesSupervisor.php?recibidos=1' +
                '&emisor=' + encodeURIComponent(emisorEmail) +
                '&conversation_with=' + encodeURIComponent(conversationWith);
    const res = await fetch(url, { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    const arr = Array.isArray(data.mensajes) ? data.mensajes : [];
    if (!data.success || arr.length === 0) {
      div.innerHTML = '<div>No hay mensajes en esta conversación.</div>';
      return;
    }
    // Mostrar mensajes (seguro)
    div.innerHTML = arr.map(m => `<div><b>${escapeHtml(m.emisor)}</b>: ${escapeHtml(m.texto ?? m.mensaje ?? '')} <small>${escapeHtml(m.fecha ?? '')}</small></div>`).join('');
  } catch (err) {
    console.error('cargarMensajesSupervisor error:', err);
  }
}

// ========== EVALUACIÓN DE PASANTES ==========
async function mostrarEvaluacionPasante(pasanteId) {
  try {
    const res = await fetch(`getEvaluacionPasante.php?id=${encodeURIComponent(pasanteId)}`, { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    const evalDiv = document.getElementById(`evaluacion-pasante-${pasanteId}`);
    if (!evalDiv) return console.warn(`Elemento evaluacion-pasante-${pasanteId} no encontrado`);
    const nota = data?.nota ?? '';
    const comentario = data?.comentario ?? '';
    evalDiv.innerHTML = `
      <label>Calificación final:</label>
      <input type="number" min="0" max="20" id="nota-final-${pasanteId}" value="${escapeHtml(nota)}">
      <label>Comentario:</label>
      <textarea id="comentario-final-${pasanteId}">${escapeHtml(comentario)}</textarea>
      <button id="guardar-eval-btn-${pasanteId}">Guardar</button>
    `;
    const btn = document.getElementById(`guardar-eval-btn-${pasanteId}`);
    btn.addEventListener('click', () => guardarEvaluacionPasante(pasanteId));
  } catch (err) {
    console.error('mostrarEvaluacionPasante error:', err);
  }
}
async function guardarEvaluacionPasante(pasanteId) {
  try {
    const notaEl = document.getElementById(`nota-final-${pasanteId}`);
    const comentarioEl = document.getElementById(`comentario-final-${pasanteId}`);
    const nota = notaEl ? notaEl.value : '';
    const comentario = comentarioEl ? comentarioEl.value : '';
    const res = await fetch('guardarEvaluacionPasante.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pasanteId, nota, comentario })
    });
    const data = await res.json().catch(() => ({ success: false }));
    alert(data.message || (data.success ? 'Calificación guardada' : 'Error al guardar'));
    // opcional: refrescar vista o datos
  } catch (err) {
    console.error('guardarEvaluacionPasante error:', err);
    alert('Error de red al guardar evaluación');
  }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  // Paneles al cargar
  cargarSupervisores();
  cargarPasantesAdmin();
  cargarChatSupervisores();
  // Nota: mostrarEvaluacionPasante(123) es un ejemplo; solo ejecutarlo si existe el elemento y el id real
  const exampleEvalDiv = document.getElementById('evaluacion-pasante-123');
  if (exampleEvalDiv) mostrarEvaluacionPasante(123);
});