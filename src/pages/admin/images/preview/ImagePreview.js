import React from 'react';
import { Button, Chip, Stack, Box, Alert} from '@mui/material';
import LazyImage from 'components/lazyImage';
import { useFirebaseContext } from 'components/firebase';
import { Body } from 'template/pageTypography';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useFormDialog from 'dialogs/FormDialog';
import ImageForm from './ImageForm';

const ImageProperties = ({image}) => {
    if (!image) {
        return null;
    }
    return (
        <Stack
            direction={'column'}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
            sx={{marginX: 1, p: 0}}
        >
            {
                image.title ?
                <Body sx={{m: 0}}>{image.title}</Body> :
                <Alert severity='warning'>Pas de titre</Alert>
            }
            {
                image.description ?
                <Body sx={{m: 0}}>{image.description}</Body> :
                <Alert severity='warning'>Pas de description</Alert>
            }
            <Box>
                {
                    image.tags === null ?
                    <Alert severity='warning'>Pas de tags...</Alert> :
                    image.tags.map(tag => {
                        return (
                            <Chip key={tag} label={tag} size="small" sx={{marginRight: 0.5, marginTop: 0.5}} />
                        )
                    })
                }
            </Box>
        </Stack>
    )
}

const ImagePreview = ({image, file}) => {
    const firebaseContext = useFirebaseContext();

    if (!image) {
        file.src = `${firebaseContext.rootPublicUrl}/${file.fullPath}`;
    }
    const sxProp = {
        width: '200px'
    }
    if (image) {
        sxProp.height = `${200/image.sizeRatio}px`;
    }

    return (
        <Stack direction={'row'} sx={{p: 1}}>
            <Box sx={sxProp}>
                <LazyImage
                    image={image || file}
                    width={200}
                    withFavorite={false}
                    withOverlay={false}
                />
            </Box>
            <ImageProperties image={image} />
        </Stack>
    )
}

const ImagePreviewWrapper = ({image, children}) => {
    const { dialogProps, openDialog, FormDialog } = useFormDialog();

    const onCopyTags = React.useCallback(() => {
        navigator.clipboard.writeText(image.tags.join());
    }, [image]);

    if (image) {
        const hasTags = image.tags && image.tags.length > 0;
        return (
            <React.Fragment>
                <Stack direction={'column'}>
                    { children }
                    <Stack direction={'row'} sx={{marginBottom: 1}} justifyContent="flex-end" spacing={0.5}>
                        <Button startIcon={<ContentCopyIcon/>} disabled={!hasTags} variant="outlined" size="small" onClick={onCopyTags}>Copier les tags</Button>
                        <Button startIcon={<EditIcon/>} variant="outlined" size="small" onClick={openDialog}>Modifier</Button>
                    </Stack>
                </Stack>
                <FormDialog title="Modifier les propriétés de l'image" {...dialogProps}>
                    <ImageForm image={image} />
                </FormDialog>
            </React.Fragment>
        )
    } else {
        return children;
    }
}

const ConditionalImagePreview = ({image, file}) => {
    return (
        <ImagePreviewWrapper image={image}>
            <ImagePreview image={image} file={file} />
        </ImagePreviewWrapper>
    )
}

export default ConditionalImagePreview;
