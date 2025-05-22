import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QRScanner from '../pages/QRScanner';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.mock('html5-qrcode', () => {
    return {
        Html5QrcodeScanner: function () {
            return {
                render: jest.fn(),
                clear: jest.fn()
            };
        }
    };
});

const renderWithProviders = (component) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <BrowserRouter>{component}</BrowserRouter>
        </ThemeProvider>
    );
};

describe('QRScanner', () => {
    it('renders scanner UI', () => {
        renderWithProviders(<QRScanner />);
        expect(screen.getByText(/QR Reader/i)).toBeInTheDocument();
    });

    it('renders staff login button', () => {
        renderWithProviders(<QRScanner />);
        const button = screen.getByRole('button', { name: /staff login/i });
        expect(button).toBeInTheDocument();
        fireEvent.click(button); 
    });
});
