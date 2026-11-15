import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Settings, Save, Phone, Mail, MapPin, MessageSquare, Check, Share2, Info } from 'lucide-react';

export default function SettingsPage() {
    const [settingsMap, setSettingsMap] = useState({
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
        telegram: '',
        tiktok: '',
        site_name: '',
        about_app: '',
        copyright: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            const map = res.data.data.map || {};
            setSettingsMap((prev) => ({ ...prev, ...map }));
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (key, value) => {
        setSettingsMap((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSavedSuccess(false);

        try {
            await api.put('/admin/settings', settingsMap);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 4000);
        } catch (err) {
            alert('حدث خطأ أثناء حفظ الإعدادات.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>جاري تحميل الإعدادات...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إعدادات النظام والمكتبة ⚙️
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        تعديل أرقام التواصل، روابط السوشيال ميديا، وبيانات المكتبة المتاحة للجمهور.
                    </p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                </button>
            </div>

            {savedSuccess && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    color: '#065F46',
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '20px'
                }}>
                    <Check size={18} />
                    <span>تم حفظ وتحديث الإعدادات بنجاح!</span>
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Contact Info Card */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                        <Phone size={18} color="#C5A869" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                            بيانات التواصل والاتصال
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">رقم الهاتف (Phone)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="+201234567890"
                                value={settingsMap.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">رقم الواتساب (WhatsApp)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="+201234567890"
                                value={settingsMap.whatsapp}
                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني (Email)</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="contact@qalam-library.com"
                                value={settingsMap.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">العنوان والمقر (Address)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="القاهرة، مصر"
                                value={settingsMap.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Social Media Links Card */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                        <Share2 size={18} color="#C5A869" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                            روابط منصات التواصل الاجتماعي (Social Media)
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">فيسبوك (Facebook)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://facebook.com/..."
                                value={settingsMap.facebook}
                                onChange={(e) => handleChange('facebook', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">انستجرام (Instagram)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://instagram.com/..."
                                value={settingsMap.instagram}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">يوتيوب (YouTube)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://youtube.com/@..."
                                value={settingsMap.youtube}
                                onChange={(e) => handleChange('youtube', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">منصة إكس / تويتر (X / Twitter)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://x.com/..."
                                value={settingsMap.twitter}
                                onChange={(e) => handleChange('twitter', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">تيليجرام (Telegram)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://t.me/..."
                                value={settingsMap.telegram}
                                onChange={(e) => handleChange('telegram', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">تيك توك (TikTok)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://tiktok.com/@..."
                                value={settingsMap.tiktok}
                                onChange={(e) => handleChange('tiktok', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. General & About Card */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                        <Info size={18} color="#C5A869" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                            معلومات المكتبة والتطبيق العامة
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">اسم الموقع / المكتبة</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settingsMap.site_name}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">حقوق النشر والملكية (Copyright)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settingsMap.copyright}
                                onChange={(e) => handleChange('copyright', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '12px' }}>
                        <label className="form-label">نبذة عن المكتبة (About Us Text)</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            value={settingsMap.about_app}
                            onChange={(e) => handleChange('about_app', e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                        <Save size={16} />
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

