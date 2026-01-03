import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
