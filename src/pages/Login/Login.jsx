import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(loginUser(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        if (formData.email === 'admin@foodapp.com') {
          navigate('/admin/categories');
        } else {
          navigate('/menu'); // Redirect to customer menu on success
        }
      }
    });
  }, [dispatch, formData, navigate]);

  return (
    <div className="auth-container login-bg">
      <div className="auth-card">
        <h2>تسجيل الدخول</h2>
        <p className="auth-subtitle">مرحباً بك مجدداً في Epicurean Express</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              placeholder="example@mail.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-group">
            <label>كلمة المرور <span className="forgot-password">نسيت كلمة المرور؟</span></label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">تذكرني على هذا الجهاز</label>
          </div>

          <button type="submit" className="auth-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="auth-switch">ليس لديك حساب؟ <Link to="/register">سجل الآن</Link></p>
        
      </div>
      <div className="auth-side-image">
         <div className="auth-side-text">
            <h3>طعم لا يُنسى</h3>
            <p>اكتشف أفضل المطاعم في مدينتك واطلب وجباتك المفضلة بلمسة واحدة.</p>
         </div>
      </div>
    </div>
  );
};

export default Login;
