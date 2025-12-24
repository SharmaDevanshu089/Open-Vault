document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const modalOverlay = document.getElementById('modalOverlay');
  const importModal = document.getElementById('importCsvModal');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('csvFileInput');
  const fileNameDisplay = document.getElementById('csvFileNameDisplay');
  const previewTable = document.getElementById('csvPreviewTableContainer');
  const containerArea = document.getElementById('passwordContainersArea');
  const emptyState = document.getElementById('emptyState');
  const btnClose = document.querySelectorAll('.close-modal-btn');
  const btnImportConfirm = document.getElementById('importCsvConfirmBtn');
  const importTitleInput = document.getElementById('importContainerTitleInput');

  let currentCSVData = null;

  // --- Init ---
  setupEventListeners();

  function setupEventListeners() {
    // Open import modal
    [document.getElementById('importCsvBtnGlobal'), document.getElementById('importCsvBtnEmpty')].forEach(btn => {
      if(btn) btn.addEventListener('click', openModal);
    });

    // Close modal
    btnClose.forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#5e63ff';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      handleFile(e.dataTransfer.files[0]);
    });

    // File input change
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Import button
    if (btnImportConfirm) {
      btnImportConfirm.addEventListener('click', importCSV);
    }
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    fileNameDisplay.textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0) {
        alert('Invalid CSV file.');
        return;
      }

      currentCSVData = { headers, rows };
      displayTable(headers, rows);
      btnImportConfirm.style.display = 'inline-block';
    };
    reader.readAsText(file);
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 1) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return values;
    });

    return { headers, rows };
  }

  function displayTable(headers, rows) {
    let html = '<table class="csv-display-table"><thead><tr>';
    
    headers.forEach(h => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${escapeHtml(cell)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    previewTable.innerHTML = html;
  }

  function displayImportedData(container) {
    // Create container element with the imported CSV data
    const containerEl = document.createElement('div');
    containerEl.className = 'password-group';
    
    let tableHTML = '<table class="pass-table"><thead><tr>';
    container.headers.forEach(h => {
      tableHTML += `<th>${escapeHtml(h)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    container.data.forEach(row => {
      tableHTML += '<tr>';
      row.forEach(cell => {
        tableHTML += `<td>${escapeHtml(cell)}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    containerEl.innerHTML = `
      <div class="group-header">
        <h2>${escapeHtml(container.title)}</h2>
        <button class="btn btn-sm btn-danger delete-group-btn" data-id="${container.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <div class="table-responsive">
        ${tableHTML}
      </div>
    `;

    emptyState.style.display = 'none';
    containerArea.appendChild(containerEl);

    // Attach delete handler
    containerEl.querySelector('.delete-group-btn').addEventListener('click', (e) => {
      if (confirm('Delete this password collection?')) {
        const id = e.currentTarget.dataset.id;
        const containers = JSON.parse(localStorage.getItem('passwordContainers') || '[]');
        const filtered = containers.filter(c => c.id != id);
        localStorage.setItem('passwordContainers', JSON.stringify(filtered));
        containerEl.remove();
        
        if (filtered.length === 0) {
          emptyState.style.display = 'block';
        }
      }
    });
  }

  function importCSV() {
    if (!currentCSVData || currentCSVData.rows.length === 0) {
      alert('No CSV data to import.');
      return;
    }

    const title = importTitleInput.value.trim() || 'Imported ' + new Date().toLocaleDateString();
    
    // Store in localStorage
    const containers = JSON.parse(localStorage.getItem('passwordContainers') || '[]');
    const newContainer = {
      id: Date.now(),
      title: title,
      headers: currentCSVData.headers,
      data: currentCSVData.rows,
      importDate: new Date().toISOString()
    };

    containers.push(newContainer);
    localStorage.setItem('passwordContainers', JSON.stringify(containers));

    closeModal();
    resetModal();
    displayImportedData(newContainer);
  }

  function openModal() {
    modalOverlay.style.display = 'block';
    importModal.style.display = 'flex';
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    importModal.style.display = 'none';
  }

  function resetModal() {
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    importTitleInput.value = '';
    previewTable.innerHTML = '';
    btnImportConfirm.style.display = 'none';
    currentCSVData = null;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
});