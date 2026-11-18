import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { ShieldCheck, UserCheck, Plus, Edit, Trash2, X, Search, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function UsersList() {
    const [tab, setTab] = useState('admins'); // 'admins' or 'users'
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // null means Add, object means Edit
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ name: '', email: '', password: '' });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            email: item.email || '',
            password: '', // leave empty unless they want to change it
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    // Save (Create or Update)
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            const payload = { ...formData };
            // If editing and password is left blank, remove it from payload
            if (editingItem && !payload.password) {
                delete payload.password;
            }

            const endpoint = tab === 'admins' ? '/admin/admins' : '/admin/users';

            if (editingItem) {
                await api.put(`${endpoint}/${editingItem.id}`, payload);
            } else {
                await api.post(endpoint, payload);
            }

            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            let msg = err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.';
            if (err.response?.data?.errors) {
                const details = Object.values(err.response.data.errors).flat().join(' | ');
                if (details) msg = `${msg} (${details})`;
            }
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    // Delete Admin
    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
        try {
            await api.delete(`/admin/admins/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل حذف المشرف');
        }
    };

    // Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل حذف المستخدم');
        }
    };

    // Filter by search
    const filteredAdmins = admins.filter((a) =>
        (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredUsers = users.filter((u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إدارة المشرفين والمستخدمين 🛡️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        عرض وإضافة وتعديل بيانات مسؤولي لوحة التحكم والمستخدمين المسجلين.
                    </p>
                </div>
                <button onClick={handleOpenAdd} className="btn btn-primary">
                    <Plus size={16} />
                    <span>{tab === 'admins' ? 'إضافة مشرف جديد' : 'إضافة مستخدم جديد'}</span>
                </button>
            </div>

            {/* Tabs & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => { setTab('admins'); setSearch(''); }}
                        className={`btn ${tab === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 18px', fontSize: '13.5px' }}
                    >
                        <ShieldCheck size={16} />
                        <span>المشرفون ({admins.length})</span>
                    </button>
                    <button
                        onClick={() => { setTab('users'); setSearch(''); }}
                        className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 18px', fontSize: '13.5px' }}
                    >
                        <UserCheck size={16} />
                        <span>المستخدمون ({users.length})</span>
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={15} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        className="form-input"
                        style={{ paddingRight: '36px', height: '38px', fontSize: '13px' }}
                        placeholder="بحث بالاسم أو البريد..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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
                                    <th style={{ textAlign: 'center', width: '130px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>جاري التحميل...</td></tr>
                                ) : filteredAdmins.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>لا يوجد مشرفون يطابقون البحث.</td></tr>
                                ) : (
                                    filteredAdmins.map((adm) => (
                                        <tr key={adm.id}>
                                            <td style={{ fontWeight: '700', color: '#0F172A' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: '#FEF3C7',
                                                        color: '#B45309',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px',
                                                        fontWeight: '800'
                                                    }}>
                                                        <ShieldCheck size={16} />
                                                    </div>
                                                    <span>{adm.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#475569' }}>{adm.email}</td>
                                            <td style={{ fontSize: '13px', color: '#64748B' }}>{adm.created_at ? adm.created_at.slice(0, 10) : '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => handleOpenEdit(adm)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 8px' }}
                                                        title="تعديل بيانات المشرف"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(adm.id)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 8px', color: '#EF4444' }}
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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
                                    <th style={{ textAlign: 'center', width: '130px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>جاري التحميل...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>لا يوجد مستخدمون يطابقون البحث.</td></tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: '700', color: '#0F172A' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: '#EFF6FF',
                                                        color: '#2563EB',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px',
                                                        fontWeight: '800'
                                                    }}>
                                                        <UserIcon size={16} />
                                                    </div>
                                                    <span>{u.name}</span>
                                                </div>
                                            </td>
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
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => handleOpenEdit(u)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 8px' }}
                                                        title="تعديل بيانات المستخدم"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '6px 8px', color: '#EF4444' }}
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal for Add / Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '480px' }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                                {editingItem
                                    ? (tab === 'admins' ? 'تعديل بيانات المشرف' : 'تعديل بيانات المستخدم')
                                    : (tab === 'admins' ? 'إضافة مشرف جديد' : 'إضافة مستخدم جديد')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '24px' }}>
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
                                    placeholder="مثال: يوسف ميخائيل"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="example@domain.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {editingItem ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور *'}
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder={editingItem ? 'اتركها فارغة إذا كنت لا ترغب بتغييرها' : '6 أحرف على الأقل'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingItem}
                                />
                                {editingItem && (
                                    <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                                        اترك الحقل فارغاً للاحتفاظ بكلمة المرور الحالية دون تغيير.
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving
                                        ? 'جاري الحفظ...'
                                        : (editingItem ? 'حفظ التعديلات' : (tab === 'admins' ? 'إنشاء حساب المشرف' : 'إنشاء حساب المستخدم'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
