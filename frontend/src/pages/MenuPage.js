import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Tab,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import OrderSummary from '../components/order/OrderSummary';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {formatDistanceToNow} from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const MenuPage = () => {
    const {tableId} = useParams();
    const navigate = useNavigate();
    const [menuData, setMenuData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [deliveredOrders, setDeliveredOrders] = useState({});
    const [activeOrders, setActiveOrders] = useState(() => {
        const savedOrders = localStorage.getItem(`orders_${tableId}`);
        return savedOrders ? JSON.parse(savedOrders) : [];
    });
    const [table, setTable] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        checkTable();
    }, [tableId]);

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        const updateOrderStatuses = async () => {
            try {
                const updatedOrders = await Promise.all(
                    activeOrders
                        .filter(order => !deliveredOrders[order.id]) // Only update non-delivered orders
                        .map(async (order) => {
                            try {
                                const response = await axios.get(`${API_URL}/api/orders/${order.id}`);
                                const newOrder = response.data;
                                
                                // Handle newly delivered orders
                                if (newOrder.status === 'DELIVERED' && order.status !== 'DELIVERED') {
                                    handleDeliveredOrder(newOrder.id);
                                    return newOrder;
                                }

                                // Update status for non-delivered orders
                                if (newOrder.status !== order.status) {
                                    if (newOrder.status === 'READY') {
                                        setSnackbar({
                                            open: true,
                                            message: `Order #${order.id} is Ready!`,
                                            severity: 'success'
                                        });
                                    }
                                    return newOrder;
                                }

                                return order;
                            } catch (error) {
                                console.error(`Error fetching order ${order.id}:`, error);
                                return order;
                            }
                        })
                );

                // Combine updated orders with delivered orders
                const allOrders = [
                    ...updatedOrders,
                    ...activeOrders.filter(order => deliveredOrders[order.id])
                ];

                // Update orders only if there are changes
                const hasChanges = JSON.stringify(allOrders) !== JSON.stringify(activeOrders);
                if (hasChanges) {
                    setActiveOrders(allOrders);
                    localStorage.setItem(`orders_${tableId}`, JSON.stringify(allOrders));
                }
            } catch (error) {
                console.error('Error updating order statuses:', error);
            }
        };

        const interval = setInterval(updateOrderStatuses, 3000);
        updateOrderStatuses();

        return () => clearInterval(interval);
    }, [tableId, deliveredOrders]);

    const checkTable = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/tables/${tableId}`);
            const tableData = response.data;

            if (!tableData.active) {
                throw new Error('Table is not active, please try again later.');
            }

            setTable(tableData);
            setError(null);
        } catch (error) {
            let errorMessage = 'Table information error.';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Table not found, please try again later.';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
            setTable(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/menu/categories`);
            setMenuData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading menu:', error);
            setError('Error loading menu, please try again later.');
            setLoading(false);
        }
    };

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
    };

    const handleAddToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id ? {...i, quantity: i.quantity + 1} : i
                );
            }
            return [...prevItems, {...item, quantity: 1}];
        });
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? {...item, quantity: newQuantity} : item
            )
        );
    };

    const handleRemoveItem = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handleAddNote = (itemId, note) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? {...item, note} : item
            )
        );
    };

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(item => item.id === itemId);
        return item ? item.quantity : 0;
    };

    const handleOrder = async () => {
        try {
            const orderItems = cartItems.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity,
                note: item.note
            }));

            const response = await axios.post(`${API_URL}/api/orders`, {
                tableId: parseInt(tableId),
                items: orderItems
            });

            const newOrder = response.data;
            const updatedOrders = [...activeOrders, newOrder];

            setActiveOrders(updatedOrders);
            localStorage.setItem(`orders_${tableId}`, JSON.stringify(updatedOrders));

            setSnackbar({
                open: true,
                message: 'Order created successfully. Order ID: ' + newOrder.id,
                severity: 'success'
            });
            setCartItems([]);
        } catch (error) {
            console.error('Error creating order:', error);
            setSnackbar({
                open: true,
                message: 'Failed to create order. Please try again later.',
                severity: 'error'
            });
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'READY':
                return 'success';
            case 'PREPARING':
                return 'warning';
            case 'DELIVERED':
                return 'info';
            default:
                return 'default';
        }
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case 'READY':
                return 'Ready';
            case 'PREPARING':
                return 'Preparing';
            case 'DELIVERED':
                return 'Delivered';
            default:
                return status;
        }
    };

    const getTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), {addSuffix: true});
    };

    useEffect(() => {
        const timerInterval = setInterval(() => {
            const now = Date.now();
            let hasExpiredOrders = false;
            
            // Check each delivered order's timer
            Object.entries(deliveredOrders).forEach(([orderId, timer]) => {
                if (now >= timer.endTime) {
                    hasExpiredOrders = true;
                }
            });

            if (hasExpiredOrders) {
                // Remove all expired orders at once
                setActiveOrders(prev => {
                    const updatedOrders = prev.filter(order => {
                        const timer = deliveredOrders[order.id];
                        return !timer || now < timer.endTime;
                    });
                    localStorage.setItem(`orders_${tableId}`, JSON.stringify(updatedOrders));
                    return updatedOrders;
                });

                // Clean up expired timers
                setDeliveredOrders(prev => {
                    const updated = {...prev};
                    Object.entries(updated).forEach(([orderId, timer]) => {
                        if (now >= timer.endTime) {
                            if (timer.timerId) {
                                clearTimeout(timer.timerId);
                            }
                            delete updated[orderId];
                        }
                    });
                    return updated;
                });
            } else {
                // Just update the display
                setDeliveredOrders(prev => ({...prev}));
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [tableId]);

    const getRemainingTime = (orderId) => {
        const orderTimer = deliveredOrders[orderId];
        if (!orderTimer) return null;

        const now = Date.now();
        if (now >= orderTimer.endTime) {
            return 0;
        }

        const remaining = orderTimer.endTime - now;
        return Math.ceil(remaining / 1000);
    };

    const handleDeliveredOrder = (orderId) => {
        const REMOVAL_DELAY = 120000; // 2 minutes in milliseconds
        
        // If timer already exists, don't create a new one
        if (deliveredOrders[orderId]) {
            return;
        }

        // Create new timer for this order
        const timerData = {
            startTime: Date.now(),
            endTime: Date.now() + REMOVAL_DELAY,
            timerId: setTimeout(() => {
                setActiveOrders(prev => {
                    const updatedOrders = prev.filter(order => order.id !== orderId);
                    localStorage.setItem(`orders_${tableId}`, JSON.stringify(updatedOrders));
                    return updatedOrders;
                });
                
                setDeliveredOrders(prev => {
                    const updated = {...prev};
                    if (updated[orderId]?.timerId) {
                        clearTimeout(updated[orderId].timerId);
                    }
                    delete updated[orderId];
                    return updated;
                });
            }, REMOVAL_DELAY)
        };

        setDeliveredOrders(prev => ({
            ...prev,
            [orderId]: timerData
        }));
    };

    const renderActiveOrders = () => (
        <Box sx={{mb: 4}}>
            <Typography variant="h6" sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}>
                Active Orders
            </Typography>
            <List>
                {activeOrders.map((order) => (
                    <Card key={order.id} sx={{mb: 2, borderRadius: 2}}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    Order #{order.id}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {order.status === 'DELIVERED' && (
                                        <Typography variant="caption" color="text.secondary">
                                            Removing in: {getRemainingTime(order.id)}s
                                        </Typography>
                                    )}
                                    <Chip
                                        label={order.status}
                                        color={getOrderStatusColor(order.status)}
                                        size={isMobile ? 'small' : 'medium'}
                                    />
                                </Box>
                            </Box>
                            <List dense>
                                {order.items.map((item) => (
                                    <ListItem key={item.id} sx={{py: 0.5}}>
                                        <ListItemText
                                            primary={item.menuItemName}
                                            secondary={`${item.quantity} pieces - ${item.unitPrice.toFixed(2)} $`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{my: 1}}/>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    <AccessTimeIcon fontSize="small" sx={{mr: 0.5, verticalAlign: 'middle'}}/>
                                    {getTimeAgo(order.createdAt)}
                                </Typography>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    Total: {order.totalAmount.toFixed(2)} $
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </List>
        </Box>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100vh"
                    gap={3}
                >
                    <ErrorIcon color="error" sx={{fontSize: 60}}/>
                    <Typography variant="h5" color="error" align="center">
                        {error}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                        Scan QR Code
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            py: {xs: 2, sm: 4},
            px: {xs: 1, sm: 2}
        }}>
            <Container maxWidth="lg">
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    justifyContent: 'space-between',
                    alignItems: {xs: 'flex-start', md: 'center'},
                    mb: 4
                }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            color: 'primary.main',
                            mb: {xs: 2, md: 0}
                        }}
                    >
                        Table {table?.tableNumber} Menu
                    </Typography>
                </Box>

                {activeOrders.length > 0 && renderActiveOrders()}

                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 4,
                    '& .MuiTabs-root': {
                        minHeight: 48
                    }
                }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 48,
                                fontSize: '1rem',
                                fontWeight: 500
                            }
                        }}
                    >
                        {menuData.map((category) => (
                            <Tab
                                key={category.id}
                                label={category.name}
                                sx={{
                                    textTransform: 'none',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        fontWeight: 600
                                    }
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Grid container spacing={3}>
                    {menuData[selectedCategory]?.menuItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imageUrl || 'https://via.placeholder.com/200'}
                                    alt={item.name}
                                    sx={{
                                        objectFit: 'cover'
                                    }}
                                />
                                <CardContent sx={{flexGrow: 1}}>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="div"
                                        sx={{fontWeight: 600}}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mb: 2}}
                                    >
                                        {item.description}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 2
                                        }}
                                    >
                                        {item.price.toFixed(2)} $
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mt: 'auto'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                            p: 0.5
                                        }}>
                                            <Button
                                                size="small"
                                                onClick={() => handleUpdateQuantity(item.id, getItemQuantity(item.id) - 1)}
                                                disabled={getItemQuantity(item.id) <= 0}
                                                sx={{minWidth: 32}}
                                            >
                                                <RemoveIcon/>
                                            </Button>
                                            <Typography
                                                sx={{
                                                    mx: 2,
                                                    fontWeight: 500,
                                                    minWidth: 24,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {getItemQuantity(item.id)}
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={() => handleAddToCart(item)}
                                                sx={{minWidth: 32}}
                                            >
                                                <AddIcon/>
                                            </Button>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<ShoppingCartIcon/>}
                                            onClick={() => handleAddToCart(item)}
                                            sx={{ml: 2}}
                                        >
                                            Add to Cart
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                    p: 2,
                    zIndex: 1000
                }}>
                    <OrderSummary
                        items={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onAddNote={handleAddNote}
                        onOrder={handleOrder}
                    />
                </Box>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                    </Alert>
                    </Snackbar>
        </Box>
    );
};

export default MenuPage;

