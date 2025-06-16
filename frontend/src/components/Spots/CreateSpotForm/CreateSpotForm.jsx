import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpot, addSpotImage } from '../../../store/spots'; 
import './CreateSpotForm.css';



const CreateSpotForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector(state => state.session.user);

  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [ description, setDescription ] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [ previewImage, setPreviewImage] = useState('');

  const [errors, setErrors] = useState({});


  const [img1, setImg1] = useState('');
  const [img2, setImg2] = useState('');
  const [img3, setImg3] = useState('');
  const [img4, setImg4] = useState('');

  if (!sessionUser) return <h2>Please log in to create a spot</h2>;

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({}); 

  const spotData = {
    address,
    city,
    state: stateField,
    country,
    name,
    description,
    price: parseFloat(price)
  };

  const res = await dispatch(createSpot(spotData));

  if (res.errors) {
    setErrors(res.errors);
    return;
  }

  const imageRes = await dispatch(
    addSpotImage(res.id, {
      url: previewImage,
      preview: true
    })
  );

  if (imageRes.errors) {
    setErrors({ previewImage: imageRes.errors[0] });
    return;
  }

const additionalImages = [img1, img2, img3, img4].filter(url => url.trim() !== '');

for (let url of additionalImages) {
  await dispatch(
    addSpotImage(res.id, {
      url,
      preview: false
    })
  );
}


navigate(`/spots/${res.id}`);
};

  return (
    <form onSubmit={handleSubmit} className="create-spot-form">
      <h1>Create a New Spot</h1>

      {Object.values(errors).map((error, i) => <p key={i} className="error">{error}</p>)}

       <section className="form-section location-section">
    <h2>Where&apos;s your place located?</h2>
    <p className="caption">
      Guests will only get your exact address once they booked a reservation.
    </p>

    <label>
      Country
      <input
        type="text"
        value={country}
        onChange={e => setCountry(e.target.value)}
        required
        placeholder="Country"
      />
    </label>

    <label>
      Street Address
      <input
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
        placeholder="Street Address"
      />
    </label>

    <label>
      City
      <input
        type="text"
        value={city}
        onChange={e => setCity(e.target.value)}
        required
        placeholder="City"
      />
    </label>

    <label>
      State
      <input
        type="text"
        value={stateField}
        onChange={e => setStateField(e.target.value)}
        required
        placeholder="State"
      />
    </label>
  </section>

<section className="form-section description-section">
  <h2>Describe your place to guests</h2>
  <p className="caption">
    Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.
  </p>

  <label>
    Description
    <textarea
      value={description}
      onChange={e => setDescription(e.target.value)}
      placeholder="Please write at least 30 characters"
      required
    />
  </label>
</section>

<section className="form-section title-section">
  <h2>Set a title for your spot</h2>
  <p className="caption">
    Catch guests&apos; attention with a spot title that highlights what makes your place special.
  </p>

  <label>
    Name
    <input
      type="text"
      value={name}
      onChange={e => setName(e.target.value)}
      required
      placeholder="Name of your spot"
    />
  </label>
</section>

<section className="form-section price-section">
  <h2>Set a base price for your spot</h2>
  <p className="caption">
    Competitive pricing can help your listing stand out and rank higher in search results.
  </p>

  <label>
    Price per night (USD)
    <div className="price-input-wrapper">
      <span className="dollar-sign">$</span>
      <input
        type="number"
        min="1"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
        placeholder="Price per night (USD)"
      />
    </div>
  </label>
</section>

<section className="form-section image-upload-section">
  <h2>Liven up your spot with photos</h2>
  <p className="caption">
    Submit a link to at least one photo to publish your spot.
  </p>

  <label>
    Preview Image URL
    <input
      type="url"
      value={previewImage}
      onChange={e => setPreviewImage(e.target.value)}
      required
      placeholder="Preview Image URL"
    />
  </label>

  <input
    type="url"
    value={img1}
    onChange={e => setImg1(e.target.value)}
    placeholder="Image URL"
  />
  <input
    type="url"
    value={img2}
    onChange={e => setImg2(e.target.value)}
    placeholder="Image URL"
  />
  <input
    type="url"
    value={img3}
    onChange={e => setImg3(e.target.value)}
    placeholder="Image URL"
  />
  <input
    type="url"
    value={img4}
    onChange={e => setImg4(e.target.value)}
    placeholder="Image URL"
  />
</section>

      <button type="submit">Create Spot</button>
    </form>
  );
};

export default CreateSpotForm;
