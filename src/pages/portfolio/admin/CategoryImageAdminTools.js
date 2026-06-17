import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { PORTFOLIO_INTENT_UPDATE_IMAGE_EXCLUDED_CATEGORIES } from 'utils/portfolio/portfolioIntents';
import { useAsyncFetcher } from 'components/reactRouter';
import { APP_ROUTE_PATH } from 'navigation/routes';
import ToggleActionButton from 'components/toggleActionButton';
import { useTranslation } from 'utils';


const CategoryImageAdminTools = ({image}) => {

    const t = useTranslation("pages.portfolio.admin");
    const { submit: fetcherSubmit } = useAsyncFetcher("portfolioImageCategoryExclusion", APP_ROUTE_PATH);
    const categoryKey = image.groupKey;
    const imageIsExcluded = React.useMemo(() => image.excluded_cats && image.excluded_cats.includes(categoryKey), [image, categoryKey]);

    const onChangeCategoryImageVisibility = React.useCallback((image, excluded_cats) => {
        const submitData = {
            intent: PORTFOLIO_INTENT_UPDATE_IMAGE_EXCLUDED_CATEGORIES,
            ...image,
            excluded_cats
        };
        return fetcherSubmit(submitData);
    }, [fetcherSubmit]);

    const onExcludeImageFromCategory = React.useCallback((image) => {
        return onChangeCategoryImageVisibility(image, [...image.excluded_cats, image.groupKey]);
    }, [onChangeCategoryImageVisibility]);

    const onIncludeImageInCategory = React.useCallback((image) => {
        return onChangeCategoryImageVisibility(image, image.excluded_cats.filter(catKey => catKey !== image.groupKey));
    }, [onChangeCategoryImageVisibility]);

    const handleOnToggleImageVisibility = React.useCallback(() => {
        if (imageIsExcluded) {
            return onIncludeImageInCategory(image);
        } else {
            return onExcludeImageFromCategory(image);
        }
    }, [image, imageIsExcluded, onIncludeImageInCategory, onExcludeImageFromCategory]);

    return (
        <ToggleActionButton
            isActive={imageIsExcluded}
            isDisabled={false}
            canInteract={true}
            title={imageIsExcluded ? t("btn:includeInCategory") : t("btn:excludeFromCategory")}
            onAction={handleOnToggleImageVisibility}
            activeIcon={<VisibilityOffIcon color="error" />}
            inactiveIcon={<VisibilityIcon color="success" />}
        />
    );
};

export default CategoryImageAdminTools;