import React, {useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const OrderSummary = ({items, onUpdateQuantity, onRemoveItem, onAddNote, onOrder}) => {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [note, setNote] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSelectedItem(null);
        setNote('');
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setNote(item.note || '');
        handleOpen();
    };

    const handleNoteChange = (event) => {
        setNote(event.target.value);
    };

    const handleNoteSave = () => {
        if (selectedItem) {
            onAddNote(selectedItem.id, note);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            <Box sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'stretch', sm: 'center'},
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'flex-start', sm: 'center'},
                    gap: 2
                }}>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Total: ${totalAmount.toFixed(2)}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon/>}
                        onClick={handleOpen}
                        size={isMobile ? 'small' : 'medium'}
                    >
                        View Details
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon/>}
                    onClick={onOrder}
                    size={isMobile ? 'small' : 'medium'}
                    fullWidth={isMobile}
                >
                    Place Order
                </Button>
            </Box>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 600,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pb: 2
                }}>
                    Order Details
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    <List sx={{mb: 2}}>
                        {items.map((item) => (
                            <React.Fragment key={item.id}>
                                <ListItem
                                    sx={{
                                        px: 0,
                                        py: 2,
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                    secondaryAction={
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: 'background.paper',
                                                borderRadius: 2,
                                                p: 0.5
                                            }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon fontSize="small"/>
                                                </IconButton>
                                                <Typography sx={{
                                                    mx: 1,
                                                    minWidth: 24,
                                                    textAlign: 'center',
                                                    fontWeight: 500
                                                }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <AddIcon fontSize="small"/>
                                                </IconButton>
                                            </Box>
                                            <IconButton
                                                onClick={() => onRemoveItem(item.id)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                                                {item.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mt: 0.5
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    ${item.price.toFixed(2)} x {item.quantity}
                                                </Typography>
                                                <Typography variant="body2" color="primary" sx={{fontWeight: 500}}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        }
                                        onClick={() => handleItemClick(item)}
                                    />
                                </ListItem>
                                {item.note && (
                                    <ListItem sx={{px: 0, py: 1}}>
                                        <ListItemText
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{pl: 2, fontStyle: 'italic'}}
                                                >
                                                    Note: {item.note}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                )}
                                <Divider/>
                            </React.Fragment>
                        ))}
                    </List>

                    {selectedItem && (
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Item Note"
                            value={note}
                            onChange={handleNoteChange}
                            onBlur={handleNoteSave}
                            variant="outlined"
                            sx={{mb: 2}}
                        />
                    )}

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider'
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 600}}>
                            Total Amount
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{fontWeight: 600}}>
                            ${totalAmount.toFixed(2)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{mr: 1}}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={onOrder}
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartIcon/>}
                    >
                        Place Order
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OrderSummary;
