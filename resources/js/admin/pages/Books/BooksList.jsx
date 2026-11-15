import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Star, 
    Sparkles, 
    Archive, 
    RotateCcw, 
    Edit, 
    Trash2, 
    X,
    Filter
} from 'lucide-react';

export default function BooksList() {
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({});
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [page, setPage] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        author_id: '',
        category_id: '',
        is_suggested: false,
        is_book_of_the_day: false,
    });
    const [coverFile, setCoverFile] = useState(null);
    const [bookFile, setBookFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 12 };
            if (search) params.search = search;
            if (selectedCategory) params.category_id = selectedCategory;
            if (selectedAuthor) params.author_id = selectedAuthor;

            const res = await api.get('/admin/books', { params });
            const data = res.data.data;
            setBooks(data.data || []);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
            });
        } catch (err) {
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [catRes, authRes] = await Promise.all([
                api.get('/categories'),
                api.get('/authors'),
            ]);
            setCategories(catRes.data.data || []);
            setAuthors(authRes.data.data || []);
        } catch (err) {
            console.error('Error fetching dropdowns:', err);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [page, selectedCategory, selectedAuthor]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBooks();
    };

    const handleSetBookOfTheDay = async (id) => {
        try {
            await api.patch(`/admin/books/${id}/set-book-of-the-day`);
            fetchBooks();
        } catch (err) {
            alert('فشل تعيين كتاب اليوم');
        }
    };

    const handleToggleSuggested = async (id) => {
        try {
            await api.patch(`/admin/books/${id}/toggle-suggested`);
            fetchBooks();
        } catch (err) {
            alert('فشل تغيير حالة المقترح');
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm('هل أنت متأكد من أرشفة هذا الكتاب؟')) return;
        try {
            await api.delete(`/admin/books/${id}`);
            fetchBooks();
        } catch (err) {
            alert('فشل أرشفة الكتاب');
        }
    };

    const openAddModal = () => {
        setEditingBook(null);
        setFormData({
            title: '',
            slug: '',
            description: '',
            author_id: authors[0]?.id || '',
            category_id: categories[0]?.id || '',
            is_suggested: false,
            is_book_of_the_day: false,
        });
        setCoverFile(null);
        setBookFile(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title || '',
            slug: book.slug || '',
            description: book.description || '',
            author_id: book.author?.id || '',
            category_id: book.category?.id || '',
            is_suggested: !!book.is_suggested,
            is_book_of_the_day: !!book.is_book_of_the_day,
        });
        setCoverFile(null);
        setBookFile(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSaveBook = async (e) => {
        e.preventDefault();
        setSaving(true);
        setModalError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('slug', formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'));
            data.append('description', formData.description || '');
            data.append('author_id', formData.author_id);
            data.append('category_id', formData.category_id);
            data.append('is_suggested', formData.is_suggested ? 1 : 0);
            data.append('is_book_of_the_day', formData.is_book_of_the_day ? 1 : 0);

            if (coverFile) {
                data.append('cover_image', coverFile);
            }
            if (bookFile) {
                data.append('file', bookFile);
            }

            if (editingBook) {
                // Laravel handles multipart PUT with _method POST
                data.append('_method', 'PUT');
                await api.post(`/admin/books/${editingBook.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/books', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setIsModalOpen(false);
            fetchBooks();
        } catch (err) {
            const msg = err.response?.data?.message || 'حدث خطأ أثناء حفظ الكتاب.';
            setModalError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            {/* Header / Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إدارة الكتب 📚
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        عرض وإضافة وتعديل الكتب الرقمية وتعيين كتاب اليوم والكتب المقترحة.
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة كتاب جديد</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ابحث باسم الكتاب، الوصف..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingRight: '36px' }}
                        />
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                    </div>

                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        style={{ flex: '0 1 180px' }}
                    >
                        <option value="">جميع الأقسام</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={selectedAuthor}
                        onChange={(e) => { setSelectedAuthor(e.target.value); setPage(1); }}
                        style={{ flex: '0 1 180px' }}
                    >
                        <option value="">جميع المؤلفين</option>
                        {authors.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>

                    <button type="submit" className="btn btn-secondary" style={{ padding: '9px 16px' }}>
                        <Filter size={15} />
                        <span>بحث</span>
                    </button>
                </form>
            </div>

            {/* Books Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>الغلاف</th>
                                <th>عنوان الكتاب</th>
                                <th>المؤلف</th>
                                <th>القسم</th>
                                <th>المشاهدات</th>
                                <th>الحالة والوسوم</th>
                                <th style={{ textAlign: 'center', width: '180px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل الكتب...
                                    </td>
                                </tr>
                            ) : books.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لم يتم العثور على أي كتب مطابقة.
                                    </td>
                                </tr>
                            ) : (
                                books.map((b) => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{
                                                width: '42px',
                                                height: '56px',
                                                borderRadius: '6px',
                                                background: '#F1F5F9',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {b.cover_image_url ? (
                                                    <img src={b.cover_image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <BookOpen size={20} color="#94A3B8" />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ color: '#0F172A', fontSize: '14.5px' }}>{b.title}</div>
                                            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>{b.slug}</div>
                                        </td>
                                        <td style={{ color: '#475569' }}>
                                            {b.author?.name || 'غير محدد'}
                                        </td>
                                        <td>
                                            <span className="badge badge-gold">
                                                {b.category?.name || 'عام'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '600', color: '#334155' }}>
                                            {b.views_count ?? 0}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {b.is_book_of_the_day && (
                                                    <span className="badge badge-gold" title="كتاب اليوم">
                                                        <Star size={11} fill="#C5A869" /> كتاب اليوم
                                                    </span>
                                                )}
                                                {b.is_suggested && (
                                                    <span className="badge badge-blue" title="مقترح">
                                                        <Sparkles size={11} /> مقترح
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => handleSetBookOfTheDay(b.id)}
                                                    className="btn btn-secondary"
                                                    title="تعيين كـ كتاب اليوم"
                                                    style={{ padding: '6px 8px' }}
                                                >
                                                    <Star size={14} color={b.is_book_of_the_day ? '#C5A869' : '#64748B'} fill={b.is_book_of_the_day ? '#C5A869' : 'none'} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleSuggested(b.id)}
                                                    className="btn btn-secondary"
                                                    title="تغيير حالة مقترح"
                                                    style={{ padding: '6px 8px' }}
                                                >
                                                    <Sparkles size={14} color={b.is_suggested ? '#2563EB' : '#64748B'} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(b)}
                                                    className="btn btn-secondary"
                                                    title="تعديل"
                                                    style={{ padding: '6px 8px' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(b.id)}
                                                    className="btn btn-secondary"
                                                    title="أرشفة"
                                                    style={{ padding: '6px 8px', color: '#EF4444' }}
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
                        <div>إجمالي النتائج: {pagination.total} كتاب</div>
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

            {/* Add / Edit Modal */}
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
                                {editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBook} style={{ padding: '24px' }}>
                            {modalError && (
                                <div style={{ padding: '10px 14px', background: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                                    {modalError}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">عنوان الكتاب *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">المؤلف *</label>
                                    <select
                                        className="form-select"
                                        value={formData.author_id}
                                        onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                                        required
                                    >
                                        <option value="">اختر المؤلف</option>
                                        {authors.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">القسم / التصنيف *</label>
                                    <select
                                        className="form-select"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">اختر القسم</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">وصف الكتاب</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">صورة الغلاف (Image)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-input"
                                        onChange={(e) => setCoverFile(e.target.files[0])}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ملف الكتاب (PDF)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.epub,.docx"
                                        className="form-input"
                                        onChange={(e) => setBookFile(e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', margin: '16px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_suggested}
                                        onChange={(e) => setFormData({ ...formData, is_suggested: e.target.checked })}
                                    />
                                    <span>إضافة للكتب المقترحة</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_book_of_the_day}
                                        onChange={(e) => setFormData({ ...formData, is_book_of_the_day: e.target.checked })}
                                    />
                                    <span>تعيين كـ كتاب اليوم</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingBook ? 'تحديث الكتاب' : 'إضافة الكتاب')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

