import React, { useState, useEffect, useContext } from 'react';
import Alert from '@material-ui/core/Alert';
import { AuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { GlobalContext } from '../../components/globalContext';

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

    const context = useContext(GlobalContext);
    const authContext = useContext(AuthContext);
    const [images, setImages] = useState(null);

    useEffect(() => {
        if (authContext.user === null) {
            return;
        }
        context.dataProvider.getFavorites()
        .then(images => {
            setImages(images);
        });
    }, [context.dataProvider, authContext.user]);

    return (
        <React.Fragment>
            <PageTitle>Ma Sélection</PageTitle>
            <VerticalSpacing factor={2} />
            <MySelectionContent user={authContext.user} images={images} ></MySelectionContent>
        </React.Fragment>
    );
}

export default MySelection;