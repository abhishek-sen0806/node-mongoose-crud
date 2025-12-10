import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';

/**
 * Login Page Component
 */

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className="border-0 shadow-lg"
      style={{ 
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px'
      }}
    >
      <Card.Body className="p-4 p-md-5">
        <h2 className="text-center text-white mb-1">Welcome Back</h2>
        <p className="text-center text-muted mb-4">Sign in to your account</p>

        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-light">Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#6366f1'
                }}
              >
                <Mail size={18} />
              </InputGroup.Text>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control-dark"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff'
                }}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-light">Password</Form.Label>
            <InputGroup>
              <InputGroup.Text 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#6366f1'
                }}
              >
                <Lock size={18} />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff'
                }}
              />
              <Button 
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#6366f1'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 py-2 mb-3"
            disabled={isLoading}
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              fontWeight: '600'
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} className="me-2" />
                Sign In
              </>
            )}
          </Button>
        </Form>

        <div className="text-center">
          <span className="text-muted">Don&apos;t have an account? </span>
          <Link 
            to={ROUTES.REGISTER} 
            className="text-decoration-none"
            style={{ color: '#6366f1' }}
          >
            Create one
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoginPage;

