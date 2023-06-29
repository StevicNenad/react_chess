interface WaitingResponseDialogProps {
    open: boolean;
    onCancel: () => void;  // no arguments here
    onClose: (event: React.SyntheticEvent, reason: 'backdropClick' | 'escapeKeyDown') => void;
}


export default WaitingResponseDialogProps;