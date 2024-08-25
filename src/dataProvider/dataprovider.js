import {
    TRANSIENT_PROPERTY_DB_INDEX,
    deleteTransientProperties,
    setDbIndex,
    getDbIndex
} from './common';
import qs from 'qs';

function _addSimulationDbIndex(simulations) {
    simulations.forEach((simulation, index) => {
        setDbIndex(simulation, index);
    });
    return simulations;
}

function DataProvider(axiosInstance) {
    this.axios = axiosInstance
}

DataProvider.prototype.getDestinationProps = function(infoArray, props) {
    const destinationInfo = infoArray.reduce((acc, info) => acc + info + "/", "");
    const serviceUrl = `/destination/${destinationInfo}${props}`;
    return this.axios.get(serviceUrl)
    .then(response => {
        if (response.status === 204) {
            return null;
        } else {
            return response.data;
        }
    })
};

DataProvider.prototype.getDestinations = function() {
    return this.axios.get("/destinations")
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.getRelatedDestinations = function(regions, macro, wide) {
    return this.axios.get("/destinations/related", {
        params:{
            region: regions.map(region => region.id),
            macro: macro,
            wide: wide
        },
        paramsSerializer: function(params) {
            return qs.stringify(params, {arrayFormat: 'repeat'})
        }
    })
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.getRegions = function() {
    return this.axios.get("/regions")
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.getLocations = function() {
    return this.axios.get("/locations")
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.getDestinationDescFromPath = function(destinationPath) {
    return this.getDestinationProps([destinationPath], "desc");
};

DataProvider.prototype.getDestinationDetailsFromPath = function(destinationPath) {
    return this.getDestinationProps([destinationPath], "head");
};

DataProvider.prototype.getDestinationImagesFromPath = function(destinationPath) {
    return this.getDestinationProps([destinationPath], "images");
};

DataProvider.prototype.getDestinationSubGalleries = function(id) {
    return this.getDestinationProps([id], "galleries");
};

DataProvider.prototype.getUserData = function() {
    return this.axios.get(`/userdata`)
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.addFavorite = function(pathArray) {
    return this.axios.post('/favorites', pathArray )
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.removeFavorite = function(path) {
    return this.axios.delete('/favorites', {data: { path: path } } )
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.getFavorites = function(uid) {
    // NOTE: this request should not be triggered...
    // the query data cache is hydrated from userdata response when getting user data at login time
    if (uid === null) {
        return Promise.resolve([]);
    }
    return this.axios.get(`/favorites/${uid}`)
    .then(response => {
        return response.data;
    })
};

DataProvider.prototype.getSimulations = function(uid) {
    if (uid === null) {
        return Promise.resolve([]);
    }
    return this.axios.get('/simulations')
    .then(response => {
        // we generate an index property that corresponds to the index in the db json array
        // this index will be used as a simulation identifier for deletion / update
        return _addSimulationDbIndex(response.data.simulations);
    });
}

DataProvider.prototype.addSimulation = function(newSimulation) {
    const rollbackFunc = deleteTransientProperties(newSimulation);
    return this.axios.post('/simulations', newSimulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
    }).catch((error) => {
        rollbackFunc();
        throw error;
    });
}

DataProvider.prototype.updateSimulation = function(simulation) {
    // Delete transient properties but keep dbindex
    const rollbackFunc = deleteTransientProperties(simulation, [TRANSIENT_PROPERTY_DB_INDEX]);
    // Here, simulation should contain an index property
    return this.axios.post('/simulations', simulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
    }).catch((error) => {
        rollbackFunc();
        throw error;
    });
}

DataProvider.prototype.removeSimulation = function(simulation) {
    return this.axios.delete('/simulations', {data: { index: getDbIndex(simulation) } })
    .then(response => {
        return _addSimulationDbIndex(response.data);
    });
}

DataProvider.prototype.getImageCount = function() {
    return this.axios.get('/images')
    .then(response => {
        return response.data.count;
    })
}

DataProvider.prototype.getInteriors = function() {
    return this._getBucketContent('interiors');
}

DataProvider.prototype.getUploadedInteriors = function(uid) {
    if (uid === null) {
        return Promise.resolve([]);
    }
    return this.axios.get('/uploadedInteriors')
    .then(response => {
        return response.data;
    });
}

DataProvider.prototype.removeUploadedInterior = function(fileName) {
    return this.axios.delete('/uploadedInteriors', {data: { fileName: fileName } })
}

DataProvider.prototype.getImageDefaultSelection = function() {
    return this._getBucketContent('homeslideshow');
}

DataProvider.prototype._getBucketContent = function(folder) {
    return this.axios.get(`/bucket/${folder}`)
    .then(response => {
        return response.data;
    });
}

DataProvider.prototype.searchImages = function(pageIndex, query, pageSize, exact, processId) {
    return this.axios.post('/search', {
        query: query,
        page: pageIndex,
        pageSize: pageSize,
        exact: exact,
        processId: processId
    }).then(response => {
        return response.data;
    })
}

DataProvider.prototype.sendMessage = function(messageProperties) {
    return this.axios.post('/message', {
        ...messageProperties
    }).then(response => {
        return response.data;
    })
}

DataProvider.prototype.getImageFolders = function() {
    return this.axios.get('/images/folders')
    .then(response => {
        return response.data;
    })
}

DataProvider.prototype.updateUser = function(user) {
    return this.axios.put('/user', user);
}


//  ADMIN //

// Destinations
DataProvider.prototype.createDestination = function(destination) {
    return this.axios.post('/admin/destinations', destination)
    .then(response => {
        return response.data; // contains the new destinations
    });
}
DataProvider.prototype.updateDestination = function(destination) {
    return this.axios.put('/admin/destinations', destination);
}
DataProvider.prototype.deleteDestination = function(destinationId) {
    return this.axios.delete('/admin/destinations', {data: { id: destinationId } })
    .then(response => {
        return response.data; // contains the deleted destination
    });
}

// Locations
DataProvider.prototype.createLocation = function(location) {
    return this.axios.post('/admin/locations', location)
    .then(response => {
        return response.data; // contains the new locations
    });
}
DataProvider.prototype.updateLocation = function(location) {
    return this.axios.put('/admin/locations', location);
}
DataProvider.prototype.deleteLocation = function(locationId) {
    return this.axios.delete('/admin/locations', {data: { id: locationId } })
    .then(response => {
        return response.data; // contains the deleted location
    });
}

// Sub Galleries
DataProvider.prototype.createSubGallery = function(subGallery) {
    return this.axios.post('/admin/sub_galleries', subGallery)
    .then(response => {
        return response.data; // contains the new sub galleries
    });
}
DataProvider.prototype.updateSubGallery = function(subGallery) {
    return this.axios.put('/admin/sub_galleries', subGallery)
    .then(response => {
        return response.data; // contains the new sub galleries
    });
}
DataProvider.prototype.updateSubGalleryIndices = function(patchInfos) {
    return this.axios.patch('/admin/sub_galleries', patchInfos)
    .then(response => {
        return response.data;
    });
}
DataProvider.prototype.updateSubGalleryImages = function(patchInfos) {
    return this.axios.patch('/admin/sub_galleries/images', patchInfos)
    .then(response => {
        return response.data;
    });
}
DataProvider.prototype.deleteSubGallery = function(subGallery) {
    return this.axios.delete('/admin/sub_galleries', { data: { ...subGallery }})
    .then(response => {
        return response.data;
    });
}

// Images / Thumbnails
DataProvider.prototype.insertImageInDatabase = function(fullPath) {
    return this.axios.post('/admin/images', { fullPath })
    .then (response => {
        // The response contains the inserted image
        // {
        //     "name": "DSC_9149.jpg",
        //     "path": "2026/essai1",
        //     "title": "",
        //     "description": "",
        //     "tags": <string arrray>,
        //     "caption": null,
        //     "captionTags": null,
        //     "width": 1328,
        //     "height": 2000,
        //     "sizeRatio": 0.664,
        //     "create": "2012-09-01T18:21:06.00"
        // }
        return response.data; // contains the inserted image
    });
}
// Update image properties (tags, title, etc)
DataProvider.prototype.updateImageProperties = function(image) {
    return this.axios.put('/admin/images', image )
    .then (response => {
        // Contains the updated image
        return response.data;
    });
}
DataProvider.prototype.removeImageFromDatabase = function(fullPath) {
    return this.axios.delete('/admin/images', {data: {path: fullPath}});
}
// Refresh thumbnails should not be an Admin API since it can be called in simulations,
// to generate uploaded interior thumbnails
DataProvider.prototype.refreshThumbnails = function(fullPath) {
    return this.axios.patch('/admin/images', {
        fullPath,
    });
}
DataProvider.prototype.createInteriorThumbnails = function(fullPath) {
    return this.axios.patch('/admin/interiors', {
        fullPath,
    }).then(response => {
        return response.data; // Contains the size ratio of the original interior
    });
}

DataProvider.prototype.getImageErrors = function() {
    return this.axios.get('admin/images/errors')
    .then(response => response.data);
}

// Storage
// It seems it is not possible to remove a folder using the Firebase API
// We use our own API to use the Storage SDK to remove files and folders
DataProvider.prototype.removeStorageItem = function(folderFullPath) {
    return this.axios.delete('/admin/bucket', {data: { path: folderFullPath } })
}
DataProvider.prototype.renameFolder = function(folder, newName) {
    return this.axios.patch(`/admin/bucket/${folder}`, {
        name: newName
    });
}

DataProvider.prototype.getUsers = function() {
    return this.axios.get('/admin/users')
    .then(response => response.data.users);
}

export default DataProvider;