import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';

/**
 * Register Page Component
 */

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach((error) => {
          apiErrors[error.field] = error.message;
        });
        setErrors(apiErrors);
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff'
  };

  const iconStyle = { 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#6366f1'
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
        <h2 className="text-center text-white mb-1">Create Account</h2>
        <p className="text-center text-muted mb-4">Join us today</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-light">Full Name</Form.Label>
            <InputGroup>
              <InputGroup.Text style={iconStyle}>
                <User size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                style={inputStyle}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-light">Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text style={iconStyle}>
                <Mail size={18} />
              </InputGroup.Text>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                style={inputStyle}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={iconStyle}>
                    <Lock size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    style={inputStyle}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={iconStyle}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Confirm Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={iconStyle}>
                    <Lock size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    style={inputStyle}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={iconStyle}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-4">
            <small className="text-muted">
              Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
            </small>
          </div>

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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={18} className="me-2" />
                Create Account
              </>
            )}
          </Button>
        </Form>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          <Link 
            to={ROUTES.LOGIN} 
            className="text-decoration-none"
            style={{ color: '#6366f1' }}
          >
            Sign in
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RegisterPage;

