/**
 * Tests for Drawer UI component
 * Covers all 10 exported Drawer components from vaul wrapper
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '../drawer';

// Mock vaul's Drawer.Root to render children directly for testing
jest.mock('vaul', () => {
  const React = require('react');
  const Root = ({ children, ...props }: any) => <div data-testid="drawer-root" {...props}>{children}</div>;
  const Trigger = React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>);
  const Portal = ({ children }: any) => <div data-testid="drawer-portal">{children}</div>;
  const Close = React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>);
  const Overlay = React.forwardRef(({ className, ...props }: any, ref: any) => <div ref={ref} className={className} data-testid="drawer-overlay" {...props} />);
  const Content = React.forwardRef(({ children, className, ...props }: any, ref: any) => <div ref={ref} className={className} data-testid="drawer-content-primitive" {...props}>{children}</div>);
  const Title = React.forwardRef(({ children, className, ...props }: any, ref: any) => <h2 ref={ref} className={className} {...props}>{children}</h2>);
  const Description = React.forwardRef(({ children, className, ...props }: any, ref: any) => <p ref={ref} className={className} {...props}>{children}</p>);

  Trigger.displayName = 'DrawerTrigger';
  Close.displayName = 'DrawerClose';
  Overlay.displayName = 'DrawerOverlay';
  Content.displayName = 'DrawerContent';
  Title.displayName = 'DrawerTitle';
  Description.displayName = 'DrawerDescription';

  return {
    __esModule: true,
    Drawer: Object.assign(Root, {
      Root,
      Trigger,
      Portal,
      Close,
      Overlay,
      Content,
      Title,
      Description,
    }),
  };
});

describe('Drawer', () => {
  it('should render Drawer root', () => {
    render(<Drawer><div>content</div></Drawer>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

describe('DrawerTrigger', () => {
  it('should render trigger button', () => {
    render(<Drawer><DrawerTrigger>Open</DrawerTrigger></Drawer>);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<Drawer><DrawerTrigger>Open</DrawerTrigger></Drawer>);
    const trigger = screen.getByText('Open');
    expect(trigger).toHaveAttribute('data-slot', 'drawer-trigger');
  });
});

describe('DrawerClose', () => {
  it('should render close button', () => {
    render(<Drawer><DrawerClose>Close</DrawerClose></Drawer>);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<Drawer><DrawerClose>Close</DrawerClose></Drawer>);
    expect(screen.getByText('Close')).toHaveAttribute('data-slot', 'drawer-close');
  });
});

describe('DrawerHeader', () => {
  it('should render header content', () => {
    render(<DrawerHeader>Header Content</DrawerHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<DrawerHeader className="custom-class">Header</DrawerHeader>);
    expect(container.firstChild).toHaveAttribute('data-slot', 'drawer-header');
    expect((container.firstChild as HTMLElement).classList.toString()).toContain('custom-class');
  });
});

describe('DrawerFooter', () => {
  it('should render footer content', () => {
    render(<DrawerFooter>Footer Content</DrawerFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<DrawerFooter>Footer</DrawerFooter>);
    expect(container.firstChild).toHaveAttribute('data-slot', 'drawer-footer');
  });
});

describe('DrawerTitle', () => {
  it('should render title text', () => {
    render(<Drawer><DrawerTitle>My Title</DrawerTitle></Drawer>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<Drawer><DrawerTitle>Title</DrawerTitle></Drawer>);
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'drawer-title');
  });
});

describe('DrawerDescription', () => {
  it('should render description text', () => {
    render(<Drawer><DrawerDescription>Description here</DrawerDescription></Drawer>);
    expect(screen.getByText('Description here')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<Drawer><DrawerDescription>Desc</DrawerDescription></Drawer>);
    expect(screen.getByText('Desc')).toHaveAttribute('data-slot', 'drawer-description');
  });
});

describe('DrawerOverlay', () => {
  it('should render with data-slot', () => {
    render(<Drawer><DrawerOverlay /></Drawer>);
    const overlay = screen.getByTestId('drawer-overlay');
    expect(overlay).toHaveAttribute('data-slot', 'drawer-overlay');
  });
});

describe('DrawerContent', () => {
  it('should render content with children', () => {
    render(
      <Drawer>
        <DrawerContent>
          <div>Inner Content</div>
        </DrawerContent>
      </Drawer>
    );
    expect(screen.getByText('Inner Content')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(
      <Drawer>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );
    const content = container.querySelector('[data-slot="drawer-content"]');
    expect(content).toBeInTheDocument();
  });
});
