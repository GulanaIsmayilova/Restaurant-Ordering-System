import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const ConfirmDialog = ({
                           open,
                           onClose,
                           onConfirm,
                           title,
                           message,
                           confirmText = 'Confirm',
                           cancelText = 'Cancel',
                           severity = 'warning'
                       }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getSeverityColor = () => {
        switch (severity) {
            case 'error':
                return 'error.main';
            case 'warning':
                return 'warning.main';
            case 'info':
                return 'info.main';
            default:
                return 'primary.main';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <WarningIcon sx={{color: getSeverityColor()}}/>
                <Typography variant="h6" component="div" sx={{fontWeight: 600}}>
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{pt: 2}}>
                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{
                px: 3,
                py: 2,
                gap: 1
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                        minWidth: 100,
                        borderRadius: 2
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={severity === 'error' ? 'error' : 'primary'}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                        minWidth: 100,
                        borderRadius: 2,
                        bgcolor: getSeverityColor(),
                        '&:hover': {
                            bgcolor: getSeverityColor(),
                            opacity: 0.9
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
