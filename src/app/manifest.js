export default function manifest() {
  return {
    name: 'Nirbhaya Setu',
    short_name: 'Nirbhaya',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e16441',
    description: 'Safety concierge, SOS, and community safety tools.',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' }
    ]
  };
}