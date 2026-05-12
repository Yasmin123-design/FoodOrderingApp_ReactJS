import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css'; // Reusing the same styles for consistency
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(registerUser(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/'); // Redirect to home on success
      }
    });
  }, [dispatch, formData, navigate]);

  return (
    <div className="auth-container register-bg">
      <div className="auth-card register-card">
        <h2>ابدأ رحلتك معنا</h2>
        <p className="auth-subtitle">سجل حسابك الجديد لتستمتع بأشهى المأكولات</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>الاسم بالكامل</label>
            <input 
              type="text" 
              name="name" 
              placeholder="أدخل اسمك الكامل" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-group">
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              placeholder="email@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-group">
            <label>كلمة المرور</label>
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
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">أوافق على <span style={{color: '#d35400'}}>شروط الاستخدام و سياسة الخصوصية</span></label>
          </div>

          <button type="submit" className="auth-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        

        <p className="auth-switch" style={{marginTop: '2rem'}}>لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
      </div>
    </div>
  );
};

export default Register;
