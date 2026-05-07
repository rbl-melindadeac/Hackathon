export default function MapPage() {
  return (
    <div className="map-page">
      <h2>Global Photo Map</h2>
      <p>Map will render here in Story 1.3</p>
      <div className="map-placeholder" style={{
        width: '100%',
        height: '600px',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        borderRadius: '8px',
      }}>
        🗺️ Interactive map placeholder
      </div>
    </div>
  );
}
