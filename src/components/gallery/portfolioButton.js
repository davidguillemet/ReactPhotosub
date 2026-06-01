import React, { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import TooltipIconButton from '../tooltipIconButton';
import { useAuthContext } from '../authentication';
import './css/favorites.css';
import { usePortfolio } from 'providers';
import { useTranslation } from 'utils';
import { useGalleryContext } from './galleryContext';
import { PORTFOLIO_INTENT_ADD, PORTFOLIO_INTENT_REMOVE } from 'utils/portfolio/portfolioIntents';
import { useToast } from 'components/notifications';

const PortfolioButton = ({image, size = 'medium', style, color }) => {

    const { toast } = useToast();
    const t = useTranslation("components.gallery");
    const authContext = useAuthContext();
    const { isInPortfolio, notifyObservers } = usePortfolio();
    const { portfolioSubmit, withFavorite } = useGalleryContext();
    const [ updating, setUpdating ] = useState(false);

    const imageIsInPortfolio = React.useMemo(() => {
        return isInPortfolio(image);
    }, [isInPortfolio, image]);

    const handleClick = React.useCallback(() => {
        setUpdating(true);
        const updateIntent = imageIsInPortfolio ? PORTFOLIO_INTENT_REMOVE : PORTFOLIO_INTENT_ADD;
        const submitData = {
            intent: updateIntent,
            ids: [image.id]
        }
        portfolioSubmit(submitData)
        .then(() => {
            notifyObservers(submitData.ids, updateIntent);
        }).catch(err => {
            // Empty... mutationCache is adding an error toast
            toast.error(err.message);
        }).finally(() => {
            setUpdating(false);
        });
    }, [portfolioSubmit, notifyObservers, imageIsInPortfolio, image, toast]);

    const isDisabled = !withFavorite;

    const buttonStyle = {...style};
    let title = t("btn:addToPortfolio");
    if (imageIsInPortfolio && updating === false) {
        title = t("btn:deleteFromPortfolio");
        buttonStyle.color = isDisabled ? 'grey' : 'red';
    } else if (color) {
        buttonStyle.color = isDisabled ? 'grey' : color;
    }

    return (
        <TooltipIconButton
            variant="noBorder"
            tooltip={
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption">{title}</Typography>
                </Box>
            }
            onClick={authContext.admin && updating === false ? handleClick : null}
            style={buttonStyle}
            size={size}
            disabled={isDisabled}
        >
            {
                updating ?
                <AutorenewIcon fontSize="inherit" sx={{
                    animation: 'favoriteUpdate 1.2s linear infinite' // see styles.css for favoriteUpdate
                }}/> : 
                imageIsInPortfolio ?
                <StarIcon fontSize="inherit"/> :
                <StarBorderIcon fontSize="inherit" />
            }
        </TooltipIconButton>
    );
}

export default PortfolioButton;