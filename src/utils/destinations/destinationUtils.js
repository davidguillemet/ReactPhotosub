export const DESTINATION_QUERY_BASE_KEY = "destination";

export const DESTINATION_PROPS = {
    HEADER: "header",
    DESC: "desc",
    IMAGES: "images"
};

export const getFetchDestinationKey = (path, props) => {
    return [
        DESTINATION_QUERY_BASE_KEY,
        path,
        props
    ];
};

// A destination key is like [ "destination", "<year>/<title>", "<props>" ]
export const isDestinationKey = (queryKey, path) => {
    return  queryKey.length >= 3 &&
            queryKey[0] === DESTINATION_QUERY_BASE_KEY &&
            queryKey[1] === path;
            // We could also check the props is defined as DESTINATION_PROPS property...
};
