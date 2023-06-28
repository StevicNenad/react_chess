import React from 'react';
import {Box, Button, Dialog, DialogContent, DialogTitle} from '@mui/material';
import WaitingResponseDialogProps from "./WaitingDialog.props";
import animationData from "../../../assets/lottie/loading.json";
import Lottie from "lottie-react";
import "../Dialog.style.scss";

const WaitingResponseDialog = ({open, onCancel, onClose}: WaitingResponseDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0)', // semi-transparent white
                    backdropFilter: 'blur(8px)', // apply blur for "frosted glass" effect
                    boxShadow: 'none', // remove box shadow
                    border: '2px solid rgba(255, 255, 255, 0.1)' // add a subtle border
                }
            }}
        >
            <Box className={"dialog-box"}>
                <DialogTitle id="alert-dialog-title">{"Awaiting response..."}</DialogTitle>
                <DialogContent>
                    <Lottie className={"waiting-dialog-animation"} animationData={animationData}/>
                </DialogContent>
                <Button onClick={onCancel} color="primary" autoFocus>
                    Cancel
                </Button>
            </Box>
        </Dialog>
    );
}

export default WaitingResponseDialog;