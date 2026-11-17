import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLogin from '../pages/AdminLogin';

describe('AdminLogin Component', () => {
    it('renders login form with inputs and submit button', () => {
        render(<AdminLogin onLoginSuccess={vi.fn()} />);

        expect(screen.getByRole('heading', { name: /admin portal/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/admin or admin@giakaa.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in to dashboard/i })).toBeInTheDocument();
    });

    it('toggles password visibility when eye icon button is clicked', () => {
        render(<AdminLogin onLoginSuccess={vi.fn()} />);

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleBtn = screen.getByLabelText(/show password/i);
        fireEvent.click(toggleBtn);

        expect(passwordInput).toHaveAttribute('type', 'text');

        const hideBtn = screen.getByLabelText(/hide password/i);
        fireEvent.click(hideBtn);

        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('displays client validation alert when submission is incomplete', async () => {
        render(<AdminLogin onLoginSuccess={vi.fn()} />);

        // Fill username but leave password empty, then trigger form submit
        const usernameInput = screen.getByPlaceholderText(/admin or admin@giakaa.com/i);
        fireEvent.change(usernameInput, { target: { value: 'admin' } });

        const form = usernameInput.closest('form');
        fireEvent.submit(form);

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(/Please enter both your username\/email and password/i);
    });
});
