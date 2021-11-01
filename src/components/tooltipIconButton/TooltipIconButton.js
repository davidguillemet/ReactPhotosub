import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton';

const useTooltipButtonStyles = makeStyles(() => ({
    tooltipLabel: {
        fontSize: 16
    },
    tooltipPlacementBottom: {
        backgroundColor: 'black',
        bottom: 15
    },
    tooltipPlacementTop: {
        backgroundColor: 'black',
        top: 15
    },
    arrow: {
        color: 'black',
    }
}));

const TooltipIconButton = ({tooltip, onClick, disabled = false, children, style, edge = false}) => {

    const classes = useTooltipButtonStyles();

    return (
        <Tooltip
            title={tooltip}
            placement="bottom"
            TransitionComponent={Zoom}
            arrow
            classes={{
                tooltip: classes.tooltipLabel,
                tooltipPlacementBottom: classes.tooltipPlacementBottom,
                tooltipPlacementTop: classes.tooltipPlacementTop,
                arrow: classes.arrow
            }}
        >
            <IconButton
                edge={edge}
                sx={{
                    mr: {
                        xs: 0,
                        sm: 1
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
