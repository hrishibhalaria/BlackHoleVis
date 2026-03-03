/**
 * Catalog of famous black holes with real astronomical data.
 * Each entry provides parameters for the ray-marching shader.
 */
export const BLACK_HOLE_CATALOG = [
  {
    id: 'sgr-a-star',
    name: 'Sagittarius A*',
    category: 'Supermassive',
    mass: '4.15 million M☉',
    spin: 0.9,
    distance: '26,000 ly',
    constellation: 'Sagittarius',
    diskTemp: 8000,
    diskBrightness: 1.8,
    diskInner: 1.5,
    diskOuter: 12.0,
    description: 'The supermassive black hole at the center of our Milky Way galaxy. Imaged by the Event Horizon Telescope in 2022. Its mass is ~4 million times that of our Sun.'
  },
  {
    id: 'm87-star',
    name: 'M87*',
    category: 'Supermassive',
    mass: '6.5 billion M☉',
    spin: 0.75,
    distance: '53.5 million ly',
    constellation: 'Virgo',
    diskTemp: 6000,
    diskBrightness: 2.0,
    diskInner: 1.2,
    diskOuter: 15.0,
    description: 'The first black hole ever directly imaged (2019) by the Event Horizon Telescope. Located at the center of the giant elliptical galaxy Messier 87. Produces a relativistic jet extending 5,000 light-years.'
  },
  {
    id: 'gargantua',
    name: 'Gargantua',
    category: 'Fictional',
    mass: '100 million M☉',
    spin: 0.998,
    distance: '10 billion ly',
    constellation: '—',
    diskTemp: 5500,
    diskBrightness: 1.5,
    diskInner: 1.0,
    diskOuter: 14.0,
    description: 'The fictional near-extremal Kerr black hole from Christopher Nolan\'s Interstellar (2014). Visualized by Kip Thorne\'s team using actual general relativity equations. Its extreme spin makes time dilation immense near the horizon.'
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1',
    category: 'Stellar',
    mass: '21.2 M☉',
    spin: 0.998,
    distance: '6,070 ly',
    constellation: 'Cygnus',
    diskTemp: 15000,
    diskBrightness: 2.5,
    diskInner: 1.0,
    diskOuter: 10.0,
    description: 'One of the strongest X-ray sources in the sky and the first widely accepted black hole candidate. A stellar-mass black hole in a binary system with a blue supergiant star HDE 226868. Near-extremal spin.'
  },
  {
    id: 'ton-618',
    name: 'TON 618',
    category: 'Ultramassive',
    mass: '66 billion M☉',
    spin: 0.5,
    distance: '10.4 billion ly',
    constellation: 'Canes Venatici',
    diskTemp: 4500,
    diskBrightness: 3.0,
    diskInner: 2.0,
    diskOuter: 20.0,
    description: 'One of the most massive black holes ever discovered. Powers the hyperluminous quasar TON 618, which shines with the luminosity of 140 trillion Suns. Its event horizon could swallow our entire solar system.'
  },
  {
    id: 'phoenix-a',
    name: 'Phoenix A',
    category: 'Ultramassive',
    mass: '100 billion M☉',
    spin: 0.3,
    distance: '5.7 billion ly',
    constellation: 'Phoenix',
    diskTemp: 4000,
    diskBrightness: 2.0,
    diskInner: 2.5,
    diskOuter: 25.0,
    description: 'The most massive black hole ever discovered as of 2022, at the center of the Phoenix A galaxy. Its event horizon is larger than our entire solar system, spanning roughly 590 AU.'
  },
  {
    id: 'grs-1915',
    name: 'GRS 1915+105',
    category: 'Stellar',
    mass: '12.4 M☉',
    spin: 0.975,
    distance: '36,000 ly',
    constellation: 'Aquila',
    diskTemp: 20000,
    diskBrightness: 2.8,
    diskInner: 1.0,
    diskOuter: 8.0,
    description: 'A stellar-mass black hole and X-ray binary, famous for its rapid quasi-periodic oscillations and producing apparent superluminal jets. One of the fastest-spinning stellar black holes known.'
  },
  {
    id: 'v404-cygni',
    name: 'V404 Cygni',
    category: 'Stellar',
    mass: '9 M☉',
    spin: 0.92,
    distance: '7,800 ly',
    constellation: 'Cygnus',
    diskTemp: 12000,
    diskBrightness: 2.0,
    diskInner: 1.2,
    diskOuter: 9.0,
    description: 'A stellar-mass black hole in a low-mass X-ray binary. In 2015 it underwent a dramatic outburst visible to amateur telescopes, producing spectacular accretion flares and wobbling jets.'
  },
  {
    id: 'ngc-1277',
    name: 'NGC 1277',
    category: 'Supermassive',
    mass: '17 billion M☉',
    spin: 0.6,
    distance: '220 million ly',
    constellation: 'Perseus',
    diskTemp: 5000,
    diskBrightness: 1.5,
    diskInner: 1.5,
    diskOuter: 16.0,
    description: 'A supermassive black hole that constitutes an unusually large fraction (~14%) of its host galaxy\'s total mass. This "overmassive" black hole challenges models of galaxy formation.'
  },
  {
    id: 'ic-1101',
    name: 'IC 1101*',
    category: 'Ultramassive',
    mass: '40–100 billion M☉',
    spin: 0.4,
    distance: '1.04 billion ly',
    constellation: 'Virgo',
    diskTemp: 4200,
    diskBrightness: 1.8,
    diskInner: 2.0,
    diskOuter: 22.0,
    description: 'The supermassive black hole at the center of IC 1101, one of the largest known galaxies. The galaxy spans 6 million light-years and contains over 100 trillion stars.'
  },
  {
    id: 'a0620',
    name: 'A0620-00',
    category: 'Stellar',
    mass: '6.6 M☉',
    spin: 0.12,
    distance: '3,460 ly',
    constellation: 'Monoceros',
    diskTemp: 8000,
    diskBrightness: 1.2,
    diskInner: 2.5,
    diskOuter: 8.0,
    description: 'One of the closest known black holes to Earth. A slowly spinning stellar-mass black hole in a quiet X-ray binary. Good demonstration of near-Schwarzschild (non-spinning) black hole geometry.'
  },
  {
    id: 'schwarzschild',
    name: 'Schwarzschild (Ideal)',
    category: 'Theoretical',
    mass: '—',
    spin: 0.0,
    distance: '—',
    constellation: '—',
    diskTemp: 6000,
    diskBrightness: 1.5,
    diskInner: 3.0,
    diskOuter: 12.0,
    description: 'A perfectly non-rotating, uncharged black hole — the simplest exact solution to Einstein\'s field equations (1916). Features a perfectly spherical event horizon and shadow. ISCO is at 3× Schwarzschild radius.'
  }
];

/**
 * Search the catalog by name, category, or description.
 */
export function searchCatalog(query) {
  if (!query || query.trim() === '') return BLACK_HOLE_CATALOG;

  const q = query.toLowerCase().trim();
  return BLACK_HOLE_CATALOG.filter(bh =>
    bh.name.toLowerCase().includes(q) ||
    bh.category.toLowerCase().includes(q) ||
    bh.description.toLowerCase().includes(q) ||
    bh.id.toLowerCase().includes(q)
  );
}
