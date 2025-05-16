import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);

  useEffect(() => {
    const fetchSpot = async () => {
        try {
            const res = await fetch(`/api/spots/${spotId}`);
            console.log('Response:', res); 
      
            if (res.ok) {
              const data = await res.json();
              console.log('Spot data:', data); 
              setSpot(data);
            } else {
              console.error('Failed to fetch spot:', res.status);
            }
          } catch (err) {
            console.error('Error fetching spot:', err);
          }
    };

    fetchSpot();
  }, [spotId]);

  if (!spot) return <h2>Loading spot details...</h2>;

  return (
    <div>
      <h1>{spot.name}</h1>
      <p>{spot.city}, {spot.state}, {spot.country}</p>
      <img src={spot.SpotImages?.[0]?.url} alt={spot.name} width="400" />
      <p>{spot.description}</p>
      <p><strong>${spot.price}</strong> / night</p>
      <p>★ {spot.avgStarRating || "New"}</p>
    </div>
  );
}

export default SpotDetails;