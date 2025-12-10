import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Navbar as BsNavbar, 
  Container, 
  Nav, 
  NavDropdown, 
  Badge,
  Image
} from 'react-bootstrap';
import { 
  User, 
  LogOut, 
  Settings, 
  Users, 
  LayoutDashboard,
  Shield,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';

/**
 * Navigation Bar Component
 */

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      default: return 'info';
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:3000${user.avatar}`;
    }
    return null;
  };

  return (
    <BsNavbar 
      expand="lg" 
      expanded={expanded}
      className="navbar-dark shadow-sm"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Container fluid className="px-4">
        <BsNavbar.Brand 
          as={Link} 
          to={ROUTES.DASHBOARD}
          className="d-flex align-items-center fw-bold"
          style={{ fontSize: '1.25rem' }}
        >
          <Shield className="me-2" size={28} style={{ color: '#6366f1' }} />
          <span style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NodeCRUD
          </span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle 
          aria-controls="navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        >
          <Menu size={24} />
        </BsNavbar.Toggle>

        <BsNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to={ROUTES.DASHBOARD}
              className={`d-flex align-items-center mx-1 ${isActive(ROUTES.DASHBOARD) ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <LayoutDashboard size={18} className="me-1" />
              Dashboard
            </Nav.Link>

            {isAdmin && (
              <Nav.Link 
                as={Link} 
                to={ROUTES.USERS}
                className={`d-flex align-items-center mx-1 ${isActive(ROUTES.USERS) ? 'active' : ''}`}
                onClick={() => setExpanded(false)}
              >
                <Users size={18} className="me-1" />
                Users
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            <NavDropdown
              align="end"
              title={
                <span className="d-flex align-items-center">
                  {getAvatarUrl() ? (
                    <Image 
                      src={getAvatarUrl()} 
                      roundedCircle 
                      width={32} 
                      height={32}
                      className="me-2"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ 
                        width: 32, 
                        height: 32, 
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                  <span className="d-none d-lg-inline">
                    {user?.name || 'User'}
                  </span>
                  <Badge 
                    bg={getRoleBadgeVariant(user?.role)} 
                    className="ms-2 text-uppercase"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {user?.role}
                  </Badge>
                </span>
              }
              id="user-dropdown"
              className="nav-dropdown-custom"
            >
              <NavDropdown.Item 
                as={Link} 
                to={ROUTES.PROFILE}
                onClick={() => setExpanded(false)}
              >
                <User size={16} className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item 
                as={Link} 
                to={ROUTES.SETTINGS}
                onClick={() => setExpanded(false)}
              >
                <Settings size={16} className="me-2" />
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;

