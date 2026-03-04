import { render, screen } from '@testing-library/react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';

// Mock input-otp module
jest.mock('input-otp', () => {
  const React = require('react');
  const OTPInputContext = React.createContext({
    slots: Array(6).fill(null).map(() => ({ char: '', hasFakeCaret: false, isActive: false })),
  });
  return {
    OTPInput: React.forwardRef(({ children, className, containerClassName, ...props }: any, ref: any) => (
      <div ref={ref} data-slot="input-otp" className={containerClassName} {...props}>
        <div className={className}>{children}</div>
      </div>
    )),
    OTPInputContext,
  };
});

describe('InputOTP', () => {
  it('should render with data-slot', () => {
    render(
      <InputOTP maxLength={6} data-testid="otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    );
    expect(screen.getByTestId('otp')).toHaveAttribute('data-slot', 'input-otp');
  });

  it('should apply containerClassName', () => {
    render(
      <InputOTP maxLength={6} containerClassName="custom-container" data-testid="otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    );
    expect(screen.getByTestId('otp')).toHaveClass('custom-container');
  });
});

describe('InputOTPGroup', () => {
  it('should render with data-slot', () => {
    render(
      <InputOTPGroup data-testid="group">
        <InputOTPSlot index={0} />
      </InputOTPGroup>
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'input-otp-group');
  });
});

describe('InputOTPSlot', () => {
  it('should render with data-slot', () => {
    render(
      <InputOTPGroup>
        <InputOTPSlot index={0} data-testid="slot" />
      </InputOTPGroup>
    );
    expect(screen.getByTestId('slot')).toHaveAttribute('data-slot', 'input-otp-slot');
  });
});

describe('InputOTPSeparator', () => {
  it('should render with separator role', () => {
    render(<InputOTPSeparator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('should have data-slot', () => {
    render(<InputOTPSeparator />);
    expect(screen.getByRole('separator')).toHaveAttribute('data-slot', 'input-otp-separator');
  });
});
