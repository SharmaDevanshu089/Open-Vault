// passwords_page.js
document.addEventListener('DOMContentLoaded', () => {
  // API helpers
  const apiBase = window.API_BASE || (window.apiUrl ? window.apiUrl('') : 'http://localhost:3000');
  async function fetchJson(url, opts = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function loadCredentials() {
    try {
      const creds = await fetchJson((window.apiUrl ? window.apiUrl('/credentials') : apiBase + '/credentials'));
      renderCredentials(creds);
    } catch (err) {
      console.warn('Could not load credentials:', err.message);
      document.getElementById('emptyState').style.display = 'block';
    }
  }
  // --- Modal Helpers ---
  function toggleModal(modalId, show = true) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    if (show) {
      overlay.style.display = 'block';
      modal.style.display = 'block';
    } else {
      overlay.style.display = 'none';
      modal.style.display = 'none';
    }
  }

  // --- Global Buttons ---
  document.getElementById('toggleFiltersBtn').addEventListener('click', () => {
    const section = document.getElementById('filterExpansionSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  });

  const importBtns = ['importCsvBtnGlobal', 'importCsvBtnEmpty'];
  importBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => toggleModal('importCsvModal', true));
  });

  const addCredentialBtns = ['addNewCredentialBtnGlobal', 'addNewCredentialBtnEmpty'];
  addCredentialBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => toggleModal('addCredentialModal', true));
  });

  // --- Modal Close Buttons ---
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.dataset.modalId;
      toggleModal(modalId, false);
    });
  });

  // --- Password Actions ---
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const span = e.currentTarget.closest('.password-cell').querySelector('.password-text');
      span.textContent = span.textContent.includes('*') ? 'actual-password' : '********';
    });
  });

  document.querySelectorAll('.copy-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const password = e.currentTarget.closest('.password-cell').querySelector('.password-text').textContent;
      navigator.clipboard.writeText(password);
      alert('Password copied!');
    });
  });

  // --- Credential Actions ---
  document.querySelectorAll('.edit-credential').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Edit functionality coming soon!');
    });
  });

  document.querySelectorAll('.delete-credential').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.credentialId;
      toggleModal('confirmationModal', true);
      document.getElementById('confirmationModalMessage').textContent = 'Delete this credential?';
      document.getElementById('confirmActionBtn').onclick = async () => {
        toggleModal('confirmationModal', false);
        try {
          await fetchJson((window.apiUrl ? window.apiUrl(`/credentials/${id}`) : apiBase + `/credentials/${id}`), { method: 'DELETE' });
          await loadCredentials();
        } catch (err) {
          alert('Delete failed: ' + err.message);
        }
      };
    });
  });

  // --- Container Actions ---
  document.querySelectorAll('.btn-delete-container').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleModal('confirmationModal', true);
      document.getElementById('confirmationModalMessage').textContent = 'Delete this container and all its credentials?';
      document.getElementById('confirmActionBtn').onclick = () => {
        toggleModal('confirmationModal', false);
        alert('Container deleted.');
      };
    });
  });

  document.querySelectorAll('.btn-add-to-container').forEach(btn => {
    btn.addEventListener('click', () => toggleModal('addCredentialModal', true));
  });

  // --- Filters ---
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(input => {
      if (input.type === 'select-multiple' || input.tagName === 'SELECT') {
        input.selectedIndex = -1;
      } else {
        input.value = '';
      }
    });
  });

  document.getElementById('applyFiltersBtn').addEventListener('click', () => {
    alert('Filters applied.');
  });

  // --- Add Credential Modal ---
  document.getElementById('generatePasswordBtn').addEventListener('click', () => {
    const generated = Math.random().toString(36).slice(-10) + 'A1!';
    document.getElementById('credentialPassword').value = generated;
    document.getElementById('credentialConfirmPassword').value = generated;
  });

  document.querySelector('.toggle-password-modal').addEventListener('click', (e) => {
    const passwordInput = e.currentTarget.previousElementSibling;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('credentialTargetContainer').addEventListener('change', (e) => {
    const showNew = e.target.value === '_new_';
    document.getElementById('newContainerNameGroup').style.display = showNew ? 'block' : 'none';
  });

  document.getElementById('addCredentialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    (async () => {
      const payload = {
        site: document.getElementById('credentialWebsite').value,
        username: document.getElementById('credentialUsername').value,
        password: document.getElementById('credentialPassword').value,
        notes: document.getElementById('credentialNotes').value,
        tags: (document.getElementById('credentialTags').value || '').split(',').map(s => s.trim()).filter(Boolean),
        container: document.getElementById('credentialTargetContainer').value || null,
      };
      try {
        await fetchJson((window.apiUrl ? window.apiUrl('/credentials') : apiBase + '/credentials'), { method: 'POST', body: JSON.stringify(payload) });
        toggleModal('addCredentialModal', false);
        await loadCredentials();
      } catch (err) {
        alert('Save failed: ' + err.message);
      }
    })();
  });

  // --- CSV Modal ---
  document.getElementById('csvFileInput').addEventListener('change', (e) => {
    const name = e.target.files[0]?.name || '';
    document.getElementById('csvFileNameDisplay').textContent = name;
  });

  // Import flow: parse CSV on confirm and send to backend
  document.getElementById('initiateImportBtn').addEventListener('click', async () => {
    const input = document.getElementById('csvFileInput');
    const file = input.files[0];
    if (!file) return alert('Select a CSV file first');
    const text = await file.text();
    // very small CSV parser: assume header row and comma-separated
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const headers = rows.shift().split(',').map(h => h.trim().toLowerCase());
    const entries = rows.map(r => {
      const cols = r.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return { site: obj.website || obj.site || '', username: obj.username || '', password: obj.password || '', notes: obj.notes || '' };
    });
    try {
      await fetchJson((window.apiUrl ? window.apiUrl('/import-credentials') : apiBase + '/import-credentials'), { method: 'POST', body: JSON.stringify({ entries }) });
      document.getElementById('csvFileInput').value = '';
      document.getElementById('csvFileNameDisplay').textContent = '';
      toggleModal('importCsvModal', false);
      await loadCredentials();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  });

  // render helpers
  function renderCredentials(items) {
    const area = document.getElementById('passwordContainersArea');
    const empty = document.getElementById('emptyState');
    area.innerHTML = '';
    if (!items || items.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'password-card';
      el.innerHTML = `
        <div class="password-card-header">
          <h3>${escapeHtml(it.site)}</h3>
          <div class="card-actions">
            <button class="btn btn-link toggle-password" data-credential-id="${it.id}">Show</button>
            <button class="btn btn-danger delete-credential" data-credential-id="${it.id}">Delete</button>
          </div>
        </div>
        <div class="password-card-body">
          <div><strong>Username:</strong> ${escapeHtml(it.username || '')}</div>
          <div><strong>Password:</strong> <span class="password-text">${'*'.repeat(Math.min(8, (it.password||'').length))}</span></div>
          <div class="small">${escapeHtml(it.notes || '')}</div>
        </div>
      `;
      area.appendChild(el);
    });

    // rebind dynamic buttons
    area.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.credentialId;
        const span = e.currentTarget.closest('.password-card').querySelector('.password-text');
        if (span.textContent.includes('*')) {
          // fetch full credential (we could return password in list, but for demo fetch single)
          try {
            const all = await fetchJson((window.apiUrl ? window.apiUrl('/credentials') : apiBase + '/credentials'));
            const found = all.find(c => c.id === id);
            span.textContent = found ? found.password : '—';
            e.currentTarget.textContent = 'Hide';
          } catch (err) { alert('Could not fetch password: ' + err.message); }
        } else {
          span.textContent = '*'.repeat(8);
          e.currentTarget.textContent = 'Show';
        }
      });
    });

    area.querySelectorAll('.delete-credential').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.credentialId;
        toggleModal('confirmationModal', true);
        document.getElementById('confirmationModalMessage').textContent = 'Delete this credential?';
        document.getElementById('confirmActionBtn').onclick = async () => {
          toggleModal('confirmationModal', false);
          try {
            await fetchJson((window.apiUrl ? window.apiUrl(`/credentials/${id}`) : apiBase + `/credentials/${id}`), { method: 'DELETE' });
            await loadCredentials();
          } catch (err) {
            alert('Delete failed: ' + err.message);
          }
        };
      });
    });
  }

  // small html escape helper
  function escapeHtml(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  // initial load
  loadCredentials();
});
