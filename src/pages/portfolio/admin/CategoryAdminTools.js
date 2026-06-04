import React from 'react';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { PORTFOLIO_CATEGORY_OTHER_KEY } from 'utils/portfolio';

const categoryAdminToolsFactory = (categories, onEditCategory, onClickDeleteCategory) => {

    const CategoryAdminTools = ({group}) => {

        const categoryKey = group.key;
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
            <Stack
                direction="row"
                spacing={0.5}
                sx={{
                    alignContent: "center",
                    alignItems: "center",
                    backgroundColor: theme => `${theme.palette.background.default}cc`,
                    borderRadius: '50vh',
                    padding: 1.5,
                    opacity: 0.8,
                    transition: 'opacity 0.3s',
                    '&:hover': {
                        opacity: 1,
                    }
                }}
            >
                {
                    group && group.images.length === 0 &&
                    <Tooltip
                        title={"Aucune image ne correspond à cette catégorie"}
                        placement="bottom"
                        slots={{
                            transition: Zoom
                        }}
                    >
                        <WarningIcon color="warning" sx={{ mr: 0.5}}/>
                    </Tooltip>
                }
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