import React from 'react';
import Alert from '@material-ui/core/Alert';
import { useAuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { useGlobalContext } from '../../components/globalContext';

const MySelectionContent= ({user, images}) => {
    if (user === null) {
        return (
            <Alert severity="warning" elevation={4} variant="filled">Cette page n'est accessible qu'aux utilisateurs connectés</Alert>
        );
    }

    return (
        <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5} emptyMessage="Votre liste de favoris est vide."/>
    );
}

const MySelection = () => {

    const context = useGlobalContext();
    const authContext = useAuthContext();
    const { data: images } = context.useFetchFavorites(authContext.user && authContext.user.uid, true)

    return (
        <React.Fragment>
            <PageTitle>Ma Sélection</PageTitle>
            <VerticalSpacing factor={2} />
            <MySelectionContent user={authContext.user} images={images} ></MySelectionContent>
        </React.Fragment>
    );
}

export default MySelection;