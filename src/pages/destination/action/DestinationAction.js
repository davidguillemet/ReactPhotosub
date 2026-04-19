import {
    getFetchDestinationKey,
    DESTINATION_PROPS,
    SUB_GALLERY_INTENT_CREATE,
    SUB_GALLERY_INTENT_DELETE,
    SUB_GALLERY_INTENT_UPDATE,
    SUB_GALLERY_INTENT_UPDATE_INDICES,
    SUB_GALLERY_INTENT_UPDATE_IMAGES
} from "utils/destinations";

const updateCacheAfterSubGalleryMutation = async (currentCachedData, newSubGalleries) => ({
    images: currentCachedData.images, // Keep images as they are not impacted by sub gallery update
    galleries: newSubGalleries
});

const initializeIntentHandlers = (queryClient, dataProvider) => {

    const intentHandlers = new Map();
    intentHandlers.set(SUB_GALLERY_INTENT_UPDATE, {
        call: (formData) => dataProvider.updateSubGallery(formData),
        updateCache: updateCacheAfterSubGalleryMutation
    });
    intentHandlers.set(SUB_GALLERY_INTENT_CREATE, {
        call: (formData) => dataProvider.createSubGallery(formData),
        updateCache: updateCacheAfterSubGalleryMutation
    });
    intentHandlers.set(SUB_GALLERY_INTENT_UPDATE_INDICES, {
        call: (formData) => dataProvider.updateSubGalleryIndices(formData),
        updateCache: updateCacheAfterSubGalleryMutation
    });
    intentHandlers.set(SUB_GALLERY_INTENT_DELETE, {
        call: (formData) => dataProvider.deleteSubGallery(formData),
        updateCache: async (currentCachedData, newSubGalleries, formData) => ({
            galleries: newSubGalleries,
            // Remove sub_gallery_id for impacted images
            images: currentCachedData.images.map(image => {
                if (image.sub_gallery_id === formData.id) {
                    return { ...image, sub_gallery_id: null };
                }
                return image;
            })
        })
    });
    intentHandlers.set(SUB_GALLERY_INTENT_UPDATE_IMAGES, {
        call: (formData) => dataProvider.updateSubGalleryImages(formData),
        updateCache: async (currentCachedData, newSubGalleries, formData) => ({
            galleries: currentCachedData.galleries, // just use the previous sub galleries 
            // Update sub_gallery_id for impacted images
            images: currentCachedData.images.map(image => {
                if (formData.add?.indexOf(image.id) !== -1) {
                    return { ...image, sub_gallery_id: formData.galleryId };
                } else if (formData.remove?.indexOf(image.id) !== -1) {
                    return { ...image, sub_gallery_id: null };
                }
                return image;
            })
        })
    });

    return intentHandlers;
};

const validateFormData = (formData) => {
    if (!formData.destinationPath) {
        throw new Response("Bad Request: Missing destinationPath", { status: 400 });
    }
};

export const actionProperties = {
    initializeIntentHandlers,
    validateFormData,
    getQueryKey: (formData) => getFetchDestinationKey(formData.destinationPath, DESTINATION_PROPS.IMAGES)
};
