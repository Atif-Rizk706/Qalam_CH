import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { ShieldCheck, UserCheck, Plus, Trash2, X, Mail } from 'lucide-react';

export default function UsersList() {
    const [tab, setTab] = useState('admins'); // 'admins' or 'users'
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [admRes, usrRes] = await Promise.all([
                api.get('/admin/admins').catch(() => ({ data: { data: [] } })),
                api.get('/admin/users').catch(() => ({ data: { data: [] } })),
            ]);
            setAdmins(admRes.data.data?.data || admRes.data.data || []);
            setUsers(usrRes.data.data?.data || usrRes.data.data || []);
        } catch (err) {
            console.error('Error fetching users/admins:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
        try {
            await api.delete(`/admin/admins/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل حذف المشرف');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل حذف المستخدم');
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            await api.post('/admin/admins', adminForm);
            setIsAddAdminOpen(false);
            setAdminForm({ name: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'فشل إنشاء حساب المشرف');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إدارة المشرفين والمستخدمين 🛡️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        إدارة حسابات مسؤولي لوحة التحكم والمستخدمين المسجلين في التطبيق.
                    </p>
                </div>
                {tab === 'admins' && (
                    <button onClick={() => setIsAddAdminOpen(true)} className="btn btn-primary">
                        <Plus size={16} />
                        <span>إضافة مشرف جديد</span>
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                <button
                    onClick={() => setTab('admins')}
                    className={`btn ${tab === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                >
                    <ShieldCheck size={16} />
                    <span>المشرفون ({admins.length})</span>
                </button>
                <button
                    onClick={() => setTab('users')}
                    className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                >
                    <UserCheck size={16} />
                    <span>المستخدمون المسجلون ({users.length})</span>
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    {tab === 'admins' ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>اسم المشرف</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>تاريخ الإنشاء</th>
                                    <th style={{ textAlign: 'center', width: '100px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</td></tr>
                                ) : admins.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>لا يوجد مشرفون.</td></tr>
                                ) : (
                                    admins.map((adm) => (
                                        <tr key={adm.id}>
                                            <td style={{ fontWeight: '700', color: '#0F172A' }}>{adm.name}</td>
                                            <td style={{ color: '#475569' }}>{adm.email}</td>
                                            <td style={{ fontSize: '13px', color: '#64748B' }}>{adm.created_at ? adm.created_at.slice(0, 10) : '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDeleteAdmin(adm.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px', color: '#EF4444' }}
                                                    title="حذف"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>اسم المستخدم</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>طريقة التسجيل</th>
                                    <th>تاريخ الانضمام</th>
                                    <th style={{ textAlign: 'center', width: '100px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>لا يوجد مستخدمون مسجلون.</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: '700', color: '#0F172A' }}>{u.name}</td>
                                            <td style={{ color: '#475569' }}>{u.email}</td>
                                            <td>
                                                {u.google_id ? (
                                                    <span className="badge badge-blue">جوجل (Google)</span>
                                                ) : (
                                                    <span className="badge badge-gray">بريد وكلمة مرور</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#64748B' }}>{u.created_at ? u.created_at.slice(0, 10) : '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px', color: '#EF4444' }}
                                                    title="حذف"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            {isAddAdminOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '480px' }}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0F172A' }}>إضافة مشرف جديد للوحة التحكم</h3>
                            <button onClick={() => setIsAddAdminOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateAdmin} style={{ padding: '24px' }}>
                            {errorMsg && (
                                <div style={{ padding: '10px 14px', background: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                                    {errorMsg}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">الاسم الكامل *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={adminForm.name}
                                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={adminForm.email}
                                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">كلمة المرور *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="8 أحرف على الأقل"
                                    value={adminForm.password}
                                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsAddAdminOpen(false)} className="btn btn-secondary">إلغاء</button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الإضافة...' : 'إنشاء حساب المشرف'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

