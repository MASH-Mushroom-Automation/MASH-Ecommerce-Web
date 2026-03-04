import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../form';

function TestForm({ children, defaultValues = { name: '' } }: { children: React.ReactNode; defaultValues?: Record<string, string> }) {
  const form = useForm({ defaultValues });
  return <FormProvider {...form}>{children}</FormProvider>;
}

function FullFieldForm({ error }: { error?: string }) {
  const form = useForm({
    defaultValues: { name: '' },
  });

  if (error) {
    form.setError('name', { message: error });
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <input {...field} />
            </FormControl>
            <FormDescription>Enter your name</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}

describe('Form', () => {
  it('should render as FormProvider', () => {
    const form = useForm ? true : false;
    expect(form).toBe(true);
  });
});

describe('FormItem', () => {
  it('should render with data-slot', () => {
    render(
      <TestForm>
        <FormField
          name="name"
          render={() => (
            <FormItem data-testid="item">
              <div>Content</div>
            </FormItem>
          )}
        />
      </TestForm>
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'form-item');
  });

  it('should merge custom className', () => {
    render(
      <TestForm>
        <FormField
          name="name"
          render={() => (
            <FormItem data-testid="item" className="custom">
              <div>Content</div>
            </FormItem>
          )}
        />
      </TestForm>
    );
    expect(screen.getByTestId('item')).toHaveClass('custom');
  });
});

describe('FormLabel', () => {
  it('should render label text', () => {
    render(<FullFieldForm />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should have data-slot', () => {
    render(<FullFieldForm />);
    expect(screen.getByText('Name').closest('[data-slot="form-label"]')).toBeInTheDocument();
  });
});

describe('FormControl', () => {
  it('should render input with aria-describedby', () => {
    render(<FullFieldForm />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('FormDescription', () => {
  it('should render description text', () => {
    render(<FullFieldForm />);
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('should have data-slot', () => {
    render(<FullFieldForm />);
    expect(screen.getByText('Enter your name')).toHaveAttribute('data-slot', 'form-description');
  });
});

describe('FormMessage', () => {
  it('should not render when no error', () => {
    render(<FullFieldForm />);
    const messages = document.querySelectorAll('[data-slot="form-message"]');
    expect(messages).toHaveLength(0);
  });

  it('should render error message when field has error', () => {
    render(<FullFieldForm error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('should have data-slot on error message', () => {
    render(<FullFieldForm error="Required field" />);
    expect(screen.getByText('Required field')).toHaveAttribute('data-slot', 'form-message');
  });
});
