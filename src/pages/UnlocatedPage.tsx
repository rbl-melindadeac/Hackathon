export default function UnlocatedPage() {
  return (
    <div className="unlocated-page">
      <h2>Unlocated Photos</h2>
      <p>Photos without GPS data will appear here in Epic 3</p>
      <div className="photos-placeholder" style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        borderRadius: '8px',
      }}>
        📸 Photos grid placeholder
      </div>
    </div>
  );
}
