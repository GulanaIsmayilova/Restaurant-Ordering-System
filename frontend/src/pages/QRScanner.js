import React, {useEffect, useState} from 'react';
import {Html5QrcodeScanner} from 'html5-qrcode';
import {useNavigate} from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import {
    Box,
    Button,
    Typography,
    Paper,
    Container,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip
} from '@mui/material';
import LoginIcon from "@mui/icons-material/Login";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

const QRScanner = () => {
    const [scanning, setScanning] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 10,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
        });

        const success = (decodedText) => {
            try {
                setScanning(false);
                const url = new URL(decodedText);
                const tableId = url.pathname.split('/').pop();

                if (tableId) {
                    navigate(`/table/${tableId}`);
                } else {
                    setError('Invalid QR code. Please scan the QR code on your table.');
                }
            } catch (err) {
                console.error('QR code processing error:', err);
                setError('Invalid QR code format. Please scan the QR code on your table.');
            }
        };

        const error = (err) => {
            console.error('QR scanning error:', err);
            setError('QR code scanning error. Please try again.');
        };

        scanner.render(success, error);

        return () => {
            scanner.clear();
        };
    }, [navigate]);

    const handleRetry = () => {
        setScanning(true);
        setError(null);
    };

    return (
        <ErrorBoundary>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        py: 4,
                        gap: 3
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            width: '100%',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <QrCodeScannerIcon
                                sx={{
                                    fontSize: {xs: 32, sm: 40},
                                    color: 'primary.main'
                                }}
                            />
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontSize: {xs: '1.5rem', sm: '2rem'},
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            >
                                QR Reader
                            </Typography>
                        </Box>

                        {scanning && !error && (
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 500,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div id="reader"/>
                            </Box>
                        )}

                        {error && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    p: 3,
                                    bgcolor: 'error.light',
                                    borderRadius: 2,
                                    width: '100%'
                                }}
                            >
                                <Typography color="error.dark" gutterBottom>
                                    {error}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleRetry}
                                    startIcon={<RefreshIcon/>}
                                    sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Try Again
                                </Button>
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: {xs: 'column', sm: 'row'},
                                gap: 2,
                                width: '100%',
                                mt: 2
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<LoginIcon/>}
                                onClick={() => navigate('/login')}
                                fullWidth
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Staff Login
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </ErrorBoundary>
    );
};

export default QRScanner;
