import {ComponentPropsWithRef} from "react";
import {Box} from "@mui/material";

interface ColorChooserBoxProps extends ComponentPropsWithRef<typeof Box> {
    src: string;
    color: string;
}

export default ColorChooserBoxProps;