import {Box} from "@mui/material";
import ColorChooserBoxProps from "./ColorChooserBox.props";
import "./ColorChooserBox.style.scss";

const ColorChooserBox = ({src, color, ...props}: ColorChooserBoxProps) => {
    return (
        <Box component="form" className="color-chooser-box" {...props}>
            <img className={"color-picker"} src={src} alt={color}/>
        </Box>
    )
}

export default ColorChooserBox;
