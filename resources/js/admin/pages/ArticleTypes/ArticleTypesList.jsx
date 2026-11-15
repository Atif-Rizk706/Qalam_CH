import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Tags, Plus, Edit, Trash2, X } from 'lucide-react';

export default function ArticleTypesList() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/article-types');
            const raw = res.data.data;
            const list = Array.isArray(raw) ? raw : (raw?.data || []);
            setTypes(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Error fetching article types:', err);
            setTypes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const openAddModal = () => {
        setEditingType(null);
        setFormData({ name: '', slug: '' });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (t) => {
        setEditingType(t);
        setFormData({ name: t.name || '', slug: t.slug || '' });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        try {
            await api.delete(`/admin/article-types/${id}`);
            fetchTypes();
        } catch (err) {
            alert('فشل حذف النوع');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            const payload = {
                ...formData,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            };

            if (editingType) {
                await api.put(`/admin/article-types/${editingType.id}`, payload);
            } else {
                await api.post('/admin/article-types', payload);
            }

            setIsModalOpen(false);
            fetchTypes();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'فشل حفظ نوع المقال');
        } finally {
            setSaving(false);
        }
    };

    const safeTypes = Array.isArray(types) ? types : [];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        أنواع المقالات والدراسات 🏷️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        تصنيف المحتوى النصي: مقال، دراسة، تأمل، خطبة، قصيدة، مقابلة...
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة نوع جديد</span>
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>اسم النوع</th>
                                <th>المعرف اللطيف (Slug)</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل الأنواع...
                                    </td>
                                </tr>
                            ) : safeTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد أنواع مسجلة.
                                    </td>
                                </tr>
                            ) : (
                                safeTypes.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: '#F1F5F9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Tags size={16} color="#C5A869" />
                                                </div>
                                                <span style={{ fontSize: '14px', color: '#0F172A' }}>{t.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: '13px' }}>
                                            {t.slug}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEditModal(t)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px' }}
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
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
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                                {editingType ? 'تعديل نوع المقال' : 'إضافة نوع مقال جديد'}
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
                                <label className="form-label">اسم النوع *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: تأمل، دراسة، قصيدة..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">المعرف اللطيف (Slug)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="تلقائي (مثال: meditation)"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingType ? 'تحديث النوع' : 'إضافة النوع')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

