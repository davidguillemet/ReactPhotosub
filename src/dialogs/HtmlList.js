import List from '@material-ui/core/List'

const HtmlList = ({children}) => {
    return (
        <List dense={true} sx={{
            "&.MuiList-root" : {
                listStyleType: "disc",
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