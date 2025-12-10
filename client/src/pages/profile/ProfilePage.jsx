import { useState, useRef } from 'react';
import { Card, Row, Col, Form, Button, Image, Badge, InputGroup } from 'react-bootstrap';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Camera, 
  Save,
  Edit,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';
import toast from 'react-hot-toast';

/**
 * Profile Page Component
 */

const ProfilePage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.update(user._id, formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateAvatar(user._id, file);
      await refreshUser();
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:3000${user.avatar}`;
    }
    return null;
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      default: return 'info';
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
        <User size={32} className="me-2" style={{ color: '#6366f1' }} />
        My Profile
      </h1>

      <Row className="g-4">
        {/* Profile Card */}
        <Col lg={4}>
          <Card style={cardStyle} className="text-center">
            <Card.Body className="py-5">
              {/* Avatar */}
              <div className="position-relative d-inline-block mb-4">
                {getAvatarUrl() ? (
                  <Image 
                    src={getAvatarUrl()} 
                    roundedCircle 
                    width={120} 
                    height={120}
                    style={{ objectFit: 'cover', border: '4px solid rgba(99, 102, 241, 0.3)' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: 120, 
                      height: 120, 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      border: '4px solid rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Camera Button */}
                <Button
                  variant="primary"
                  size="sm"
                  className="position-absolute rounded-circle p-2"
                  style={{ 
                    bottom: 0, 
                    right: 0,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera size={16} />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <h4 className="text-white mb-1">{user?.name}</h4>
              <p className="text-muted mb-3">{user?.email}</p>
              
              <Badge 
                bg={getRoleBadgeVariant(user?.role)} 
                className="text-uppercase px-3 py-2"
              >
                {user?.role}
              </Badge>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="d-flex align-items-center justify-content-center text-muted">
                  <Calendar size={16} className="me-2" />
                  <small>
                    Joined {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col lg={8}>
          <Card style={cardStyle}>
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center px-4 pt-4">
              <h5 className="text-white mb-0">
                <Shield size={20} className="me-2" style={{ color: '#6366f1' }} />
                Profile Information
              </h5>
              {!isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={16} className="me-1" />
                  Edit
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-light">Full Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <User size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={inputStyle}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-light">Email Address</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <Mail size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={inputStyle}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-light">Role</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <Shield size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          disabled
                          style={inputStyle}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Contact admin to change role
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-light">Account Status</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}>
                          <Shield size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={user?.isActive ? 'Active' : 'Inactive'}
                          disabled
                          style={inputStyle}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X size={18} className="me-1" />
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
                          <Save size={18} className="me-1" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;

