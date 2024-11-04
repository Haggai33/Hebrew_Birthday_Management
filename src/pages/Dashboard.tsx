import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, Download } from 'lucide-react';
import { BirthdayList } from '../components/birthdays/BirthdayList';
import { BirthdayStats } from '../components/birthdays/BirthdayStats';
import { BirthdayFilters } from '../components/birthdays/BirthdayFilters';
import { CSVImport } from '../components/birthdays/CSVImport';
import { CSVExport } from '../components/birthdays/CSVExport';
import { useBirthdays } from '../context/BirthdayContext';
import { useAuth } from '../context/AuthContext';
import type { Birthday, BirthdayFilters as FilterType } from '../types/birthday';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    birthdays, 
    isLoading, 
    error,
    addBirthday,
    deleteBirthdays,
    archiveBirthday
  } = useBirthdays();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterType>({
    searchTerm: '',
    sortBy: 'nextBirthday', // Changed default sort
    sortOrder: 'asc',
    timeframe: 'all'
  });

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredBirthdays = birthdays
    .filter(birthday => {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameLower = `${birthday.firstName} ${birthday.lastName}`.toLowerCase();
      
      const matchesSearch = !filters.searchTerm || nameLower.includes(searchLower);
      const matchesGender = !filters.gender || birthday.gender === filters.gender;
      
      let matchesTimeframe = true;
      if (filters.timeframe && filters.timeframe !== 'all' && birthday.nextBirthday) {
        const nextBirthday = new Date(birthday.nextBirthday);
        const today = new Date();
        const currentMonth = today.getMonth();
        const nextMonth = (currentMonth + 1) % 12;
        const birthdayMonth = nextBirthday.getMonth();

        if (filters.timeframe === 'thisMonth') {
          matchesTimeframe = birthdayMonth === currentMonth;
        } else if (filters.timeframe === 'nextMonth') {
          matchesTimeframe = birthdayMonth === nextMonth;
        }
      }
      
      return matchesSearch && matchesGender && matchesTimeframe;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'name':
          return order * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
        case 'date':
          return order * (new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime());
        case 'nextBirthday':
          if (!a.nextBirthday) return 1;
          if (!b.nextBirthday) return -1;
          return order * (new Date(a.nextBirthday).getTime() - new Date(b.nextBirthday).getTime());
        case 'age':
          return order * (a.age - b.age);
        default:
          return 0;
      }
    });

  // Rest of the component remains the same...
  const handleEdit = (birthday: Birthday) => {
    navigate(`/edit/${birthday.id}`);
  };

  const handleDelete = async (ids: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected birthdays?`)) {
      try {
        await deleteBirthdays(ids);
        setSelectedIds(new Set());
      } catch (error) {
        console.error('Failed to delete birthdays:', error);
      }
    }
  };

  const handleArchive = async (ids: string[]) => {
    if (window.confirm(`Are you sure you want to archive ${ids.length} selected birthdays?`)) {
      try {
        await Promise.all(ids.map(id => archiveBirthday(id)));
        setSelectedIds(new Set());
      } catch (error) {
        console.error('Failed to archive birthdays:', error);
      }
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      await Promise.all(data.map(birthday => addBirthday(birthday)));
    } catch (error) {
      console.error('Failed to import birthdays:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Birthday Dashboard</h1>
        <div className="flex space-x-4">
          <CSVImport onImport={handleImport} />
          <CSVExport birthdays={birthdays} />
          <button
            onClick={() => navigate('/add')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Birthday
          </button>
        </div>
      </div>

      <BirthdayStats birthdays={filteredBirthdays} />
      
      <BirthdayFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="bg-white rounded-lg shadow-md">
        <BirthdayList
          birthdays={filteredBirthdays}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          selectedIds={selectedIds}
          onSelect={(id, selected) => {
            const newIds = new Set(selectedIds);
            if (selected) {
              newIds.add(id);
            } else {
              newIds.delete(id);
            }
            setSelectedIds(newIds);
          }}
          onSelectAll={(selected) => {
            setSelectedIds(selected ? new Set(filteredBirthdays.map(b => b.id)) : new Set());
          }}
          isAdmin={user?.role === 'admin'}
        />
      </div>
    </div>
  );
}

export default Dashboard;