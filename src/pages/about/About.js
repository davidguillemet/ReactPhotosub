import React from 'react';
import Box from '@material-ui/core/Box';
import { PageTitle, Paragraph } from '../../template/pageTypography';

const About = () => {
    return (
        <React.Fragment>
            <PageTitle>A Propos</PageTitle>
            <Box sx={{
                width: '100%',
                my: 2
            }}>
                <img src="/dgui1.jpg" alt="David Guillemet" style={{width: '100%'}}></img>
            </Box>
            <Paragraph>Il m'aura fallu un peu de temps pour devenir complètement accro à la plongée sous-marine...</Paragraph>
            <Paragraph>Un premier baptême en Australie en 2003, suivi d'un deuxième en Croatie un an plus tard, mais toujours pas le déclic...</Paragraph>
            <Paragraph>J'ai finalement passé mon niveau 1 un peu par hasard lors d'un séjour en Martinique en mars 2005, mais c'est réellement début 2006, aux Bahamas, lorsque ma route croise celle d'un requin marteau que tout va changer...</Paragraph>
            <Paragraph>La plongée devient alors une véritable passion et je passe très rapidement mon niveau 2 avant de m'inscrire à l'ASD12 pour continuer ma progression (Nitrox, N3, N4, initiateur).</Paragraph>
            <Paragraph>En parallèle de mes niveaux techniques, je m'intéresse également très tôt à la biologie sous-marine et lors de cette première saison 2006-2007, je vais suivre les cours du Comité Départemental de Paris qui me mèneront à la validation de l'AFBS (Animateur Fédéral de Biologie Sous-marine - équivalent de l'actuel N1 Bio) lors d'une semaine de stage à Cerbère avec Robert Oms.</Paragraph>
            <Paragraph>De fil en aiguille, après la bio, je vais naturellement m'intéresser à la photo sous-marine...Et me voilà donc parti aux Maldives en février 2008, équipé d'un Nikon P5100 en caisson Ikelite, avec un flash DS125 de la même marque.</Paragraph>
            <Paragraph>Les premiers résultats sont plutôt encourageants et au fur et à mesure de mon apprentissage des réglages manuels de l'appareil, je ressens une certaine frustration en raison de leur limitation.</Paragraph>
            <Paragraph>Je passe donc au reflex en juillet 2009, et plus précisément au Nikon D90 en caisson Aquatica, avec mon fidèle flash DS125, auquel je vais associer un DS160, plus recent.</Paragraph>
            <Paragraph>Entre temps, ce site est tout simplement né du désir de partager cette passion avec famille et amis, et c'est en septembre 2021 que cette 6ème version voit le jour...</Paragraph>
            <Paragraph>Après 5 ans passés avec mon D90, j'ai ensuite évolué vers le D7100 puis le D7200, toujours en caisson Aquatica, avec mes deux flashs Ikelite DS125 et DS160.</Paragraph>
        </React.Fragment>
    )
}

export default About;