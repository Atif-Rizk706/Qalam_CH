import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Users, Plus, Search, Edit, Trash2, X, Globe, Calendar } from 'lucide-react';

export default function AuthorsList() {
    const [authors, setAuthors] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterContemporary, setFilterContemporary] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        country_id: '',
        bio: '',
        is_contemporary: false,
        birth_year: '',
        death_year: '',
    });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (filterContemporary !== '') params.is_contemporary = filterContemporary;

            const res = await api.get('/admin/authors', { params });
            const data = res.data.data;
            setAuthors(data.data || data || []);
        } catch (err) {
            console.error('Error fetching authors:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const res = await api.get('/countries');
            setCountries(res.data.data || []);
        } catch (err) {
            console.error('Error fetching countries:', err);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchAuthors();
    }, [filterContemporary]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAuthors();
    };

    const openAddModal = () => {
        setEditingAuthor(null);
        setFormData({
            name: '',
            slug: '',
            country_id: '',
            bio: '',
            is_contemporary: false,
            birth_year: '',
            death_year: '',
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (a) => {
        setEditingAuthor(a);
        setFormData({
            name: a.name || '',
            slug: a.slug || '',
            country_id: a.country?.id || a.country_id || '',
            bio: a.bio || '',
            is_contemporary: !!a.is_contemporary,
            birth_year: a.birth_year || '',
            death_year: a.death_year || '',
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المؤلف؟')) return;
        try {
            await api.delete(`/admin/authors/${id}`);
            fetchAuthors();
        } catch (err) {
            alert('فشل حذف المؤلف');
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

            if (editingAuthor) {
                await api.put(`/admin/authors/${editingAuthor.id}`, payload);
            } else {
                await api.post('/admin/authors', payload);
            }

            setIsModalOpen(false);
            fetchAuthors();
        } catch (err) {
            let msg = err.response?.data?.message || 'فشل حفظ المؤلف';
            if (err.response?.data?.errors) {
                const details = Object.values(err.response.data.errors).flat().join(' | ');
                if (details) msg = `${msg} (${details})`;
            }
            setErrorMsg(msg);
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
                        إدارة المؤلفين ✍️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        إدارة المؤلفين والآباء والكتّاب وربطهم ببلدانهم وتاريخهم.
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة مؤلف جديد</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ابحث باسم المؤلف، البلد..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingRight: '36px' }}
                        />
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                    </div>

                    <select
                        className="form-select"
                        value={filterContemporary}
                        onChange={(e) => setFilterContemporary(e.target.value)}
                        style={{ flex: '0 1 200px' }}
                    >
                        <option value="">جميع الكتّاب (معاصرين وقدامى)</option>
                        <option value="1">كتّاب معاصرون فقط</option>
                        <option value="0">كتّاب وآباء راحلون فقط</option>
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
                                <th>اسم المؤلف</th>
                                <th>الدولة</th>
                                <th>الحالة التاريخية</th>
                                <th>سنوات الميلاد والوفاة</th>
                                <th>النبذة التعريفية</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل المؤلفين...
                                    </td>
                                </tr>
                            ) : authors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد بيانات مطابقة.
                                    </td>
                                </tr>
                            ) : (
                                authors.map((a) => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ color: '#0F172A', fontSize: '14.5px' }}>{a.name}</div>
                                            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>{a.slug}</div>
                                        </td>
                                        <td>
                                            {a.country ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '16px' }}>{a.country.flag_emoji || '🌐'}</span>
                                                    <span style={{ fontSize: '13px' }}>{a.country.name_ar || a.country.name_en}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>غير محدد</span>
                                            )}
                                        </td>
                                        <td>
                                            {a.is_contemporary ? (
                                                <span className="badge badge-success">معاصر</span>
                                            ) : (
                                                <span className="badge badge-gray">{a.life_status || 'متوفي'}</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#475569' }}>
                                            {a.birth_year ? `${a.birth_year} - ` : ''}
                                            {a.death_year || (a.is_contemporary ? 'الآن' : '')}
                                        </td>
                                        <td style={{ maxWidth: '280px', fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.bio || '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEditModal(a)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px' }}
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
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
                                {editingAuthor ? 'تعديل بيانات المؤلف' : 'إضافة مؤلف جديد'}
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
                                <label className="form-label">اسم المؤلف *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">البلد / الدولة</label>
                                    <select
                                        className="form-select"
                                        value={formData.country_id}
                                        onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                                    >
                                        <option value="">اختر الدولة (اختياري)</option>
                                        {countries.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.flag_emoji} {c.name_ar || c.name_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الاسم اللطيف (Slug)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="تلقائي من الاسم"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">سنة الميلاد (مثال: 354 م)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.birth_year}
                                        onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">سنة الوفاة (مثال: 430 م)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.death_year}
                                        disabled={formData.is_contemporary}
                                        placeholder={formData.is_contemporary ? 'معاصر' : ''}
                                        onChange={(e) => setFormData({ ...formData, death_year: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ margin: '14px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_contemporary}
                                        onChange={(e) => setFormData({ ...formData, is_contemporary: e.target.checked })}
                                    />
                                    <span>كاتب معاصر (على قيد الحياة)</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">نبذة وسيرة ذاتية مختصرة</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingAuthor ? 'تحديث البيانات' : 'إضافة المؤلف')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

