import React from 'react';
import {render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminPage from '../pages/AdminPage';
import axios from 'axios';


jest.mock('../pages/MenuManagement', () => () => <div><h1>Menu Management</h1></div>);
jest.mock('../pages/StaffManagement', () => () => <div><h1>Staff Management</h1></div>);

// Axios mock
jest.mock('axios');

const renderWithProviders = (ui) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </ThemeProvider>
    );
};

describe('AdminPage', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: [] });
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the AdminPage with tabs', async () => {
        renderWithProviders(<AdminPage />);
        expect(await screen.findByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /tables/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /menu management/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /staff management/i })).toBeInTheDocument();
    });

    it('loads tables when Tables tab is active', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                { id: 1, tableNumber: 10, active: true },
                { id: 2, tableNumber: 20, active: false }
            ]
        });

        renderWithProviders(<AdminPage />);

        await waitFor(() => {
            expect(screen.getByText('Table 10')).toBeInTheDocument();
            expect(screen.getByText('Table 20')).toBeInTheDocument();
        });
    });

    it('opens and closes the add table dialog', async () => {
        renderWithProviders(<AdminPage />);

      
        const addButton = screen.getByRole('button', { name: /add new table/i });
        fireEvent.click(addButton);

        const dialogTitle = await screen.findByRole('dialog');
        expect(within(dialogTitle).getByText(/add new table/i)).toBeInTheDocument();

        const cancelButton = within(dialogTitle).getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('handles tab switching to Menu Management', async () => {
        renderWithProviders(<AdminPage />);

        const menuTab = screen.getByRole('tab', { name: /menu management/i });
        fireEvent.click(menuTab);

        const heading = await screen.findByRole('heading', { name: /menu management/i });
        expect(heading).toBeInTheDocument();
    });

    it('handles tab switching to Staff Management', async () => {
        renderWithProviders(<AdminPage />);

        const staffTab = screen.getByRole('tab', { name: /staff management/i });
        fireEvent.click(staffTab);

        const heading = await screen.findByRole('heading', { name: /staff management/i });
        expect(heading).toBeInTheDocument();
    });
});