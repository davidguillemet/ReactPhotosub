import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import IconButton from '@material-ui/core/IconButton';

const useTooltipButtonStyles = makeStyles((theme) => ({
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
    },
    menuButton: {
        marginRight: theme.spacing(0),
      },
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
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                onClick={onClick}
                disabled={disabled}
                style={style}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}

export default TooltipIconButton;
