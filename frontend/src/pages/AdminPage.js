import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from 'react-router-dom';
import {QRCodeCanvas} from 'qrcode.react';
import axios from 'axios';
import MenuManagement from './MenuManagement';
import StaffManagement from './StaffManagement';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [tables, setTables] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [notification, setNotification] = useState({open: false, message: '', severity: 'success'});
    const [filter, setFilter] = useState('all');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (activeTab === 0) {
            fetchTables();
        }
    }, [activeTab]);

    const fetchTables = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/tables`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTables(response.data);
        } catch (error) {
            showNotification('Failed to load tables', 'error');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handlePrintQR = (tableNumber) => {
        const printWindow = window.open('', '_blank');
        const qrUrl = `${window.location.origin}/table/${tableNumber}`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Table ${tableNumber} QR Code</title>
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                        }
                        .qr-container {
                            text-align: center;
                        }
                        .table-number {
                            font-size: 24px;
                            margin: 20px 0;
                        }
                        @media print {
                            body {
                                height: auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <div class="table-number">Table ${tableNumber}</div>
                        <img src="${document.querySelector(`#qr-${tableNumber}`).toDataURL()}" 
                             alt="QR Code" 
                             style="width: 300px; height: 300px;"/>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    const handleToggleActive = async (tableId, active) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/tables/${tableId}/toggle-active`,
                {},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            showNotification(active ? 'Table activated' : 'Table deactivated');
            fetchTables();
        } catch (error) {
            showNotification('Error changing table status', 'error');
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({open: true, message, severity});
    };

    const filteredTables = tables.filter((table) => {
        if (filter === 'all') return true;
        if (filter === 'active') return table.active;
        if (filter === 'inactive') return !table.active;
        return false;
    });

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Admin Panel
                </Typography>
            </Box>

            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: {xs: '0.875rem', sm: '1rem'}
                        }
                    }}
                >
                    <Tab label="Tables"/>
                    <Tab label="Menu Management"/>
                    <Tab label="Staff Management"/>
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <FormControl sx={{minWidth: 120}}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filter}
                                label="Status"
                                onChange={(e) => setFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setOpenDialog(true)}>
                            Add New Table
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {filteredTables.map((table) => (
                            <Grid item xs={12} sm={6} md={4} key={table.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center"
                                                 width="100%">
                                                <Typography variant="h6">
                                                    Table {table.tableNumber}
                                                </Typography>
                                                <Chip
                                                    label={table.active ? 'Active' : 'Inactive'}
                                                    color={table.active ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{p: 2, bgcolor: 'white', borderRadius: 1, boxShadow: 1}}>
                                                <QRCodeCanvas
                                                    id={`qr-${table.tableNumber}`}
                                                    value={`${window.location.origin}/table/${table.tableNumber}`}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </Box>
                                            <Box display="flex" gap={1}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={table.active}
                                                            onChange={() => handleToggleActive(table.id, table.active)}
                                                            color={table.active ? 'success' : 'error'}
                                                        />
                                                    }
                                                    label={table.active ? 'Active' : 'Inactive'}
                                                    sx={{
                                                        '& .MuiFormControlLabel-label': {
                                                            color: table.active ? 'success.main' : 'error.main'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {activeTab === 1 && (
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: {xs: 2, sm: 3},
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <MenuManagement/>
                </Box>
            )}

            {activeTab === 2 && (
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: {xs: 2, sm: 3},
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <StaffManagement />
                </Box>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogContent>
                    <Box sx={{pt: 2}}>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Table Number"
                            type="number"
                            value={selectedTable?.tableNumber || ''}
                            onChange={(e) => setSelectedTable({...selectedTable, tableNumber: e.target.value})}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                await axios.post(
                                    `${API_URL}/api/tables`,
                                    {tableNumber: selectedTable?.tableNumber},
                                    {headers: {Authorization: `Bearer ${token}`}}
                                );
                                showNotification('Table added successfully');
                                setOpenDialog(false);
                                setSelectedTable(null);
                                fetchTables();
                            } catch (error) {
                                showNotification('Error adding table', 'error');
                            }
                        }}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({...notification, open: false})}
            >
                <Alert
                    severity={notification.severity}
                    onClose={() => setNotification({...notification, open: false})}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminPage;
