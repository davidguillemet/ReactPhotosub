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

DataProvider.prototype.getDestinationProps = function(year, title, props) {
    return this.axios.get(`/destination/${year}/${title}/${props}`)
    .then(response => {
        return response.data;
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

DataProvider.prototype.getDestinationDescFromPath = function(year, title) {
    return this.getDestinationProps(year, title, "desc");
};

DataProvider.prototype.getDestinationDetailsFromPath = function(year, title) {
    return this.getDestinationProps(year, title, "head");
};

DataProvider.prototype.getDestinationImagesFromPath = function(year, title) {
    return this.getDestinationProps(year, title, "images");
};

DataProvider.prototype.updateDestination = function(destination) {
    return this.axios.put('/admin/destinations', destination);
}

DataProvider.prototype.createDestination = function(destination) {
    return this.axios.post('/admin/destinations', destination)
    .then(response => {
        return response.data; // contains the new destination
    });
}

DataProvider.prototype.deleteDestination = function(destinationId) {
    return this.axios.delete('/admin/destinations', {data: { id: destinationId } })
    .then(response => {
        return response.data; // contains the new destination
    });
}

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
    // NOTE: this request shoudl not be triggered...
    // the query data is initialized when getting user data at login time
    if (uid === null) {
        return Promise.resolve([]);
    }
    return this.axios.get('/favorites')
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
    deleteTransientProperties(newSimulation);
    return this.axios.post('/simulations', newSimulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
    });
}

DataProvider.prototype.updateSimulation = function(simulation) {
    // Delete transient properties but keep dbindex
    deleteTransientProperties(simulation, [TRANSIENT_PROPERTY_DB_INDEX]);
    // Here, simulation should contain an index property
    return this.axios.post('/simulations', simulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
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

DataProvider.prototype.waitForThumbnails = function(fileName) {
    return this.axios.get(`/thumbstatus/${fileName}`, {
        timeout: 60000, // Specific timeout for this request
    }).then(response => {
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

export default DataProvider;