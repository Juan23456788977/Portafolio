// chat_ui.js — UI mínima para chatear entre usuarios (usa messages.php)
// Monta en #panel-chat o similar. Requiere sesión activa (login).

(function(){
  let initialized = false;
  function el(t,a='',h=''){ const e=document.createElement(t); if(typeof a==='object') Object.keys(a).forEach(k=>e.setAttribute(k,a[k])); if(h) e.innerHTML=h; return e; }

  function mount(container) {
    if (!container || initialized) return;
    initialized = true;
    container.innerHTML = '';
    container.appendChild(el('h3',{},'Chat entre usuarios'));
    const wrapper = el('div',{ style:'display:flex;gap:12px;' });
    const left = el('div',{ style:'width:30%;' });
    const right = el('div',{ style:'flex:1;display:flex;flex-direction:column;' });

    left.innerHTML = '<div style="margin-bottom:8px;"><input id="chat-filter" placeholder="Buscar usuarios" style="width:100%;padding:6px"/></div><div id="chat-users" style="max-height:420px;overflow:auto"></div>';
    right.innerHTML = '<div id="chat-window" style="flex:1;overflow:auto;border:1px solid #ddd;padding:8px;border-radius:6px;background:#fff;"></div><div style="margin-top:8px;display:flex;gap:8px;"><input id="chat-msg" style="flex:1;padding:8px;" placeholder="Escribe mensaje..."/><button id="chat-send">Enviar</button></div>';

    wrapper.appendChild(left);
    wrapper.appendChild(right);
    container.appendChild(wrapper);

    const usersDiv = container.querySelector('#chat-users');
    const filter = container.querySelector('#chat-filter');
    const windowDiv = container.querySelector('#chat-window');
    const msgInput = container.querySelector('#chat-msg');
    const sendBtn = container.querySelector('#chat-send');

    let selectedUserId = null;

    async function loadUsers(q='') {
      usersDiv.innerHTML = 'Cargando...';
      try {
        const res = await fetch('listarUsuarios.php');
        const j = await res.json();
        if (!j.success) { usersDiv.innerHTML = 'Error'; return; }
        let arr = j.users || [];
        // Excluir admins de la lista de conversación y al propio usuario no lo eliminamos (si quisieras)
        // Filtrar por rol opcional si querés (pasante, supervisor, moderador)
        if (q) {
          const qq = q.toLowerCase();
          arr = arr.filter(u => (u.nombre||'').toLowerCase().includes(qq) || (u.email||'').toLowerCase().includes(qq));
        }
        if (!arr.length) { usersDiv.innerHTML = '<div>No hay usuarios</div>'; return; }
        let html = '';
        arr.forEach(u => {
          html += `<div style="padding:8px;border-bottom:1px solid #eee;cursor:pointer;" data-id="${u.id}"><strong>${escape(u.nombre)}</strong><div style="font-size:12px;color:#666">${escape(u.role)} — ${escape(u.email)}</div></div>`;
        });
        usersDiv.innerHTML = html;
        usersDiv.querySelectorAll('div[data-id]').forEach(d => {
          d.onclick = () => { selectUser(d.dataset.id, d); };
        });
      } catch (err) {
        usersDiv.innerHTML = 'Error de red';
      }
    }

    async function selectUser(id, elNode) {
      selectedUserId = id;
      windowDiv.innerHTML = 'Cargando conversación...';
      try {
        const res = await fetch('messages.php?conversation_with=' + encodeURIComponent(id));
        const j = await res.json();
        if (!j.success) { windowDiv.innerHTML = 'No hay conversación'; return; }
        const msgs = j.messages || [];
        let html = '';
        msgs.forEach(m => {
          const side = m.sender_id == selectedUserId ? 'left' : (m.sender_id == m.sender_id ? 'right' : 'right');
          html += `<div style="margin-bottom:10px;"><div style="padding:8px;border-radius:6px;background:${m.sender_id==selectedUserId? '#f1f1f1':'#d3f0d3'};max-width:70%;">${escape(m.message)}<div style="font-size:11px;color:#666;margin-top:6px;">${escape(m.created_at || '')} — ${escape(m.sender_nombre || '')}</div></div></div>`;
        });
        windowDiv.innerHTML = html;
        windowDiv.scrollTop = windowDiv.scrollHeight;
      } catch (err) {
        windowDiv.innerHTML = 'Error de red';
      }
    }

    async function sendMessage() {
      const text = msgInput.value.trim();
      if (!text || !selectedUserId) return;
      sendBtn.disabled = true;
      try {
        const res = await fetch('messages.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient_id: selectedUserId, message: text })
        });
        const j = await res.json();
        if (j.success) {
          msgInput.value = '';
          await selectUser(selectedUserId);
        } else {
          alert(j.message || 'No se pudo enviar');
        }
      } catch (err) {
        alert('Error de red');
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
    filter.addEventListener('input', (e)=> loadUsers(e.target.value));

    function escape(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

    loadUsers();
  }

  const observer = new MutationObserver((m) => {
    if (initialized) return;
    const panel = document.getElementById('panel-chat') || document.getElementById('panel-mod') || null;
    if (panel) mount(panel);
  });
  observer.observe(document.documentElement || document.body, { childList:true, subtree:true });
  document.addEventListener('DOMContentLoaded', ()=> {
    const panel = document.getElementById('panel-chat') || document.getElementById('panel-mod') || null;
    if (panel) mount(panel);
  });

})();