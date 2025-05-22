import React from 'react';
import {Box, Button, Paper, Typography, useMediaQuery, useTheme} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // Error logging service can be integrated here
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({hasError: false, error: null, errorInfo: null});
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback
                error={this.state.error}
                onReset={this.handleReset}
            />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({error, onReset}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                bgcolor: 'background.default'
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: {xs: 3, sm: 4},
                    maxWidth: 600,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}
            >
                <ErrorIcon
                    color="error"
                    sx={{
                        fontSize: {xs: 48, sm: 64},
                        mb: 2
                    }}
                />
                <Typography
                    variant="h5"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'error.main',
                        mb: 2
                    }}
                >
                    Oops! Something went wrong
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{mb: 3}}
                >
                    {error?.message || 'An unexpected error occurred. Please try again.'}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onReset}
                    startIcon={<RefreshIcon/>}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                        borderRadius: 2,
                        px: 3
                    }}
                >
                    Try Again
                </Button>
            </Paper>
        </Box>
    );
};

export default ErrorBoundary;
