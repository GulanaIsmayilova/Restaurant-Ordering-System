import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuItemList from '../components/menu/MenuItemList';
import MenuItemDialog from '../components/menu/MenuItemDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, itemId: null, itemName: '' });

    useEffect(() => {
        fetchMenuItems();
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = menuItems;

        if (selectedCategory) {
            filtered = filtered.filter(item => item.categoryId === parseInt(selectedCategory));
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(item =>
                statusFilter === 'active' ? item.active : !item.active
            );
        }

        setFilteredItems(filtered);
    }, [selectedCategory, statusFilter, menuItems]);

    const fetchMenuItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/menu/admin/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMenuItems(response.data);
            setFilteredItems(response.data);
        } catch (error) {
            showNotification('Failed to load menu items', 'error');
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/menu/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            showNotification('Failed to load categories', 'error');
        }
    };

    const handleOpenDialog = (item = null) => {
        setSelectedItem(item);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
    };

    const handleSaveItem = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (selectedItem) {
                await axios.put(
                    `${API_URL}/api/menu/items/${selectedItem.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('Menu item updated successfully');
            } else {
                await axios.post(
                    `${API_URL}/api/menu/items`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('Menu item created successfully');
            }
            handleCloseDialog();
            fetchMenuItems();
        } catch (error) {
            showNotification('An error occurred while saving', 'error');
        }
    };

    const handleDeleteClick = (item) => {
        setDeleteDialog({
            open: true,
            itemId: item.id,
            itemName: item.name
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/menu/items/${deleteDialog.itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Menu item deleted successfully');
            setDeleteDialog({ open: false, itemId: null, itemName: '' });
            fetchMenuItems();
        } catch (error) {
            showNotification('An error occurred while deleting', 'error');
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Menu Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Menu Item
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            label="Filter by Category"
                        >
                            <MenuItem value="">All</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <ToggleButtonGroup
                        value={statusFilter}
                        exclusive
                        onChange={(e, value) => value && setStatusFilter(value)}
                        fullWidth
                    >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="active">Active</ToggleButton>
                        <ToggleButton value="inactive">Inactive</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            <MenuItemList
                items={filteredItems}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteClick}
            />

            <MenuItemDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveItem}
                item={selectedItem}
                categories={categories}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, itemId: null, itemName: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Menu Item"
                message={`Are you sure you want to delete the menu item "${deleteDialog.itemName}"? This action cannot be undone.`}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MenuManagement;
