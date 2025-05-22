import React from 'react';
import {Box, Card, CardContent, CardMedia, Chip, Grid, IconButton, Tooltip, Typography} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

const MenuItemList = ({items, onEdit, onDelete}) => {
    const getPlaceholderImage = (name) => {
        return `https://via.placeholder.com/200x200?text=${encodeURIComponent(name)}`;
    };

    return (
        <Grid container spacing={3}>
            {items.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                    <Card>
                        <Box display="flex" flexDirection={{xs: 'column', sm: 'row'}}>
                            <Box
                                position="relative"
                                sx={{
                                    width: {xs: '100%', sm: 200},
                                    height: {xs: 200, sm: 200},
                                    minWidth: {sm: 200},
                                    bgcolor: 'grey.100',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {item.imageUrl ? (
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        image={item.imageUrl}
                                        alt={item.name}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            p: 2,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <ImageNotSupportedIcon sx={{fontSize: 40, color: 'grey.400'}}/>
                                        <Typography variant="body2" color="text.secondary">
                                            No image available
                                        </Typography>
                                        <Tooltip title="Click the edit button to add an image">
                                            <Typography variant="caption" color="primary" sx={{cursor: 'help'}}>
                                                Click to add image
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>
                            <CardContent sx={{flex: 1}}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box flex={1}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="h6">{item.name}</Typography>
                                            <Chip
                                                label={item.active ? 'Active' : 'Inactive'}
                                                color={item.active ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {item.description}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Typography variant="h6" color="primary">
                                                ${item.price.toFixed(2)}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <AccessTimeIcon fontSize="small" color="action"/>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.preparationTime} min
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                            Category: {item.categoryName}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <IconButton onClick={() => onEdit(item)}>
                                            <EditIcon/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default MenuItemList;
