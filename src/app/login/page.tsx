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

// Mock credentials for prototype testing
const MOCK_USERS: Record<string, { password: string; name: string; route: string }> = {
  'admin@ops.com':    { password: 'admin123',    name: 'System Admin',    route: '/dashboard' },
  'manager@ops.com':  { password: 'manager123',  name: 'Mateo Rivera',    route: '/manager' },
  'employee@ops.com': { password: 'employee123', name: 'Priya Patel',     route: '/employee' },
  'mr@ops.com':       { password: 'mr123',       name: 'Marketing Rep',   route: '/mr' },
};

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill credentials when role is selected
  const handleRoleSelect = (roleId: RoleId) => {
    setRole(roleId);
    setError(null);
    const presets: Record<RoleId, { email: string; password: string }> = {
      'Admin':                    { email: 'admin@ops.com',    password: 'admin123' },
      'Manager':                  { email: 'manager@ops.com',  password: 'manager123' },
      'Employee':                 { email: 'employee@ops.com', password: 'employee123' },
      'Marketing Representative': { email: 'mr@ops.com',       password: 'mr123' },
    };
    setEmail(presets[roleId].email);
    setPassword(presets[roleId].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 700));

    const user = MOCK_USERS[email.toLowerCase()];
    if (!user || user.password !== password) {
      setError('Invalid credentials. Use the preset credentials shown below.');
      setLoading(false);
      return;
    }

    localStorage.setItem('user', JSON.stringify({ email, name: user.name, role }));
    router.push(user.route);
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

      {/* LOGO */}
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

      {/* PROTOTYPE BADGE */}
      <div style={{
        background: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.4)',
        borderRadius: 10,
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 700,
        color: '#92400e',
        marginBottom: 24,
        letterSpacing: '0.05em',
      }}>
        🧪 PROTOTYPE MODE — Click a role to auto-fill credentials
      </div>

      {/* CARD */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '44px 48px 36px',
        width: '100%',
        maxWidth: 500,
        boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
      }}>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1e1b4b', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14.5, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          Select your role and sign in to the prototype.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: 12,
            color: '#991b1b',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ROLE SELECTOR */}
        <div style={{ marginBottom: 28 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Select Workspace Role
          </label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden',
          }}>
            {ROLES.map(({ id, label, Icon }, i) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleRoleSelect(id)}
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

        {/* FORM */}
        <form onSubmit={handleSubmit}>
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
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* MOCK CREDENTIALS TABLE */}
        <div style={{
          marginTop: 28,
          padding: '16px',
          background: '#f8faff',
          border: '1px solid #e0e7ff',
          borderRadius: 12,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Prototype Credentials
          </p>
          {[
            { role: 'Admin',    email: 'admin@ops.com',    pass: 'admin123' },
            { role: 'Manager',  email: 'manager@ops.com',  pass: 'manager123' },
            { role: 'Employee', email: 'employee@ops.com', pass: 'employee123' },
            { role: 'Mktg Rep', email: 'mr@ops.com',       pass: 'mr123' },
          ].map(c => (
            <div key={c.role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#374151', marginBottom: 4, fontFamily: 'monospace' }}>
              <span style={{ fontWeight: 700, color: '#4f46e5', minWidth: 80 }}>{c.role}</span>
              <span style={{ color: '#6b7280' }}>{c.email}</span>
              <span style={{ color: '#9ca3af' }}>{c.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
