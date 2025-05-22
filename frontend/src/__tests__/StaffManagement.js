import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaffManagement from '../pages/StaffManagement';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

jest.mock('axios');

const renderWithProviders = (component) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <BrowserRouter>{component}</BrowserRouter>
        </ThemeProvider>
    );
};

describe('StaffManagement', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: [] });
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the staff management page', async () => {
        renderWithProviders(<StaffManagement />);
        expect(await screen.findByText(/Staff Management/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add New Staff/i })).toBeInTheDocument();
    });

    it('opens dialog when Add New Staff is clicked', async () => {
        renderWithProviders(<StaffManagement />);
        const button = screen.getByRole('button', { name: /Add New Staff/i });
        fireEvent.click(button);
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
});
