import React from 'react';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { PORTFOLIO_INTENT_UPDATE_IMAGE_EXCLUDED_CATEGORIES } from 'utils/portfolio/portfolioIntents';
import { useAsyncFetcher } from 'components/reactRouter';
import { useToast } from 'components/notifications';
import { APP_ROUTE_PATH } from 'navigation/routes';


const CategoryImageAdminTools = ({image}) => {

    const toast = useToast();
    const { submit: fetcherSubmit } = useAsyncFetcher("portfolioImageCategoryExclusion", APP_ROUTE_PATH);
    const categoryKey = image.groupKey;
    const imageIsExcluded = React.useMemo(() => image.excluded_cats && image.excluded_cats.includes(categoryKey), [image, categoryKey]);
    const [ updating, setUpdating ] = React.useState(false);

    const onChangeCategoryImageVisibility = React.useCallback((image, excluded_cats) => {
        const submitData = {
            intent: PORTFOLIO_INTENT_UPDATE_IMAGE_EXCLUDED_CATEGORIES,
            ...image,
            excluded_cats
        };
        setUpdating(true);
        fetcherSubmit(submitData).catch(err => {
            // Empty... mutationCache is adding an error toast
            toast.error(err.message);
        }).finally(() => {
            setUpdating(false);
        });
    }, [fetcherSubmit, toast]);

    const onExcludeImageFromCategory = React.useCallback((image) => {
        onChangeCategoryImageVisibility(image, [...image.excluded_cats, image.groupKey]);
    }, [onChangeCategoryImageVisibility]);

    const onIncludeImageInCategory = React.useCallback((image) => {
        onChangeCategoryImageVisibility(image, image.excluded_cats.filter(catKey => catKey !== image.groupKey));
    }, [onChangeCategoryImageVisibility]);

    const handleOnToggleImageVisibility = React.useCallback(() => {
        if (imageIsExcluded) {
            onIncludeImageInCategory(image);
        } else {
            onExcludeImageFromCategory(image);
        }
    }, [image, imageIsExcluded, onIncludeImageInCategory, onExcludeImageFromCategory]);

    return (
        <IconButton onClick={handleOnToggleImageVisibility} loading={updating} >
            {imageIsExcluded ? <VisibilityOffIcon color="error" /> : <VisibilityIcon color="success" />}
        </IconButton>
    );
};

export default CategoryImageAdminTools;