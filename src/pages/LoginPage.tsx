import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const warehouseBgUrl = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      navigate('/dashboard');
    }
  };

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Draw connections
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
    };

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      drawConnections();
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="login-page">
      <div
        className="login-bg"
        style={{ backgroundImage: `url(${warehouseBgUrl})` }}
      />
      <div className="login-overlay" />
      <canvas ref={canvasRef} className="login-particles" />

      <motion.div
        className="login-card-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1 className="login-title">Inventory Management System</h1>

        <motion.div
          className="login-card"
          whileHover={{
            y: -4,
            boxShadow: '0 32px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.12)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className={`form-group ${isEmailFocused || email ? 'focused' : ''}`}>
              <label htmlFor="login-email">
                <Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Email
              </label>
              <motion.input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
                animate={{
                  borderColor: isEmailFocused ? '#3b82f6' : '#e5e7eb',
                  boxShadow: isEmailFocused
                    ? '0 0 0 3px rgba(59,130,246,0.15), 0 0 12px rgba(59,130,246,0.08)'
                    : '0 0 0 0px rgba(59,130,246,0)',
                }}
                transition={{ duration: 0.25 }}
              />
            </div>

            <div className={`form-group ${isPasswordFocused || password ? 'focused' : ''}`} style={{ position: 'relative' }}>
              <label htmlFor="login-password">
                <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <motion.input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  animate={{
                    borderColor: isPasswordFocused ? '#3b82f6' : '#e5e7eb',
                    boxShadow: isPasswordFocused
                      ? '0 0 0 3px rgba(59,130,246,0.15), 0 0 12px rgba(59,130,246,0.08)'
                      : '0 0 0 0px rgba(59,130,246,0)',
                  }}
                  transition={{ duration: 0.25 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none mb-4 mt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer transition-all duration-200"
              />
              <span className="text-sm text-gray-500 font-medium">Remember Me</span>
            </label>

            <motion.button
              type="submit"
              className="login-btn"
              whileHover={{
                scale: 1.03,
                boxShadow: '0 8px 24px rgba(59,130,246,0.45), 0 0 16px rgba(59,130,246,0.2)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              Login
              <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 8 }} />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
