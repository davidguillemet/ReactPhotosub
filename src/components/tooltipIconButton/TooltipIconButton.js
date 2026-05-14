import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton';

const TooltipIconButton = (props) => {

    const {
        sx = null,
        tooltip,
        children,
        ...iconButtonProps // onClick, disabled, style, size, edge, variant, ...
    } = props;

    return (
        <Tooltip
            title={tooltip}
            placement="bottom"
            slots={{
                transition: Zoom
            }}
        >
            <IconButton
                sx={{
                    mr: {
                        xs: 0,
                        sm: 0
                    },
                    ...(sx && { ...sx })

                }}
                color="inherit"
                aria-label="menu"
                {...iconButtonProps}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}

export default TooltipIconButton;
