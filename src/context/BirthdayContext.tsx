import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Birthday, NewBirthday } from '../types/birthday';
import * as api from '../services/api';

interface BirthdayContextType {
  birthdays: Birthday[];
  archivedBirthdays: Birthday[];
  isLoading: boolean;
  error: string | null;
  addBirthday: (data: NewBirthday) => Promise<void>;
  updateBirthday: (id: string, data: Partial<NewBirthday>) => Promise<void>;
  deleteBirthdays: (ids: string[]) => Promise<void>;
  archiveBirthday: (id: string) => Promise<void>;
  restoreBirthday: (id: string) => Promise<void>;
  refreshBirthdays: () => Promise<void>;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export function BirthdayProvider({ children }: { children: React.ReactNode }) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [archivedBirthdays, setArchivedBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBirthdays = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [activeBirthdays, archived] = await Promise.all([
        api.getBirthdays(),
        api.getArchivedBirthdays()
      ]);
      setBirthdays(activeBirthdays.filter(b => !b.archived));
      setArchivedBirthdays(archived);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch birthdays');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBirthdays();
  }, [refreshBirthdays]);

  const addBirthday = async (data: NewBirthday) => {
    try {
      await api.addBirthday(data);
      refreshBirthdays();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add birthday');
      throw err;
    }
  };

  const updateBirthday = async (id: string, data: Partial<NewBirthday>) => {
    try {
      await api.updateBirthday(id, data);
      refreshBirthdays();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update birthday');
      throw err;
    }
  };

  const deleteBirthdays = async (ids: string[]) => {
    try {
      await api.deleteBirthdays(ids);
      refreshBirthdays();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete birthdays');
      throw err;
    }
  };

  const archiveBirthday = async (id: string) => {
    try {
      await api.archiveBirthday(id);
      refreshBirthdays();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive birthday');
      throw err;
    }
  };

  const restoreBirthday = async (id: string) => {
    try {
      await api.restoreBirthday(id);
      refreshBirthdays();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore birthday');
      throw err;
    }
  };

  return (
    <BirthdayContext.Provider
      value={{
        birthdays,
        archivedBirthdays,
        isLoading,
        error,
        addBirthday,
        updateBirthday,
        deleteBirthdays,
        archiveBirthday,
        restoreBirthday,
        refreshBirthdays
      }}
    >
      {children}
    </BirthdayContext.Provider>
  );
}

export function useBirthdays() {
  const context = useContext(BirthdayContext);
  if (context === undefined) {
    throw new Error('useBirthdays must be used within a BirthdayProvider');
  }
  return context;
}