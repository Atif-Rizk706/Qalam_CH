import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/admin';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: 'Cairo, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '520px',
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '36px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #FEE2E2',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <AlertTriangle size={28} />
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                            حدث خطأ أثناء عرض هذه الصفحة
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: '1.6' }}>
                            {this.state.error?.message || 'واجه النظام خطأ غير متوقع أثناء معالجة البيانات.'}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    background: '#C5A869',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={14} />
                                <span>إعادة المحاولة</span>
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Home size={14} />
                                <span>الرئيسية</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

