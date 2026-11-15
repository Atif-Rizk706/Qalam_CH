import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({ title }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Right Sidebar (RTL) */}
            <Sidebar />

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Navbar title={title} />
                <main style={{ padding: '24px', flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

