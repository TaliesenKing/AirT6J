//this component will be for individual spot previews

import { Link } from 'react-router-dom';
import './SpotCard.css';


//we need a function that will receive a spot as an argument
//its return should wrap the card in a Link that we imported from react-router-dom
function SpotCard({ spot }) {
    return (
      <Link to={`/spots/${spot.id}`} className="spot-card-link" title={spot.name}>
        <div className="spot-card">
          <img src={spot.previewImage || '/fallback.jpg'} alt={spot.name} />
          <div className="spot-info">
            <div>{spot.city}, {spot.state}</div>
            <div>${spot.price} / night</div>
            <div>★ {spot.avgRating === '0.0' ? 'New' : spot.avgRating}</div>
          </div>
        </div>
      </Link>
    );
  }

export default SpotCard;