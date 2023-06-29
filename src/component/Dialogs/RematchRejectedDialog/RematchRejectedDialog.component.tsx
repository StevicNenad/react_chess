import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import RematchRejectedDialogProps from "./RematchRejectedDialog.props";

const RematchRejectedDialog = ({open}: RematchRejectedDialogProps) => {
    return (
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Rematch Request"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Rematch has been rejected.
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}

export default RematchRejectedDialog;
