module.exports = function(admin, config) {
    const fetchAllSubGalleries = require("../utils/fetchSubGalleries")(config);

    const {getSubGalleryPropsToUpdate} = require("../utils/updateUtils")(config);

    const updateImagesPromise = (ids, galleryId) => {
        return config.pool("images")
            .whereIn("id", ids)
            .update("sub_gallery_id", galleryId);
    };

    admin.route("/sub_galleries")
        // Create a new sub-gallery (admin task)
        .post(async function(req, res, next) {
            const subGallery = req.body;
            res.locals.errorMessage = `Failed to insert sub gallery ${subGallery.title}.`;
            return config.pool("sub_galleries")
                .returning("id")
                .insert(subGallery)
                .then((data) => {
                    return fetchAllSubGalleries(subGallery.destination_id, req, res, next);
                })
                .catch(next);
        })
        // Update a sub-gallery (admin task)
        .put(async function(req, res, next) {
            const subGallery = req.body;
            res.locals.errorMessage = `Failed to update sub gallery ${subGallery.title}.`;
            const subGalleryUpdate = await getSubGalleryPropsToUpdate(subGallery);
            return config.pool("sub_galleries")
                .where("id", subGallery.id)
                .update(subGalleryUpdate)
                .then(() => {
                    return fetchAllSubGalleries(subGallery.destination_id, req, res, next);
                }).catch(next);
        })
        .patch(async function(req, res, next) {
            const patchPayload = req.body;
            // {
            //   destination: <destination>,
            //   update: [
            //     {id: <id>, index: <index> },
            //     {id: <id>, index: <index> },
            //   ]
            // }
            const patchInfos = patchPayload.update;
            return config.pool().raw(
                `update sub_galleries as sg set
                    index = i.index
                 from (values
                    (?::integer, ?::integer),
                    (?::integer, ?::integer)
                 ) as i(id, index)
                 where i.id = sg.id`, [patchInfos[0].id, patchInfos[0].index, patchInfos[1].id, patchInfos[1].index])
                .then(() => {
                    return fetchAllSubGalleries(patchPayload.destination.id, req, res, next);
                }).catch(next);
        })
        // Delete a sub-gallery (admin task)
        .delete(function(req, res, next) {
            const removedGallery = req.body;
            res.locals.errorMessage = `Failed to delete sub-gallery ${removedGallery.id}.`;
            return config.pool("sub_galleries")
                .where("id", removedGallery.id)
                .del()
                .then(() => {
                    return fetchAllSubGalleries(removedGallery.destination_id, req, res, next);
                }).catch(next);
        });

    admin.route("/sub_galleries/images")
        // Update images for a given sub-gallery
        .patch(async function(req, res, next) {
            const patchInfos = req.body;
            // {
            //   galleryId: <sub-gallery id>,
            //   add: [imageId1, imageId2, ...],
            //   remove: [imageId3, imageId4, ...]
            // }
            const updatePromises = [];
            if (patchInfos.add && patchInfos.add.length > 0) {
                updatePromises.push(updateImagesPromise(patchInfos.add, patchInfos.galleryId));
            }
            if (patchInfos.add && patchInfos.add.length > 0) {
                updatePromises.push(updateImagesPromise(patchInfos.remove, null));
            }
            Promise.all(updatePromises).then(() => {
                res.status(200).end();
            });
        });
};
