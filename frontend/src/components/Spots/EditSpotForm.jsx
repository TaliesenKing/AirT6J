import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateSpotThunk } from '../../store/spots';

function EditSpotForm() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const spot = useSelector(state => state.spots.allSpots[spotId]);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    description: '',
    price: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name || '',
        address: spot.address || '',
        city: spot.city || '',
        state: spot.state || '',
        country: spot.country || '',
        description: spot.description || '',
        price: spot.price || '',
        lat: spot.lat || '',
        lng: spot.lng || ''
      });
    }
  }, [spot]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const updatedSpot = await dispatch(updateSpotThunk(spotId, formData));
  
      if (updatedSpot && updatedSpot.id) {
        navigate(`/spots/${updatedSpot.id}`); // safely redirect to updated spot page
      } else {
        console.error("Failed to update spot.");
      }
    } catch (err) {
      console.error("Error updating spot:", err);
    }
  };

  if (!spot) return <h2>Loading spot...</h2>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Spot</h2>
      {Object.keys(formData).map((key) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type={key === 'price' ? 'number' : 'text'}
            name={key}
            value={formData[key]}
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditSpotForm;
