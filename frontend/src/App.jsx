import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import SpotsPage from './components/Spots/SpotsPage'; 
import SpotDetails from './components/Spots/SpotDetails';
import HomePage from './components/HomePage';
import CurrentUserSpots from './components/Spots/CurrentUserSpots';
import EditSpotForm from './components/Spots/EditSpotForm';
import { restoreCSRF } from './store/csrf';
import CreateSpotForm from './components/Spots/CreateSpotForm/CreateSpotForm';




restoreCSRF(); 


function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/spots', 
        element: <SpotsPage />
      },
      {
        path: '/spots/new',
        element: <CreateSpotForm />  
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/spots/current', 
        element: <CurrentUserSpots />
      },
      {
        path: '/spots/:spotId/edit',
        element: <EditSpotForm />
      }
    ]
  }
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App;