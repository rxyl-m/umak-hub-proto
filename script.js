/* ═══════════════════════════════════════════════
   script.js — UMAK HUB · Full Feature Version
   ═══════════════════════════════════════════════ */
import { supabase } from './supabase.js';

let _studentAuthenticated = false;
let _isStudentPage = false;

/* ── members.html ── */
const grid      = document.getElementById('members-grid');
const noResults = document.getElementById('no-results');

if (grid) {
  (async () => {
    const { data: students, error } = await supabase
      .from('students').select('*').order('last_name');
    if (error) { console.error(error); return; }
    students.forEach(s => {
      const initials = (s.first_name[0] + s.last_name[0]).toUpperCase();
      const div = document.createElement('div');
      div.className = 'memlink';
      div.innerHTML = `
        <div class="card-inner">
          <a href="student.html?id=${s.id}" class="card-front" style="text-decoration:none;color:inherit;">
            <div class="mem-avatar">${initials}</div>
            <div class="studentid" data-name="${s.last_name}">
              <h2>${s.last_name}<br/>${s.first_name}</h2>
            </div>
          </a>
          <div class="card-back">
            <h3>Quick Info</h3>
            <p>Hours: ${s.hours} / ${s.total}</p>
            <p>Status: ${s.hours >= s.total ? 'Complete' : 'In Progress'}</p>
            <a href="student.html?id=${s.id}" class="btn-primary" style="margin-top:14px;padding:6px 14px;font-size:0.75rem;">View Profile</a>
          </div>
        </div>`;
      div.addEventListener('contextmenu', e => { e.preventDefault(); div.classList.toggle('flipped'); });
      div.addEventListener('click', e => {
        if (div.classList.contains('flipped') && e.target.tagName !== 'A') {
          e.preventDefault(); div.classList.remove('flipped');
        }
      });
      grid.insertBefore(div, noResults);
    });
    setupCardObserver();
  })();
}

/* ── student.html ── */
const studentPageContent = document.getElementById('page-content');

if (studentPageContent) {
  _isStudentPage = true;
  (async () => {
    const params = new URLSearchParams(window.location.search);
    const rawId  = (params.get('id') || '').toLowerCase();
    const { data, error } = await supabase.from('students').select('*').eq('id', rawId).single();

    if (error || !data) {
      studentPageContent.innerHTML = `
        <div class="not-found">
          <h1>404</h1>
          <p>Student not found. Check the URL or go back to the members list.</p>
          <a href="members.html" class="btn-primary not-found-back">← ʙᴀᴄᴋ ᴛᴏ ᴍᴇᴍʙᴇʀꜱ</a>
        </div>`;
      return;
    }

    const student  = { ...data };
    document.title = student.last_name + ', ' + student.first_name + ' — G12-01CPG';
    window._studentTotal  = student.total;
    window._studentLogged = student.hours;

    const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();
    function calcPct(h) { return Math.min(Math.round((h / student.total) * 100), 100); }
    function calcRem(h) { return Math.max(student.total - h, 0); }

    studentPageContent.innerHTML = `
      <div class="content-card profile-card">
        <div class="profile-accent-bar"></div>
        <div class="profile-hero">
          <div class="profile-avatar-initials" id="avatar-circle">${initials}</div>
          <div class="profile-info">
            <h1 class="profile-name" id="profile-name">${student.last_name}, ${student.first_name}</h1>
            <p class="profile-meta">G12-01CPG · University of Makati · ICT Strand</p>
            <div class="profile-tags">
              <span class="profile-tag">Student</span>
              <span class="profile-tag">Work Immersion</span>
              <span class="profile-tag">ICT</span>
            </div>
          </div>
        </div>
        <div class="prog-lbl">
          <span class="p-title">IMMERSION PROGRESS</span>
          <span class="p-count" id="hoursCount">${student.hours} / ${student.total} hrs</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill" id="progressBar" style="width:${calcPct(student.hours)}%"></div>
        </div>
        <p class="prog-caption" id="progCaption">${calcPct(student.hours)}% complete · ${calcRem(student.hours)} hours remaining</p>
        <div class="stat-row">
          <div class="t-stat"><div class="tv blue" id="displayLogged">${student.hours}</div><div class="tl">Hours Logged</div></div>
          <div class="t-stat"><div class="tv amber" id="displayRemaining">${calcRem(student.hours)}</div><div class="tl">Hours Left</div></div>
          <div class="t-stat"><div class="tv green" id="displayDays">${student.days}</div><div class="tl">Days Attended</div></div>
        </div>
      </div>

      <div class="content-card" id="auth-panel">
        <div class="sec-hdr">
          <h2 class="sec-title">STUDENT LOGIN</h2>
          <span class="sec-badge red">RESTRICTED</span>
        </div>
        <div class="sys-panel">
          <h3>Access Your Journal</h3>
          <input type="password" id="student-pin" class="finput pin-input" placeholder="Enter 4-digit PIN…" maxlength="4"/>
          <p id="pin-err" class="field-err">Incorrect PIN. Please try again.</p>
          <button class="btn-primary" id="login-btn">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"/></svg>
            Access Journal
          </button>
        </div>
      </div>

      <div class="content-card hidden" id="upload-panel">
        <div class="sec-hdr">
          <h2 class="sec-title">UPLOAD DOCUMENTATION</h2>
          <span class="sec-badge green">AUTHENTICATED</span>
        </div>
        <div class="sys-panel upload-sys-panel">
          <h3>Upload Journal File</h3>
          <div class="upload-row">
            <input type="text" id="file-custom-name" class="finput" placeholder="Custom name or date (e.g. Day 01 · April 11)"/>
            <input type="file" id="journal-file" accept="image/*,.pdf" class="file-input"/>
            <button class="btn-primary" id="upload-btn">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8"/></svg>
              Upload File
            </button>
          </div>
          <p id="upload-status" class="upload-status"></p>
          <button class="btn-secondary" id="view-files-btn" style="margin-top:10px;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
            View Uploaded Files
          </button>
        </div>
        <div class="sec-hdr" style="margin-top:1.5rem;">
          <h2 class="sec-title">JOURNAL LOG</h2>
          <span class="sec-badge navy" id="entry-count">0 entries</span>
        </div>
        <div class="journal-grid" id="journal-grid">
          <p class="journal-empty">Loading entries…</p>
        </div>
      </div>

      <div class="je-modal-overlay hidden" id="jeDetailOverlay">
        <div class="je-modal">
          <div class="je-modal-head">
            <h3 id="jeDetailTitle">Entry Details</h3>
            <button id="jeDetailClose" class="modal-close">✕</button>
          </div>
          <div class="je-modal-body">
            <p class="je-detail-row"><span class="je-detail-label">Date</span><span id="jeDetailDate"></span></p>
            <p class="je-detail-row"><span class="je-detail-label">Hours</span><span id="jeDetailHrs"></span></p>
            <p class="je-detail-row"><span class="je-detail-label">Task</span><span id="jeDetailTask"></span></p>
            <p class="je-detail-row"><span class="je-detail-label">Notes</span><span id="jeDetailNotes"></span></p>
          </div>
        </div>
      </div>

      <div class="je-modal-overlay hidden" id="jeEditOverlay">
        <div class="je-modal">
          <div class="je-modal-head">
            <h3>Edit Entry</h3>
            <button id="jeEditClose" class="modal-close">✕</button>
          </div>
          <div class="je-modal-body">
            <input type="hidden" id="jeEditId"/>
            <input type="hidden" id="jeEditOldHrs"/>
            <div class="fgroup"><label class="flabel">Date</label><input class="finput" type="date" id="jeEditDate"/></div>
            <div class="fgroup"><label class="flabel">Hours</label><input class="finput" type="number" id="jeEditHrs" min="0.5" max="12" step="0.5"/></div>
            <div class="fgroup"><label class="flabel">Task Description</label><input class="finput" type="text" id="jeEditTask"/></div>
            <div class="fgroup"><label class="flabel">Notes</label><textarea class="ftextarea" id="jeEditNotes"></textarea></div>
          </div>
          <div class="modal-foot">
            <button class="btn-danger" id="jeEditCancel">ᴄᴀɴᴄᴇʟ</button>
            <button class="btn-success" id="jeEditSave">ꜱᴀᴠᴇ</button>
          </div>
        </div>
      </div>

      <div class="je-modal-overlay hidden" id="filesModalOverlay">
        <div class="je-modal je-modal--wide">
          <div class="je-modal-head">
            <h3>Uploaded Files</h3>
            <button id="filesModalClose" class="modal-close">✕</button>
          </div>
          <div class="je-modal-body">
            <input type="text" class="finput" id="filesSearch" placeholder="Search by name or date…" style="margin-bottom:12px;"/>
            <div id="files-list"><p class="journal-empty">Loading files…</p></div>
          </div>
        </div>
      </div>`;
    
    function updateStudentTracker() {
      const pct = calcPct(student.hours);
      const rem = calcRem(student.hours);
      const bar = document.getElementById('progressBar');
      if (bar) bar.style.width = pct + '%';
      const cnt = document.getElementById('hoursCount');
      if (cnt) cnt.textContent = student.hours + ' / ' + student.total + ' hrs';
      const dL = document.getElementById('displayLogged');
      if (dL) dL.textContent = student.hours;
      const dR = document.getElementById('displayRemaining');
      if (dR) dR.textContent = rem;
      const dD = document.getElementById('displayDays');
      if (dD) dD.textContent = student.days;
      const cap = document.getElementById('progCaption');
      if (cap) cap.textContent = pct + '% complete · ' + rem + ' hours remaining';
    }

    function tryLogin() {
      const pin = document.getElementById('student-pin').value;
      const err = document.getElementById('pin-err');
      if (pin === student.pin) {
        if (student.pin === '1234') { showSetPinScreen(); }
        else {
          _studentAuthenticated = true;
          document.getElementById('auth-panel').classList.add('hidden');
          document.getElementById('upload-panel').classList.remove('hidden');
          loadJournalEntries();
        }
      } else {
        err.classList.add('show');
        document.getElementById('student-pin').classList.add('input-error');
        setTimeout(() => { err.classList.remove('show'); document.getElementById('student-pin').classList.remove('input-error'); }, 2500);
      }
    }

    function showSetPinScreen() {
      document.getElementById('auth-panel').innerHTML = `
        <div class="sec-hdr">
          <h2 class="sec-title">SET YOUR PIN</h2>
          <span class="sec-badge amber">FIRST LOGIN</span>
        </div>
        <div class="sys-panel">
          <h3>Create a new 4-digit PIN</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">You're using the default PIN. Please set a personal PIN that only you know.</p>
          <input type="password" id="new-pin" class="finput pin-input" placeholder="New 4-digit PIN…" maxlength="4"/>
          <input type="password" id="confirm-pin" class="finput pin-input" placeholder="Confirm PIN…" maxlength="4" style="margin-top:8px;"/>
          <p id="set-pin-err" class="field-err">PINs do not match or too short.</p>
          <button class="btn-primary" id="set-pin-btn" style="margin-top:12px;">Save PIN & Continue</button>
        </div>`;
      document.getElementById('set-pin-btn').addEventListener('click', async () => {
        const newPin = document.getElementById('new-pin').value;
        const confirmPin = document.getElementById('confirm-pin').value;
        const err = document.getElementById('set-pin-err');
        if (newPin.length < 4 || newPin !== confirmPin) {
          err.classList.add('show'); setTimeout(() => err.classList.remove('show'), 2500); return;
        }
        const { error } = await supabase.from('students').update({ pin: newPin }).eq('id', student.id);
        if (error) { showToast('Error saving PIN. Try again.'); return; }
        student.pin = newPin; _studentAuthenticated = true;
        showToast('PIN set successfully ✓');
        document.getElementById('auth-panel').classList.add('hidden');
        document.getElementById('upload-panel').classList.remove('hidden');
        loadJournalEntries();
      });
    }

    document.getElementById('login-btn').addEventListener('click', tryLogin);
    document.getElementById('student-pin').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

    document.getElementById('upload-btn').addEventListener('click', async () => {
      const file = document.getElementById('journal-file').files[0];
      const customName = document.getElementById('file-custom-name').value.trim();
      const status = document.getElementById('upload-status');
      if (!file) {
        status.classList.add('upload-status-error'); status.textContent = 'Please select a file first.';
        setTimeout(() => { status.classList.remove('upload-status-error'); status.textContent = ''; }, 2500); return;
      }
      status.textContent = 'Uploading…';
      const displayName = customName || file.name;
      const filePath = `${student.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('journal-files').upload(filePath, file);
      if (uploadError) { status.classList.add('upload-status-error'); status.textContent = 'Upload failed: ' + uploadError.message; return; }
      const { data: urlData } = supabase.storage.from('journal-files').getPublicUrl(filePath);
      await supabase.from('file_uploads').insert({ student_id: student.id, filename: displayName, file_url: urlData.publicUrl, file_path: filePath });
      status.classList.remove('upload-status-error');
      status.textContent = '✓ "' + displayName + '" uploaded!';
      document.getElementById('journal-file').value = '';
      document.getElementById('file-custom-name').value = '';
    });

    document.getElementById('view-files-btn').addEventListener('click', async () => {
      document.getElementById('filesModalOverlay').classList.remove('hidden');
      await loadFilesList();
    });
    document.getElementById('filesModalClose').addEventListener('click', () => { document.getElementById('filesModalOverlay').classList.add('hidden'); });
    document.getElementById('filesSearch')?.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.file-item').forEach(item => { item.style.display = item.dataset.name.toLowerCase().includes(q) ? '' : 'none'; });
    });

    async function loadFilesList() {
      const filesList = document.getElementById('files-list');
      const { data: files } = await supabase.from('file_uploads').select('*').eq('student_id', student.id).order('uploaded_at', { ascending: false });
      if (!files || files.length === 0) { filesList.innerHTML = '<p class="journal-empty">No files uploaded yet.</p>'; return; }
      filesList.innerHTML = files.map(f => `
        <div class="file-item" data-name="${f.filename}">
          <div class="file-item-info">
            <span class="file-item-name">${f.filename}</span>
            <span class="file-item-date">${new Date(f.uploaded_at).toLocaleDateString()}</span>
          </div>
          <div class="file-item-actions">
            <a href="${f.file_url}" target="_blank" class="btn-primary" style="padding:4px 10px;font-size:0.72rem;">Open</a>
            <button class="btn-danger" style="padding:4px 10px;font-size:0.72rem;" onclick="deleteFile('${f.id}','${f.file_path}',this)">Delete</button>
          </div>
        </div>`).join('');
    }

    window.deleteFile = async (fileId, filePath, btn) => {
      btn.textContent = '…';
      if (filePath) await supabase.storage.from('journal-files').remove([filePath]);
      await supabase.from('file_uploads').delete().eq('id', fileId);
      await loadFilesList();
    };

    async function loadJournalEntries() {
      const { data: entries } = await supabase.from('journal_entries').select('*').eq('student_id', student.id).order('created_at', { ascending: false });
      renderJournal(entries || []);
    }

    const isMobile = () => window.innerWidth <= 768;

    function renderJournal(entries) {
      const journalGrid = document.getElementById('journal-grid');
      const badge = document.getElementById('entry-count');
      if (!journalGrid) return;
      badge.textContent = entries.length + ' entr' + (entries.length === 1 ? 'y' : 'ies');
      if (entries.length === 0) {
        journalGrid.innerHTML = '<p class="journal-empty">No journal entries yet. Submit hours using the UPDATE button above to get started.</p>';
        return;
      }
      journalGrid.innerHTML = entries.map((e, i) => `
        <div class="journal-entry" data-id="${e.id}">
          <div class="je-date">Day ${String(entries.length - i).padStart(2,'0')} · ${e.log_date}</div>
          <div class="je-title">${e.task || 'Immersion hours'}</div>
          <div class="je-actions">
            ${isMobile() ? `<button class="je-btn je-btn--details" data-id="${e.id}">Details</button>` : ''}
            <button class="je-btn je-btn--edit" data-id="${e.id}">Edit</button>
            <button class="je-btn je-btn--delete" data-id="${e.id}">Delete</button>
          </div>
          <span class="je-badge navy">Logged</span>
        </div>`).join('');
      document.querySelectorAll('.journal-entry').forEach(card => {
        const entry = entries.find(e => e.id === card.dataset.id);
        if (!entry) return;
        card.addEventListener('contextmenu', ev => { ev.preventDefault(); openJeDetail(entry); });
        card.querySelector('.je-btn--details')?.addEventListener('click', () => openJeDetail(entry));
        card.querySelector('.je-btn--edit')?.addEventListener('click', () => openJeEdit(entry));
        card.querySelector('.je-btn--delete')?.addEventListener('click', () => deleteJournalEntry(entry));
      });
    }

    function openJeDetail(entry) {
      document.getElementById('jeDetailTitle').textContent = entry.task || 'Immersion hours';
      document.getElementById('jeDetailDate').textContent  = entry.log_date;
      document.getElementById('jeDetailHrs').textContent   = entry.hrs + ' hour' + (entry.hrs !== 1 ? 's' : '');
      document.getElementById('jeDetailTask').textContent  = entry.task || '—';
      document.getElementById('jeDetailNotes').textContent = entry.notes || '—';
      document.getElementById('jeDetailOverlay').classList.remove('hidden');
    }
    document.getElementById('jeDetailClose').addEventListener('click', () => { document.getElementById('jeDetailOverlay').classList.add('hidden'); });

    function openJeEdit(entry) {
      document.getElementById('jeEditId').value     = entry.id;
      document.getElementById('jeEditOldHrs').value = entry.hrs;
      document.getElementById('jeEditDate').value   = entry.log_date;
      document.getElementById('jeEditHrs').value    = entry.hrs;
      document.getElementById('jeEditTask').value   = entry.task || '';
      document.getElementById('jeEditNotes').value  = entry.notes || '';
      document.getElementById('jeEditOverlay').classList.remove('hidden');
    }
    document.getElementById('jeEditClose').addEventListener('click', () => { document.getElementById('jeEditOverlay').classList.add('hidden'); });
    document.getElementById('jeEditCancel').addEventListener('click', () => { document.getElementById('jeEditOverlay').classList.add('hidden'); });

    document.getElementById('jeEditSave').addEventListener('click', async () => {
      const id     = document.getElementById('jeEditId').value;
      const oldHrs = parseFloat(document.getElementById('jeEditOldHrs').value);
      const newHrs = parseFloat(document.getElementById('jeEditHrs').value);
      const date   = document.getElementById('jeEditDate').value;
      const task   = document.getElementById('jeEditTask').value.trim();
      const notes  = document.getElementById('jeEditNotes').value.trim();
      if (!newHrs || newHrs <= 0 || newHrs > 12 || !date) { showToast('Please fill in valid fields.'); return; }
      await supabase.from('journal_entries').update({ log_date: date, hrs: newHrs, task, notes }).eq('id', id);
      const hrsDiff  = newHrs - oldHrs;
      const newTotal = Math.min(Math.max((student.hours || 0) + hrsDiff, 0), student.total);
      await supabase.from('students').update({ hours: newTotal }).eq('id', student.id);
      student.hours = newTotal;
      updateStudentTracker();
      document.getElementById('jeEditOverlay').classList.add('hidden');
      showToast('Entry updated ✓');
      loadJournalEntries();
    });

    async function deleteJournalEntry(entry) {
      if (!confirm('Delete this entry? This will subtract ' + entry.hrs + ' hour(s) from your total.')) return;
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      const newHours = Math.max((student.hours || 0) - entry.hrs, 0);
      const newDays  = Math.max((student.days || 0) - 1, 0);
      await supabase.from('students').update({ hours: newHours, days: newDays }).eq('id', student.id);
      student.hours = newHours; student.days = newDays;
      updateStudentTracker(); showToast('Entry deleted.'); loadJournalEntries();
    }

    document.getElementById('modalSubmit')?.addEventListener('click', async () => {
      const hrsInput = document.getElementById('logHours');
      const hrs   = parseFloat(hrsInput?.value);
      const date  = document.getElementById('logDate')?.value;
      const task  = document.getElementById('logTask')?.value?.trim() || 'Immersion hours';
      const notes = document.getElementById('logNotes')?.value?.trim() || '';
      if (!hrs || hrs <= 0 || hrs > 12 || !date) return;
      if (!document.getElementById('upload-panel').classList.contains('hidden')) {
        await supabase.from('journal_entries').insert({ student_id: student.id, log_date: date, hrs, task, notes });
        const newHours = Math.min((student.hours || 0) + hrs, student.total);
        await supabase.from('students').update({ hours: newHours, days: (student.days || 0) + 1 }).eq('id', student.id);
        student.hours = newHours; student.days = (student.days || 0) + 1;
        updateStudentTracker(); loadJournalEntries(); closeModal(); showToast('+' + hrs + 'h logged ✓');
      }
    }, true);

  })();
}

/* ── IntersectionObserver ── */
function setupCardObserver() {
  const cards = document.querySelectorAll('.memlink');
  if (!cards.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  cards.forEach(card => observer.observe(card));
}
setupCardObserver();

/* ── Hamburger ── */
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('mobileDrawer');
const backdrop  = document.getElementById('navBackdrop');

function openMenu() {
  hamburger?.classList.add('open'); drawer?.classList.add('open');
  backdrop?.classList.add('open'); document.body.style.overflow = 'hidden';
}
function closeMenu(e) {
  if (e) e.preventDefault();
  hamburger?.classList.remove('open'); drawer?.classList.remove('open');
  backdrop?.classList.remove('open'); document.body.style.overflow = '';
  if (e?.currentTarget?.tagName === 'A') {
    const href = e.currentTarget.getAttribute('href');
    if (href && href !== '#') setTimeout(() => { window.location.href = href; }, 300);
  }
}
window.closeMenu = closeMenu;
hamburger?.addEventListener('click', () => drawer?.classList.contains('open') ? closeMenu() : openMenu());
backdrop?.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

/* ── Modal ── */
const modalOverlay = document.getElementById('modalOverlay');
let _pickerStudents = null;

async function loadStudentPicker() {
  const list = document.getElementById('studentPickerList');
  if (!list) return;
  if (!_pickerStudents) {
    const { data } = await supabase.from('students').select('id, last_name, first_name').order('last_name');
    _pickerStudents = data || [];
  }
  renderPickerList(_pickerStudents);
  const searchEl = document.getElementById('studentPickerSearch');
  if (searchEl) {
    searchEl.value = '';
    searchEl.oninput = () => {
      const q = searchEl.value.toLowerCase();
      renderPickerList(_pickerStudents.filter(s =>
        s.last_name.toLowerCase().includes(q) || s.first_name.toLowerCase().includes(q)
      ));
    };
    setTimeout(() => searchEl.focus(), 300);
  }
}

function renderPickerList(students) {
  const list = document.getElementById('studentPickerList');
  if (!list) return;
  if (!students.length) { list.innerHTML = '<p style="color:var(--text-muted);font-size:.84rem;">No students found.</p>'; return; }
  list.innerHTML = students.map(s => `
    <a href="student.html?id=${s.id}" class="picker-item">
      <div class="picker-avatar">${(s.first_name[0] + s.last_name[0]).toUpperCase()}</div>
      <div class="picker-name">
        <span class="picker-last">${s.last_name}</span>
        <span class="picker-first">${s.first_name}</span>
      </div>
      <svg class="picker-arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
    </a>`).join('');
}

function openModal() {
  /* Feature 6: toast if on student page and not logged in */
  if (_isStudentPage && !_studentAuthenticated) {
    showToast('Please log in first before updating..');
    return;
  }
  if (!modalOverlay) return;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!_isStudentPage) {
    /* Home / Progress — show student picker */
    loadStudentPicker();
  } else {
    /* Student page — regular add hours modal */
    const today = new Date().toISOString().split('T')[0];
    const dateIn = document.getElementById('logDate');
    if (dateIn) dateIn.value = today;
    setTimeout(() => document.getElementById('logHours')?.focus(), 300);
  }
}

function closeModal() {
  modalOverlay?.classList.remove('open');
  document.body.style.overflow = '';
  clearErrors();
}
window.openModal  = openModal;
window.closeModal = closeModal;

function clearErrors() {
  document.getElementById('logHours')?.classList.remove('input-error');
  const err = document.getElementById('hrsErr');
  if (err) err.classList.remove('show');
}

document.getElementById('cta-btn')?.addEventListener('click', openModal);
document.getElementById('cta-btn-2')?.addEventListener('click', openModal);
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalCancel')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  const m = document.getElementById('toastMsg');
  if (!t || !m) return;
  m.textContent = msg; t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
}

/* ── Class-wide tracker ── */
const TOTAL = window._studentTotal !== undefined ? window._studentTotal : 3040;
let logged  = window._studentLogged !== undefined ? window._studentLogged : 0;

function updateTracker() {
  const pct = Math.min((logged / TOTAL) * 100, 100);
  const rem  = Math.max(TOTAL - logged, 0);
  const bar  = document.getElementById('progressBar');
  if (bar) bar.style.width = pct.toFixed(1) + '%';
  const cnt = document.getElementById('hoursCount');
  if (cnt) cnt.textContent = logged + ' / ' + TOTAL + ' hrs';
  const dL = document.getElementById('displayLogged');
  if (dL) dL.textContent = logged;
  const dR = document.getElementById('displayRemaining');
  if (dR) dR.textContent = rem;
  const cap = document.getElementById('progCaption');
  if (cap) cap.textContent = Math.round(pct) + '% complete · ' + rem + ' hours remaining';
}

if (document.querySelector('.progress-top') || document.querySelector('.tracker-card')) {
  (async () => {
    const { data } = await supabase.from('students').select('hours');
    if (data) { logged = data.reduce((sum, s) => sum + (s.hours || 0), 0); updateTracker(); }
  })();
}

/* ── Search bar ── */
const searchbar  = document.getElementById('searchbar');
const countBadge = document.getElementById('member-count-badge');
searchbar?.addEventListener('input', () => {
  const q = searchbar.value.toLowerCase(); let visible = 0;
  document.querySelectorAll('.memlink').forEach(card => {
    const nameDiv = card.querySelector('.studentid');
    const name = nameDiv?.getAttribute('data-name')?.toLowerCase() || '';
    const show = name.includes(q);
    card.style.display = show ? 'flex' : 'none';
    if (show) { visible++; card.classList.add('show'); }
  });
  if (countBadge) countBadge.textContent = q === '' ? '38 Students' : `${visible} Student${visible !== 1 ? 's' : ''} found`;
  const nr = document.getElementById('no-results');
  if (nr) nr.style.display = visible === 0 ? 'block' : 'none';
});

/* ── Init ── */
if (!studentPageContent) updateTracker();
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Feature 7: Profile Picture Upload ---
document.getElementById('update-profile-pic-btn')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('profile-picture-input');
  const file = fileInput.files[0];

  if (!file) {
    showToast('Please select an image first.');
    return;
  }

  // 1. Create a unique file path for this specific student
  const filePath = `${student.id}/${Date.now()}_profile.png`; // Puts it in a folder with their ID

  // 2. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Storage Upload Failed:', uploadError);
    showToast('Upload failed: ' + uploadError.message);
    return;
  }

  // 3. Get the new Public URL
  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  // 4. Update the student's record in the Database
  // We'll use your existing 'students' table and add a new column
  const { error: dbError } = await supabase
    .from('students')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', student.id);

  if (dbError) {
    console.error('Database Update Failed:', dbError);
    // You might want to delete the file from storage if the DB fails
    showToast('Failed to save link. Try again.');
    return;
  }

  // 5. Update the page without reloading!
  showToast('Profile photo updated ✓');
  fileInput.value = ''; // Clear the input

  // If they have an existing photo, we should delete it to save space
  if (student.avatar_url && student.avatar_url !== 'null') {
    // You'd extract the file path from the full URL to delete it
    // But for a proof-of-concept, we can skip this part
  }

  // Update the page data and re-render the avatar
  student.avatar_url = urlData.publicUrl;
  renderAvatar(urlData.publicUrl);
});

// Create a small helper function to handle the logic
function renderAvatar(url) {
  const circle = document.getElementById('avatar-circle');
  if (!circle) return;

  if (url && url !== 'null') {
    // If they have a photo, replace the initials with an image
    circle.innerHTML = `<img src="${url}" alt="${student.first_name}'s avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
    circle.style.padding = '0'; // Removes the padding that centers the initials
  } else {
    // Otherwise, keep the default initials look
    const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();
    circle.textContent = initials;
    circle.style.padding = '0.5rem'; // Restores the original padding
  }
}