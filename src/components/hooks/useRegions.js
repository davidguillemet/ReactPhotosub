import { useEffect, useState } from 'react';
import { useQueryContext } from '../queryContext';

const compareRegions = (a, b) => a.title === b.title ? 0 : a.title < b.title ? -1 : 1;

function insertChildren(parent, hierarchy, regionList) {
    const currentLevel = parent !== null ? parent.level + 1 : 0;
    const parentId = parent !== null ? parent.id : null;
    const children = regionList.filter(region => region.parent === parentId).sort(compareRegions);
    for (let childIndex = 0; childIndex < children.length; childIndex++) {
        const child = children[childIndex];
        child.level = currentLevel;
        hierarchy.push(child);
        insertChildren(child, hierarchy, regionList);
    }
}

function buildHierarchy(regionList) {
    const hierarchy = [];
    insertChildren(null, hierarchy, regionList);
    return hierarchy;
}

const useRegions = () => {

    const queryContext = useQueryContext();
    const [regions, setRegions] = useState({
        hierarchy: undefined,
        map: undefined
    });

    // Executed only once to get regions
    const { isLoading, data } = queryContext.useFetchRegions();
    
    useEffect(() => {
        if (isLoading === true) {
            return;
        }

        // Build the region map (region id -> region)
        const regionMap = new Map();
        data.forEach(region => {
            regionMap.set(region.id, region);
        })

        const hierarchy = buildHierarchy(data);

        setRegions({
            hierarchy: hierarchy,
            map: regionMap
        })
    }, [isLoading, data]);
    
    return [
        regions.hierarchy,
        regions.map
    ];
}

export default useRegions;