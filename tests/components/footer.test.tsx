import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer component', () => {
  it('renders semantic footer with application brand, copyright, license, and version', () => {
    render(<Footer />);

    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();

    expect(screen.getByText(/Rekap Siswa & Nilai/i)).toBeInTheDocument();
    expect(screen.getByText(/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/MIT/i)).toBeInTheDocument();
    expect(screen.getByText(/v0\.3\./i)).toBeInTheDocument();
  });

  it('includes mobile clearance classes for BottomNav', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
    // Must contain padding bottom to clear fixed mobile bottom navigation
    expect(footer?.className).toMatch(/pb-2/);
  });
});
