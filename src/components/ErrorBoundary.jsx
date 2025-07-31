import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to monitoring service (Sentry, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
                disabled={this.state.retryCount >= 3}
              >
                {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </button>
              
              <button 
                onClick={this.handleReload}
                className="reload-button"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-help">
              <p>If this problem persists, please:</p>
              <ul>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-container {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 500px;
              margin: 1rem;
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }

            h1 {
              color: #1f2937;
              margin-bottom: 1rem;
              font-size: 1.5rem;
              font-weight: 600;
            }

            p {
              color: #6b7280;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
            }

            .retry-button, .reload-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .retry-button {
              background: #3b82f6;
              color: white;
            }

            .retry-button:hover:not(:disabled) {
              background: #2563eb;
            }

            .retry-button:disabled {
              background: #9ca3af;
              cursor: not-allowed;
            }

            .reload-button {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .reload-button:hover {
              background: #e5e7eb;
            }

            .error-details {
              margin-top: 2rem;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #6b7280;
              font-weight: 500;
              margin-bottom: 1rem;
            }

            .error-stack {
              background: #f9fafb;
              padding: 1rem;
              border-radius: 6px;
              font-size: 0.875rem;
              color: #374151;
              overflow-x: auto;
              white-space: pre-wrap;
              border: 1px solid #e5e7eb;
            }

            .error-help {
              margin-top: 2rem;
              padding-top: 2rem;
              border-top: 1px solid #e5e7eb;
            }

            .error-help p {
              margin-bottom: 1rem;
              font-weight: 500;
              color: #374151;
            }

            .error-help ul {
              text-align: left;
              color: #6b7280;
              line-height: 1.6;
            }

            .error-help li {
              margin-bottom: 0.5rem;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 