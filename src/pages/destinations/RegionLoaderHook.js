import { useState, useEffect } from 'react';
import dataProvider from '../../dataProvider';

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

const useRegions = (user, simulations, listType) => {

    const [regions, setRegions] = useState({
        hierarchy: [],
        map: null
    });

    // Executed only once to get regions
    useEffect(() => {
        dataProvider.getRegions().then(items => {

            // Build the region map (region id -> region)
            const regionMap = new Map();
            items.forEach(region => {
                regionMap.set(region.id, region);
            })

            const hierarchy = buildHierarchy(items);

            setRegions({
                hierarchy: hierarchy,
                map: regionMap
            })
        })
    }, []);
    
    return [
        regions.hierarchy,
        regions.map
    ];
}

export default useRegions;