import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

const renderWithProviders = (ui) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <MemoryRouter>{ui}</MemoryRouter>
        </ThemeProvider>
    );
};

describe('LoginPage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form', () => {
        renderWithProviders(<LoginPage />);
        expect(screen.getByText(/restaurant management system/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('submits and navigates for ROLE_ADMIN', async () => {
        axios.post.mockResolvedValueOnce({
            data: { token: 'admin-token', role: 'ROLE_ADMIN' }
        });

        const mockNavigate = jest.fn();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate,
        }));

        renderWithProviders(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '1234' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/login'),
                { username: 'admin', password: '1234' }
            );

            expect(localStorage.getItem('token')).toBe('admin-token');
            expect(localStorage.getItem('userRole')).toBe('ROLE_ADMIN');
        });
    });

    it('shows error on failed login', async () => {
        axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

        renderWithProviders(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        const errorAlert = await screen.findByText(/invalid username or password/i);
        expect(errorAlert).toBeInTheDocument();
    });
});
