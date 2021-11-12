import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Link } from '@mui/material';

const StyledSvgIcon = styled(SvgIcon)(({ theme }) => ({
    color: theme.palette.grey[500]
}));

const ExternalLink = (props) => (
    <Link target="_blank" rel="noreferrer" {...props} />
) 

export const FlickrIcon = () => (
    <StyledSvgIcon viewBox="0 0 34 34">
        <path d="M17,0C7.611,0,0,7.61,0,17c0,9.391,7.611,17,17,17c9.389,0,17-7.609,17-17C34,7.61,26.389,0,17,0z M10.727,22.001
                c-2.762,0-5.001-2.241-5.001-5.002c0-2.762,2.239-5,5.001-5c2.761,0,5.001,2.238,5.001,5C15.728,19.76,13.488,22.001,10.727,22.001
                z M23.273,22.001c-2.762,0-5-2.241-5-5.002c0-2.762,2.238-5,5-5s5,2.238,5,5C28.273,19.76,26.035,22.001,23.273,22.001z"/>
    </StyledSvgIcon>
);

export const InstagramIcon = () => (
    <StyledSvgIcon viewBox="0 0 260 260">
        <path d="M164.58,64H95.42C78.1,64,64,78.1,64,95.42v69.16C64,181.9,78.1,196,95.42,196h69.16c17.32,0,31.42-14.1,31.42-31.42V95.42
                C196,78.1,181.9,64,164.58,64z M130,171.1c-22.66,0-41.1-18.44-41.1-41.1s18.44-41.1,41.1-41.1s41.1,18.44,41.1,41.1
                S152.66,171.1,130,171.1z M172.22,97.3c-5.3,0-9.6-4.3-9.6-9.61c0-5.3,4.3-9.6,9.6-9.6c5.31,0,9.61,4.3,9.61,9.6
                C181.83,93,177.53,97.3,172.22,97.3z M130,102.9c-14.94,0-27.1,12.16-27.1,27.1s12.16,27.1,27.1,27.1s27.1-12.16,27.1-27.1
                S144.94,102.9,130,102.9z M130,2C59.31,2,2,59.31,2,130s57.31,128,128,128s128-57.31,128-128S200.69,2,130,2z M210,164.58
                c0,25.04-20.38,45.42-45.42,45.42H95.42C70.38,210,50,189.62,50,164.58V95.42C50,70.38,70.38,50,95.42,50h69.16
                C189.62,50,210,70.38,210,95.42V164.58z"/>
    </StyledSvgIcon>
);

export const FacebookIcon = () => (
    <StyledSvgIcon viewBox="0 0 97.75 97.75">
        <path d="M48.875,0C21.882,0,0,21.882,0,48.875S21.882,97.75,48.875,97.75S97.75,75.868,97.75,48.875S75.868,0,48.875,0z
                M67.521,24.89l-6.76,0.003c-5.301,0-6.326,2.519-6.326,6.215v8.15h12.641L67.07,52.023H54.436v32.758H41.251V52.023H30.229V39.258
                h11.022v-9.414c0-10.925,6.675-16.875,16.42-16.875l9.851,0.015V24.89L67.521,24.89z"/>
    </StyledSvgIcon>
);

export const FiveHundredsIcon = () => (
    <StyledSvgIcon viewBox="0 0 97.75 97.75">
        <g>
            <path d="M72.337,47.891c-1.588,0.21-2.897,0.996-4.133,1.942c-1.376,1.056-2.53,2.344-3.718,3.595
                    c-0.16,0.168-0.09,0.256,0.027,0.387c0.836,0.936,1.697,1.845,2.676,2.631c1.623,1.308,3.381,2.313,5.522,2.512
                    c2.412,0.225,4.365-0.905,5.229-3.09c0.299-0.756,0.424-1.547,0.428-2.471c0.01-0.23-0.029-0.57-0.071-0.91
                    C77.917,49.453,75.363,47.491,72.337,47.891z"/>
            <path d="M52.206,49.757c-1.028-0.741-2.11-1.401-3.356-1.711c-1.896-0.469-3.621-0.2-4.969,1.343
                    c-1.046,1.197-1.545,2.614-1.543,4.303c0.012,0.151,0.025,0.401,0.047,0.65c0.205,2.35,1.773,4.114,4.047,4.529
                    c1.249,0.229,2.463,0.062,3.642-0.396c2.515-0.979,4.433-2.742,6.185-4.723c0.128-0.146,0.064-0.217-0.036-0.322
                    C54.968,52.115,53.688,50.824,52.206,49.757z"/>
            <path d="M48.875,0C21.883,0,0,21.882,0,48.875S21.883,97.75,48.875,97.75S97.75,75.868,97.75,48.875S75.867,0,48.875,0z
                    M72.996,65.65c-3.092-0.036-5.729-1.234-8.137-3.06c-1.571-1.192-2.918-2.624-4.215-4.101c-0.218-0.248-0.318-0.303-0.582-0.028
                    c-1.324,1.375-2.582,2.819-4.07,4.03c-1.881,1.531-3.957,2.682-6.389,3.012c-4.3,0.584-8.014-0.549-10.9-3.922
                    c-0.654-0.766-1.147-1.637-1.552-2.559c-0.052-0.115-0.066-0.256-0.198-0.354c-0.566,1.223-1.268,2.348-2.188,3.325
                    c-2.317,2.464-5.176,3.749-8.549,3.868c-2.438,0.086-4.826-0.225-7.05-1.279c-3.725-1.766-5.773-4.705-6.027-8.854
                    c-0.02-0.316,0.068-0.396,0.382-0.395c2.003,0.014,4.007,0.014,6.01,0c0.301-0.002,0.385,0.086,0.436,0.38
                    c0.386,2.287,1.615,3.878,3.919,4.45c3.215,0.797,6.168-1.025,7.013-4.335c0.568-2.228,0.323-4.356-1.154-6.211
                    c-0.979-1.231-2.311-1.831-3.874-1.941c-2.249-0.158-4.089,0.583-5.417,2.45c-0.123,0.176-0.268,0.219-0.467,0.217
                    c-1.806-0.005-3.611-0.01-5.417,0.004c-0.313,0.002-0.378-0.086-0.324-0.385c0.937-5.209,1.866-10.42,2.796-15.631
                    c0.127-0.713,0.258-1.426,0.374-2.14c0.038-0.234,0.128-0.321,0.381-0.32c5.997,0.008,11.993,0.008,17.99,0
                    c0.286-0.001,0.349,0.093,0.347,0.361c-0.013,1.607-0.016,3.216,0.002,4.823c0.002,0.328-0.081,0.417-0.414,0.416
                    c-4.296-0.011-8.592-0.003-12.889-0.015c-0.356-0.001-0.515,0.058-0.582,0.459c-0.377,2.286-0.795,4.566-1.195,6.849
                    c-0.018,0.097-0.086,0.229,0.02,0.292c0.116,0.071,0.182-0.069,0.25-0.136c1.969-1.896,4.37-2.475,7.019-2.333
                    c2.548,0.136,4.723,1.092,6.517,2.904c0.749,0.756,1.331,1.63,1.801,2.582c0.051,0.104,0.104,0.207,0.194,0.389
                    c0.507-1.337,1.133-2.503,2.021-3.513c1.947-2.214,4.408-3.408,7.333-3.678c4.122-0.381,7.51,1.211,10.475,3.917
                    c1.229,1.121,2.317,2.377,3.385,3.649c0.229,0.271,0.328,0.295,0.568,0.01c1.375-1.634,2.745-3.274,4.438-4.603
                    c1.952-1.53,4.103-2.635,6.596-2.927c6.165-0.722,11.317,2.635,12.63,8.999c0.551,2.677,0.383,5.324-0.546,7.902
                    C82.039,62.989,78.068,65.71,72.996,65.65z"/>
        </g>
    </StyledSvgIcon>
);

const SocialIcons = () => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            mt: 2,
            flex: 1
        }}
    >
        <IconButton
            component={ExternalLink} href="https://www.instagram.com/david.guillemet/"
            edge="start"
            size="small">
            <InstagramIcon />
        </IconButton>
        <IconButton
            component={ExternalLink} href="https://www.facebook.com/davidphotosub/"
            edge="start"
            size="small">
            <FacebookIcon />
        </IconButton>
        <IconButton
            component={ExternalLink} href="https://www.flickr.com/photos/dguillemet/"
            edge="start"
            size="small">
            <FlickrIcon />
        </IconButton>
        <IconButton
            component={ExternalLink} href="https://500px.com/davidguillemet"
            edge="start"
            size="small">
            <FiveHundredsIcon />
        </IconButton>
    </Box>
);

export default SocialIcons;