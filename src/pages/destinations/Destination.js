import GridListTile from "@material-ui/core/GridListTile"
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    gridList: {
      flexWrap: 'nowrap',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    tile: {
        [theme.breakpoints.only('xs')]: {
            width: '100%',
        },
        [theme.breakpoints.only('sm')]: {
            width: 'calc(50% - 10px)',
        },
        [theme.breakpoints.only('md')]: {
            width: 'calc(33.33% - 10px)',
        },
        [theme.breakpoints.only('lg')]: {
            width: 'calc(25% - 10px)',
        },
        [theme.breakpoints.up('xl')]: {
            width: 'calc(20% - 10px)',
        },
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    icon: {
        color: 'white',
    },
}));

const Destination = (props) => {
    const classes = useStyles();

    return (
        <GridListTile key={props.id} classes={{
                root: classes.tile
            }}>
            <img src={props.cover} alt={props.title} style={{
                width: '100%'
            }}/>
            <GridListTileBar
                title={props.title}
                classes={{
                    root: classes.titleBar,
                    title: classes.title,
                }}
                subtitle={<span>{props.date}</span>}
                actionIcon={
                    <IconButton aria-label={`star ${props.title}`} className={classes.icon}>
                        <StarBorderIcon />
                    </IconButton>
                }
            />
        </GridListTile>
    );
}

export default Destination;