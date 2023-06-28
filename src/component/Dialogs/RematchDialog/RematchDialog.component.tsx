import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import RematchDialogProps from "./RematchDialog.props";

const RematchDialog = ({ open, onClose, onConfirm } :RematchDialogProps) => {
    return (
        <Dialog
            className={"glass-dialog"}
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                }
            }}
        >
            <DialogTitle id="alert-dialog-title">{"Rematch?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Do you want to challenge your opponent to a rematch?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    No
                </Button>
                <Button onClick={onConfirm} color="primary" autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RematchDialog;
