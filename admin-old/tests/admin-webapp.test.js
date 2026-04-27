// @vitest-environment jsdom

import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const appJsPath = path.resolve(process.cwd(), 'js', 'app.js');
const appSource = fs.readFileSync(appJsPath, 'utf8');

function setupDom() {
  document.body.innerHTML = `
    <div id="toast-container"></div>

    <div id="login-screen" class="hidden"></div>
    <div id="app"></div>
    <input id="email" />
    <input id="password" />

    <h1 id="page-title"></h1>
    <p id="page-subtitle"></p>

    <div id="page-dashboard" class="page"></div>
    <div id="page-users" class="page"></div>
    <div id="page-reports" class="page"></div>
    <div id="page-marketplace" class="page"></div>

    <button class="nav-item" data-page="dashboard"></button>
    <button class="nav-item" data-page="users"></button>
    <button class="nav-item" data-page="reports"></button>
    <button class="nav-item" data-page="marketplace"></button>

    <button id="logout-btn"></button>
    <div id="sidebar-name"></div>
    <div id="sidebar-role"></div>
    <div id="sidebar-avatar"></div>

    <div id="stat-users-count"></div>
    <div id="stat-pending-count"></div>
    <div id="stat-verified-count"></div>
    <div id="stat-spam-count"></div>
    <div id="recent-reports-list"></div>
    <div id="recent-users-list"></div>

    <div id="users-tbody"></div>
    <input id="user-search" />

    <select id="filter-status"></select>
    <select id="filter-type"></select>
    <div id="reports-tbody"></div>
    <span id="reports-info"></span>
    <button id="btn-prev"></button>
    <span id="page-indicator"></span>
    <button id="btn-next"></button>

    <div id="products-grid"></div>
    <input id="product-search" />

    <div id="img-modal" class="modal-overlay hidden"></div>
    <img id="modal-img" src="" />
    <p id="modal-desc"></p>
    <button id="modal-close"></button>

    <div id="product-modal" class="modal-overlay hidden"></div>
    <h3 id="product-modal-title"></h3>
    <form id="product-form"></form>
    <input id="pf-name" />
    <input id="pf-price" />
    <input id="pf-image" />
    <input id="pf-shop" />
    <textarea id="pf-desc"></textarea>
    <input id="pf-active" type="checkbox" />
    <button id="product-submit-btn"></button>
    <div id="pf-image-preview" style="display:none"></div>
    <img id="pf-preview-img" src="" />
  `;

  localStorage.clear();
  window.fetch = async () => ({
    ok: true,
    json: async () => ({}),
  });

  window.eval(appSource);
}

describe('admin webapp', () => {
  beforeEach(() => {
    setupDom();
  });

  it('renders report rows with expected moderation actions', () => {
    window.renderReports([
      {
        id: 'r1',
        issueType: 'ramp_blocked',
        description: 'Ramp blocked by boxes',
        place: { name: 'Cafe 1', sourceId: 'osm:node:1' },
        user: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        status: 'pending',
        spamScore: 45,
        createdAt: '2026-04-20T10:00:00.000Z',
      },
    ]);

    const html = document.getElementById('reports-tbody').innerHTML;
    expect(html).toContain('Ramp Blocked');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Verify');
    expect(html).toContain('Reject');
    expect(html).toContain('Spam');
  });

  it('renders empty-state row when report list is empty', () => {
    window.renderReports([]);
    expect(document.getElementById('reports-tbody').textContent).toContain('No reports match your filters');
  });

  it('updates pagination information and button state', () => {
    window.renderPagination({ page: 2, totalPages: 3, total: 40, limit: 15 });

    expect(document.getElementById('reports-info').textContent).toContain('16–30 of 40');
    expect(document.getElementById('btn-prev').disabled).toBe(false);
    expect(document.getElementById('btn-next').disabled).toBe(false);
    expect(document.getElementById('page-indicator').textContent).toContain('Page 2 / 3');
  });

  it('opens and closes image modal correctly', () => {
    window.showImageModal('https://example.com/report.png', 'proof image');

    expect(document.getElementById('img-modal').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('modal-img').getAttribute('src')).toBe('https://example.com/report.png');
    expect(document.getElementById('modal-desc').textContent).toBe('proof image');

    window.closeImageModal();

    expect(document.getElementById('img-modal').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('modal-img').getAttribute('src')).toBe('');
  });
});
