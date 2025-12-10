import { Spinner } from 'react-bootstrap';

/**
 * Loading Spinner Component
 */

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = 'md',
  text = 'Loading...',
  variant = 'primary'
}) => {
  const spinnerSize = size === 'sm' ? 'sm' : undefined;

  if (fullScreen) {
    return (
      <div 
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        <Spinner 
          animation="border" 
          variant="light" 
          style={{ width: '3rem', height: '3rem' }}
        />
        <p className="mt-3 text-light">{text}</p>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <Spinner animation="border" variant={variant} size={spinnerSize} />
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

