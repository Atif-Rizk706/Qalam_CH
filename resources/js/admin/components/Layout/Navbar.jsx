import React from 'react';
import { Bell, Search, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title = 'لوحة التحكم' }) {
    const { adminUser } = useAuth();

    return (
        <header style={{
            height: '65px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
        }}>
            {/* Title / Breadcrumbs */}
            <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {title}
                </h1>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#64748B',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC'
                    }}
                >
                    <ExternalLink size={14} />
                    <span>زيارة الموقع</span>
                </a>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingRight: '12px',
                    borderRight: '1px solid #E2E8F0'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#C5A869',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px'
                    }}>
                        {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
}

