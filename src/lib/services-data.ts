export interface Service {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  category: 'wash' | 'detailing' | 'repair' | 'general' | 'oil-change';
  features: string[];
}

export const services: Service[] = [
  {
    id: 'oil-change',
    name: 'Oil Change',
    subtitle: 'Premium Engine Oil Service & Filter Replacement',
    image: '/oil-change-hd-new.jpg',
    category: 'oil-change',
    features: ['Synthetic Oil', 'Oil Filter', 'Fluid Check', 'Engine Inspection', 'Quick Service']
  },
  {
    id: 'car-wash',
    name: 'Car Wash',
    subtitle: 'Professional Cleaning Service At Home',
    image: '/car-wash.png',
    category: 'wash',
    features: ['Pressure Wash', 'Deep Vacuum', 'Mat Cleaning', 'Dashboard Polishing', 'Tire Shine']
  },
  {
    id: 'interior-detailing',
    name: 'Interior Detailing',
    subtitle: 'Complete Cabin Rejuvenation & Sanitization',
    image: '/interior-detailing.jpg',
    category: 'detailing',
    features: ['Deep Cleaning', 'Leather Treatment', 'Sanitization', 'Odor Removal', 'AC Vent Cleaning']
  },
  {
    id: 'exterior-detailing',
    name: 'Exterior Detailing',
    subtitle: 'Unmatched Shine & Paint Protection',
    image: '/exterior-detailing.png',
    category: 'detailing',
    features: ['Paint Correction', 'Chrome Polishing', 'Wax Coating', 'Glass Treatment', 'Wheel Detailing']
  },
  {
    id: 'periodic-service',
    name: 'Periodic Service',
    subtitle: 'Expert Maintenance for Peak Performance',
    image: '/periodic-service.png',
    category: 'general',
    features: ['Oil Change', 'Filter Replacement', 'Brake Inspection', 'Fluid Top-up', 'Multi-point Check']
  },
  {
    id: 'denting-painting',
    name: 'Denting & Painting',
    subtitle: 'Precision Body Work & Factory Finish',
    image: '/denting-painting.jpg',
    category: 'repair',
    features: ['Dent Removal', 'Scratch Repair', 'Full Body Paint', 'Color Matching', 'Clear Coat']
  },
  {
    id: 'suspension-fitments',
    name: 'Suspension & Fitments',
    subtitle: 'Smooth Handling & Ride Comfort',
    image: '/suspension.jpg',
    category: 'repair',
    features: ['Shock Absorbers', 'Strut Replacement', 'Alignment', 'Bushing Replacement', 'Spring Repair']
  },
  {
    id: 'clutch-body-parts',
    name: 'Clutch & Body Parts',
    subtitle: 'Seamless Power Delivery & Component Replacement',
    image: '/clutch.jpg',
    category: 'repair',
    features: ['Clutch Plate', 'Pressure Plate', 'Flywheel Service', 'Body Panel Repair', 'Parts Replacement']
  },
  {
    id: 'insurance-claims',
    name: 'Insurance Claims',
    subtitle: 'Hassle-Free Accident Recovery',
    image: '/insurance.png',
    category: 'general',
    features: ['Claim Processing', 'Documentation Help', 'Surveyor Coordination', 'Cashless Service', 'Quick Settlement']
  },
  {
    id: 'roadside-assistance',
    name: 'Roadside Assistance',
    subtitle: 'Reliable Support Whenever You Need It',
    image: '/roadside.jpg',
    category: 'general',
    features: ['24/7 Support', 'Towing Service', 'Battery Jump Start', 'Flat Tire Help', 'Fuel Delivery']
  },
  {
    id: 'accidental-repair',
    name: 'Accidental Repair',
    subtitle: 'Major Collision Repair Specialists',
    image: '/accidental.jpg',
    category: 'repair',
    features: ['Frame Straightening', 'Panel Replacement', 'Structural Repair', 'Airbag Replacement', 'Full Restoration']
  },
    {
      id: 'car-dealership',
      name: 'Car Dealership',
      subtitle: 'Buy & Sell Quality Pre-Owned Vehicles',
      image: '/car-dealership-hd.jpg',
      category: 'general',
      features: ['Verified Vehicles', 'Documentation Help', 'Fair Pricing', 'Inspection Report', 'Transfer Assistance']
    }

];

export const serviceCategories = [
  { id: 'oil-change', name: 'Oil Change', icon: 'droplet', color: '#3B82F6' },
  { id: 'wash', name: 'Car Wash', icon: 'sparkles', color: '#10B981' },
  { id: 'repair', name: 'Repairing', icon: 'wrench', color: '#F59E0B' },
  { id: 'general', name: 'General', icon: 'settings', color: '#8B5CF6' }
];

export const getServicesByCategory = (category: string) => {
  return services.filter(service => service.category === category);
};

export const getServiceById = (id: string) => {
  return services.find(service => service.id === id);
};
