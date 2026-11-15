import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Megaphone, Plus, Edit, Trash2, X, ExternalLink, Calendar } from 'lucide-react';

export default function AdvertisementsList() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image_path: '',
        url: '',
        start_time: '',
        end_time: '',
        is_active: true,
    });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/advertisements');
            const data = res.data.data;
            setAds(data.data || data || []);
        } catch (err) {
            console.error('Error fetching ads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const openAddModal = () => {
        setEditingAd(null);
        setFormData({
            title: '',
            image_path: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
            url: 'https://example.com',
            start_time: new Date().toISOString().slice(0, 10),
            end_time: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
            is_active: true,
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (ad) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title || '',
            image_path: ad.image_path || '',
            url: ad.url || '',
            start_time: ad.start_time ? ad.start_time.slice(0, 10) : '',
            end_time: ad.end_time ? ad.end_time.slice(0, 10) : '',
            is_active: !!ad.is_active,
        });
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await api.delete(`/admin/advertisements/${id}`);
            fetchAds();
        } catch (err) {
            alert('فشل حذف الإعلان');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            if (editingAd) {
                await api.put(`/admin/advertisements/${editingAd.id}`, formData);
            } else {
                await api.post('/admin/advertisements', formData);
            }

            setIsModalOpen(false);
            fetchAds();
        } catch (err) {
            let msg = err.response?.data?.message || 'فشل حفظ الإعلان';
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
                        إدارة الإعلانات والبانرات 📢
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        إدارة البانرات الإعلانية وروابط التوجيه وتواريخ البدء والانتهاء.
                    </p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={16} />
                    <span>إضافة إعلان جديد</span>
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>عنوان الإعلان</th>
                                <th>الرابط</th>
                                <th>تاريخ البدء والانتهاء</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل الإعلانات...
                                    </td>
                                </tr>
                            ) : ads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد إعلانات مسجلة.
                                    </td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id}>
                                        <td style={{ fontWeight: '700' }}>
                                            <div style={{ color: '#0F172A', fontSize: '14.5px' }}>{ad.title}</div>
                                            <div style={{ fontSize: '12px', color: '#94A3B8', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ad.image_path}
                                            </div>
                                        </td>
                                        <td>
                                            {ad.url ? (
                                                <a href={ad.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#C5A869', textDecoration: 'none', fontSize: '13px' }}>
                                                    <span>رابط الوجهة</span>
                                                    <ExternalLink size={12} />
                                                </a>
                                            ) : '—'}
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#475569' }}>
                                            <div>من: {ad.start_time?.slice(0, 10)}</div>
                                            <div>إلى: {ad.end_time?.slice(0, 10)}</div>
                                        </td>
                                        <td>
                                            {ad.is_active ? (
                                                <span className="badge badge-success">نشط</span>
                                            ) : (
                                                <span className="badge badge-gray">متوقف</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEditModal(ad)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 8px' }}
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ad.id)}
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
                                {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
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
                                <label className="form-label">عنوان الإعلان *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">رابط صورة البانر (Image URL) *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={formData.image_path}
                                    onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">رابط التوجيه عند النقر (Target URL)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">تاريخ البداية *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">تاريخ الانتهاء *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ margin: '14px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>تفعيل الإعلان فوراً</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'جاري الحفظ...' : (editingAd ? 'تحديث الإعلان' : 'إضافة الإعلان')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

