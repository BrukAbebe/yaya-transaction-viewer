
import React, { Component, ReactNode } from 'react';

   interface ErrorBoundaryProps {
     children: ReactNode;
   }

   interface ErrorBoundaryState {
     hasError: boolean;
     error: Error | null;
   }

   class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
     state: ErrorBoundaryState = {
       hasError: false,
       error: null,
     };

     static getDerivedStateFromError(error: Error): ErrorBoundaryState {
       return { hasError: true, error };
     }

     render() {
       if (this.state.hasError) {
         return (
           <div className="text-red-500 text-center p-4 rounded-lg bg-red-50">
             <h2 className="text-xl font-semibold">Something went wrong</h2>
             <p>{this.state.error?.message}</p>
           </div>
         );
       }
       return this.props.children;
     }
   }

   export default ErrorBoundary;
