import { useState, useEffect } from 'react';
import Destination from './Destination';

function getDestinations() {
    return fetch("/api/destinations")
    .then(data => {
        return data.json();
    });
}

const Destinations = () => {

    const [destinations, setDestinations] = useState([]);

    useEffect(() => {
        getDestinations().then(items => {
            const item = items[0];
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            items.push(item);
            setDestinations(items);
        });
    }, []);

    return (
        <div>
            <h2>DESTINATIONS</h2>
            <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}>
                {destinations.map(item => <Destination key={item.id} {...item} />)}
            </div>
        </div>
    )
};

export default Destinations;