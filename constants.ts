import type { FoodItem, StaffMember } from './types';
import { StaffRole } from './types';

export const ADMIN_USERNAME = 'pavan';
export const ADMIN_PASSWORD = 'Pavan@123';
export const TOTAL_TABLES = 20;

export const initialStaff: StaffMember[] = [
    { id: 'staff-1', name: 'Pavan', role: StaffRole.MANAGER, contact: 'pavan@example.com', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80' },
    { id: 'staff-2', name: 'Sanjay', role: StaffRole.CHEF, contact: 'sanjay@example.com', photoUrl: 'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&w=100&q=80' },
    { id: 'staff-3', name: 'Manish', role: StaffRole.WAITER, contact: 'manish@example.com', photoUrl: 'https://images.unsplash.com/photo-1623854199559-158348d61848?auto=format&fit=crop&w=100&q=80' },
];

export const MENU_ITEMS: FoodItem[] = [
  {
    id: 1,
    name: 'Quantum Quinoa Salad',
    description: 'A vibrant mix of organic quinoa, avocado, and star-dusted tomatoes.',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    category: 'Salads',
    reviews: [
      { author: 'Alice', rating: 5, comment: 'So fresh and delicious!', timestamp: new Date() },
      { author: 'Bob', rating: 4, comment: 'A bit pricey, but very good.', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 7,
  },
  {
    id: 2,
    name: 'Galaxy Burger',
    description: 'A cosmic beef patty with cheddar cheese, lettuce, and a special nebula sauce.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80',
    category: 'Main Courses',
    reviews: [
        { author: 'Charlie', rating: 5, comment: 'Best burger in the universe!', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 12,
  },
  {
    id: 3,
    name: 'Starlight Salmon',
    description: 'Grilled salmon fillet served with asparagus and a lemon-butter meteor shower.',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    category: 'Main Courses',
    reviews: [],
    isAvailable: true,
    preparationTime: 15,
  },
  {
    id: 4,
    name: 'Celestial Carbonara',
    description: 'Spaghetti in a creamy sauce with pancetta, pecorino cheese, and black pepper.',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1588013273468-4113a4ea1323?auto=format&fit=crop&w=400&q=80',
    category: 'Main Courses',
    reviews: [
        { author: 'Diana', rating: 4, comment: 'Creamy and satisfying.', timestamp: new Date() },
        { author: 'Eve', rating: 5, comment: 'Absolutely perfect carbonara.', timestamp: new Date() },
        { author: 'Frank', rating: 4, comment: 'A little heavy, but tasty.', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 10,
  },
  {
    id: 5,
    name: 'Meteorite Brownie',
    description: 'A warm, fudgy brownie with a scoop of vanilla ice cream and chocolate asteroids.',
    price: 9.50,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80',
    category: 'Desserts',
    reviews: [
        { author: 'Grace', rating: 5, comment: 'The perfect end to a meal!', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 8,
  },
  {
    id: 6,
    name: 'Supernova Soup',
    description: 'A spicy tomato and basil soup that explodes with flavor.',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
    category: 'Starters',
    reviews: [
        { author: 'Heidi', rating: 4, comment: 'Nice kick to it.', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 5,
  },
    {
    id: 7,
    name: 'Cosmic Chicken Wings',
    description: 'Crispy fried chicken wings tossed in a sweet and spicy galactic glaze.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80',
    category: 'Starters',
    reviews: [],
    isAvailable: true,
    preparationTime: 12,
  },
  {
    id: 8,
    name: 'Orion Onion Rings',
    description: 'Golden-fried onion rings served with a tangy dipping sauce.',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1599498858593-394996615b88?auto=format&fit=crop&w=400&q=80',
    category: 'Starters',
    reviews: [
        { author: 'Ivan', rating: 3, comment: 'A bit greasy for my taste.', timestamp: new Date() },
        { author: 'Judy', rating: 5, comment: 'Crispy and delicious!', timestamp: new Date() },
    ],
    isAvailable: true,
    preparationTime: 8,
  },
];