import {
    TRANSIENT_PROPERTY_DB_INDEX,
    deleteTransientProperties,
    setDbIndex,
    getDbIndex
} from './common';


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

DataProvider.prototype.getDestinationDetailsFromPath = function(year, title) {
    return this.getDestinationProps(year, title, "head");
};

DataProvider.prototype.getDestinationImagesFromPath = function(year, title) {
    return this.getDestinationProps(year, title, "images");
};

DataProvider.prototype.getUserData = function(uid) {
    return this.axios.get(`/userdata/${uid}`)
    .then(response => {
        return response.data;
    });
};

DataProvider.prototype.addFavorite = function(path) {
    return this.axios.post('/favorites', { path: path })
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

DataProvider.prototype.getFavorites = function() {
    return this.axios.get('/favorites')
    .then(response => {
        return response.data;
    })
};

DataProvider.prototype.getSimulations = function() {
    return this.axios.get('/simulations')
    .then(response => {
        // we generate an index property that corresponds to the index in the db json array
        // this index we allow to identify any simulation for deletion or update
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

DataProvider.prototype.getUploadedInteriors = function() {
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
    return this.axios.get(`/thumbstatus/${fileName}`);
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
    return this.axios.post('/api/message', {
        ...messageProperties
    }).then(response => {
        return response.data;
    })
}

export default DataProvider;