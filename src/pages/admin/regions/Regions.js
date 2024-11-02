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

const RegionItem = ({region, children, onEdit}) => {

    const { language } = useLanguage();
    const onAddLocation = React.useCallback((event) => {
        event.stopPropagation();
        onEdit({ region: region.id });
    }, [onEdit, region]);

    const isEmpty = React.useMemo(() => children === null || children.every(child => child.length === 0), [children]);
    const regionId = getRegionItemId(region);

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
                    <IconButton onClick={onAddLocation} size='small'>
                        <AddLocationAltIcon fontSize='inherit' />
                    </IconButton>
                </Box>
            }
        >
            { children }
        </StyledTreeItem>
    );
}

function buildTreeView(hierarchy, parentId, locations, onEdit, onDelete, language) {
    const levelNodes = hierarchy.filter(region => region.parent === parentId).sort(compareRegions(language));
    return levelNodes.map((node, index) => {
        return (
            <RegionItem key={node.id} region={node} onEdit={onEdit}>
                { buildTreeView(hierarchy, node.id, locations, onEdit, onDelete, language) }
                {
                    locations.filter(location => location.region === node.id).map((location, index) => {
                        const nodeId = getLocationItemId(location);
                        return <LocationItem
                                    key={nodeId}
                                    location={location}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
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

    const [locationToDelete, setLocationToDelete] = React.useState(null);
    const [locationToEdit, setLocationToEdit] = React.useState(null);
    const [expanded, setExpanded] = React.useState([]);

    const onDeleteLocation = React.useCallback(() => {
        return deleteLocationMutation.mutateAsync(locationToDelete)
            .then(() => {
                toast.success("Le lieu a bien été supprimé.")
            });
    }, [deleteLocationMutation, locationToDelete, toast]);

    const onConfirmDeleteOpenChanged = React.useCallback((open) => {
        if (open === false) {
            setLocationToDelete(null);
        }
    }, []);

    const onCloseEditLocation = React.useCallback(() => {
        setLocationToEdit(null);
    }, []);

    const { dialogProps, openDialog, FormDialog } = useFormDialog(onCloseEditLocation);

    const onEditLocation = React.useCallback((location) => {
        setLocationToEdit(location);
        openDialog();
    }, [openDialog]);

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
            parentHierarchy.push(currentParentId)
            const parentRegion = regionMap.get(currentParentId);
            currentParentId = parentRegion.parent;
        } while(currentParentId !== null);
        setExpanded(prevNodeIds => {
            const regionSet = new Set(prevNodeIds);
            parentHierarchy.forEach(parent => regionSet.add(`${parent}`));
            return [...regionSet.values()];
        });
    }, [regionMap]);

    const getEditDialogTitle = React.useCallback(() => {
        if (locationToEdit === null || locationToEdit.id === undefined) {
            return "Nouveau lieu"
        } else {
            return "Modifier le lieu"
        }
    }, [locationToEdit]);

    return (
        <React.Fragment>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', mb: 1}}>
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
                { buildTreeView(regions, null, locations, onEditLocation, setLocationToDelete, language) }
            </SimpleTreeView>
            <ConfirmDialog
                open={locationToDelete !== null}
                onOpenChanged={onConfirmDeleteOpenChanged}
                onValidate={onDeleteLocation}
                title={t("title:deleteLocation")}
                dialogContent={[
                    t("confirmDeleteLocation", locationToDelete?.title),
                    t("warningDeleteLocation")
                ]}
            />
            <FormDialog title={getEditDialogTitle()} {...dialogProps} >
                <LocationForm
                    location={locationToEdit}
                    locations={locations}
                    regions={regions}
                    onNewLocation={handleNewLocation}
                />
            </FormDialog>
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