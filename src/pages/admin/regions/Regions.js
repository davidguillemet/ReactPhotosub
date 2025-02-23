import React from 'react';
import { Box } from '@mui/system';
import { Button } from '@mui/material';
import { IconButton, Typography } from '@mui/material';
import useRegions from 'components/hooks/useRegions';
import { SimpleTreeView } from '@mui/x-tree-view';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReactQuery } from 'components/reactQuery';
import { useQueryContext } from 'components/queryContext';
import { buildLoadingState, withLoading } from 'components/hoc';
import { ConfirmDialog } from 'dialogs';
import { useTranslation, compareRegions, regionTitle, useLanguage } from 'utils';
import { HorizontalSpacing } from 'template/spacing';
import { EmptySquare, PlusSquare, MinusSquare } from './TreeViewIcons';
import StyledTreeItem from './StyledTreeItem';
import { useToast } from 'components/notifications';
import useFormDialog from 'dialogs/FormDialog';
import LocationForm from './LocationForm';
import RegionForm from './RegionForm';

function getRegionItemId(region) {
    return `region_${region.id}`;
}

function getLocationItemId(location) {
    return `location_${location.id}`;
}

const LocationItem = ({location, onEdit, onDelete}) => {

    const onClickEdit = React.useCallback((event) => {
        event.stopPropagation();
        onEdit(location);
    }, [location, onEdit]);

    const onClickDelete = React.useCallback((event) => {
        event.stopPropagation();
        onDelete(location);
    }, [location, onDelete]);

    const locationId = getLocationItemId(location);
    return (
        <StyledTreeItem
            itemId={locationId}
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                    <Box component={FmdGoodIcon} color="inherit" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                        {location.title}
                    </Typography>
                    <IconButton onClick={onClickEdit} size='small'>
                        <EditLocationAltIcon fontSize='inherit'/>
                    </IconButton>
                    <IconButton onClick={onClickDelete} size='small'>
                        <DeleteIcon fontSize='inherit'/>
                    </IconButton>
                </Box>
            }
        />
    )
};

const RegionItem = ({region, children, onEditLocation, onEditRegion, onDeleteRegion}) => {

    const { language } = useLanguage();
    const handleAddLocation = React.useCallback((event) => {
        event.stopPropagation();
        onEditLocation({ region: region.id });
    }, [onEditLocation, region]);

    const handleEditRegion = React.useCallback((event) => {
        event.stopPropagation();
        onEditRegion(region);
    }, [onEditRegion, region]);

    const handleDeleteRegion = React.useCallback((event) => {
        event.stopPropagation();
        onDeleteRegion(region);
    }, [onDeleteRegion, region]);

    const isEmpty = React.useMemo(() => children === null || children.every(child => child.length === 0), [children]);
    const regionId = getRegionItemId(region);

    const hasChildren = children?.length > 1 && (children[0]?.length > 0 || children[1]?.length > 0);

    return (
        <StyledTreeItem
            itemId={regionId}
            sx={{textAlign: 'left'}}
            icon={isEmpty ? <EmptySquare /> : null}
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                    <Box component={TravelExploreIcon} color="inherit" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                        {regionTitle(region, language)}
                    </Typography>
                    <IconButton onClick={handleAddLocation} size='small'>
                        <AddLocationAltIcon fontSize='inherit' />
                    </IconButton>
                    <IconButton onClick={handleEditRegion} size='small'>
                        <EditLocationAltIcon fontSize='inherit' />
                    </IconButton>
                    <IconButton onClick={handleDeleteRegion} size='small' disabled={hasChildren}>
                        <DeleteIcon fontSize='inherit'/>
                    </IconButton>
                </Box>
            }
        >
            { children }
        </StyledTreeItem>
    );
}

function buildTreeView(hierarchy, parentId, locations, onEditLocation, onEditRegion, onDeleteLocation, onDeleteRegion, language) {
    const levelNodes = hierarchy.filter(region => region.parent === parentId).sort(compareRegions(language));
    return levelNodes.map((node, index) => {
        return (
            <RegionItem
                key={node.id}
                region={node}
                onEditLocation={onEditLocation}
                onEditRegion={onEditRegion}
                onDeleteRegion={onDeleteRegion}
            >
                { buildTreeView(hierarchy, node.id, locations, onEditLocation, onEditRegion, onDeleteLocation, onDeleteRegion, language) }
                {
                    locations.filter(location => location.region === node.id).map((location, index) => {
                        const nodeId = getLocationItemId(location);
                        return <LocationItem
                                    key={nodeId}
                                    location={location}
                                    onEdit={onEditLocation}
                                    onDelete={onDeleteLocation}
                                />
                    })
                }
            </RegionItem>
        );
    });
}

const RegionsTreeView = withLoading(({regions, regionMap, locations}) => {
    const { language } = useLanguage();
    const t = useTranslation("pages.admin.regions");
    const { toast } = useToast();
    const queryContext = useQueryContext();
    const deleteLocationMutation = queryContext.useDeleteLocation();
    const deleteRegionMutation = queryContext.useDeleteRegion();

    const [locationToDelete, setLocationToDelete] = React.useState(null);
    const [locationToEdit, setLocationToEdit] = React.useState(null);
    const [regionToDelete, setRegionToDelete] = React.useState(null);
    const [regionToEdit, setRegionToEdit] = React.useState(null);
    const [expanded, setExpanded] = React.useState([]);

    const onDeleteLocation = React.useCallback(() => {
        return deleteLocationMutation.mutateAsync(locationToDelete)
            .then(() => {
                toast.success("Le lieu a bien été supprimé.")
            }).catch((e) => {
                toast.error(`Une erreur est survenue lors de la suppression du lieu: ${e.message}`);
            });
    }, [deleteLocationMutation, locationToDelete, toast]);

    const onDeleteRegion = React.useCallback(() => {
        return deleteRegionMutation.mutateAsync(regionToDelete)
            .then(() => {
                toast.success("La région a bien été supprimée.")
            }).catch((e) => {
                toast.error(`Une erreur est survenue lors de la suppression de la région: ${e.message}`);
            });
    }, [deleteRegionMutation, regionToDelete, toast]);

    const onConfirmDeleteLocationOpenChanged = React.useCallback((open) => {
        if (open === false) {
            setLocationToDelete(null);
        }
    }, []);

    const onConfirmDeleteRegionOpenChanged = React.useCallback((open) => {
        if (open === false) {
            setRegionToDelete(null);
        }
    }, []);

    const onCloseEditLocation = React.useCallback(() => {
        setLocationToEdit(null);
    }, []);

    const onCloseEditRegion = React.useCallback(() => {
        setRegionToEdit(null);
    }, []);

    const {
        dialogProps: locationDialogProps,
        openDialog: openLocationDialog,
        FormDialog: LocationFormDialog
    } = useFormDialog(onCloseEditLocation);

    const {
        dialogProps: regionDialogProps,
        openDialog: openRegionDialog,
        FormDialog: RegionFormDialog
    } = useFormDialog(onCloseEditRegion);

    const onEditLocation = React.useCallback((location) => {
        setLocationToEdit(location);
        openLocationDialog();
    }, [openLocationDialog]);

    const onEditRegion = React.useCallback((region) => {
        setRegionToEdit(region);
        openRegionDialog();
    }, [openRegionDialog]);

    const handleAddRegion = React.useCallback(() => {
        onEditRegion(null);
    }, [onEditRegion]);

    const handleExpandAllClick = React.useCallback(() => {
        setExpanded(regions.map(region => getRegionItemId(region)));
    }, [regions]);

    const handleCollapseAllClick = React.useCallback(() => {
        setExpanded([]);
    }, []);

    const handleExpandedItemsChange = React.useCallback((event, nodeIds) => {
        setExpanded(nodeIds);
    }, []);

    const handleNewLocation = React.useCallback((newLocation) => {
        // Get all parents of the location region
        const parentHierarchy = [];
        let currentParentId = newLocation.region;
        do {
            const parentRegion = regionMap.get(currentParentId);
            parentHierarchy.push(getRegionItemId(parentRegion))
            currentParentId = parentRegion.parent;
        } while(currentParentId !== null);
        setExpanded(prevNodeIds => {
            const regionSet = new Set(prevNodeIds);
            parentHierarchy.forEach(parent => regionSet.add(`${parent}`));
            return [...regionSet.values()];
        });
    }, [regionMap]);

    const handleNewRegion = React.useCallback((newRegion) => {
        const parentHierarchy = [];
        let currentParentId = newRegion.parent;
        while (currentParentId !== null) {
            const parentRegion = regionMap.get(currentParentId);
            parentHierarchy.push(getRegionItemId(parentRegion));
            currentParentId = parentRegion.parent;
        };
        setExpanded(prevNodeIds => {
            const regionSet = new Set(prevNodeIds);
            parentHierarchy.forEach(parent => regionSet.add(`${parent}`));
            return [...regionSet.values()];
        });
    }, [regionMap]);

    const getEditLocationDialogTitle = React.useCallback(() => {
        if (locationToEdit === null || locationToEdit.id === undefined) {
            return "Nouveau lieu"
        } else {
            return "Modifier le lieu"
        }
    }, [locationToEdit]);

    const getEditRegionDialogTitle = React.useCallback(() => {
        if (regionToEdit === null || regionToEdit.id === undefined) {
            return "Nouvelle région"
        } else {
            return "Modifier la région"
        }
    }, [regionToEdit]);

    return (
        <React.Fragment>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', mb: 1}}>
                <Button onClick={handleAddRegion}>Nouvelle Région</Button>
                <HorizontalSpacing factor={2} />
                <Button disabled={expanded.length === regions.length} onClick={handleExpandAllClick}>{t("expandAll")}</Button>
                <HorizontalSpacing factor={2} />
                <Button disabled={expanded.length === 0} onClick={handleCollapseAllClick}>{t("collapseAll")}</Button>
            </Box>
            <SimpleTreeView
                expandedItems={expanded}
                onExpandedItemsChange={handleExpandedItemsChange}
                slots={{
                    expandIcon: PlusSquare,
                    collapseIcon: MinusSquare,
                    endIcon: EmptySquare,
                }}
                sx={{ flexGrow: 1, overflowY: 'auto' }}
            >
                { buildTreeView(regions, null, locations, onEditLocation, onEditRegion, setLocationToDelete, setRegionToDelete, language) }
            </SimpleTreeView>
            <ConfirmDialog
                open={locationToDelete !== null}
                onOpenChanged={onConfirmDeleteLocationOpenChanged}
                onValidate={onDeleteLocation}
                title={t("title:deleteLocation")}
                dialogContent={[
                    t("confirmDeleteLocation", locationToDelete?.title),
                    t("warningDeleteLocation")
                ]}
            />
            <ConfirmDialog
                open={regionToDelete !== null}
                onOpenChanged={onConfirmDeleteRegionOpenChanged}
                onValidate={onDeleteRegion}
                title={t("title:deleteRegion")}
                dialogContent={[
                    t("confirmDeleteRegion", regionTitle(regionToDelete, language)),
                    t("warningDeleteRegion")
                ]}
            />
            <LocationFormDialog title={getEditLocationDialogTitle()} {...locationDialogProps} >
                <LocationForm
                    location={locationToEdit}
                    locations={locations}
                    regions={regions}
                    onNewLocation={handleNewLocation}
                />
            </LocationFormDialog>
            <RegionFormDialog title={getEditRegionDialogTitle()} {...regionDialogProps} >
                <RegionForm
                    region={regionToEdit}
                    regions={regions}
                    onNewRegion={handleNewRegion}
                />
            </RegionFormDialog>
        </React.Fragment>
    );
}, [buildLoadingState("regions", [undefined]), buildLoadingState("locations", [undefined])]);

const Regions = () => {
    const queryContext = useQueryContext();
    const [regionHierarchy, regionMap] = useRegions();
    const { data: locations } = useReactQuery(queryContext.useFetchLocations);
    return <RegionsTreeView regions={regionHierarchy} regionMap={regionMap} locations={locations} />
}

export default Regions;