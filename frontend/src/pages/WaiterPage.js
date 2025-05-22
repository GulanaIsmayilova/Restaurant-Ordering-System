import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    Tooltip,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import axios from 'axios';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import {formatDistanceToNow} from 'date-fns';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import WaiterIcon from '../assets/waiters.svg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const WaiterPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [currentNotification, setCurrentNotification] = useState(null);
    const stompClient = useRef(null);

    useEffect(() => {
        fetchOrders();
        setupWebSocket();
        const interval = setInterval(fetchOrders, 30000);
        return () => {
            clearInterval(interval);
            disconnectWebSocket();
        };
    }, []);

    useEffect(() => {
        if (notifications.length > 0 && !currentNotification) {
            setCurrentNotification(notifications[0]);
            const timer = setTimeout(() => {
                setNotifications((prev) => prev.slice(1));
                setCurrentNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notifications, currentNotification]);

    const setupWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            onConnect: () => {
                client.subscribe('/topic/waiter/orders', (message) => {
                    const order = JSON.parse(message.body);
                    handleNewOrder(order);
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error(frame);
            }
        });

        client.activate();
        stompClient.current = client;
    };

    const disconnectWebSocket = () => {
        if (stompClient.current) {
            stompClient.current.deactivate();
        }
    };

    const handleNewOrder = (newOrder) => {
        setOrders((prevOrders) => {
            const existingOrderIndex = prevOrders.findIndex((o) => o.id === newOrder.id);
            if (existingOrderIndex >= 0) {
                const updatedOrders = [...prevOrders];
                updatedOrders[existingOrderIndex] = newOrder;
                return updatedOrders;
            }
            return [...prevOrders, newOrder];
        });
    };

    const fetchOrders = async () => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/waiter/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOrders(response.data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Error loading orders');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeliver = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/waiter/orders/${orderId}/deliver`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setSuccess('Order marked as delivered successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error delivering order:', error);
            setError('Error delivering order');
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'READY':
                return 'success';
            case 'PREPARING':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), {addSuffix: true});
    };

    const renderOrderList = (tableOrders) => (
        <List sx={{ p: 0 }}>
            {tableOrders.map((order) => (
                <Paper
                    key={order.id}
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: order.status === 'READY' ? 'success.main' : 'divider',
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <Box 
                        display="flex" 
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        gap={2}
                        mb={2}
                    >
                        <Box>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    mb: 0.5
                                }}
                            >
                                Order #{order.id}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AccessTimeIcon fontSize="small" color="action"/>
                                <Typography variant="body2" color="text.secondary">
                                    {getTimeAgo(order.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={order.status === 'READY' ? 'Ready' : 'Preparing'}
                            color={getOrderStatusColor(order.status)}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{ 
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                    px: 2
                                },
                                ...(order.status === 'READY' && {
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'success.dark'
                                    }
                                })
                            }}
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <List dense sx={{ p: 0 }}>
                                {order.items.map((item) => (
                                    <ListItem 
                                        key={item.id}
                                        sx={{
                                            px: 0,
                                            py: 1,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': {
                                                borderBottom: 'none'
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {item.menuItemName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.unitPrice.toFixed(2)} $
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box 
                                                    component="span" 
                                                    display="flex" 
                                                    alignItems="center" 
                                                    gap={1}
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    <Chip
                                                        label={`${item.quantity} pcs`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ 
                                                            height: 24,
                                                            '& .MuiChip-label': {
                                                                px: 1
                                                            }
                                                        }}
                                                    />
                                                    {item.specialInstructions && (
                                                        <Tooltip 
                                                            title={item.specialInstructions}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <InfoIcon 
                                                                fontSize="small" 
                                                                color="action"
                                                                sx={{ cursor: 'help' }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box 
                                display="flex" 
                                flexDirection="column" 
                                gap={2}
                                sx={{ 
                                    mt: { xs: 2, md: 0 },
                                    p: { xs: 2, sm: 0 },
                                    bgcolor: { xs: 'background.default', md: 'transparent' },
                                    borderRadius: 2
                                }}
                            >
                                {order.customerNote && (
                                    <Paper 
                                        variant="outlined" 
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ fontStyle: 'italic' }}
                                        >
                                            <strong>Note:</strong> {order.customerNote}
                                        </Typography>
                                    </Paper>
                                )}
                                <Box 
                                    sx={{ 
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {order.totalAmount.toFixed(2)} $
                                    </Typography>
                                </Box>
                                {order.status === 'READY' && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<LocalShippingIcon/>}
                                        onClick={() => handleDeliver(order.id)}
                                        fullWidth
                                        size={isMobile ? 'medium' : 'large'}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                       Deliver
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            ))}
        </List>
    );

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                bgcolor="background.default"
            >
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
            <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                gap={2}
                mb={4}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <img 
                        src={WaiterIcon} 
                        alt="Waiter Icon"
                        style={{
                            width: '48px',
                            height: '48px',
                            filter: 'brightness(0) saturate(100%) invert(31%) sepia(98%) saturate(1352%) hue-rotate(187deg) brightness(97%) contrast(101%)'
                        }}
                    />
                    <Typography 
                        variant="h4" 
                        component="h1"
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            fontWeight: 600,
                            color: 'primary.main'
                        }}
                    >
                        Waiter Panel
                    </Typography>
                </Box>
                <Tooltip title="Refresh Orders">
                    <IconButton 
                        onClick={fetchOrders} 
                        disabled={refreshing} 
                        color="primary"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white'
                            }
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3,
                        borderRadius: 2
                    }}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert 
                        severity="success" 
                        onClose={() => setSuccess(null)}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        {success}
                    </Alert>
                </Snackbar>
            )}

            {currentNotification && (
                <Snackbar
                    open={!!currentNotification}
                    autoHideDuration={3000}
                    onClose={() => setCurrentNotification(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        severity="info"
                        onClose={() => setCurrentNotification(null)}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        {currentNotification}
                    </Alert>
                </Snackbar>
            )}

            <Grid container spacing={3}>
                {Object.entries(
                    orders.reduce((acc, order) => {
                        if (!acc[order.tableNumber]) {
                            acc[order.tableNumber] = [];
                        }
                        acc[order.tableNumber].push(order);
                        return acc;
                    }, {})
                ).map(([tableNumber, tableOrders]) => (
                    <Grid item xs={12} key={tableNumber}>
                        <Card 
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'hidden'
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Box 
                                    display="flex" 
                                    flexDirection={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between" 
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    gap={2}
                                    mb={2}
                                >
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: 'primary.main',
                                            fontWeight: 600
                                        }}
                                    >
                                        Table {tableNumber}
                                    </Typography>
                                    <Chip
                                        label={`${tableOrders.length} Orders`}
                                        color="primary"
                                        variant="outlined"
                                        size={isMobile ? 'small' : 'medium'}
                                        sx={{ 
                                            fontWeight: 500,
                                            '& .MuiChip-label': {
                                                px: 2
                                            }
                                        }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                {renderOrderList(tableOrders)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default WaiterPage;
