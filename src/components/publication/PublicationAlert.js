import React from 'react';
import { styled } from "@mui/material/styles";
import { Alert, Button } from '@mui/material';
import { useAsyncFetcher } from 'components/reactRouter';
import { DESTINATION_INTENT_UPDATE } from 'utils/destinations';
import { useToast } from 'components/notifications';

export const PublicationAlert = styled(({destination, ...other}) => {

    const { toast } = useToast();
    const { submit: fetcherSubmit } = useAsyncFetcher("PublicationAlert", "/destinations");

    const handlePublish = React.useCallback(() => {
        fetcherSubmit({
            id: destination.id,
            path: destination.path, // Just for query invalidation (see intent handler DESTINATION_UPDATE_INTENT in DestinationsAction.js)
            published: true,
            intent: DESTINATION_INTENT_UPDATE
        }).then(() => {
            // No need to do anything as the query invalidation will trigger a refetch of the destination with the new published value
        }).catch(e => {
            toast.error(e.message)
        });
    }, [fetcherSubmit, destination.id, destination.path, toast]);

    if (destination.published === true) {
        return null;
    }

    return (
        <Alert
            severity='error'
            {...other}
            action={
                <Button size="small" onClick={handlePublish}>
                    Publier
                </Button>
            }
        >
            Cette destination n'est pas publiée.
        </Alert>
    );
})({});