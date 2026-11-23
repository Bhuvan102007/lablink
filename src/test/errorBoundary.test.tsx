import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const FaultyChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulated runtime component exception');
  }
  return <div>Healthy Child Component</div>;
};

describe('ErrorBoundary Component Resilience Suite', () => {
  it('renders child components cleanly when no error occurs', () => {
    render(
      <ErrorBoundary>
        <FaultyChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Child Component')).toBeDefined();
  });

  it('catches runtime exceptions and displays accessible fallback UI', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <FaultyChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Recovery')).toBeDefined();
    expect(screen.getByText('Reload Application')).toBeDefined();

    consoleErrorSpy.mockRestore();
  });
});
