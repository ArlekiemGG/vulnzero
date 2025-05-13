
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
  reloadCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: '',
    reloadCount: 0
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: error.message,
      reloadCount: 0 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || error.message
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: '',
      reloadCount: prevState.reloadCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-black/5 rounded-lg border border-red-800/30">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-red-500">Algo ha salido mal</h2>
          <div className="bg-black/20 p-3 rounded text-sm text-gray-300 font-mono mb-4 max-w-full overflow-auto">
            <p className="mb-1 text-red-400">Error: {this.state.error?.message || 'Unknown error'}</p>
            {this.state.errorInfo && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-200">
                  Mostrar detalles técnicos
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-cybersec-electricblue text-cybersec-electricblue"
              onClick={this.handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Intentar de nuevo
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    // If no error occurred, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
