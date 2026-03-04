/**
 * Tests for InputGroup components
 * Covers: InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from '../input-group';

describe('InputGroup', () => {
  it('should render with role group', () => {
    render(<InputGroup data-testid="ig">Content</InputGroup>);
    expect(screen.getByTestId('ig')).toHaveAttribute('role', 'group');
  });

  it('should have data-slot attribute', () => {
    render(<InputGroup data-testid="ig">Content</InputGroup>);
    expect(screen.getByTestId('ig')).toHaveAttribute('data-slot', 'input-group');
  });

  it('should merge custom className', () => {
    render(<InputGroup data-testid="ig" className="custom-class">Content</InputGroup>);
    expect(screen.getByTestId('ig').classList.toString()).toContain('custom-class');
  });
});

describe('InputGroupAddon', () => {
  it('should render with default inline-start alignment', () => {
    render(<InputGroupAddon data-testid="addon">$</InputGroupAddon>);
    expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'inline-start');
  });

  it('should render with inline-end alignment', () => {
    render(<InputGroupAddon data-testid="addon" align="inline-end">.00</InputGroupAddon>);
    expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'inline-end');
  });

  it('should render with block-start alignment', () => {
    render(<InputGroupAddon data-testid="addon" align="block-start">Label</InputGroupAddon>);
    expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'block-start');
  });

  it('should render with block-end alignment', () => {
    render(<InputGroupAddon data-testid="addon" align="block-end">Footer</InputGroupAddon>);
    expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'block-end');
  });

  it('should focus sibling input on click', () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon">$</InputGroupAddon>
        <InputGroupInput data-testid="input" />
      </InputGroup>
    );
    const input = screen.getByTestId('input');
    const focusSpy = jest.spyOn(input, 'focus');
    fireEvent.click(screen.getByTestId('addon'));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should not focus input when button inside addon is clicked', () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon">
          <button data-testid="inner-btn">Toggle</button>
        </InputGroupAddon>
        <InputGroupInput data-testid="input" />
      </InputGroup>
    );
    const input = screen.getByTestId('input');
    const focusSpy = jest.spyOn(input, 'focus');
    fireEvent.click(screen.getByTestId('inner-btn'));
    expect(focusSpy).not.toHaveBeenCalled();
  });
});

describe('InputGroupButton', () => {
  it('should render button with default xs size', () => {
    render(<InputGroupButton>Click</InputGroupButton>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('should render with sm size', () => {
    render(<InputGroupButton size="sm">Click</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');
  });

  it('should render with icon-xs size', () => {
    render(<InputGroupButton size="icon-xs">X</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon-xs');
  });

  it('should render with icon-sm size', () => {
    render(<InputGroupButton size="icon-sm">+</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon-sm');
  });

  it('should default to type button', () => {
    render(<InputGroupButton>Click</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});

describe('InputGroupText', () => {
  it('should render text content', () => {
    render(<InputGroupText>per month</InputGroupText>);
    expect(screen.getByText('per month')).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<InputGroupText className="font-bold">test</InputGroupText>);
    expect((container.firstChild as HTMLElement).classList.toString()).toContain('font-bold');
  });
});

describe('InputGroupInput', () => {
  it('should render input with data-slot', () => {
    render(<InputGroupInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input-group-control');
  });

  it('should merge custom className', () => {
    render(<InputGroupInput data-testid="input" className="text-right" />);
    expect(screen.getByTestId('input').classList.toString()).toContain('text-right');
  });
});

describe('InputGroupTextarea', () => {
  it('should render textarea with data-slot', () => {
    render(<InputGroupTextarea data-testid="ta" />);
    expect(screen.getByTestId('ta')).toHaveAttribute('data-slot', 'input-group-control');
  });
});
