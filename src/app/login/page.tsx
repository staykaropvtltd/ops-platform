'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield, BarChart3, Users,
  Mail, Lock, Eye, EyeOff, User as UserIcon,
  Loader2
} from 'lucide-react';

const ROLES = [
  { id: 'Admin',                    label: 'Admin',        Icon: Shield },
  { id: 'Manager',                  label: 'Manager',      Icon: BarChart3 },
  { id: 'Employee',                 label: 'Employee',     Icon: Users },
  { id: 'Marketing Representative', label: 'Marketing Rep',Icon: UserIcon },
] as const;

type RoleId = typeof ROLES[number]['id'];

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<RoleId>('Marketing Representative');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? '/api/auth/signup' : '/api/auth/login';
    
    // Map UI role to DB role to ensure schema validation succeeds
    const dbRoleMap: Record<string, string> = {
      Admin: 'Admin',
      Manager: 'Manager',
      Employee: 'Staff',
      'Marketing Representative': 'User'
    };

    const body = isRegister 
      ? { email, password, name, role: dbRoleMap[role] || role } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      if (isRegister) {
        setIsRegister(false);
        setError('Account created! Please sign in.');
        setLoading(false);
      } else {
        // Save user info (simplified session)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Map DB role back to frontend routes
        const routeMap: Record<string, string> = {
          Admin: '/dashboard',
          Manager: '/manager',
          Staff: '/employee',
          Employee: '/employee',
          User: '/marketing',
          'Marketing Representative': '/marketing'
        };
        router.push(routeMap[data.user.role] || '/dashboard');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection error. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #dde0f7 0%, #e8eaf6 40%, #cfd2ee 100%)',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>

      {/* ── LOGO ── */}
      <Link href="/landing" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, #3730a3, #4f46e5)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(79,70,229,0.4)',
        }}>
          <Shield size={24} color="white" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#1e1b4b', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Ops Platform
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 3 }}>
            Enterprise Operations
          </div>
        </div>
      </Link>

      {/* ── CARD ── */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '44px 48px 36px',
        width: '100%',
        maxWidth: 500,
        boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
      }}>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1e1b4b', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
          {isRegister ? 'Create Account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize: 14.5, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          {isRegister ? 'Join the enterprise operations platform.' : 'Please enter your details to sign in.'}
        </p>

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            background: error.includes('created') ? '#ecfdf5' : '#fef2f2', 
            border: `1px solid ${error.includes('created') ? '#10b981' : '#ef4444'}`,
            borderRadius: 12,
            color: error.includes('created') ? '#065f46' : '#991b1b',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ── ROLE SELECTOR ── */}
        <div style={{ marginBottom: 28 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Select {isRegister ? 'Target Role' : 'Workspace Role'}
          </label>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${isRegister ? 3 : 4}, 1fr)`,
            border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden',
          }}>
            {ROLES.filter(r => !isRegister || r.id !== 'Admin').map(({ id, label, Icon }, i) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  style={{
                    padding: '14px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    background: active ? 'rgba(79,70,229,0.06)' : 'white',
                    border: 'none',
                    borderLeft: i > 0 ? '1.5px solid #e5e7eb' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon
                    size={20}
                    color={active ? '#4f46e5' : '#9ca3af'}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span style={{
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? '#4f46e5' : '#6b7280',
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit}>

          {isRegister && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#1e1b4b', outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px',
                  border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#1e1b4b', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 42px',
                  border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#1e1b4b', outline: 'none'
                }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #3730a3, #4f46e5)',
              color: 'white', fontWeight: 700, fontSize: 15.5, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(79,70,229,0.4)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6b7280', marginTop: 28 }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
          >
            {isRegister ? 'Sign In' : 'Request access / Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
