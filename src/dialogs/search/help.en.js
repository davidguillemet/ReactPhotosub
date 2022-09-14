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
<SummaryParagraph>By default, an "inclusive" search is performed:
<HtmlList>
    <ListItem>The search for <BoldItalic>vert</BoldItalic> (green) returns images containing green color, but also images containing a vertebrate, or an invertebrate ("vertebrate" and "invertebrate" contain the string "vert")</ListItem>
</HtmlList>
</SummaryParagraph>
<SummaryParagraph>
To perform a more restrictive search, then check the option "Search for exact terms":
<HtmlList>
    <ListItem>In that case, the search for <BoldItalic>vert</BoldItalic> will only return images containing green color, but also those containing a green giant (yes, it exists...)</ListItem>
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
