import { render, screen } from '@testing-library/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../resizable';

// Mock react-resizable-panels
jest.mock('react-resizable-panels', () => {
  const React = require('react');
  return {
    PanelGroup: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
      <div ref={ref} className={className} data-panel-group {...props}>{children}</div>
    )),
    Panel: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    PanelResizeHandle: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
      <div ref={ref} className={className} {...props}>{children}</div>
    )),
  };
});

describe('ResizablePanelGroup', () => {
  it('should render with data-slot', () => {
    render(
      <ResizablePanelGroup direction="horizontal" data-testid="group">
        <ResizablePanel>Panel 1</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'resizable-panel-group');
  });

  it('should merge custom className', () => {
    render(
      <ResizablePanelGroup direction="horizontal" data-testid="group" className="custom">
        <ResizablePanel>Panel 1</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(screen.getByTestId('group')).toHaveClass('custom');
  });
});

describe('ResizablePanel', () => {
  it('should render with data-slot', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel data-testid="panel">Content</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(screen.getByTestId('panel')).toHaveAttribute('data-slot', 'resizable-panel');
  });
});

describe('ResizableHandle', () => {
  it('should render without handle by default', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle data-testid="handle" />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    expect(screen.getByTestId('handle')).toHaveAttribute('data-slot', 'resizable-handle');
  });

  it('should render grip icon when withHandle is true', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle data-testid="handle" />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    );
    const handle = screen.getByTestId('handle');
    expect(handle.querySelector('svg')).toBeInTheDocument();
  });
});
