import { useState, useEffect } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { 
  Users, 
  Shield, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  Server,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Dashboard Page Component
 */

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch health status
        const healthResponse = await api.get('/health');
        setHealth(healthResponse.data.data);

        // Fetch user stats if admin
        if (isAdmin) {
          const usersResponse = await userService.getAll({ limit: 1 });
          setStats({
            totalUsers: usersResponse.meta?.pagination?.totalItems || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const cardStyle = {
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted mb-0">
          Here&apos;s what&apos;s happening with your API today.
        </p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {isAdmin && (
          <Col sm={6} lg={3}>
            <Card style={cardStyle} className="h-100">
              <Card.Body className="d-flex align-items-center">
                <div 
                  className="rounded-circle p-3 me-3"
                  style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                >
                  <Users size={24} style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <h3 className="text-white mb-0">{stats?.totalUsers || 0}</h3>
                  <small className="text-muted">Total Users</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        <Col sm={6} lg={3}>
          <Card style={cardStyle} className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="rounded-circle p-3 me-3"
                style={{ background: 'rgba(16, 185, 129, 0.2)' }}
              >
                <Activity size={24} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h3 className="text-white mb-0">
                  <Badge bg="success">Online</Badge>
                </h3>
                <small className="text-muted">API Status</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card style={cardStyle} className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="rounded-circle p-3 me-3"
                style={{ background: 'rgba(245, 158, 11, 0.2)' }}
              >
                <Clock size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-white mb-0">
                  {health?.uptime ? formatUptime(health.uptime) : 'N/A'}
                </h3>
                <small className="text-muted">Uptime</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card style={cardStyle} className="h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="rounded-circle p-3 me-3"
                style={{ background: 'rgba(139, 92, 246, 0.2)' }}
              >
                <Shield size={24} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <h3 className="text-white mb-0 text-capitalize">{user?.role}</h3>
                <small className="text-muted">Your Role</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Health & Info */}
      <Row className="g-4">
        <Col lg={6}>
          <Card style={cardStyle}>
            <Card.Header 
              className="bg-transparent border-0 pt-4 px-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05) !important' }}
            >
              <h5 className="text-white mb-0">
                <Server size={20} className="me-2" style={{ color: '#6366f1' }} />
                System Health
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3" 
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted">Database</span>
                <Badge bg={health?.services?.database === 'connected' ? 'success' : 'danger'}>
                  <CheckCircle size={14} className="me-1" />
                  {health?.services?.database || 'Unknown'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted">Cache</span>
                <Badge bg={health?.services?.cache === 'connected' ? 'success' : 'secondary'}>
                  {health?.services?.cache || 'Not configured'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted">Environment</span>
                <Badge bg="info">{health?.environment || 'development'}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">API Version</span>
                <Badge bg="primary">{health?.version || '1.0.0'}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card style={cardStyle}>
            <Card.Header 
              className="bg-transparent border-0 pt-4 px-4"
            >
              <h5 className="text-white mb-0">
                <Database size={20} className="me-2" style={{ color: '#6366f1' }} />
                Memory Usage
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted">Heap Used</span>
                <span className="text-white">{health?.memory?.heapUsed || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted">Heap Total</span>
                <span className="text-white">{health?.memory?.heapTotal || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">RSS</span>
                <span className="text-white">{health?.memory?.rss || 'N/A'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-4 mt-2">
        <Col lg={12}>
          <Card style={cardStyle}>
            <Card.Header className="bg-transparent border-0 pt-4 px-4">
              <h5 className="text-white mb-0">
                <TrendingUp size={20} className="me-2" style={{ color: '#6366f1' }} />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <Row className="g-3">
                <Col sm={6} md={3}>
                  <Card 
                    as="a"
                    href="/profile"
                    className="text-decoration-none h-100"
                    style={{ 
                      ...cardStyle, 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body className="text-center py-4">
                      <Users size={32} style={{ color: '#6366f1' }} className="mb-2" />
                      <p className="text-white mb-0">View Profile</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card 
                    as="a"
                    href="/settings"
                    className="text-decoration-none h-100"
                    style={{ 
                      ...cardStyle, 
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body className="text-center py-4">
                      <Shield size={32} style={{ color: '#10b981' }} className="mb-2" />
                      <p className="text-white mb-0">Security Settings</p>
                    </Card.Body>
                  </Card>
                </Col>
                {isAdmin && (
                  <>
                    <Col sm={6} md={3}>
                      <Card 
                        as="a"
                        href="/users"
                        className="text-decoration-none h-100"
                        style={{ 
                          ...cardStyle, 
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="text-center py-4">
                          <Users size={32} style={{ color: '#f59e0b' }} className="mb-2" />
                          <p className="text-white mb-0">Manage Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} md={3}>
                      <Card 
                        as="a"
                        href="http://localhost:3000/api-docs"
                        target="_blank"
                        className="text-decoration-none h-100"
                        style={{ 
                          ...cardStyle, 
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="text-center py-4">
                          <Activity size={32} style={{ color: '#8b5cf6' }} className="mb-2" />
                          <p className="text-white mb-0">API Docs</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

