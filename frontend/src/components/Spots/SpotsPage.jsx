//this will be my main spot component

//first area has to be imports
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots } from '../../store/spots';
import SpotCard from './SpotCard'; //this is for the individual spot previews
import './SpotsPage.css' //this will add the style


//we need to declare a function that Fetches spots once the component loads
function SpotsPage() { //we dont need to pass any arguments
//lets declare our Redux hooks first
const dispatch = useDispatch(); //we'll use this to send things to Redux
const spots = useSelector(state => Object.values(state.spots));
//we learned about useSelector with Ray
//object.values will change the object of spots into an array so we can map it
useEffect(() => {
    dispatch(fetchSpots());
}, [dispatch]);
//now when the SpotsPage loads, it will dispatch the fetchSpots thunk action which should call to the backend
//the spots we fetch from the backend will get stored in Redux
//adding dispatch because its a stable dependancy array so this only runs once when the component mounts
//the function's return should render the Available spots button
return (
<div className="spots-page">
    <h1>Available Spots</h1>
    <div className="spots-grid">
        {spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
        ))}
    </div>
</div>
);

}

//cant forget to export
export default SpotsPage;