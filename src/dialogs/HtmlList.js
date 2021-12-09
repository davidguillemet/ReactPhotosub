import List from '@mui/material/List'

const HtmlList = ({children, listStyle = "disc"}) => {
    return (
        <List dense={true} sx={{
            "&.MuiList-root" : {
                listStyleType: listStyle,
                listStylePosition: "outside",
                ml: 3
            },
            "& li" : {
                display: "list-item",
                px: 1
            }
        }}>
            {children}
        </List>        
    )
}

export default HtmlList;