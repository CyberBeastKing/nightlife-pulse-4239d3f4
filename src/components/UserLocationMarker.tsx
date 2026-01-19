export function UserLocationMarker() {
  return (
    <div className="relative">
      {/* Expanding ring animation */}
      <div className="user-location-ring w-8 h-8" />
      
      {/* Main marker */}
      <div className="user-location w-8 h-8 relative z-10 flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>
    </div>
  );
}
