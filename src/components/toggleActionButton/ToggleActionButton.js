import React, { useState } from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useToast } from 'components/notifications';
import TooltipIconButton from '../tooltipIconButton';
import './toggleActionButton.css';

const ToggleActionButton = ({
    isActive,
    isDisabled,
    canInteract,
    title,
    onAction,
    activeIcon,
    inactiveIcon,
    size = 'medium',
    style,
    color,
    tooltipExtra
}) => {
    const toast = useToast();
    const [updating, setUpdating] = useState(false);

    const handleClick = React.useCallback(() => {
        setUpdating(true);
        onAction()
            .catch(err => { toast.error(err.message); })
            .finally(() => setUpdating(false));
    }, [onAction, toast]);

    const buttonStyle = { ...style };
    if (isActive && !updating) {
        buttonStyle.color = isDisabled ? 'grey' : 'red';
    } else if (color) {
        buttonStyle.color = isDisabled ? 'grey' : color;
    }

    return (
        <TooltipIconButton
            variant="noBorder"
            tooltip={
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption">{title}</Typography>
                    {tooltipExtra}
                </Box>
            }
            onClick={canInteract && !updating ? handleClick : null}
            style={buttonStyle}
            size={size}
            disabled={isDisabled}
        >
            {
                updating ?
                <AutorenewIcon fontSize="inherit" sx={{ animation: 'toggleActionUpdate 1.2s linear infinite' }} /> :
                isActive ?
                activeIcon :
                inactiveIcon
            }
        </TooltipIconButton>
    );
};

export default ToggleActionButton;
