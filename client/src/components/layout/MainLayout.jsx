import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';

/**
 * Main Layout Component
 * Wraps authenticated pages with navbar and container
 */

const MainLayout = () => {
  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh'
      }}
    >
      <Navbar />
      <Container fluid className="flex-grow-1 py-4 px-4">
        <Outlet />
      </Container>
      <footer 
        className="text-center py-3 text-muted"
        style={{ 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.85rem'
        }}
      >
        <small>© {new Date().getFullYear()} NodeCRUD API. Built with ❤️ using React & Bootstrap</small>
      </footer>
    </div>
  );
};

export default MainLayout;

