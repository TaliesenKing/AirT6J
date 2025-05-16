import SpotsPage from '../Spots/SpotsPage';
import './HomePage.css';


export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to TJBnB!</h1>
      <p>Browse our beautiful spots around the world. Sign up to book your next adventure!</p>
      <SpotsPage />
    </div>
  );
}