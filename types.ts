
export enum PanelType {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  SCHEDULED = 'Scheduled',
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed',
  CLEARED = 'Cleared',
}

export enum StaffRole {
  MANAGER = 'Manager',
  CHEF = 'Chef',
  WAITER = 'Waiter',
  CLEANER = 'Cleaner',
  DISHWASHER = 'Dishwasher',
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  contact: string; // e.g., phone number or email
  photoUrl: string;
}

export interface Shift {
  id: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  clockIn: Date;
  clockOut?: Date;
}

export interface MonthlyReport {
  id: string;
  staffId: string;
  staffName: string;
  month: number; // 0-11 for Jan-Dec
  year: number;
  totalHours: number;
  attendanceData: { date: string; hours: number; status: string }[];
  generatedAt: Date;
}


export interface Review {
  author: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  reviews: Review[];
  isAvailable?: boolean;
  preparationTime?: number; // Estimated prep time in minutes
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  tableNumber: number;
  isNew?: boolean;
  justUpdated?: boolean;
  scheduledTime?: Date;
  reminderSent?: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface DbSetting {
  key: string;
  value: any;
}

export interface TableStatus {
  tableNumber: number;
  status: 'available' | 'unavailable';
}