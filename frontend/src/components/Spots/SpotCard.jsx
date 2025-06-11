//this component will be for individual spot previews

import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import OpenModalButton from '../OpenModalButton';
import DeleteSpotModal from '../DeleteSpotModal';
import './SpotCard.css';

//we need a function that will receive a spot as an argument
//its return should wrap the card in a Link that we imported from react-router-dom
function SpotCard({ spot }) {
  const sessionUser = useSelector(state => state.session.user);
  const location = useLocation(); 
  const isOwner = sessionUser?.id === spot.ownerId;

  return (
    <div className="spot-card">
      <Link to={`/spots/${spot.id}`} className="spot-card-link" title={spot.name}>
        <img src={spot.previewImage || '/fallback.jpg'} alt={spot.name} />
        <div className="spot-info">
          <div>{spot.city}, {spot.state}</div>
          <div>${spot.price} / night</div>
          <div>★ {spot.avgRating === '0.0' ? 'New' : spot.avgRating}</div>
        </div>
      </Link>

      {/* Only show this delete button if the user owns the spot and they're on the spot management page */}
      {isOwner && location.pathname === '/spots/current' && (
        <div className="spot-card-buttons">
          <OpenModalButton
            buttonText="Delete"
            modalComponent={<DeleteSpotModal spotId={spot.id} />}
          />
        </div>
      )}
    </div>
  );
}


export default SpotCard;