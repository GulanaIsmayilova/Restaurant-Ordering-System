import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MenuPage from '../pages/MenuPage';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

jest.mock('axios');

const mockMenu = [
    {
        id: 1,
        name: 'Main Dishes',
        menuItems: [
            {
                id: 101,
                name: 'Burger',
                description: 'Juicy beef burger',
                price: 9.99,
                imageUrl: ''
            }
        ]
    }
];

const mockTable = {
    id: 5,
    tableNumber: 5,
    active: true
};

const renderWithProviders = (component) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={['/table/5']}>
                <Routes>
                    <Route path="/table/:tableId" element={component} />
                </Routes>
            </MemoryRouter>
        </ThemeProvider>
    );
};

describe('MenuPage', () => {
    it('loads menu and displays category and item', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/tables/')) {
                return Promise.resolve({ data: mockTable });
            }
            if (url.includes('/menu/categories')) {
                return Promise.resolve({ data: mockMenu });
            }
            return Promise.resolve({ data: [] });
        });

        renderWithProviders(<MenuPage />);

        expect(await screen.findByText(/Table 5 Menu/i)).toBeInTheDocument();
        expect(await screen.findByText('Main Dishes')).toBeInTheDocument();
        expect(await screen.findByText('Burger')).toBeInTheDocument();
        expect(await screen.findByText(/9\.99/i)).toBeInTheDocument();
    });
});
