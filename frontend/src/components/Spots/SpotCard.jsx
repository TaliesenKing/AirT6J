//this component will be for individual spot previews

import { Link } from 'react-router-dom';
import './SpotCard.css';


//we need a function that will receive a spot as an argument
//its return should wrap the card in a Link that we imported from react-router-dom
function SpotCard({ spot }) {
    return (
        <div className="spot-card">
            <Link to={'/spots/${spot.id}'}>
            <img src={spot.previewImage} alt={spot.name} />
            <div className="spot-info">
                <div>{spot.city}, {spot.state}</div>
                <div>${spot.price} night</div>
                <div>★ {spot.avgRating || 'New'}</div>
            </div>
            </Link>
        </div>
    )
}

export default SpotCard;