import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className="navigation-bar">
      <ul className="navigation-list">
        <li className="logo">
          <NavLink to="/">
            <img src="/logo.png" alt="Website Logo" className="logo-image" />
          </NavLink>
        </li>

        <div className="right-nav">
          {sessionUser && (
            <li className="create-spot-button">
              <NavLink to="/spots/new" className="create-spot-link">
                Create a New Spot
              </NavLink>
            </li>
          )}

          {isLoaded && (
            <li className="profile-button">
              <ProfileButton user={sessionUser} />
            </li>
          )}
        </div>
      </ul>
    </nav>
  );
}

export default Navigation;