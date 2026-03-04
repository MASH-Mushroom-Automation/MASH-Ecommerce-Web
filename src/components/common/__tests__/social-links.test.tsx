import { render, screen } from '@testing-library/react';
import { SocialLinks } from '../social-links';

jest.mock('lucide-react', () => ({
  Facebook: (p: any) => <span data-testid="icon-facebook" {...p}>FB</span>,
  Youtube: (p: any) => <span data-testid="icon-youtube" {...p}>YT</span>,
  Instagram: (p: any) => <span data-testid="icon-instagram" {...p}>IG</span>,
  Twitter: (p: any) => <span data-testid="icon-twitter" {...p}>TW</span>,
  Linkedin: (p: any) => <span data-testid="icon-linkedin" {...p}>LI</span>,
  Mail: (p: any) => <span data-testid="icon-mail" {...p}>ML</span>,
}));
jest.mock('@/components/ui/tiktok-icon', () => ({ TikTokIcon: (p: any) => <span data-testid="icon-tiktok" {...p}>TT</span> }));
jest.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

const fullSocial = {
  facebook: 'https://facebook.com/mash',
  youtube: 'https://youtube.com/mash',
  instagram: 'https://instagram.com/mash',
  twitter: 'https://twitter.com/mash',
  linkedin: 'https://linkedin.com/mash',
  tiktok: 'https://tiktok.com/@mash',
};

describe('SocialLinks', () => {
  it('returns null when socialMedia is undefined', () => {
    const { container } = render(<SocialLinks variant="header" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all platform icons for header variant', () => {
    render(<SocialLinks socialMedia={fullSocial} variant="header" />);
    expect(screen.getByTestId('icon-facebook')).toBeInTheDocument();
    expect(screen.getByTestId('icon-youtube')).toBeInTheDocument();
    expect(screen.getByTestId('icon-instagram')).toBeInTheDocument();
    expect(screen.getByTestId('icon-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('icon-linkedin')).toBeInTheDocument();
    expect(screen.getByTestId('icon-tiktok')).toBeInTheDocument();
  });

  it('skips platforms without URLs', () => {
    render(<SocialLinks socialMedia={{ facebook: 'https://fb.com' }} variant="header" />);
    expect(screen.getByTestId('icon-facebook')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-youtube')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-tiktok')).not.toBeInTheDocument();
  });

  it('renders TikTokIcon for tiktok platform', () => {
    render(<SocialLinks socialMedia={{ tiktok: 'https://tiktok.com/@mash' }} variant="header" />);
    expect(screen.getByTestId('icon-tiktok')).toBeInTheDocument();
  });

  it('renders generic Icon for non-tiktok platforms', () => {
    render(<SocialLinks socialMedia={{ facebook: 'https://fb.com' }} variant="header" />);
    expect(screen.getByTestId('icon-facebook')).toBeInTheDocument();
  });

  it('shows email link in footer variant when contactEmail provided', () => {
    render(<SocialLinks socialMedia={fullSocial} contactEmail="hi@mash.ph" variant="footer" />);
    expect(screen.getByTestId('icon-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('href', 'mailto:hi@mash.ph');
  });

  it('does not show email link in header variant', () => {
    render(<SocialLinks socialMedia={fullSocial} contactEmail="hi@mash.ph" variant="header" />);
    expect(screen.queryByTestId('icon-mail')).not.toBeInTheDocument();
  });

  it('does not show email link in footer without contactEmail', () => {
    render(<SocialLinks socialMedia={fullSocial} variant="footer" />);
    expect(screen.queryByTestId('icon-mail')).not.toBeInTheDocument();
  });

  it('wraps content in Follow Us section for mobile variant', () => {
    render(<SocialLinks socialMedia={fullSocial} variant="mobile" />);
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
  });

  it('does not show Follow Us for header variant', () => {
    render(<SocialLinks socialMedia={fullSocial} variant="header" />);
    expect(screen.queryByText('Follow Us')).not.toBeInTheDocument();
  });

  it('does not show Follow Us for footer variant', () => {
    render(<SocialLinks socialMedia={fullSocial} variant="footer" />);
    expect(screen.queryByText('Follow Us')).not.toBeInTheDocument();
  });

  it('sets target=_blank on social links', () => {
    render(<SocialLinks socialMedia={{ facebook: 'https://fb.com' }} variant="header" />);
    const link = screen.getByLabelText('Facebook');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies custom className', () => {
    const { container } = render(<SocialLinks socialMedia={fullSocial} variant="header" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
