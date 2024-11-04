import { Birthday, NewBirthday } from '../types/birthday';
import { convertGregorianToHebrew, getNextHebrewBirthdays } from './hebcal';
import { format } from 'date-fns';

// Get stored birthdays from localStorage
const getStoredBirthdays = (): Birthday[] => {
  const stored = localStorage.getItem('birthdays');
  return stored ? JSON.parse(stored) : [];
};

// Save birthdays to localStorage
const saveBirthdays = (birthdays: Birthday[]) => {
  localStorage.setItem('birthdays', JSON.stringify(birthdays));
};

export async function getBirthdays(): Promise<Birthday[]> {
  try {
    const birthdays = getStoredBirthdays();
    const birthdaysWithDates = await Promise.all(
      birthdays.map(async (birthday) => {
        try {
          const birthDate = new Date(birthday.birthDate);
          const hebrewDate = await convertGregorianToHebrew(birthDate, birthday.afterSunset);
          const nextBirthdays = await getNextHebrewBirthdays(birthDate, birthday.afterSunset);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          return {
            ...birthday,
            hebrewDate: hebrewDate.hebrew,
            nextBirthday: nextBirthdays[0] ? format(nextBirthdays[0], 'yyyy-MM-dd') : undefined,
            nextBirthdays: nextBirthdays.map(date => format(date, 'yyyy-MM-dd')),
            age
          };
        } catch (error) {
          console.error(`Error processing birthday for ${birthday.firstName}:`, error);
          return birthday;
        }
      })
    );

    return birthdaysWithDates.filter(b => !b.archived);
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    throw new Error('Failed to fetch birthdays');
  }
}

export async function getBirthday(id: string): Promise<Birthday> {
  const birthdays = getStoredBirthdays();
  const birthday = birthdays.find(b => b.id === id);
  if (!birthday) throw new Error('Birthday not found');
  return birthday;
}

export async function addBirthday(data: NewBirthday): Promise<Birthday> {
  const birthdays = getStoredBirthdays();
  const id = crypto.randomUUID();
  const newBirthday: Birthday = {
    ...data,
    id,
    age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
    archived: false
  };
  birthdays.push(newBirthday);
  saveBirthdays(birthdays);
  return newBirthday;
}

export async function updateBirthday(id: string, data: Partial<NewBirthday>): Promise<Birthday> {
  const birthdays = getStoredBirthdays();
  const index = birthdays.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Birthday not found');
  
  birthdays[index] = {
    ...birthdays[index],
    ...data,
    age: new Date().getFullYear() - new Date(data.birthDate || birthdays[index].birthDate).getFullYear()
  };
  
  saveBirthdays(birthdays);
  return birthdays[index];
}

export async function deleteBirthdays(ids: string[]): Promise<void> {
  const birthdays = getStoredBirthdays();
  const filtered = birthdays.filter(b => !ids.includes(b.id));
  saveBirthdays(filtered);
}

export async function archiveBirthday(id: string): Promise<void> {
  const birthdays = getStoredBirthdays();
  const index = birthdays.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Birthday not found');
  
  birthdays[index].archived = true;
  saveBirthdays(birthdays);
}

export async function getArchivedBirthdays(): Promise<Birthday[]> {
  const birthdays = getStoredBirthdays();
  return birthdays.filter(b => b.archived);
}

export async function restoreBirthday(id: string): Promise<void> {
  const birthdays = getStoredBirthdays();
  const index = birthdays.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Birthday not found');
  
  birthdays[index].archived = false;
  saveBirthdays(birthdays);
}