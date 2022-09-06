import { useMemo, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import Box from '@mui/material/Box';
import lazyComponent from '../../components/lazyComponent';
import { useGlobalContext } from '../../components/globalContext';
import LabeledDivider from '../../components/labeledDivider/labeledDivider';
import ImageSlider from '../../components/imageSlider';
import { VerticalSpacing } from '../../template/spacing';
import {isMobile} from 'react-device-detect';
import { formatDate, formatDateShort } from '../../utils';
import ImageDescription from '../../components/imageDescription/imageDescription';
import Alert from '@mui/material/Alert';
import { withLoading, buildLoadingState } from '../../components/hoc';
import { useReactQuery } from '../../components/reactQuery';

function imageFromCover(destination) {
    const dateFormater = isMobile ? formatDateShort : formatDate;
    return {
        src: destination.cover,
        // <destination title> (<destination date>)
        title: `${destination.title} (${dateFormater(new Date(destination.date))})`,
        sizeRatio: 1.5, // Cover images are paysage only
        path: destination.path
    }
}

const EmptyRelatedDestinations = () => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Alert severity="info" elevation={4} variant="filled">Aucune destination similaire</Alert>
        </Box>
    );
}

const RelatedDestinationsSlider = withLoading(({destination, related, imageHeight}) => {
    const history = useHistory();
    const images = useMemo(() => related.filter(dest => dest.id !== destination.id).map(dest => imageFromCover(dest)), [related, destination]);

    const onSelectDestination = (index) => {
        history.push(`/destinations/${images[index].path}`);
    };

    const renderOverlay = useCallback((image) => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    color: "#fff",
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
            >
                <ImageDescription image={image} />
            </Box>
        )
    }, []);

    return (
        <ImageSlider
            images={images}
            currentIndex={-1}
            onThumbnailClick={onSelectDestination}
            style={{
                mx: {
                    "xs": -1,
                    "sm": 0
                }
            }}
            imageHeight={imageHeight}
            emptyComponent={<EmptyRelatedDestinations/>}
            renderOverlay={renderOverlay}
        />
    );
}, [buildLoadingState("related", [undefined])]);

const imageHeight = isMobile ? 120 : 150;

const RelatedDestinationsSliderController = lazyComponent(({destination}) => {
    const context = useGlobalContext();
    const { data } = useReactQuery(context.useFetchRelatedDestinations, [destination.regionpath, destination.macro, destination.wide]);
    return <RelatedDestinationsSlider destination={destination} related={data} imageHeight={imageHeight}/>
}, { height: imageHeight });

const RelatedDestinations = ({destination}) => {
    return (
        <Box sx={{ width: "100%"}} >
            <LabeledDivider label="Destinations Similaires"></LabeledDivider>
            <VerticalSpacing factor={2} />
            <RelatedDestinationsSliderController destination={destination} />
        </Box>
    );
};

export default RelatedDestinations;