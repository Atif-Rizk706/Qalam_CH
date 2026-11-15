import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { FileText, Plus, Search, Edit, Archive, CheckCircle, XCircle, X, Filter } from 'lucide-react';

export default function ArticlesList() {
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({});
    const [types, setTypes] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
        body: '',
        excerpt: '',
        author_id: '',
        type_id: '',
        read_time: 5,
        is_published: true,
    });
    const [coverFile, setCoverFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 12 };
            if (search) params.search = search;
            if (selectedType) params.type_id = selectedType;

            const res = await api.get('/admin/articles', { params });
            const data = res.data.data;
            setArticles(data.data || []);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
            });
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [typesRes, authorsRes] = await Promise.all([
                api.get('/admin/article-types'),
                api.get('/authors'),
            ]);
            setTypes(typesRes.data.data || []);
            setAuthors(authorsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching dropdowns:', err);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [page, selectedType]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchArticles();
    };

    const handleTogglePublish = async (id) => {
        try {
            await api.patch(`/admin/articles/${id}/toggle-publish`);
            fetchArticles();
        } catch (err) {
            alert('فشل تغيير حالة النشر');
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm('هل أنت متأكد من أرشفة هذا المقال؟')) return;
        try {
            await api.delete(`/admin/articles/${id}`);
            fetchArticles();
        } catch (err) {
            alert('فشل أرشفة المقال');
        }
    };

    const openAddModal = () => {
        setEditingArticle(null);
        setFormData({
            title: '',
            slug: '',
            short_description: '',
            body: '',
            excerpt: '',
            author_id: authors[0]?.id || '',
            type_id: types[0]?.id || '',
            read_time: 5,
            is_published: true,
        });
        setCoverFile(null);
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (art) => {
        setEditingArticle(art);
        setFormData({
            title: art.title || '',
            slug: art.slug || '',
            short_description: art.short_description || '',
            body: art.body || art.content || '',
            excerpt: art.excerpt || '',
            author_id: art.author?.id || '',
            type_id: art.type?.id || '',
            read_time: art.read_time || 5,
            is_published: !!art.is_published,
        });
        setCoverFile(null);
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('slug', formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'));
            data.append('short_description', formData.short_description || '');
            data.append('body', formData.body);
            data.append('excerpt', formData.excerpt || '');
            data.append('author_id', formData.author_id);
            if (formData.type_id) data.append('type_id', formData.type_id);
            data.append('read_time', formData.read_time);
            data.append('is_published', formData.is_published ? 1 : 0);

            if (coverFile) {
                data.append('cover_image', coverFile);
            }

            if (editingArticle) {
                data.append('_method', 'PUT');
                await api.post(`/admin/articles/${editingArticle.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/articles', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setIsModalOpen(false);
            fetchArticles();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'فشل حفظ المقال');
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
                        إدارة المقالات والدراسات ✍️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        نشر المقالات والتأملات الروحية والدراسات اللاهوتية مع المحتوى النصي الكامل.
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة مقال جديد</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ابحث بالعنوان، الوصف، أو المحتوى..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingRight: '36px' }}
                        />
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                    </div>

                    <select
                        className="form-select"
                        value={selectedType}
                        onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                        style={{ flex: '0 1 180px' }}
                    >
                        <option value="">جميع الأنواع (مقال، دراسة...)</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    <button type="submit" className="btn btn-secondary" style={{ padding: '9px 16px' }}>
                        <span>بحث</span>
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>عنوان المقال</th>
                                <th>الكاتب</th>
                                <th>النوع</th>
                                <th>وقت القراءة</th>
                                <th>المشاهدات</th>
                                <th>حالة النشر</th>
                                <th style={{ textAlign: 'center', width: '130px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل المقالات...
                                    </td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد مقالات مسجلة.
                                    </td>
                                </tr>
                            ) : (
                                articles.map((art) => (
                                    <tr key={art.id}>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ color: '#0F172A', fontSize: '14.5px' }}>{art.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {art.short_description || '—'}
                                            </div>
                                        </td>
                                        <td style={{ color: '#475569', fontSize: '13.5px' }}>
                                            {art.author?.name || 'غير محدد'}
                                        </td>
                                        <td>
                                            <span className="badge badge-gold">
                                                {art.type?.name || 'مقال'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#64748B' }}>
                                            {art.read_time ?? 5} دقيقة
                                        </td>
                                        <td style={{ fontWeight: '600', color: '#334155' }}>
                                            {art.views_count ?? 0}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleTogglePublish(art.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {art.is_published ? (
                                                    <span className="badge badge-success">
                                                        <CheckCircle size={12} /> منشور
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-gray">
                                                        <XCircle size={12} /> مسودة
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEditModal(art)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px' }}
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(art.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px', color: '#EF4444' }}
                                                    title="أرشفة"
                                                >
                                                    <Archive size={14} />
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
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #E2E8F0',
                        fontSize: '13px',
                        color: '#64748B'
                    }}>
                        <div>إجمالي النتائج: {pagination.total} مقال</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px' }}
                            >
                                السابق
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: '700' }}>
                                {page} من {pagination.last_page}
                            </span>
                            <button
                                disabled={page >= pagination.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px' }}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '750px' }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                                {editingArticle ? 'تعديل بيانات المقال' : 'إضافة مقال جديد'}
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
                                <label className="form-label">عنوان المقال *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">المؤلف / الكاتب *</label>
                                    <select
                                        className="form-select"
                                        value={formData.author_id}
                                        onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                                        required
                                    >
                                        <option value="">اختر الكاتب</option>
                                        {authors.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">نوع المقال</label>
                                    <select
                                        className="form-select"
                                        value={formData.type_id}
                                        onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                                    >
                                        <option value="">اختر النوع</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">وقت القراءة (بالدقائق)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={formData.read_time}
                                        onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">الوصف القصير البارز (Short Description)</label>
                                <textarea
                                    className="form-textarea"
                                    rows="2"
                                    placeholder="نبذة تشويقية تظهر في الكروت والقوائم..."
                                    value={formData.short_description}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">نص المقالة الكامل (Full Article Text) *</label>
                                <textarea
                                    className="form-textarea"
                                    rows="8"
                                    placeholder="اكتب هنا المحتوى الكامل للمقال أو التأمل الروحي..."
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">مقتطف أو اقتباس ختامي (Excerpt)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="اقتباس يلخص جوهر المقال..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                                <div className="form-group">
                                    <label className="form-label">صورة الغلاف (اختياري)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-input"
                                        onChange={(e) => setCoverFile(e.target.files[0])}
                                    />
                                </div>

                                <div style={{ paddingTop: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <span style={{ fontWeight: '700' }}>نشر المقال مباشرة للجمهور</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingArticle ? 'تحديث المقال' : 'نشر المقال')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

