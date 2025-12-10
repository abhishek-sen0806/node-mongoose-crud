import { useState } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Lock, Eye, EyeOff, Settings, Shield, Save, CheckCircle } from 'lucide-react';
import authService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Settings Page Component
 */

const SettingsPage = () => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.changePassword(formData);
      setSuccess(true);
      toast.success('Password changed successfully! Please login again.');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      // Logout after a short delay
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle = {
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
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
    <div>
      <h1 className="text-white mb-4">
        <Settings size={32} className="me-2" style={{ color: '#6366f1' }} />
        Settings
      </h1>

      <Row className="g-4">
        {/* Password Change */}
        <Col lg={8}>
          <Card style={cardStyle}>
            <Card.Header className="bg-transparent border-0 px-4 pt-4">
              <h5 className="text-white mb-0">
                <Shield size={20} className="me-2" style={{ color: '#6366f1' }} />
                Change Password
              </h5>
              <p className="text-muted mb-0 mt-1">
                Ensure your account is using a secure password
              </p>
            </Card.Header>
            <Card.Body className="p-4">
              {success && (
                <Alert variant="success" className="d-flex align-items-center">
                  <CheckCircle size={20} className="me-2" />
                  Password changed successfully! Redirecting to login...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Current Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={iconStyle}>
                      <Lock size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.currentPassword}
                      style={inputStyle}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={iconStyle}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.currentPassword}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">New Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <Lock size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          isInvalid={!!errors.newPassword}
                          style={inputStyle}
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={iconStyle}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.newPassword}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Confirm New Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <Lock size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmNewPassword"
                          placeholder="Confirm new password"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          isInvalid={!!errors.confirmNewPassword}
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
                          {errors.confirmNewPassword}
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
                  disabled={isLoading}
                  style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="me-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Security Tips */}
        <Col lg={4}>
          <Card style={cardStyle}>
            <Card.Header className="bg-transparent border-0 px-4 pt-4">
              <h5 className="text-white mb-0">
                <Shield size={20} className="me-2" style={{ color: '#10b981' }} />
                Security Tips
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <ul className="list-unstyled mb-0">
                <li className="d-flex mb-3">
                  <CheckCircle size={18} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Use a unique password for each account</span>
                </li>
                <li className="d-flex mb-3">
                  <CheckCircle size={18} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Avoid using personal information</span>
                </li>
                <li className="d-flex mb-3">
                  <CheckCircle size={18} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Change your password regularly</span>
                </li>
                <li className="d-flex mb-3">
                  <CheckCircle size={18} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Never share your password</span>
                </li>
                <li className="d-flex">
                  <CheckCircle size={18} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Use a password manager</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;

