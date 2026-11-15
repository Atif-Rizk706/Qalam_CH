import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FolderTree,
    FileText,
    Tags,
    Megaphone,
    Globe,
    Settings,
    ShieldCheck,
    LogOut,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { to: '/admin', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: '/admin/books', label: 'إدارة الكتب', icon: BookOpen },
    { to: '/admin/authors', label: 'المؤلفون', icon: Users },
    { to: '/admin/categories', label: 'الأقسام', icon: FolderTree },
    { to: '/admin/articles', label: 'المقالات والدراسات', icon: FileText },
    { to: '/admin/article-types', label: 'أنواع المقالات', icon: Tags },
    { to: '/admin/advertisements', label: 'الإعلانات والبانرات', icon: Megaphone },
    { to: '/admin/analytics', label: 'إحصائيات الزوار والدول', icon: Globe },
    { to: '/admin/settings', label: 'الإعدادات العامة', icon: Settings },
    { to: '/admin/users', label: 'المشرفون والمستخدمون', icon: ShieldCheck },
];

export default function Sidebar() {
    const { logout, adminUser } = useAuth();

    return (
        <aside style={{
            width: '260px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
            color: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #334155',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Brand Logo & Title */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #C5A869 0%, #8A6E32 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(197, 168, 105, 0.4)'
                }}>
                    <Sparkles size={22} color="#FFFFFF" />
                </div>
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                        مكتبة قلم CH
                    </h2>
                    <span style={{ fontSize: '11px', color: '#C5A869', fontWeight: '600' }}>
                        لوحة التحكم الإدارية
                    </span>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '11px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13.5px',
                                        fontWeight: isActive ? '700' : '500',
                                        color: isActive ? '#FFFFFF' : '#94A3B8',
                                        background: isActive ? 'linear-gradient(90deg, rgba(197, 168, 105, 0.25) 0%, rgba(197, 168, 105, 0.08) 100%)' : 'transparent',
                                        borderRight: isActive ? '3px solid #C5A869' : '3px solid transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.15s ease'
                                    })}
                                >
                                    <Icon size={18} style={{ flexShrink: 0 }} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Admin User Footer & Logout */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {adminUser?.name || 'مدير النظام'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {adminUser?.email || 'admin@qalam.com'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#F87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    <LogOut size={14} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}

