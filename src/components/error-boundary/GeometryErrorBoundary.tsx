import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GeometryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service
    console.error('Geometry Error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          className="error-boundary animate-fade-in"
          role="alert"
          aria-live="assertive"
          tabIndex={0}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Sacred Geometry Rendering Error
          </Typography>
          <Typography variant="body1" gutterBottom>
            {this.state.error?.message}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Typography
              variant="body2"
              component="pre"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: '#fff',
                borderRadius: 1,
                overflow: 'auto'
              }}
            >
              {this.state.errorInfo?.componentStack}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Reset Geometry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}