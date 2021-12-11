import CollectionsIcon from '@mui/icons-material/Collections';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import React from 'react';
import { HorizontalSpacing } from '../../template/spacing';
import HtmlList from '../HtmlList';
import SummaryParagraph from '../SummaryParagraph';




const help = () => (
<React.Fragment>
<SummaryParagraph>Cette page vous permet de laisser libre cours à votre imagination pour créer une composition murale à partir des images disponibles sur le site, et de tester son rendu dans divers décors d'intérieur, voire votre propre intérieur...
<HtmlList listStyle="decimal">
    <ListItem>Sélectionnez un décor parmi la sélection proposée ou téléchargez le vôtre <b>(*)</b></ListItem>
    <ListItem>Sélectionnez une image parmi:<br />
        <Box sx={{display: "flex", flexDirection: "row"}}><HorizontalSpacing /><CollectionsIcon /><HorizontalSpacing />La sélection par défaut<br /></Box>
        <Box sx={{display: "flex", flexDirection: "row"}}><HorizontalSpacing /><FavoriteIcon /><HorizontalSpacing />La liste de vos favoris <b>(*)</b></Box>
        <Box sx={{display: "flex", flexDirection: "row"}}><HorizontalSpacing /><SearchIcon /><HorizontalSpacing />Les résultats d'une recherche</Box>
    </ListItem>
    <ListItem>Déplacez ou redimensionez votre image comme vous le souhaitez</ListItem>
    <ListItem>Définissez l'épaisseur et la couleur du cadre, ainsi que l'ombre portée</ListItem>
    <ListItem>Sauvegardez votre composition et donnez-lui un nom pour la retrouver plus tard <b>(*)</b></ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>Vous pouvez ajouter autant d'images que vous le souhaitez à votre composition en répétant les étapes 2 et 3.</SummaryParagraph>
<SummaryParagraph>Cliquez simplement sur une image de votre composition pour l'activer et:
    <HtmlList>
        <ListItem><b>la modifier</b> en sélectionnant et modifiant une nouvelle image comme décrit à l'étape n°2</ListItem>
        <ListItem><b>la supprimer</b> en cliquant sur <DeleteIcon sx={{position: "relative", top: "6px"}}/></ListItem>
    </HtmlList>
</SummaryParagraph>
<SummaryParagraph><b>(*)</b> connexion requise</SummaryParagraph>
</React.Fragment>
);

export default help;
