import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
    BookOpen,
    Users,
    FolderTree,
    FileText,
    Globe,
    Eye,
    TrendingUp,
    PlusCircle,
    ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [visitors, setVisitors] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashRes, visRes] = await Promise.all([
                    api.get('/admin/dashboard').catch(() => null),
                    api.get('/admin/analytics/visitors').catch(() => null),
                ]);

                if (dashRes?.data?.data) {
                    setStats(dashRes.data.data);
                }
                if (visRes?.data?.data) {
                    setVisitors(visRes.data.data);
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'إجمالي الكتب', count: stats?.books_count ?? '...', icon: BookOpen, color: '#C5A869', bg: '#FBF8F1', link: '/admin/books' },
        { label: 'المؤلفون', count: stats?.authors_count ?? '...', icon: Users, color: '#3B82F6', bg: '#EFF6FF', link: '/admin/authors' },
        { label: 'الأقسام والتصنيفات', count: stats?.categories_count ?? '...', icon: FolderTree, color: '#10B981', bg: '#ECFDF5', link: '/admin/categories' },
        { label: 'المقالات والدراسات', count: stats?.articles_count ?? '...', icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', link: '/admin/articles' },
        { label: 'الزوار الفريدين', count: visitors?.summary?.total_unique_visitors ?? '...', icon: Globe, color: '#F59E0B', bg: '#FFFBEB', link: '/admin/analytics' },
        { label: 'إجمالي المشاهدات', count: visitors?.summary?.total_page_views ?? '...', icon: Eye, color: '#EC4899', bg: '#FDF2F8', link: '/admin/analytics' },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
                جاري تحميل بيانات لوحة التحكم...
            </div>
        );
    }

    return (
        <div>
            {/* Welcome banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: '16px',
                padding: '24px 28px',
                color: '#FFFFFF',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0' }}>
                        مرحباً بك في لوحة تحكم مكتبة قلم CH 📖
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                        إليك ملخص سريع لنشاط المكتبة، المحتوى، وحركة الزوار عبر العالم.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/admin/books" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                        <PlusCircle size={15} />
                        <span>إضافة كتاب جديد</span>
                    </Link>
                    <Link to="/admin/articles" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                        <PlusCircle size={15} />
                        <span>إضافة مقال جديد</span>
                    </Link>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
            }}>
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={i}
                            to={card.link}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>
                                        {card.label}
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
                                        {card.count}
                                    </div>
                                </div>
                                <div style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '12px',
                                    background: card.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={22} color={card.color} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Analytics by Country Table */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={18} color="#C5A869" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                            أكثر الدول زيارة للمكتبة 🌍
                        </h3>
                    </div>
                    <Link to="/admin/analytics" style={{ fontSize: '12px', color: '#C5A869', textDecoration: 'none', fontWeight: '700' }}>
                        عرض كل الإحصائيات ←
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>الدولة</th>
                                <th>رمز الدولة</th>
                                <th>الزوار الفريدين</th>
                                <th>إجمالي الزيارات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors?.by_country && visitors.by_country.length > 0 ? (
                                visitors.by_country.slice(0, 6).map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '700' }}>
                                            <span style={{ marginLeft: '8px', fontSize: '18px' }}>{item.flag || '🌐'}</span>
                                            <span>{item.country_name_ar || item.country_name_en}</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-gray">{item.code}</span>
                                        </td>
                                        <td style={{ fontWeight: '700', color: '#0F172A' }}>
                                            {item.unique_visitors}
                                        </td>
                                        <td style={{ color: '#C5A869', fontWeight: '700' }}>
                                            {item.total_visits}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                                        لا توجد بيانات زيارات مسجلة بعد.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

