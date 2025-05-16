import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSpots } from '../../store/spots';

function CurrentUserSpots() {
  const dispatch = useDispatch();
  const spots = useSelector(state => Object.values(state.spots.allSpots));
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  if (!sessionUser) return <h2>Please log in to view your spots.</h2>;

  const userSpots = spots.filter(spot => spot.ownerId === sessionUser.id);

  return (
    <div className="user-spots">
      <h2>Your Spots</h2>
      {userSpots.map(spot => (
        <div key={spot.id} className="spot-card">
          <img src={spot.previewImage} alt={spot.name} />
          <h3>{spot.name}</h3>
          <p>{spot.city}, {spot.state}</p>
          <p>${spot.price} / night</p>
          <p>★ {spot.avgStarRating || "New"}</p>

          <button onClick={() => navigate(`/spots/${spot.id}/edit`)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}

export default CurrentUserSpots;