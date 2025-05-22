import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import MenuManagement from '../pages/MenuManagement';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

jest.mock('axios');

jest.mock('../components/menu/MenuItemList', () => (props) => (
    <div data-testid="menu-item-list">{props.items.length} items</div>
));

jest.mock('../components/menu/MenuItemDialog', () => (props) => (
    props.open ? <div data-testid="menu-item-dialog">Dialog Open</div> : null
));

jest.mock('../components/common/ConfirmDialog', () => (props) => (
    props.open ? (
        <div data-testid="confirm-dialog">
            <button onClick={props.onConfirm}>Confirm</button>
        </div>
    ) : null
));

const renderWithProviders = (ui) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <BrowserRouter>{ui}</BrowserRouter>
        </ThemeProvider>
    );
};

describe('MenuManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders title and loads menu items and categories', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/menu/admin/items')) {
                return Promise.resolve({ data: [{ id: 1, name: 'Burger', categoryId: 1, active: true }] });
            }
            if (url.includes('/menu/categories')) {
                return Promise.resolve({ data: [{ id: 1, name: 'Main Dishes' }] });
            }
        });

        renderWithProviders(<MenuManagement />);

        expect(await screen.findByText(/menu management/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-list')).toHaveTextContent(/1\s*items/i);
        });
    });

    it('opens new item dialog on button click', async () => {
        axios.get.mockResolvedValue({ data: [] });

        renderWithProviders(<MenuManagement />);

        const button = screen.getByRole('button', { name: /new menu item/i });
        fireEvent.click(button);

        expect(await screen.findByTestId('menu-item-dialog')).toBeInTheDocument();
    });


    it('filters by active status', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                { id: 1, name: 'Pasta', categoryId: 1, active: true },
                { id: 2, name: 'Soup', categoryId: 1, active: false }
            ]
        });
        axios.get.mockResolvedValueOnce({
            data: [{ id: 1, name: 'Italian' }]
        });

        renderWithProviders(<MenuManagement />);

        const toggle = await screen.findByRole('button', { name: /inactive/i });
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-list')).toHaveTextContent(/1\s*items/i);
        });
    });

    it('shows notification on error', async () => {
        axios.get.mockRejectedValue(new Error('error'));

        renderWithProviders(<MenuManagement />);

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(/failed to load/i);
    });
});
