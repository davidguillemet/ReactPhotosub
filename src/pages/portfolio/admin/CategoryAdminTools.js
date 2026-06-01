import React from 'react';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { PORTFOLIO_CATEGORY_OTHER_KEY } from 'utils/portfolio';

const categoryAdminToolsFactory = (categories, onEditCategory, onClickDeleteCategory) => {

    const CategoryAdminTools = ({categoryKey}) => {

        const category = React.useMemo(() => categories.find(cat => cat.key === categoryKey), [categoryKey]);

        const handleOnEditCategory = React.useCallback(() => {
            onEditCategory(category);
        }, [category]);

        const handleOnClickDeleteCategory = React.useCallback(() => {
            onClickDeleteCategory(category);
        }, [category]);

        if (categoryKey === PORTFOLIO_CATEGORY_OTHER_KEY) {
            return null;
        }

        return (
            <Stack direction="row" spacing={0.5} sx={{ alignContent: "center"}} >
                <IconButton onClick={handleOnEditCategory}>
                    <EditIcon></EditIcon>
                </IconButton>
                <IconButton onClick={handleOnClickDeleteCategory}>
                    <DeleteIcon></DeleteIcon>
                </IconButton>
            </Stack>
        );
    };

    return CategoryAdminTools;

};

export default categoryAdminToolsFactory;