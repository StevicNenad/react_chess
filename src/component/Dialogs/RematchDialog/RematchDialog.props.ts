import React, { ComponentPropsWithRef } from 'react';
import { Dialog } from '@mui/material';

interface RematchDialogProps extends ComponentPropsWithRef<typeof Dialog> {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default RematchDialogProps;
