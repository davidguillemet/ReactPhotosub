import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuthContext } from '../authentication';
import { usePortfolio } from 'providers';
import { useTranslation } from 'utils';
import { useGalleryContext } from './galleryContext';
import { PORTFOLIO_INTENT_ADD, PORTFOLIO_INTENT_REMOVE } from 'utils/portfolio/portfolioIntents';
import { parsePortfolioCategoryImageId } from 'utils/portfolio';
import ToggleActionButton from 'components/toggleActionButton';

const PortfolioButton = ({ image, size = 'medium', style, color }) => {

    const t = useTranslation("components.gallery");
    const authContext = useAuthContext();
    const { isInPortfolio, notifyObservers } = usePortfolio();
    const { portfolioSubmit, withFavorite } = useGalleryContext();

    const imageIsInPortfolio = React.useMemo(() => {
        return isInPortfolio(image);
    }, [isInPortfolio, image]);

    const handleAction = React.useCallback(() => {
        const updateIntent = imageIsInPortfolio ? PORTFOLIO_INTENT_REMOVE : PORTFOLIO_INTENT_ADD;
        const submitData = {
            intent: updateIntent,
            ids: [parsePortfolioCategoryImageId(image.id)]
        };
        return portfolioSubmit(submitData)
            .then(() => notifyObservers(submitData.ids, updateIntent))
    }, [portfolioSubmit, notifyObservers, imageIsInPortfolio, image]);

    const isDisabled = !withFavorite;

    return (
        <ToggleActionButton
            isActive={imageIsInPortfolio}
            isDisabled={isDisabled}
            canInteract={!!authContext.admin}
            title={imageIsInPortfolio ? t("btn:deleteFromPortfolio") : t("btn:addToPortfolio")}
            onAction={handleAction}
            activeIcon={<StarIcon fontSize="inherit" />}
            inactiveIcon={<StarBorderIcon fontSize="inherit" />}
            size={size}
            style={style}
            color={color}
        />
    );
};

export default PortfolioButton;
