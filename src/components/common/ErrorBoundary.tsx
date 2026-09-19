import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  isComponentLevel?: boolean;
}

export interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const randomId = `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return { hasError: true, error, errorId: randomId };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.isComponentLevel) {
        return (
          <div className="my-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-slate-800 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {this.props.fallbackTitle || 'Component Render Error'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This widget encountered an unexpected error and failed to render safely.
                </p>
              </div>
            </div>
            {this.state.error && (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-rose-100/70 p-2.5 text-[11px] font-mono text-rose-900 dark:bg-rose-950 dark:text-rose-300">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Widget
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex min-h-[450px] w-full flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner dark:bg-amber-950/60 dark:text-amber-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            ⚠️ Something went wrong
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-600 dark:text-slate-400">
            The page encountered an unexpected error. Don't worry, the rest of the application remains protected.
          </p>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Error ID: <span className="font-bold text-slate-700 dark:text-slate-300">{this.state.errorId}</span>
          </div>

          {this.state.error && (
            <div className="mt-4 max-w-xl text-left w-full">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] font-mono text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 overflow-x-auto max-h-40">
                <div className="font-bold">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.errorInfo?.componentStack && (
                  <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
