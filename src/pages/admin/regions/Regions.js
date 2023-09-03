import React from 'react';
import { Box } from '@mui/system';
import { Button } from '@mui/material';
import { IconButton, Typography } from '@mui/material';
import useRegions from 'components/hooks/useRegions';
import TreeView from '@mui/lab/TreeView';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReactQuery } from 'components/reactQuery';
import { useQueryContext } from 'components/queryContext';
import { buildLoadingState, withLoading } from 'components/hoc';
import { ConfirmDialog } from 'dialogs';
import EditLocationDialog from './EditLocationDialog';
import { useTranslation, compareRegions, regionTitle, useLanguage } from 'utils';
import { HorizontalSpacing } from 'template/spacing';
import { EmptySquare, PlusSquare, MinusSquare } from './TreeViewIcons';
import StyledTreeItem from './StyledTreeItem';
import { useToast } from 'components/notifications';

const LocationItem = ({location, onEdit, onDelete}) => {

    const onClickEdit = React.useCallback((event) => {
        event.stopPropagation();
        onEdit(location);
    }, [location, onEdit]);

    const onClickDelete = React.useCallback((event) => {
        event.stopPropagation();
        onDelete(location);
    }, [location, onDelete]);

    const nodeId = `location_${location.id}`;
    return (
        <StyledTreeItem
            nodeId={nodeId} 
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                    <Box component={FmdGoodIcon} color="inherit" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                        {location.title}
                    </Typography>
                    <IconButton onClick={onClickEdit}>
                        <EditLocationAltIcon />
                    </IconButton>
                    <IconButton onClick={onClickDelete}>
                        <DeleteIcon />
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
    const regionId = `${region.id}`;

    return (
        <StyledTreeItem
            nodeId={regionId} sx={{textAlign: 'left'}}
            icon={isEmpty ? <EmptySquare /> : null}
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                    <Box component={TravelExploreIcon} color="inherit" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                        {regionTitle(region, language)}
                    </Typography>
                    <IconButton onClick={onAddLocation}>
                        <AddLocationAltIcon />
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
                        const nodeId = `location_${location.id}`;
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
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
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
        setEditDialogOpen(false);
        setLocationToEdit(null);
    }, []);

    const onEditLocation = React.useCallback((location) => {
        setLocationToEdit(location);
        setEditDialogOpen(true);
    }, []);

    const handleExpandAllClick = React.useCallback(() => {
        setExpanded(regions.map(region => `${region.id}`));
    }, [regions]);

    const handleCollapseAllClick = React.useCallback(() => {
        setExpanded([]);
    }, []);

    const handleNodeToggle = React.useCallback((event, nodeIds) => {
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

    return (
        <React.Fragment>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', mb: 1}}>
                <Button variant="outlined" disabled={expanded.length === regions.length} onClick={handleExpandAllClick}>{t("expandAll")}</Button>
                <HorizontalSpacing factor={2} />
                <Button variant="outlined" disabled={expanded.length === 0} onClick={handleCollapseAllClick}>{t("collapseAll")}</Button>
            </Box>
            <TreeView
                expanded={expanded}
                onNodeToggle={handleNodeToggle}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                sx={{ flexGrow: 1, overflowY: 'auto' }}
            >
                { buildTreeView(regions, null, locations, onEditLocation, setLocationToDelete, language) }
            </TreeView>
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
            <EditLocationDialog
                open={editDialogOpen}
                location={locationToEdit}
                locations={locations}
                regions={regions}
                onClose={onCloseEditLocation}
                onNewLocation={handleNewLocation}
            />
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