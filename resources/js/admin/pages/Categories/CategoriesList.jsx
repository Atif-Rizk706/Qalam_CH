import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { FolderTree, Plus, Edit, Trash2, X, BookOpen, Search, ChevronRight, ChevronLeft } from 'lucide-react';

export default function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', icon_path: '' });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchCategories = async (targetPage = page) => {
        setLoading(true);
        try {
            const params = { page: targetPage };
            if (search) params.search = search;

            const res = await api.get('/admin/categories', { params });
            const raw = res.data.data;

            // Handle both paginated { data: [...], current_page: 1 } and direct array [...]
            const list = Array.isArray(raw) ? raw : (raw?.data || []);
            setCategories(Array.isArray(list) ? list : []);

            if (raw && (raw.current_page || raw.meta?.current_page)) {
                setPagination({
                    current_page: raw.current_page || raw.meta?.current_page || 1,
                    last_page: raw.last_page || raw.meta?.last_page || 1,
                    total: raw.total || raw.meta?.total || list.length,
                });
            } else {
                setPagination({});
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(page);
    }, [page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCategories(1);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', slug: '', icon_path: '' });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name || '',
            slug: cat.slug || '',
            icon_path: cat.icon_path || '',
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            fetchCategories(page);
        } catch (err) {
            alert('فشل حذف القسم');
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

            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, payload);
            } else {
                await api.post('/admin/categories', payload);
            }

            setIsModalOpen(false);
            fetchCategories(page);
        } catch (err) {
            let msg = err.response?.data?.message || 'فشل حفظ القسم.';
            if (err.response?.data?.errors) {
                const details = Object.values(err.response.data.errors).flat().join(' | ');
                if (details) msg = `${msg} (${details})`;
            }
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    const safeCategories = Array.isArray(categories) ? categories : [];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إدارة الأقسام والتصنيفات 📂
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        تصنيف الكتب وتوزيعها وإحصائيات عدد الكتب في كل قسم.
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة قسم جديد</span>
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingRight: '36px' }}
                            placeholder="بحث باسم القسم أو الـ slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                        بحث
                    </button>
                    {search && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setSearch(''); setPage(1); }}
                        >
                            مسح
                        </button>
                    )}
                </form>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>اسم القسم</th>
                                <th>المعرف اللطيف (Slug)</th>
                                <th>عدد الكتب المتاحة</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل الأقسام...
                                    </td>
                                </tr>
                            ) : safeCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد أقسام مسجلة بعد.
                                    </td>
                                </tr>
                            ) : (
                                safeCategories.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: '#FBF8F1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FolderTree size={18} color="#C5A869" />
                                                </div>
                                                <span style={{ fontSize: '14.5px', color: '#0F172A' }}>{c.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: '13px' }}>
                                            {c.slug}
                                        </td>
                                        <td>
                                            <span className="badge badge-gold">
                                                <BookOpen size={12} />
                                                {c.books_count ?? 0} كتب
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px' }}
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
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

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderTop: '1px solid #E2E8F0',
                        fontSize: '13px',
                        color: '#64748B'
                    }}>
                        <div>
                            إجمالي: <strong>{pagination.total}</strong> قسم (صفحة {pagination.current_page} من {pagination.last_page})
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                disabled={pagination.current_page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px' }}
                            >
                                <ChevronRight size={14} /> السابق
                            </button>
                            <button
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px' }}
                            >
                                التالي <ChevronLeft size={14} />
                            </button>
                        </div>
                    </div>
                )}
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
                                {editingCategory ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
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
                                <label className="form-label">اسم القسم *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: كتب روحية، دراسات كتابية..."
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
                                    placeholder="تلقائي (مثال: spiritual-books)"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingCategory ? 'تحديث القسم' : 'إضافة القسم')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
