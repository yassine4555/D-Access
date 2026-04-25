/* ============================================================
   D-Access Admin Panel — app.js
   ============================================================ */

const API = 'http://localhost:3000';

let token       = localStorage.getItem('da_admin_token');
let currentUser = null;
let reportPage  = 1;
let reportFilters = { status: '', issueType: '' };
let allUsers    = [];
let allProducts = [];
let editingProductId = null;

/* ─── API Helper ─────────────────────────────────────────── */
async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

/* ─── Toast ──────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ─── Auth ───────────────────────────────────────────────── */
async function login(e) {
  e.preventDefault();
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const data = await api('POST', '/auth/login', {
      email:    document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    });

    token = data.access_token;
    localStorage.setItem('da_admin_token', token);

    const me = await api('GET', '/auth/me');
    if (!['admin', 'moderator'].includes(me.role)) {
      localStorage.removeItem('da_admin_token');
      token = null;
      throw new Error('Access denied. Admin or moderator role required.');
    }

    currentUser = me;
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

function logout() {
  localStorage.removeItem('da_admin_token');
  token = null;
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  const name = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('sidebar-role').textContent = currentUser.role;
  document.getElementById('sidebar-avatar').textContent = currentUser.firstName[0].toUpperCase();

  navigate('dashboard');
}

/* ─── Navigation ─────────────────────────────────────────── */
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

  const titles = {
    dashboard:   ['Dashboard',   'Platform overview at a glance'],
    users:       ['Users',       'Manage registered users'],
    reports:     ['Reports',     'Moderate accessibility reports'],
    marketplace: ['Marketplace', 'Manage products shown in the app'],
  };
  document.getElementById('page-title').textContent    = titles[page][0];
  document.getElementById('page-subtitle').textContent = titles[page][1];

  if (page === 'dashboard')   loadDashboard();
  if (page === 'users')       loadUsers();
  if (page === 'reports')     { reportPage = 1; loadReports(); }
  if (page === 'marketplace') loadProducts();
}

/* ─── Dashboard ──────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const [users, pending, verified, rejected, spam, recent] = await Promise.all([
      api('GET', '/admin/users'),
      api('GET', '/admin/reports?limit=1&status=pending'),
      api('GET', '/admin/reports?limit=1&status=verified'),
      api('GET', '/admin/reports?limit=1&status=rejected'),
      api('GET', '/admin/reports?limit=1&status=spam'),
      api('GET', '/admin/reports?limit=5&page=1'),
    ]);

    document.getElementById('stat-users-count').textContent    = users.length;
    document.getElementById('stat-pending-count').textContent  = pending.pagination.total;
    document.getElementById('stat-verified-count').textContent = verified.pagination.total;
    document.getElementById('stat-spam-count').textContent     = spam.pagination.total;

    // Recent reports
    const rrEl = document.getElementById('recent-reports-list');
    if (recent.data.length === 0) {
      rrEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No reports yet</p></div>';
    } else {
      rrEl.innerHTML = '<div class="mini-list">' + recent.data.map(r => `
        <div class="mini-item">
          <div class="mini-item-left">
            <span class="mini-item-name">${issueLabel(r.issueType)}</span>
            <span class="mini-item-sub">${r.place ? r.place.name || r.place.sourceId : 'Unknown place'}</span>
          </div>
          <span class="badge badge-${r.status}">${r.status}</span>
        </div>`).join('') + '</div>';
    }

    // Recent users
    const ruEl = document.getElementById('recent-users-list');
    const recentUsers = users.slice(0, 5);
    if (recentUsers.length === 0) {
      ruEl.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No users yet</p></div>';
    } else {
      ruEl.innerHTML = '<div class="mini-list">' + recentUsers.map(u => {
        const fName = u.firstName || (u.profile && u.profile.name ? u.profile.name.split(' ')[0] : 'User');
        const lName = u.lastName || (u.profile && u.profile.name ? u.profile.name.split(' ').slice(1).join(' ') : '');
        return `
        <div class="mini-item">
          <div class="mini-item-left">
            <span class="mini-item-name">${fName} ${lName}</span>
            <span class="mini-item-sub">${u.email}</span>
          </div>
          <span class="badge badge-${u.role}">${u.role}</span>
        </div>`;
      }).join('') + '</div>';
    }
  } catch (err) {
    toast(err.message, 'error');
  }
}

/* ─── Users ──────────────────────────────────────────────── */
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = `<tr class="loading-row"><td colspan="6"><span class="spinner"></span></td></tr>`;
  try {
    allUsers = await api('GET', '/admin/users');
    renderUsers(allUsers);
  } catch (err) {
    toast(err.message, 'error');
    tbody.innerHTML = `<tr class="loading-row"><td colspan="6">Failed to load users</td></tr>`;
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  if (users.length === 0) {
    tbody.innerHTML = `<tr class="loading-row"><td colspan="6">No users found</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => {
    const fName = u.firstName || (u.profile && u.profile.name ? u.profile.name.split(' ')[0] : 'User');
    const lName = u.lastName || (u.profile && u.profile.name ? u.profile.name.split(' ').slice(1).join(' ') : '');
    const firstChar = fName[0] ? fName[0].toUpperCase() : 'U';
    
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar" style="width:32px;height:32px;font-size:.8rem">
            ${firstChar}
          </div>
          <div>
            <div style="font-weight:500">${fName} ${lName}</div>
            <div style="font-size:.75rem;color:var(--text-2)">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-${u.provider || 'local'}">${u.provider || 'local'}</span></td>
      <td>
        <select class="role-select" onchange="changeRole('${u._id}', this.value)" ${u._id === currentUser._id ? 'disabled' : ''}>
          <option value="user"      ${u.role==='user'      ?'selected':''}>User</option>
          <option value="moderator" ${u.role==='moderator' ?'selected':''}>Moderator</option>
          <option value="admin"     ${u.role==='admin'     ?'selected':''}>Admin</option>
        </select>
      </td>
      <td style="color:var(--text-2)">${u.language || 'en'}</td>
      <td style="color:var(--text-2)">${fmtDate(u.createdAt)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}','${fName} ${lName}')"
          ${u._id === currentUser._id ? 'disabled title="Cannot delete yourself"' : ''}>
          Delete
        </button>
      </td>
    </tr>`;
  }).join('');
}

function filterUsers(q) {
  const lower = q.toLowerCase();
  const filtered = allUsers.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(lower)
  );
  renderUsers(filtered);
}

async function changeRole(id, role) {
  try {
    await api('PATCH', `/admin/users/${id}/role`, { role });
    toast(`Role updated to ${role}`, 'success');
    allUsers = allUsers.map(u => u._id === id ? { ...u, role } : u);
  } catch (err) {
    toast(err.message, 'error');
    loadUsers();
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
  try {
    await api('DELETE', `/admin/users/${id}`);
    toast(`User deleted`, 'success');
    allUsers = allUsers.filter(u => u._id !== id);
    renderUsers(allUsers);
  } catch (err) {
    toast(err.message, 'error');
  }
}

/* ─── Reports ────────────────────────────────────────────── */
async function loadReports() {
  const tbody = document.getElementById('reports-tbody');
  tbody.innerHTML = `<tr class="loading-row"><td colspan="7"><span class="spinner"></span></td></tr>`;

  const qs = new URLSearchParams({
    page:  reportPage,
    limit: 15,
    ...(reportFilters.status    && { status:    reportFilters.status }),
    ...(reportFilters.issueType && { issueType: reportFilters.issueType }),
  });

  try {
    const { data, pagination } = await api('GET', `/admin/reports?${qs}`);
    renderReports(data);
    renderPagination(pagination);
  } catch (err) {
    toast(err.message, 'error');
    tbody.innerHTML = `<tr class="loading-row"><td colspan="7">Failed to load reports</td></tr>`;
  }
}

function renderReports(reports) {
  const tbody = document.getElementById('reports-tbody');
  if (reports.length === 0) {
    tbody.innerHTML = `<tr class="loading-row"><td colspan="7">No reports match your filters</td></tr>`;
    return;
  }
  tbody.innerHTML = reports.map(r => {
    const spam = r.spamScore || 0;
    const spamColor = spam > 70 ? '#ef4444' : spam > 40 ? '#f59e0b' : '#10b981';
    const imgCell = r.imageUrl
      ? `<img src="${r.imageUrl}" class="img-thumb" onclick="showImageModal('${escapeAttr(r.imageUrl)}','${escapeAttr(r.description || '')}')" alt="Report image">`
      : `<div class="no-img">—</div>`;

    const actions = [];
    if (r.status !== 'verified') actions.push(`<button class="btn btn-sm btn-success" onclick="moderateReport('${r.id}','verify')">✓ Verify</button>`);
    if (r.status !== 'rejected') actions.push(`<button class="btn btn-sm btn-danger"  onclick="moderateReport('${r.id}','reject')">✕ Reject</button>`);
    if (r.status !== 'spam')     actions.push(`<button class="btn btn-sm btn-warning" onclick="moderateReport('${r.id}','spam')">⚑ Spam</button>`);
    if (r.status === 'spam')     actions.push(`<button class="btn btn-sm btn-ghost"   onclick="moderateReport('${r.id}','unspam')">↩ Unspam</button>`);

    return `<tr>
      <td>${imgCell}</td>
      <td>
        <div style="font-weight:500">${issueLabel(r.issueType)}</div>
        <div style="font-size:.75rem;color:var(--text-2);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.description || '—'}</div>
      </td>
      <td style="font-size:.8rem;color:var(--text-2)">${r.place ? (r.place.name || r.place.sourceId) : '—'}</td>
      <td>${r.user ? `<div style="font-size:.82rem;font-weight:500">${r.user.firstName} ${r.user.lastName}</div><div style="font-size:.73rem;color:var(--text-2)">${r.user.email||''}</div>` : '—'}</td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td>
        <div class="score-bar">
          <div class="score-track" style="width:60px">
            <div class="score-fill" style="width:${spam}%;background:${spamColor}"></div>
          </div>
          <span style="font-size:.78rem;color:var(--text-2)">${spam}</span>
        </div>
      </td>
      <td style="color:var(--text-2);font-size:.8rem">${fmtDate(r.createdAt)}</td>
      <td><div class="actions">${actions.join('')}</div></td>
    </tr>`;
  }).join('');
}

function renderPagination({ page, totalPages, total, limit }) {
  document.getElementById('reports-info').textContent =
    `Showing ${Math.min((page-1)*limit+1, total)}–${Math.min(page*limit, total)} of ${total}`;
  document.getElementById('btn-prev').disabled = page <= 1;
  document.getElementById('btn-next').disabled = page >= totalPages;
  document.getElementById('page-indicator').textContent = `Page ${page} / ${totalPages}`;
}

async function moderateReport(id, action) {
  const endpointMap = {
    verify:  `/admin/reports/${id}/verify`,
    reject:  `/admin/reports/${id}/reject`,
    spam:    `/admin/reports/${id}/mark-spam`,
    unspam:  `/admin/reports/${id}/unmark-spam`,
  };
  try {
    await api('PATCH', endpointMap[action]);
    toast(`Report ${action === 'unspam' ? 'unmarked as spam' : action + 'ed'}`, 'success');
    loadReports();
  } catch (err) {
    toast(err.message, 'error');
  }
}

/* ─── Image Modal ────────────────────────────────────────── */
function showImageModal(src, description) {
  document.getElementById('modal-img').src = src;
  document.getElementById('modal-desc').textContent = description || 'No description';
  document.getElementById('img-modal').classList.remove('hidden');
}
function closeImageModal() {
  document.getElementById('img-modal').classList.add('hidden');
  document.getElementById('modal-img').src = '';
}

/* ─── Helpers ────────────────────────────────────────────── */
function issueLabel(type) {
  const map = {
    elevator_out_of_order: '🛗 Elevator Out',
    ramp_blocked:          '🚧 Ramp Blocked',
    parking_issue:         '🅿️ Parking Issue',
    place_closed:          '🚪 Place Closed',
    incorrect_info:        'ℹ️ Incorrect Info',
    other:                 '📌 Other',
  };
  return map[type] || type;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ─── Marketplace ────────────────────────────────────────── */
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';
  try {
    const response = await api('GET', '/admin/marketplace?limit=100');
    allProducts = Array.isArray(response?.data) ? response.data : [];
    renderProducts(allProducts);
  } catch (err) {
    toast(err.message, 'error');
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><p>Failed to load products</p></div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (products.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><p>No products yet. Click <strong>+ Add Product</strong> to get started.</p></div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    const sym = '$';
    const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
    const statusBadge = p.isActive
      ? '<span class="badge badge-verified" style="font-size:.7rem">Active</span>'
      : '<span class="badge badge-rejected" style="font-size:.7rem">Hidden</span>';
    return `
    <div class="product-card">
      <div class="product-img-wrap">
        <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(p.name)}" class="product-img"
          onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'%23334155\'/><text x=\'50\' y=\'55\' text-anchor=\'middle\' font-size=\'30\' fill=\'%2364748b\'>🖼</text></svg>'" />
        <div class="product-status">${statusBadge}</div>
      </div>
      <div class="product-body">
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">${sym} ${Number(p.price).toFixed(2)}</div>
        ${p.description ? `<div class="product-desc">${escapeHtml(p.description)}</div>` : ''}
      </div>
      <div class="product-actions">
        <a href="${escapeAttr(p.productUrl)}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">🔗 Shop</a>
        <button class="btn btn-sm btn-ghost" onclick="openProductModal('${p.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}','${escapeAttr(p.name)}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function filterProducts(q) {
  const lower = q.toLowerCase();
  renderProducts(allProducts.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    (p.description || '').toLowerCase().includes(lower)
  ));
}

function openProductModal(id) {
  editingProductId = id;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const form  = document.getElementById('product-form');
  form.reset();
  document.getElementById('pf-image-preview').style.display = 'none';

  if (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    title.textContent = 'Edit Product';
    document.getElementById('pf-name').value     = p.name;
    document.getElementById('pf-price').value    = p.price;
    document.getElementById('pf-image').value    = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
    document.getElementById('pf-shop').value     = p.productUrl;
    document.getElementById('pf-desc').value     = p.description || '';
    document.getElementById('pf-active').checked = p.isActive !== false;
    // show preview
    const prev = document.getElementById('pf-preview-img');
    prev.src = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
    document.getElementById('pf-image-preview').style.display = 'block';
  } else {
    title.textContent = 'Add Product';
  }
  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
  editingProductId = null;
}

async function submitProductForm(e) {
  e.preventDefault();
  const btn = document.getElementById('product-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  const dto = {
    name:        document.getElementById('pf-name').value.trim(),
    price:       parseFloat(document.getElementById('pf-price').value),
    images:      [document.getElementById('pf-image').value.trim()].filter(Boolean),
    productUrl:  document.getElementById('pf-shop').value.trim(),
    description: document.getElementById('pf-desc').value.trim(),
    inStock:     document.getElementById('pf-active').checked,
    category:    'other',
  };
  try {
    if (editingProductId) {
      const updated = await api('PATCH', `/admin/marketplace/${editingProductId}`, dto);
      allProducts = allProducts.map(p => p.id === editingProductId ? updated : p);
      toast('Product updated', 'success');
    } else {
      const created = await api('POST', '/admin/marketplace', dto);
      allProducts = [created, ...allProducts];
      toast('Product added', 'success');
    }
    closeProductModal();
    renderProducts(allProducts);
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await api('DELETE', `/admin/marketplace/${id}`);
    allProducts = allProducts.filter(p => p.id !== id);
    renderProducts(allProducts);
    toast('Product deleted', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Login form
  document.getElementById('login-form').addEventListener('submit', login);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  // Report filters
  document.getElementById('filter-status').addEventListener('change', function() {
    reportFilters.status = this.value;
    reportPage = 1;
    loadReports();
  });
  document.getElementById('filter-type').addEventListener('change', function() {
    reportFilters.issueType = this.value;
    reportPage = 1;
    loadReports();
  });
  document.getElementById('user-search').addEventListener('input', function() {
    filterUsers(this.value);
  });

  // Pagination
  document.getElementById('btn-prev').addEventListener('click', () => { reportPage--; loadReports(); });
  document.getElementById('btn-next').addEventListener('click', () => { reportPage++; loadReports(); });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeImageModal);
  document.getElementById('img-modal').addEventListener('click', function(e) {
    if (e.target === this) closeImageModal();
  });
  document.getElementById('product-modal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
  });

  // Product image URL live preview
  document.getElementById('pf-image').addEventListener('input', function() {
    const val = this.value.trim();
    const prev = document.getElementById('pf-image-preview');
    const img  = document.getElementById('pf-preview-img');
    if (val) { img.src = val; prev.style.display = 'block'; }
    else     { prev.style.display = 'none'; }
  });

  // Check existing token
  if (token) {
    try {
      const me = await api('GET', '/auth/me');
      if (['admin', 'moderator'].includes(me.role)) {
        currentUser = me;
        showApp();
        return;
      }
    } catch (_) {}
    localStorage.removeItem('da_admin_token');
    token = null;
  }
});
