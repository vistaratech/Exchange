'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { categories } from '@/utils/seedData';

export default function AdminPage() {
  const { posts, proposals, toast } = useApp();
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'posts' | 'reports' | 'categories'>('dashboard');

  const [reports, setReports] = useState([
    { id: 1, by: 'Karthik', item: 'City bicycle', reason: 'Suspicious activity', status: 'Open' },
    { id: 2, by: 'Asha', item: 'Reading chair', reason: 'Fake item', status: 'Reviewing' },
    { id: 3, by: 'Deepak', item: 'MacBook sleeve', reason: 'Non-responsive trader', status: 'Open' },
  ]);

  const stats = [
    ['128', 'Total users'],
    [`${posts.length}`, 'Active posts'],
    [`${proposals.filter((p) => p.status === 'pending' || p.status === 'accepted').length}`, 'Active exchanges'],
    [`${proposals.filter((p) => p.status === 'completed').length + 24}`, 'Completed exchanges'],
    [`${reports.filter((r) => r.status === 'Open').length}`, 'Pending reports'],
    [`${categories.length}`, 'Categories'],
  ];

  const handleResolveReport = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast('Report marked as resolved.');
  };

  return (
    <main className="shell">
      <section className="admin-shell">
        <aside className="admin-side">
          <div className="wordmark" style={{ marginBottom: 20 }}>
            <i className="wordmark-mark"></i>
            EXCHANGE
          </div>
          {[
            ['dashboard', 'Dashboard'],
            ['users', 'Users'],
            ['posts', 'Posts'],
            ['reports', 'Reports'],
            ['categories', 'Categories'],
          ].map(([id, name]) => (
            <button
              key={id}
              type="button"
              className={adminTab === id ? 'active' : ''}
              onClick={() => setAdminTab(id as any)}
            >
              {name}
            </button>
          ))}
        </aside>

        <section className="admin-main">
          <div className="eyebrow">Protected moderation workspace</div>
          <h1>{adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}</h1>

          {adminTab === 'dashboard' && (
            <>
              <div className="stat-grid">
                {stats.map(([val, label], i) => (
                  <article key={i} className="stat">
                    <b>{val}</b>
                    <span>{label}</span>
                  </article>
                ))}
              </div>

              <section className="section">
                <h2>Reports needing attention</h2>
                <table className="moderation-table">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Item</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td>{r.by}</td>
                        <td>{r.item}</td>
                        <td>{r.reason}</td>
                        <td>
                          <span className="status">{r.status}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => handleResolveReport(r.id)}
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {adminTab === 'reports' && (
            <section className="section">
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Item</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.by}</td>
                      <td>{r.item}</td>
                      <td>{r.reason}</td>
                      <td>
                        <span className="status">{r.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => handleResolveReport(r.id)}
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {adminTab !== 'dashboard' && adminTab !== 'reports' && (
            <div className="empty">
              <b>{adminTab.charAt(0).toUpperCase() + adminTab.slice(1)} moderation</b>
              <span>Search, review and manage community assets from this workspace.</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
