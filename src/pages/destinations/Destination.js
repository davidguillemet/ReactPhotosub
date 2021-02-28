const Destination = (props) => (
    <div style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
            width: '300px',
            margin: '5px'
        }}>
        <h3>{props.title}</h3>
        <img alt=""
             src={props.cover}
             style={{
                 width: '100%'
            }}>
        </img>
    </div>
)

export default Destination;