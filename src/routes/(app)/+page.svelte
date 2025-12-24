<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  let name = $state("");
  let greetMsg = $state("");
  let bool = invoke<boolean>("check_first_run").then((res) => {
    console.log("Is first run:", res);
    return res;
  });

  async function greet(event: Event) {
    event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsg = await invoke("greet", { name });
  }
</script>

<main class="container">

</main>

<style>
/* === PASSWORDS PAGE STYLES === */

:root {
  --card-bg: #1a1c26;
  --table-header-bg: #20222b;
  --table-border: #2a2d3a;
  --highlight-blue: #5e63ff;
  --highlight-red: #ff4b4b;
  --highlight-green: #00e676;
  --text-muted: #8b8ea0;
}

.passwords-dashboard {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- Header --- */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  color: var(--text-clr);
}

.subtitle {
  color: var(--secondary-text-clr);
  font-size: 0.95rem;
}

/* --- Stats Cards (The "Grey Boxes") --- */
.stats-overview {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background-color: var(--card-bg);
  flex: 1;
  min-width: 280px;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--line-clr);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-clr);
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-icon-wrapper.total {
  background-color: rgba(94, 99, 255, 0.1);
  color: var(--highlight-blue);
  border: 2px solid var(--highlight-blue);
}

.stat-icon-wrapper.weak {
  background-color: rgba(255, 75, 75, 0.1);
  color: var(--highlight-red);
  border: 2px solid var(--highlight-red);
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-clr);
  line-height: 1;
}

.stat-label {
  color: var(--secondary-text-clr);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

/* --- Controls Bar --- */
.controls-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--card-bg);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--line-clr);
  align-items: center;
}

.search-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  background-color: var(--base-clr);
  border-radius: 8px;
  padding: 0 1rem;
  border: 1px solid transparent;
}

.search-wrapper:focus-within {
  border-color: var(--accent-clr);
}

.search-wrapper i {
  color: var(--secondary-text-clr);
}

.search-wrapper input {
  background: transparent;
  border: none;
  color: var(--text-clr);
  padding: 0.8rem;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
}

.icon-only {
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Filter Panel --- */
.filter-panel {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--line-clr);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  color: var(--secondary-text-clr);
}

.filter-input {
  background-color: var(--base-clr);
  border: 1px solid var(--line-clr);
  color: var(--text-clr);
  padding: 0.6rem;
  border-radius: 6px;
  outline: none;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* --- Content Area / Tables --- */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.password-group {
  background-color: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--line-clr);
  overflow: hidden;
}

.group-header {
  padding: 1rem 1.5rem;
  background-color: rgba(255,255,255,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--line-clr);
}

.group-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-clr);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.pass-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.pass-table th {
  background-color: var(--table-header-bg);
  color: var(--secondary-text-clr);
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pass-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--line-clr);
  color: var(--text-clr);
  vertical-align: middle;
}

.pass-table tr:last-child td {
  border-bottom: none;
}

.pass-table tr:hover {
  background-color: rgba(255,255,255,0.02);
}

/* Password masking */
.password-cell {
  font-family: monospace;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.reveal-icon {
  opacity: 0.3;
  font-size: 0.8em;
  transition: opacity 0.2s;
}

.password-cell:hover .reveal-icon {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: 16px;
  border: 2px dashed var(--line-clr);
  margin-top: 2rem;
}

.empty-illustration {
  font-size: 3rem;
  color: var(--secondary-text-clr);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-clr);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--secondary-text-clr);
  margin-bottom: 1.5rem;
}

/* --- Buttons --- */
.btn {
  padding: 0.6em 1.2em;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary { background-color: var(--accent-clr); color: white; }
.btn-primary:hover { background-color: #4b50e6; box-shadow: 0 4px 10px rgba(94, 99, 255, 0.3); }

.btn-secondary { background-color: transparent; border: 1px solid var(--line-clr); color: var(--text-clr); }
.btn-secondary:hover { background-color: var(--hover-clr); }

.btn-danger { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
.btn-danger:hover { background-color: rgba(244, 67, 54, 0.2); }

.btn-success { background-color: var(--highlight-green); color: #000; font-weight: 600; }

.btn-sm { padding: 0.4em 0.8em; font-size: 0.85rem; }
.btn-text { background: none; color: var(--secondary-text-clr); }
.btn-text:hover { color: var(--text-clr); }

/* --- Modal Styles --- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: none;
}

.modal {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-bg);
  border: 1px solid var(--line-clr);
  width: 90%; max-width: 700px;
  max-height: 90vh;
  border-radius: 16px;
  z-index: 1001;
  display: none;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--line-clr);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-modal-btn {
  background: none !important;
  border: none !important;
  color: var(--secondary-text-clr) !important;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem !important;
  line-height: 1;
  transition: color 0.2s;
}

.close-modal-btn:hover {
  color: var(--text-clr) !important;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--line-clr);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: rgba(0,0,0,0.2);
}

/* File Upload Zone */
.file-upload-area {
  border: 2px dashed var(--line-clr);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.file-upload-area:hover {
  border-color: var(--accent-clr);
  background-color: rgba(94, 99, 255, 0.05);
}

.file-upload-area i { font-size: 2.5rem; color: var(--secondary-text-clr); margin-bottom: 1rem; }
.file-name { display: block; margin-top: 1rem; color: var(--highlight-green); font-weight: 500; }

/* Mapping Grid */
.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mapping-item label {
  display: block;
  font-size: 0.8rem;
  color: var(--secondary-text-clr);
  margin-bottom: 0.5rem;
}

.mapping-select {
  width: 100%;
  padding: 0.5rem;
  background-color: var(--base-clr);
  border: 1px solid var(--line-clr);
  color: var(--text-clr);
  border-radius: 4px;
}

/* CSV Display Table */
.csv-display-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.csv-display-table thead {
  background-color: var(--table-header-bg);
}

.csv-display-table th {
  padding: 0.75rem;
  text-align: left;
  color: var(--secondary-text-clr);
  font-weight: 600;
  border-bottom: 2px solid var(--table-border);
  font-size: 0.85rem;
  white-space: nowrap;
}

.csv-display-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--table-border);
  color: var(--text-clr);
  word-break: break-word;
  max-width: 300px;
}

.csv-display-table tbody tr:hover {
  background-color: rgba(94, 99, 255, 0.05);
}

.table-responsive {
  overflow-x: auto;
}
</style>
