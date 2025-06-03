import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpot } from '../../../store/spots'; // You’ll create this thunk in a moment

const CreateSpotForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector(state => state.session.user);

  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  const [errors, setErrors] = useState({});

  if (!sessionUser) return <h2>Please log in to create a spot</h2>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const spotData = {
      address,
      city,
      state: stateField,
      country,
      name,
      description,
      price: parseFloat(price),
      previewImage
    };

    const res = await dispatch(createSpot(spotData));

    if (res.errors) {
      setErrors(res.errors);
    } else {
      navigate(`/spots/${res.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-spot-form">
      <h1>Create a New Spot</h1>

      {Object.values(errors).map((error, i) => <p key={i} className="error">{error}</p>)}

      <label>
        Country
        <input type="text" value={country} onChange={e => setCountry(e.target.value)} required />
      </label>

      <label>
        Address
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
      </label>

      <label>
        City
        <input type="text" value={city} onChange={e => setCity(e.target.value)} required />
      </label>

      <label>
        State
        <input type="text" value={stateField} onChange={e => setStateField(e.target.value)} required />
      </label>

      <label>
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </label>

      <label>
        Description
        <textarea value={description} onChange={e => setDescription(e.target.value)} required />
      </label>

      <label>
        Price per night (USD)
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
      </label>

      <label>
        Preview Image URL
        <input type="text" value={previewImage} onChange={e => setPreviewImage(e.target.value)} required />
      </label>

      <button type="submit">Create Spot</button>
    </form>
  );
};

export default CreateSpotForm;
