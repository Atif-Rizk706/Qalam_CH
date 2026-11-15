import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            navigate('/admin');
        } else {
            setError(res.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 100%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '420px',
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '36px 32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(197, 168, 105, 0.3)'
            }}>
                {/* Header / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #C5A869 0%, #8A6E32 100%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(197, 168, 105, 0.45)',
                        marginBottom: '16px'
                    }}>
                        <Sparkles size={28} color="#FFFFFF" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                        تسجيل الدخول للإدارة
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        مكتبة قلم CH — المنصة الرقمية
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        color: '#DC2626',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '20px'
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">البريد الإلكتروني</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingRight: '40px' }}
                                required
                            />
                            <Mail size={18} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                                required
                            />
                            <Lock size={18} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                    >
                        {loading ? 'جاري التحقق...' : (
                            <>
                                <span>دخول للوحة التحكم</span>
                                <ArrowLeft size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <a href="/" style={{ fontSize: '12px', color: '#64748B', textDecoration: 'none' }}>
                        ← العودة إلى الموقع الرئيسي
                    </a>
                </div>
            </div>
        </div>
    );
}

