export interface Birthday {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  afterSunset: boolean;
  gender: 'male' | 'female';
  hebrewDate?: string;
  nextBirthday?: string;
  nextBirthdays?: string[];
  age: number;
  archived: boolean;
}

export interface BirthdayFilters {
  searchTerm: string;
  gender?: 'male' | 'female';
  timeframe?: 'all' | 'thisMonth' | 'nextMonth';
  sortBy: 'name' | 'date' | 'age' | 'nextBirthday';
  sortOrder: 'asc' | 'desc';
}

export type NewBirthday = Omit<Birthday, 'id' | 'hebrewDate' | 'nextBirthday' | 'nextBirthdays' | 'age' | 'archived'>;