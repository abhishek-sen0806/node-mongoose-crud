import { Outlet, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Shield } from 'lucide-react';

/**
 * Auth Layout Component
 * Wraps login/register pages with branding
 */

const AuthLayout = () => {
  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
      style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            {/* Logo */}
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <Shield size={48} style={{ color: '#6366f1' }} />
                </div>
                <h1 
                  className="fw-bold mb-1"
                  style={{ 
                    fontSize: '2rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  NodeCRUD
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Production-Grade REST API
                </p>
              </Link>
            </div>

            {/* Auth Form */}
            <Outlet />

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Secured with JWT Authentication & bcrypt
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;

