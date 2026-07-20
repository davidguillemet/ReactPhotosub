import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import useFormDialog from 'dialogs/FormDialog';
import ConfirmDialog from 'dialogs/ConfirmDialog';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';
import CollectionForm from './CollectionForm';

const CollectionManager = ({
    collections: collectionsProp,
    viewedCollectionId: viewedCollectionIdProp,
    onView,
    readOnly = false,
    username = null,
}) => {
    const tCol = useTranslation("pages.favorites.collections");
    const favoritesContext = useFavorites();
    const {
        activeCollectionId,
        viewedCollectionId: ownViewedCollectionId,
        collections: ownCollections,
        viewCollection,
        activateCollection,
        deleteCollection,
    } = favoritesContext;

    const collections = collectionsProp ?? ownCollections;
    const viewedCollectionId = viewedCollectionIdProp ?? ownViewedCollectionId;

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [settingActive, setSettingActive] = useState(null); // id being set as active
    // formTarget: null (create) | {id, name_fr, name_en} (edit)
    const [formTarget, setFormTarget] = useState(null);

    const { dialogProps, openDialog, FormDialog } = useFormDialog();

    const lang = tCol.language;

    const collectionLabel = useCallback((id) => {
        if (!id || id === 'main') return tCol("main");
        const item = collections?.items?.[id];
        if (!item) return id;
        return lang === 'fr' ? item.name_fr : item.name_en;
    }, [collections, lang, tCol]);

    const collectionPathCount = useCallback((id) => {
        if (id === 'main') return 0;
        return collections?.items?.[id]?.paths?.length ?? 0;
    }, [collections]);

    const handleView = useCallback((id) => {
        if (readOnly && onView) {
            onView(id);
        } else {
            viewCollection(id);
        }
    }, [readOnly, onView, viewCollection]);

    const handleSetActive = useCallback(async (e, id) => {
        e.stopPropagation();
        setSettingActive(id);
        try {
            await activateCollection(id);
        } finally {
            setSettingActive(null);
        }
    }, [activateCollection]);

    const handleDeleteRequest = useCallback((e, id) => {
        e.stopPropagation();
        setDeleteTarget({ id, name: collectionLabel(id), count: collectionPathCount(id) });
    }, [collectionLabel, collectionPathCount]);

    const openCreate = useCallback(() => {
        setFormTarget(null);
        openDialog();
    }, [openDialog]);

    const openEdit = useCallback((e, id) => {
        e.stopPropagation();
        const item = collections?.items?.[id];
        if (!item) return;
        setFormTarget({ id, name_fr: item.name_fr, name_en: item.name_en });
        openDialog();
    }, [collections, openDialog]);

    const collectionIds = ['main', ...Object.keys(collections?.items ?? {})];

    return (
        <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TableContainer sx={{ backgroundColor: 'background.paper', width: { xs: '100%', sm: '50%' } }}>
                <Table
                    size="small"
                    sx={{
                        borderStyle: 'solid',
                        borderWidth: 1,
                        borderColor: 'divider',
                        '& tr:last-child td': {
                            borderBottom: 'none',
                        },
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.paperLight' }}>
                            <TableCell
                                colSpan={readOnly ? 1 : 2}
                                align="center"
                                sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}
                            >
                                {username ? tCol("title:other", username) : tCol("title")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {collectionIds.map((id) => {
                            const isActive = id === activeCollectionId;
                            const isViewed = id === viewedCollectionId;
                            const isMain = id === 'main';
                            const isSettingActive = settingActive === id;
                            return (
                                <TableRow
                                    key={id}
                                    selected={isViewed}
                                    onClick={() => handleView(id)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        {collectionLabel(id)}
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                            <Tooltip title={tCol("btn:setActive")}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleSetActive(e, id)}
                                                        disabled={isActive || settingActive !== null}
                                                        variant="noBorder"
                                                    >
                                                        {isSettingActive
                                                            ? <CircularProgress size={16} />
                                                            : isActive
                                                                ? <StarIcon fontSize="small" color="primary" />
                                                                : <StarBorderIcon fontSize="small" />
                                                        }
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            {!isMain && (
                                                <>
                                                    <Tooltip title={tCol("btn:edit")}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => openEdit(e, id)}
                                                            disabled={settingActive !== null}
                                                            variant="noBorder"
                                                        >
                                                            <EditOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={tCol("btn:delete")}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleDeleteRequest(e, id)}
                                                            disabled={settingActive !== null}
                                                            variant="noBorder"
                                                        >
                                                            <DeleteOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                        {!readOnly && (
                            <TableRow
                                onClick={openCreate}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        '& .MuiTableCell-root': { color: 'primary.contrastText' },
                                    },
                                }}
                            >
                                <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                        <AddIcon fontSize="small" />
                                        {tCol("btn:new")}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!readOnly && (
                <>
                    <FormDialog
                        title={formTarget ? tCol("btn:edit") : tCol("btn:new")}
                        {...dialogProps}
                        maxWidth="sm"
                    >
                        <CollectionForm
                            key={formTarget ? formTarget.id : 'create'}
                            collection={formTarget}
                        />
                    </FormDialog>
                </>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title={deleteTarget?.name}
                dialogContent={[
                    deleteTarget
                        ? deleteTarget.count === 1
                            ? tCol("confirm:deleteOne", deleteTarget.name)
                            : tCol("confirm:delete", [deleteTarget.name, deleteTarget.count])
                        : '',
                ]}
                onOpenChanged={(open) => { if (!open) setDeleteTarget(null); }}
                onValidate={() => deleteTarget && deleteCollection(deleteTarget.id)}
            />
        </Box>
    );
};

export default CollectionManager;
