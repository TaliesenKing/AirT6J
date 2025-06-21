import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSpots, deleteSpot } from '../../store/spots';
import './CurrentUserSpots.css';

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

  const handleDelete = async (spotId, e) => {
    e.stopPropagation(); // Prevent triggering the parent div's click
    const confirmDelete = window.confirm('Are you sure you want to delete this spot?');
    if (confirmDelete) {
      await dispatch(deleteSpot(spotId));
      dispatch(fetchSpots()); // Refresh the list
    }
  };

  return (
    <div className="manage-spots-container">
      <h1>Manage Spots</h1>
      
      {userSpots.length === 0 ? (
        <div className="no-spots">
          <p>You haven&apos;t created any spots yet!</p>
          <button 
            onClick={() => navigate('/spots/new')}
            className="create-spot-button"
          >
            Create a New Spot
          </button>
        </div>
      ) : (
        <div className="spots-grid">
          {userSpots.map(spot => (
            <div 
              key={spot.id} 
              className="spot-tile"
              onClick={() => navigate(`/spots/${spot.id}`)}
            >
              <div className="image-container">
                <img 
                  src={spot.previewImage || 'https://via.placeholder.com/300'} 
                  alt={spot.name} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                />
              </div>
              <div className="spot-info">
                <div className="location-rating">
                  <span>{spot.city}, {spot.state}</span>
                  <span className="rating">
                    ★ {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
                  </span>
                </div>
                <div className="price">${spot.price} night</div>
                <div className="spot-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/spots/${spot.id}/edit`);
                    }}
                    className="update-button"
                  >
                    Update
                  </button>
                  <button 
                    onClick={(e) => handleDelete(spot.id, e)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrentUserSpots;