import { User, LoginData, RegisterData } from '../types/auth';

const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const storeUsers = (users: User[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const login = async ({ email, password }: LoginData): Promise<User> => {
  await delay(800); // Simulate network delay
  
  const users = getStoredUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // In a real app, we would hash the password and compare hashes
  // For demo purposes, we're using plain text
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const register = async (data: RegisterData): Promise<User> => {
  await delay(800);
  
  const users = getStoredUsers();
  
  if (users.some(u => u.email === data.email)) {
    throw new Error('Email already registered');
  }
  
  const newUser: User = {
    id: crypto.randomUUID(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: users.length === 0 ? 'admin' : 'user', // First user is admin
  };
  
  users.push(newUser);
  storeUsers(users);
  
  // Auto login after registration
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logout = async (): Promise<void> => {
  await delay(300);
  localStorage.removeItem(CURRENT_USER_KEY);
};