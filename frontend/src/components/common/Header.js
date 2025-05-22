import React from 'react';
import {
    AppBar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {logout} from '../../store/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RestaurantIcon from "@mui/icons-material/Restaurant";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {isAuthenticated, user} = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        handleMenuClose();
    };

    const handleMenuOpen = (event) => {
        console.log(user)
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar sx={{px: {xs: 2, sm: 3}}}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexGrow: 1
                }}>

                    <RestaurantIcon
                        sx={{
                            fontSize: {xs: 32, sm: 40},
                            color: 'primary.main'
                        }}
                    />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: {xs: '1.1rem', sm: '1.25rem'}
                        }}
                    >
                        QR Menu
                    </Typography>
                </Box>

                {isAuthenticated && (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {isMobile ? (
                            <>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{color: 'primary.main'}}
                                >
                                    <AccountCircleIcon/>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        sx: {
                                            mt: 1.5,
                                            borderRadius: 2,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <MenuItem
                                        onClick={handleMenuClose}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            minWidth: 200
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Signed in as {user?.sub}
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleLogout}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            color: 'error.main'
                                        }}
                                    >
                                        <LogoutIcon sx={{mr: 1, fontSize: 20}}/>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{display: {xs: 'none', sm: 'block'}}}
                                >
                                    Signed in as {user?.sub}
                                </Typography>
                                <Tooltip title="Logout">
                                    <IconButton
                                        onClick={handleLogout}
                                        sx={{
                                            color: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <LogoutIcon/>
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
