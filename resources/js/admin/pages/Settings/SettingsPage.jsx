import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/client';
import { Settings, Save, Phone, Mail, MapPin, MessageSquare, Check, Share2, Info, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';

export default function SettingsPage() {
    const [settingsMap, setSettingsMap] = useState({
        // Hero / Landing section
        title: '',
        title_descr: '',
        hero_badge: '',
        hero_image: '',
        // Contact
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        // Social
        facebook: '',
        instagram: '',
        youtube: '',
        twitter: '',
        telegram: '',
        tiktok: '',
        // General
        site_name: '',
        about_app: '',
        copyright: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Hero image upload & preview states
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState(null);
    const [removeHeroImage, setRemoveHeroImage] = useState(false);
    const heroImageInputRef = useRef(null);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            const map = res.data.data.map || {};
            setSettingsMap((prev) => ({ ...prev, ...map }));
            if (map.hero_image) {
                setHeroImagePreview(map.hero_image);
            }
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

    const handleHeroImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroImageFile(file);
            setHeroImagePreview(URL.createObjectURL(file));
            setRemoveHeroImage(false);
        }
    };

    const handleRemoveHeroImage = () => {
        setHeroImageFile(null);
        setHeroImagePreview(null);
        setRemoveHeroImage(true);
        if (heroImageInputRef.current) {
            heroImageInputRef.current.value = '';
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSavedSuccess(false);

        try {
            const fd = new FormData();
            fd.append('_method', 'PUT');

            // Append all settingsMap keys
            Object.keys(settingsMap).forEach((key) => {
                if (key !== 'hero_image') {
                    fd.append(key, settingsMap[key] ?? '');
                }
            });

            // Append hero_image file if new file was selected
            if (heroImageFile) {
                fd.append('hero_image', heroImageFile);
            }

            if (removeHeroImage) {
                fd.append('remove_hero_image', '1');
            }

            const res = await api.post('/admin/settings', fd);
            const updatedMap = res.data.data.map || {};
            setSettingsMap((prev) => ({ ...prev, ...updatedMap }));
            if (updatedMap.hero_image) {
                setHeroImagePreview(updatedMap.hero_image);
            } else if (removeHeroImage) {
                setHeroImagePreview(null);
            }
            setHeroImageFile(null);
            setRemoveHeroImage(false);

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
                        التحكم في واجهة الموقع الرئيسية (Hero Section)، بيانات التواصل، السوشيال ميديا، وبيانات المكتبة.
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
                {/* 0. Hero / Landing Section Card */}
                <div className="card" style={{ borderTop: '4px solid #C5A869' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FDF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={18} color="#C5A869" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                                    واجهة الموقع الرئيسية (Hero Section)
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                                    التحكم في عنوان الواجهة، الوصف الترويجي، الشارة، والصورة الترويجية المعروضة لزوار الموقع
                                </p>
                            </div>
                        </div>
                        <span className="badge badge-primary" style={{ background: '#FDF8F0', color: '#927028', border: '1px solid #F3E8D0', fontSize: '11.5px', padding: '4px 10px' }}>
                            الصفحة الرئيسية للموقع
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                        {/* Text fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    شارة الهيدر (Hero Badge)
                                    <span style={{ fontSize: '11px', color: '#94A3B8', marginRight: '6px' }}>(الشارة الصغيرة فوق العنوان)</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: منصة النشر والقراءة المسيحية"
                                    value={settingsMap.hero_badge || ''}
                                    onChange={(e) => handleChange('hero_badge', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '700' }}>
                                    عنوان الواجهة الرئيسي (title) *
                                    <span style={{ fontSize: '11px', color: '#94A3B8', marginRight: '6px' }}>(العنوان الأكبر في الصفحة الرئيسية)</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ fontSize: '15px', fontWeight: '700' }}
                                    placeholder="مثال: حيث تلتقي الكلمة العميقة بـ أقلام مسيحية أصيلة"
                                    value={settingsMap.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    وصف عنوان الواجهة (title_descr) *
                                    <span style={{ fontSize: '11px', color: '#94A3B8', marginRight: '6px' }}>(النص التوضيحي أسفل العنوان)</span>
                                </label>
                                <textarea
                                    className="form-textarea"
                                    rows="4"
                                    placeholder="مثال: تهدف منصة قَلَم إلى تشجيع الكتّاب والمفكرين وإثراء مكتبتنا العربية بمؤلفات جديدة في العلوم الروحية..."
                                    value={settingsMap.title_descr || ''}
                                    onChange={(e) => handleChange('title_descr', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Image field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label className="form-label" style={{ fontWeight: '700' }}>
                                صورة الواجهة الرئيسية (Hero Image)
                            </label>

                            <div
                                onClick={() => heroImageInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #CBD5E1',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: '#F8FAFC',
                                    minHeight: '200px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C5A869'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                            >
                                {heroImagePreview ? (
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            maxHeight: '190px',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                                            border: '2px solid #E2E8F0',
                                        }}>
                                            <img
                                                src={heroImagePreview}
                                                alt="Hero Preview"
                                                style={{ width: '100%', height: '170px', objectFit: 'cover', display: 'block' }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#927028', fontWeight: '600' }}>
                                            اضغط لتغيير الصورة
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#94A3B8' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ImageIcon size={24} color="#64748B" />
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                                            اضغط لاختيار صورة الواجهة
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                                            PNG, JPG, WEBP — يفضل صورة أفقية بدقة عالية
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={heroImageInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                style={{ display: 'none' }}
                                onChange={handleHeroImageChange}
                            />

                            {heroImagePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveHeroImage}
                                    style={{
                                        background: '#FEF2F2',
                                        border: '1px solid #FECACA',
                                        color: '#DC2626',
                                        borderRadius: '8px',
                                        padding: '7px 12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        marginTop: '4px',
                                    }}
                                >
                                    <Trash2 size={13} />
                                    <span>إزالة الصورة الحالية</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

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
                                value={settingsMap.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">رقم الواتساب (WhatsApp)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="+201234567890"
                                value={settingsMap.whatsapp || ''}
                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني (Email)</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="contact@qalam-library.com"
                                value={settingsMap.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">العنوان والمقر (Address)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="القاهرة، مصر"
                                value={settingsMap.address || ''}
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
                                value={settingsMap.facebook || ''}
                                onChange={(e) => handleChange('facebook', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">انستجرام (Instagram)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://instagram.com/..."
                                value={settingsMap.instagram || ''}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">يوتيوب (YouTube)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://youtube.com/@..."
                                value={settingsMap.youtube || ''}
                                onChange={(e) => handleChange('youtube', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">منصة إكس / تويتر (X / Twitter)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://x.com/..."
                                value={settingsMap.twitter || ''}
                                onChange={(e) => handleChange('twitter', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">تيليجرام (Telegram)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://t.me/..."
                                value={settingsMap.telegram || ''}
                                onChange={(e) => handleChange('telegram', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">تيك توك (TikTok)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://tiktok.com/@..."
                                value={settingsMap.tiktok || ''}
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
                                value={settingsMap.site_name || ''}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">حقوق النشر والملكية (Copyright)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settingsMap.copyright || ''}
                                onChange={(e) => handleChange('copyright', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '12px' }}>
                        <label className="form-label">نبذة عن المكتبة (About Us Text)</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            value={settingsMap.about_app || ''}
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

