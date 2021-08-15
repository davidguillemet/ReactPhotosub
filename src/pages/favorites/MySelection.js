import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/core/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthContext } from '../../components/authentication';
import dataProvider from '../../dataProvider';
import Gallery from '../../components/gallery';
import PageTitle from '../../template/pageTitle';
import { VerticalSpacing } from '../../template/spacing';

const MySelectionContent= ({user, images}) => {
    if (user === null) {
        return (
            <Alert severity="warning" elevation={4} variant="filled">Cette page n'est accessible qu'aux utilisateurs connectés</Alert>
        );
    }

    if (images === null) {
        return <CircularProgress size={40} />
    }

    if (images.length === 0) {
        return (
            <React.Fragment>
                <Alert severity="info" elevation={4} variant="filled">Votre liste de favoris est vide.</Alert>
            </React.Fragment>
        );
    }
    
    return (
        <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5}/>
    );
}

const MySelection = ({user, favorites, updateUserContext}) => {

    const [images, setImages] = useState(null);

    useEffect(() => {
        dataProvider.getFavorites()
        .then(images => {
            setImages(images);
        });
    }, []);

    return (
        <React.Fragment>
            <PageTitle>Ma Sélection</PageTitle>
            <VerticalSpacing factor={2} />
            <MySelectionContent user={user} images={images} ></MySelectionContent>
        </React.Fragment>
    );
}

const MySelectionConsumer = (props) => {
    return (
        <AuthContext.Consumer>
            { ({user, data, updateUserContext}) => {
                return (
                    <MySelection
                        user={user}
                        favorites={data && data.favorites}
                        updateUserContext={updateUserContext}
                        {...props}
                    />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default MySelectionConsumer;