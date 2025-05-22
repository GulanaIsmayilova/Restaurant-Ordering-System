import React, { useEffect, useState } from 'react';
import {
    Container, Grid, Paper, Typography, Box, List, ListItem, ListItemText,
    Button, Divider, Alert, Snackbar, Badge, Tabs, Tab, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { formatDistanceToNow } from 'date-fns';
import KitchenIcon from '../assets/kitchen.svg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

const OrderStatus = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    READY: 'READY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

const Kitchen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchOrders();

        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe('/topic/kitchen/orders', (message) => {
                    const newOrder = JSON.parse(message.body);
                    console.log('📦 New order received:', newOrder);
                    handleNewOrder(newOrder);
                });
                client.subscribe('/topic/kitchen/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    console.log('🔔 Notification:', notification);
                    handleNotification(notification);
                });
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
                setError('WebSocket connection lost. Please refresh the page.');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setError('A connection error occurred. Please refresh the page.');
            }
        });

        client.activate();
        return () => {
            if (client) client.deactivate();
        };
    }, []);

    const handleNewOrder = (newOrder) => {
        const safeOrder = {
            ...newOrder,
            items: newOrder.items || [],
        };

        setOrders(prevOrders => {
            const existing = prevOrders.find(order => order.id === safeOrder.id);
            if (existing) {
                return prevOrders.map(o => o.id === safeOrder.id ? safeOrder : o);
            }
            return [safeOrder, ...prevOrders];
        });

        fetchOrders();

        addNotification({
            message: `New order received for Table ${safeOrder.tableNumber}`,
            severity: 'info'
        });
    };

    const handleNotification = (notification) => {
        addNotification({
            message: notification.message,
            severity: notification.type || 'info'
        });
    };

    const addNotification = (notification) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, ...notification }]);
        
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/kitchen/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (e) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/kitchen/orders/${orderId}/status?status=${newStatus}`,
                null,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setOrders(prev => prev.map(o =>
                o.id === orderId ? response.data : o
            ));

            addNotification({
                message: `Order #${orderId} updated to ${newStatus}`,
                severity: 'success'
            });
        } catch (e) {
            console.error('Error updating order status:', e);
            setError('Failed to update order status');
        }
    };

    const handleTabChange = (_, newValue) => setActiveTab(newValue);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    maxWidth: '400px',
                    width: '100%'
                }}
            >
                {notifications.map((n, index) => (
                    <Snackbar
                        key={n.id}
                        open={true}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{
                            position: 'relative',
                            transform: 'none',
                            top: 'auto',
                            right: 'auto'
                        }}
                    >
                        <Alert
                            severity={n.severity}
                            action={
                                <IconButton
                                    size="small"
                                    color="inherit"
                                    onClick={() => removeNotification(n.id)}
                                    sx={{ ml: 1 }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                            sx={{
                                width: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                borderRadius: 2,
                                animation: 'slideIn 0.3s ease-out'
                            }}
                        >
                            {n.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>

            <style>
                {`
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <Box display="flex" alignItems="center" gap={2}>
                <img 
                    src={KitchenIcon} 
                    alt="Kitchen Icon"
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
                    Kitchen Panel
                </Typography>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label={`New Orders (${pendingOrders.length})`} />
                    <Tab label={`Preparing (${preparingOrders.length})`} />
                </Tabs>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        {activeTab === 0 ? (
                            <OrderList title="New Orders" orders={pendingOrders} onStatusUpdate={handleStatusUpdate} />
                        ) : (
                            <OrderList title="Preparing Orders" orders={preparingOrders} onStatusUpdate={handleStatusUpdate} />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

const OrderList = ({ title, orders, onStatusUpdate }) => (
    <>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Divider sx={{ mb: 2 }} />
        {orders.length === 0 ? (
            <Box textAlign="center" py={4}>
                <Typography color="text.secondary">No orders</Typography>
            </Box>
        ) : (
            <List>
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
                ))}
            </List>
        )}
    </>
);

const OrderCard = ({ order, onStatusUpdate }) => (
    <React.Fragment>
        <ListItem
            sx={{
                flexDirection: 'column',
                alignItems: 'stretch',
                bgcolor: 'background.default',
                mb: 2,
                borderRadius: 1,
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                    <Typography variant="subtitle1">Table {order.tableNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Unknown time'}
                    </Typography>
                </Box>
                <Typography
                    variant="caption"
                    color={order.status === OrderStatus.PREPARING ? 'warning.main' : 'text.secondary'}
                >
                    {order.status}
                </Typography>
            </Box>

            <List dense>
                {(order.items || []).map((item, index) => (
                    <ListItem key={item.id || index}>
                        <ListItemText
                            primary={item.menuItemName || 'Unnamed Item'}
                            secondary={
                                <Box component="span">
                                    <Typography variant="body2" component="span">
                                        Quantity: {item.quantity || '-'}
                                    </Typography>
                                    {item.specialInstructions && (
                                        <Typography variant="body2" color="text.secondary" component="div">
                                            Note: {item.specialInstructions}
                                        </Typography>
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {order.customerNote && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.dark">
                        Customer Note: {order.customerNote}
                    </Typography>
                </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {order.status === OrderStatus.PENDING && (
                    <Button variant="contained" color="primary"
                            onClick={() => onStatusUpdate(order.id, OrderStatus.PREPARING)}>
                        Start Preparing
                    </Button>
                )}
                {order.status === OrderStatus.PREPARING && (
                    <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}
                            onClick={() => onStatusUpdate(order.id, OrderStatus.READY)}>
                        Mark as Ready
                    </Button>
                )}
            </Box>
        </ListItem>
        <Divider />
    </React.Fragment>
);

export default Kitchen;
