import React from 'react';
import SummaryParagraph from '../SummaryParagraph';
import HtmlList from '../HtmlList';
import ListItem from '@mui/material/ListItem';

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
<SummaryParagraph>The search is launched automatically when a list of criteria has been entered.</SummaryParagraph>
<SummaryParagraph>The search returns images that meet all the criteria:
<HtmlList>
    <ListItem>The operator <BoldItalic>ET</BoldItalic> is applied</ListItem>
    <ListItem>The search for <BoldItalic>gorgon diver</BoldItalic> is considered as <BoldItalic>gorgon AND diver</BoldItalic> et retourne donc toutes les images contenant une gorgone <u>et</u> un plongeur</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
You can prefix a criterion with a hyphen (-) to exclude it from the search:
<HtmlList>
    <ListItem>The search for <BoldItalic>gorgon -diver</BoldItalic> will display images that contain a sea fan but no diver</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
You can use the slash (/) delimiter to specify a criterion containing spaces:
<HtmlList>
    <ListItem>The search for <BoldItalic>red sea</BoldItalic> returns the images corresponding to <BoldItalic>sea AND red</BoldItalic></ListItem>
    <ListItem>The search for <BoldItalic>platax /red sea/</BoldItalic> returns images of batfish caught in the red sea.</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
Criteria of less than 3 characters are ignored
</SummaryParagraph>
<SummaryParagraph>
Criteria are not case sensitive
</SummaryParagraph>
</React.Fragment>
);

export default help;
