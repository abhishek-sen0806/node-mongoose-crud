import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { User, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

/**
 * User Create/Edit Modal Component
 */

const UserModal = ({ show, onHide, user, mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (show) {
      if (isEdit && user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'user',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
        });
      }
      setErrors({});
    }
  }, [show, user, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isEdit) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        await userService.update(user._id, updateData);
        toast.success('User updated successfully');
      } else {
        await authService.register(formData);
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      }
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
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      contentClassName="border-0"
    >
      <div style={{ 
        background: 'rgba(26, 26, 46, 0.98)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-white">
            {isEdit ? 'Edit User' : 'Create New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Name</Form.Label>
              <InputGroup>
                <InputGroup.Text style={iconStyle}>
                  <User size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter name"
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
              <Form.Label className="text-light">Email</Form.Label>
              <InputGroup>
                <InputGroup.Text style={iconStyle}>
                  <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
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

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            {!isEdit && (
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
                        placeholder="Password"
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
                    <Form.Label className="text-light">Confirm</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={iconStyle}>
                        <Lock size={18} />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        style={inputStyle}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-2" />
                    {isEdit ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default UserModal;

