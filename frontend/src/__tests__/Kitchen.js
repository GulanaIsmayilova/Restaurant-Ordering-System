import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Kitchen from '../pages/Kitchen';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('@stomp/stompjs', () => ({
    Client: function () {
        return {
            activate: jest.fn(),
            deactivate: jest.fn(),
            subscribe: jest.fn(),
        };
    }
}));

jest.mock('sockjs-client', () => jest.fn());

jest.mock('axios');

const renderWithProviders = (ui) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <BrowserRouter>{ui}</BrowserRouter>
        </ThemeProvider>
    );
};

describe('Kitchen Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        renderWithProviders(<Kitchen />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        await screen.findByText(/kitchen panel/i);
    });

    it('renders kitchen panel and orders', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    tableNumber: 5,
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    items: [{ menuItemName: 'Pizza', quantity: 2 }]
                }
            ]
        });

        renderWithProviders(<Kitchen />);

        expect(await screen.findByText(/kitchen panel/i)).toBeInTheDocument();
        expect(screen.getByText(/table 5/i)).toBeInTheDocument();
        expect(screen.getByText(/pizza/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start preparing/i })).toBeInTheDocument();
    });

    it('updates order status on button click', async () => {
        const testOrder = {
            id: 1,
            tableNumber: 7,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            items: []
        };

        const updatedOrder = {
            ...testOrder,
            status: 'PREPARING'
        };

        axios.get.mockResolvedValueOnce({ data: [testOrder] });
        axios.put.mockResolvedValueOnce({ data: updatedOrder });

        renderWithProviders(<Kitchen />);

        const startBtn = await screen.findByRole('button', { name: /start preparing/i });
        fireEvent.click(startBtn);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/kitchen/orders/1/status?status=PREPARING`,
                null,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Bearer')
                    })
                })
            );
        });

        const card = await screen.findByText(/table 7/i);
        const container = card.closest('li');
        expect(within(container).getByText(/preparing/i));
    });


    it('switches tabs correctly', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        renderWithProviders(<Kitchen />);
        const preparingTab = await screen.findByRole('tab', { name: /preparing/i });
        fireEvent.click(preparingTab);

        expect(preparingTab).toHaveAttribute('aria-selected', 'true');
    });
});
