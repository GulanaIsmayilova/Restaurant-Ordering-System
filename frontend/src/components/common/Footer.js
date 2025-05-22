import React from 'react';
import {Box, Container, Link, Typography, useMediaQuery, useTheme} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Footer = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <RestaurantIcon
                            sx={{
                                color: 'primary.main',
                                fontSize: {xs: 24, sm: 28}
                            }}
                        />
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: {xs: '1rem', sm: '1.1rem'}
                            }}
                        >
                            QR Menu System
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: {xs: 'column', sm: 'row'},
                            alignItems: 'center',
                            gap: {xs: 1, sm: 3}
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{textAlign: {xs: 'center', sm: 'left'}}}
                        >
                            © {new Date().getFullYear()} QR Menu. All rights reserved.
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2
                            }}
                        >
                            <Link
                                href="#"
                                color="text.secondary"
                                underline="hover"
                                sx={{fontSize: '0.875rem'}}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                color="text.secondary"
                                underline="hover"
                                sx={{fontSize: '0.875rem'}}
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="#"
                                color="text.secondary"
                                underline="hover"
                                sx={{fontSize: '0.875rem'}}
                            >
                                Contact
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 