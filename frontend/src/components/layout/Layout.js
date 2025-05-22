import React from 'react';
import {Box, Container, useMediaQuery, useTheme} from '@mui/material';
import Header from '../common/Header';
import Footer from '../common/Footer';

const Layout = ({children}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'background.default'
            }}
        >
            <Header/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: {xs: 2, sm: 3},
                    px: {xs: 1, sm: 2}
                }}
            >
                <Container
                    maxWidth="lg"
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {children}
                </Container>
            </Box>
            <Footer/>
        </Box>
    );
};

export default Layout; 