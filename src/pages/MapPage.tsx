import MapView from '../components/MapView';
import '../styles/MapPage.css';

export default function MapPage() {
  return (
    <div className="map-page">
      <div className="map-wrapper">
        <MapView />
      </div>
    </div>
  );
}
