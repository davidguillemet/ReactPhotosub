import React from 'react';
import { PageTitle, PageHeader, PageSubTitle, Paragraph, BlockQuote } from '../../template/pageTypography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

import Video from '../../components/video';

import 'fontsource-roboto/100.css';

const _menuListItems = [
    "Une Pratique dévastatrice",
    "Une Pêche sans discernement",
    "L'équilibre des océans menacé",
    "Un mets traditionnel",
    "La liste est longue...",
    "Quelques vidéos"
];

const Anchor = ({index}) => (
    <span id={`anchor${index}`} />
)

const CustomDivider = () => <Divider variant="middle" sx={{ my: 3, mx: '20%', borderBottomWidth: 3, borderBottomColor: (theme) => theme.palette.primary.light}}/>

const ListItemLink = (props) => {
    return <ListItem component="a" {...props} sx ={{ py: 0, color: theme => theme.palette.link.main}}/>;
}

const FinningListItem = ({caption, index}) => {
    return (
        <ListItemButton>
            <ListItemIcon sx={{ minWidth: 'unset'}}>
                <NavigateNextIcon />
            </ListItemIcon>
            <ListItemLink href={`#anchor${index}`}>
                {caption}
            </ListItemLink>
        </ListItemButton>
    );
}

const Finning = () => {
    return (
        <React.Fragment>
            <PageTitle>Le Finning, Késako ?</PageTitle>
            <PageHeader sx={{color: 'red', fontWeight: 400, textAlign: 'center'}}>Initiative Citoyenne Européenne<br></br>Apportez votre soutien !</PageHeader>
            <Link href="https://www.stop-finning.eu/" target="_blank">
            <Box sx={{ width: '100%', bgcolor: 'black', p: '20px', mb: 3}}>
                <img src="/logo-stop-finning.png" alt="Stop Finninf" style={{maxWidth: '100%'}}/>
            </Box>
            </Link>
            <Box sx={{
                width: '100%',
            }}>
                <PageHeader>Vous avez sûrement déjà entendu parler du "finning" à propos de la "récolte" des ailerons de requin, mais en quoi consiste cette pratique et quelles en sont les conséquences pour l'animal et pour les éco-systèmes ?</PageHeader>
                <BlockQuote sx={{
                    pl: 0
                }}>
                    <List
                        sx={{
                            py: 0,
                            textTransform: 'uppercase'
                        }}
                        dense={true}
                    >
                        {
                            _menuListItems.map((caption, index) => <FinningListItem key={index} caption={caption} index={index} />)
                        }
                    </List>
                </BlockQuote>

                <Anchor index={0} />
                <PageSubTitle>Une pratique dévastatrice</PageSubTitle>
                <Paragraph>Il s'agit d'une pratique qui consiste à découper tous les ailerons d'un requin pour le rejeter ensuite à la mer, la plupart du temps encore vivant.</Paragraph>
                <Paragraph>A l'inverse des poissons osseux, le requin n'a pas de vessie natatoire et possède une flottabilité légèrement négative qu'il ne peut pas ajuster (pour la plupart des espèces). Il lui est donc impossible de maintenir un niveau d'immersion stable sans nager.</Paragraph>
                <Paragraph>Privé de ses ailerons et ne pouvant donc plus nager, il va irrémédiablement couler pour agoniser lentement au fond et mourir de suffocation - la plupart des requins doivent absolument être en mouvement pour permettre à l'eau de pénétrer dans leurs branchies - ou de faim, s'il n'est pas dévoré vivant par d'autres poissons...</Paragraph>
                <Paragraph>Cette pratique est particulièrement rentable puisque la chair de requin a bien moins de valeur que ses ailerons. Dans ces conditions, mieux vaut remplir son bateau de 3 tonnes d'ailerons que de 3 tonnes de carcasses...</Paragraph>

                <Anchor index={1} />
                <PageSubTitle>Une pêche sans discernement</PageSubTitle>
                <Paragraph>Au-delà de cette pratique sauvage, les requins sont pêchés sans aucun discernement, c'est à dire quelque soit leur âge, taille ou espèce.</Paragraph>
                <Paragraph>Ce sont effectivement des animaux à croissance lente et à maturité sexuelle tardive. Comme nous parlons ici de plusieurs années (12 à 14 ans pour le requin blanc !), il y a de fortes chances que les jeunes individus soient massacrés avant de s'être reproduit. Pour ne rien arranger, la durée de gestation est également assez longue, de 7 mois à 2 ans, et le nombre d'individus par portée très limité pour la plupart des espèces.</Paragraph>
                <Paragraph>Pour ces raisons, les techniques de pêche utilisées aujourd'hui sur les populations de requins ainsi que leur exploitation commerciale à grande échelle ne peuvent que conduire cet animal à l'extinction...</Paragraph>
                <Paragraph>Les experts estiment à quelques 100 millions le nombre de requins massacrés chaque année par des techniques de pêche de plus en plus performantes, contre lesquelles les pays désireux de les protéger ne peuvent souvent pas grand chose, faute de moyens suffisant.</Paragraph>

                <Anchor index={2} />
                <PageSubTitle>L'équilibre des océans menacé</PageSubTitle>
                <Paragraph>Au-delà de la disparition des requins c'est la santé même de nos océans qui est en jeu ainsi que notre propre survie.</Paragraph>
                <Paragraph>En effet, le requin se place tout en haut de la chaîne alimentaire - certains plus que d'autres - et va d'une part nettoyer les océans en se nourrissant de carcasses d'animaux morts ou malades, et d'autre part réguler la population d'autres espèces.</Paragraph>
                <Paragraph>Dans certaines régions, on a déjà pu observer un accroissement spectaculaire de la population de raies, généralement au menu des requins, ce qui entraîne en retour une diminution toute aussi spectaculaire d'autres espèces au menu des raies - comme certains coquillages - et parfois nécessaires à la bonne santé des récifs coralliens ou dont peut dépendre toute une économie locale.</Paragraph>
                <Paragraph>Un autre exemple: Les tortues sont assez souvent au menu des requins, mais fidèles à leur réputation d'"éboueur des mers", ces derniers se contentent de tortues blessées ou malades. Et donc, qui dit pas de requin dit plus de tortues malades. Je vous laisse imaginer la suite...</Paragraph>
                <Paragraph>Et donc,  certaines populations de tortues ont été décimées en raison de la propagation de maladies.</Paragraph>

                <Anchor index={3} />
                <PageSubTitle>Un mets traditionnel maintenant accessible au plus grand nombre</PageSubTitle>
                <Paragraph>Les ailerons de requin sont à destination exclusive du marché asiatique - dont Hong Kong est la plaque tournante - et seront vendus séchés à l'unité ou sous forme de soupes. A près de 100$ le bol, cela reste un mets relativement cher, preuve de réussite sociale - par exemple souvent servi lors des cérémonies de mariage - et dont la demande est de plus en plus forte en raison du nombre croissant de familles chinoises qui accèdent à la classe moyenne.</Paragraph>
                <Paragraph>En effet, cette soupe est consommée de manière traditionnelle depuis des siècles, mais voilà, de quelques millions de consommateurs dans les années 80, nous sommes aujourd'hui passés à plus de 300 millions...</Paragraph>
 
                <Anchor index={4} />
                <PageSubTitle>Requins, Éléphants, Rhinocéros, la liste est longue</PageSubTitle>
                <Paragraph>Et s'il n'y avait que les requins...mais savez-vous que d'autres grands animaux sont en véritable danger d'extinction et sont la cible d'un véritable massacre organisé?</Paragraph>
                <Paragraph>Les éléphants sont exterminés à l'arme de guerre par troupeaux entiers pour leur ivoire, les rhinocéros pour les prétendues vertus de leur corne - alors qu'il s'agit en fait de Kératine c'est à dire de poils - les tigres entre autre pour leurs os, et j'en passe...</Paragraph>
                <Paragraph>Le triste record de rhinocéros tués en une année a encore été battu en 2014 pour atteindre le nombre hallucinant de 1215 (1004 en 2013), avec pas moins de 827 animaux tués dans le seul parc Kruger qui est obligé de les déplacer pour tenter de les protéger...</Paragraph>
                <Paragraph>En 2013, ce sont tout simplement les 15 derniers rhinocéros du parc Limpopo au Mozambique qui ont été exterminés par des braconniers, aidés des garde-chasses de ce même parc (voir cet <Link href="https://www.maxisciences.com/rhinoceros/les-derniers-rhinoceros-du-parc-limpopo-du-mozambique-tues-par-leurs-propres-gardes_art29388.html" target="_blank">article</Link>).</Paragraph>
                <Paragraph>Dans tous les cas, étant donnée la valeur marchande des ailerons, de l'ivoire et du reste, ce sont de véritables mafias qui se sont mises en place et qui ne reculent devant rien pour alimenter la demande exponentielle des consommateurs et collectionneurs asiatiques.</Paragraph>
                <Paragraph>Dans cet article intitulé <Link href="https://www.lemonde.fr/idees/article/2013/07/02/il-est-urgent-de-proteger-les-elephants-de-foret_3440674_3232.html#xtor=AL-32280515" target="_blank">Il est urgent de protéger les éléphants</Link>, Nicolas Hulot cite un passage de la Lettre à l'éléphant de Romain Gary:</Paragraph>
                <BlockQuote>Si le monde ne peut plus s'offrir le luxe de cette beauté naturelle, c'est qu'il ne tardera pas à succomber à sa propre laideur et qu'elle le détruira.</BlockQuote>

                <Anchor index={5} />
                <PageSubTitle sx={{mb: 3}}>Quelques vidéos...</PageSubTitle>
                <Video src="https://www.youtube.com/embed/C2UKgLsOhRM" />

                <CustomDivider />
                <Paragraph>Voici une deuxième vidéo que je vous invite à regarder dans son intégralité - 7'35''- et qui montre bien à quel point le finning peut être dévastateur pour les populations de requins. Des femelles pleines sont massacrées, ainsi que de très jeunes individus qui n'ont certainement pas encore eu l'occasion de se reproduire.</Paragraph>
                <Paragraph>Attention, Les images sont parfois assez dures à regarder...</Paragraph>
                <Video
                    src="https://player.vimeo.com/video/9856912?h=af18379c73"
                    legend={<Paragraph><Link href="https://vimeo.com/9856912" target="_blank">人鯊誌</Link> from <Link href="https://vimeo.com/alexhofford" target="_blank">alexhofford</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
                />

                <CustomDivider />
                <Paragraph>Je vous livre ici une une autre vidéo d'Alex Hofford sur la capitale japonaise de l'aileron de requin.</Paragraph>
                <Paragraph>Mais surtout, allez lire son commentaire sur Vimeo...</Paragraph>
                <Video
                    src="https://player.vimeo.com/video/13416490?h=ac831148d0"
                    legend={<Paragraph><Link href="https://vimeo.com/13416490" target="_blank">Japan&#039;s Shark Fin Capital</Link> from <Link href="https://vimeo.com/alexhofford" target="_blank">alexhofford</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
                />

                <CustomDivider />
                <Paragraph>Voici une autre vidéo intitulée <Link href="https://saveourseas.com/" target="_blank">Save Our Sharks</Link>, réalisée par la fondation Save Our Seas et récompensée d'un "Panda Award" dans la catégorie de la meilleure campagne environnementale au festival <Link href="https://www.wildscreenfestival.org/" target="_blank">WildScreen 2010</Link>:</Paragraph>
                <Video
                    src="https://player.vimeo.com/video/6910594?h=c9cf57aaaa&title=0&byline=0&portrait=0"
                    legend={<Paragraph><Link href="https://vimeo.com/6910594" target="_blank">Save Our Sharks</Link> from <Link href="https://vimeo.com/saveourseascom" target="_blank">Save Our Seas Foundation</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
                />

                <CustomDivider />
                <Paragraph>Un reportage de Gordon Ramsay, chef cuisinier Britannique étoilé, sur la réalité du Finning, de Täiwan au Costa Rica...</Paragraph>
                <Paragraph>C'est d'ailleurs à Puntarenas qu'il a été aspergé d'essence et tenu sous la menace d'une arme à feu alors qu'il était en train de filmer des activités illégales de finning en 2011...</Paragraph>
                <Video src="https://www.youtube.com/embed/r65FgUYdBOc" />
            </Box>
        </React.Fragment>
    );
};

export default Finning;