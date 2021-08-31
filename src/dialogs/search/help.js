import React from 'react';
import SummaryParagraph from '../SummaryParagraph';
import HtmlList from '../HtmlList';
import ListItem from '@material-ui/core/ListItem';

const BoldItalic = ({children}) => (
    <span
        style={{
            fontFamily: "Courier",
            fontWeight: "bold",
            fontStyle: "italic",
            border: "1px solid #ccc",
            borderRadius: "3px",
            paddingLeft: "5px",
            paddingRight: "5px",
            whiteSpace: "nowrap",
            backgroundColor: "#eee"
        }}
    >
        {children}
    </span>
)

const help = () => (
<React.Fragment>
<SummaryParagraph>La recherche est lancée automatiquement lorsqu'une liste de critères a été saisie.</SummaryParagraph>
<SummaryParagraph>La recherche retourne les images qui vérifient tous les critères :
<HtmlList>
    <ListItem>l'opérateur <BoldItalic>ET</BoldItalic> est appliqué</ListItem>
    <ListItem>La recherche <BoldItalic>gorgone plongeur</BoldItalic> est interprétée comme <BoldItalic>gorgone ET plongeur</BoldItalic> et retourne donc toutes les images contenant une gorgone <u>et</u> un plongeur</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>Par défaut, une recherche "inclusive" est effectuée:
<HtmlList>
    <ListItem>La recherche <BoldItalic>vert</BoldItalic> retourne les images contenant du vert, mais aussi les images contenant un vertébré, ou un invertébré ("vertébré" et "invertébré" contiennent la chaîne "vert")</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
Pour effectuer une recherche plus restrictive, cochez alors l'option "Rechercher les termes exacts":
<HtmlList>
    <ListItem>Dans ce cas, la recherche <BoldItalic>vert</BoldItalic> retournera uniquement les images contenant du vert, mais également celles contenant un géant vert (oui oui, il existe...)</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
Vous pouvez préfixer un critère par un tiret (-) pour l'exclure de la recherche:
<HtmlList>
    <ListItem>La recherche <BoldItalic>gorgone -plongeur</BoldItalic> affichera les images qui contiennent une gorgone mais pas de plongeur</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
Vous pouvez utiliser le délimiteur slash (/) pour spécifier un critère contenant des espaces:
<HtmlList>
    <ListItem>La recherche <BoldItalic>mer rouge</BoldItalic> retourne les images correspondant à <BoldItalic>mer ET rouge</BoldItalic></ListItem>
    <ListItem>La recherche <BoldItalic>platax /mer rouge/</BoldItalic> retourne les images de platax prisent en mer rouge.</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
Les critères de moins de 3 caractères sont ignorés
</SummaryParagraph>
<SummaryParagraph>
Les critères ne sont pas sensibles à la casse
</SummaryParagraph>
</React.Fragment>
);

export default help;
