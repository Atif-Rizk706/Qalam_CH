import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Globe, Eye, Users, RefreshCw, Award } from 'lucide-react';

export default function VisitorsAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/analytics/visitors');
            setAnalytics(res.data.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleSyncCountries = async () => {
        setSyncing(true);
        try {
            await api.post('/admin/countries/sync');
            alert('تم تحديث قائمة الدول بنجاح!');
            fetchAnalytics();
        } catch (err) {
            alert('فشل تحديث قائمة الدول.');
        } finally {
            setSyncing(false);
        }
    };

    const summary = analytics?.summary || {};
    const countries = analytics?.by_country || [];
    const totalVisits = summary.total_page_views || 1;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        إحصائيات الزوار والدول 🌍
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        تحليل تفاعلي للزيارات والجمهور حول العالم حسب الدول والأعلام ونسبة المشاهدات.
                    </p>
                </div>
                <button
                    onClick={handleSyncCountries}
                    disabled={syncing}
                    className="btn btn-secondary"
                >
                    <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                    <span>{syncing ? 'جاري المزامنة...' : 'مزامنة بيانات الدول'}</span>
                </button>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FBF8F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} color="#C5A869" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>إجمالي الزوار الفريدين</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{summary.total_unique_visitors ?? 0}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={24} color="#2563EB" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>إجمالي المشاهدات والزيارات</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{summary.total_page_views ?? 0}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={24} color="#059669" />
                    </div>
                    <div>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>الدول النشطة في الزيارة</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{countries.length} دول</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: '800', fontSize: '15px' }}>
                    توزيع الزيارات حسب الدولة (بالترتيب التنازلي)
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>الترتيب</th>
                                <th>الدولة</th>
                                <th>الكود</th>
                                <th>الزوار الفريدين</th>
                                <th>إجمالي الزيارات</th>
                                <th style={{ width: '220px' }}>نسبة الزيارات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        جاري تحميل الإحصائيات...
                                    </td>
                                </tr>
                            ) : countries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                        لا توجد بيانات زيارات مسجلة بعد.
                                    </td>
                                </tr>
                            ) : (
                                countries.map((c, idx) => {
                                    const percent = Math.min(100, Math.round((c.total_visits / totalVisits) * 100));
                                    return (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: '700', color: idx < 3 ? '#C5A869' : '#64748B' }}>
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                            </td>
                                            <td style={{ fontWeight: '700' }}>
                                                <span style={{ marginLeft: '10px', fontSize: '20px' }}>{c.flag || '🌐'}</span>
                                                <span style={{ fontSize: '14.5px', color: '#0F172A' }}>{c.country_name_ar || c.country_name_en}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-gray">{c.code}</span>
                                            </td>
                                            <td style={{ fontWeight: '700', color: '#0F172A' }}>
                                                {c.unique_visitors} زائر
                                            </td>
                                            <td style={{ fontWeight: '700', color: '#C5A869' }}>
                                                {c.total_visits} زيارة
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #C5A869 0%, #E8DCC4 100%)', borderRadius: '4px' }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', width: '35px' }}>
                                                        {percent}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

