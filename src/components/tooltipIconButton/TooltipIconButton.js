import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton';

const TooltipIconButton = ({tooltip, onClick, disabled = false, children, style, edge = false}) => {

    return (
        <Tooltip
            title={tooltip}
            placement="bottom"
            TransitionComponent={Zoom}
            arrow
        >
            <IconButton
                edge={edge}
                sx={{
                    mr: {
                        xs: 0,
                        sm: 0
                    }
                }}
                color="inherit"
                aria-label="menu"
                onClick={onClick}
                disabled={disabled}
                style={style}
                size="large">
                {children}
            </IconButton>
        </Tooltip>
    );
}

export default TooltipIconButton;
