export const PHILIPPINE_LOCATIONS = [
  { city: 'Manila', province: 'Metro Manila', center: [14.5995, 120.9842], hub: [14.5764, 121.0851] },
  { city: 'Quezon City', province: 'Metro Manila', center: [14.676, 121.0437], hub: [14.5764, 121.0851] },
  { city: 'Makati', province: 'Metro Manila', center: [14.5547, 121.0244], hub: [14.5764, 121.0851] },
  { city: 'Cebu City', province: 'Cebu', center: [10.3157, 123.8854], hub: [10.323, 123.922] },
  { city: 'Davao City', province: 'Davao del Sur', center: [7.1907, 125.4553], hub: [7.1, 125.6] },
];

export function createApproximateRoute(location) {
  const [startLat, startLng] = location.hub;
  const [endLat, endLng] = location.center;
  const bend = endLng >= startLng ? 1 : -1;

  return Array.from({ length: 6 }, (_, index) => {
    const progress = index / 5;
    const curve = Math.sin(progress * Math.PI) * 0.012 * bend;
    return [
      startLat + (endLat - startLat) * progress + curve * 0.55,
      startLng + (endLng - startLng) * progress + curve,
    ];
  });
}