import React, { useState } from 'react';
import { Share2, Cake, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import type { Birthday } from '../../types/birthday';
import { CalendarButton } from './CalendarButton';
import { NextBirthdaysPopup } from './NextBirthdaysPopup';

interface BirthdayListProps {
  birthdays: Birthday[];
  onEdit: (birthday: Birthday) => void;
  onDelete: (ids: string[]) => void;
  onArchive: (ids: string[]) => void;
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  isAdmin: boolean;
}

export function BirthdayList({
  birthdays,
  onEdit,
  onDelete,
  onArchive,
  selectedIds,
  onSelect,
  onSelectAll,
  isAdmin
}: BirthdayListProps) {
  const [selectedBirthday, setSelectedBirthday] = useState<{
    dates: Date[];
    name: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatWhatsAppMessage = (birthdays: Birthday[]) => {
    const monthName = format(new Date(), 'MMMM');
    
    const message = `*ימי ההולדת לחודש ${monthName}:*\n\n` +
      birthdays
        .sort((a, b) => new Date(a.nextBirthday || '').getTime() - new Date(b.nextBirthday || '').getTime())
        .map(birthday => {
          const nextBirthdayDate = birthday.nextBirthday ? format(new Date(birthday.nextBirthday), 'd MMMM yyyy') : '';
          return `*${birthday.firstName} ${birthday.lastName}* - תאריך לידה: ${birthday.hebrewDate}\n` +
                 `יום הולדת: ${nextBirthdayDate}\n` +
                 `גיל: ${birthday.age}\n`;
        })
        .join('\n');

    navigator.clipboard.writeText(message);
    alert('Birthday list copied to clipboard!');
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Trigger a re-fetch of the birthdays data
      await window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isUpcoming = (birthday: Birthday) => {
    if (!birthday.nextBirthday) return false;
    const nextBirthday = new Date(birthday.nextBirthday);
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    return nextBirthday >= today && nextBirthday <= twoWeeksFromNow;
  };

  const isThisMonth = (birthday: Birthday) => {
    if (!birthday.nextBirthday) return false;
    const nextBirthday = new Date(birthday.nextBirthday);
    const today = new Date();
    return nextBirthday.getMonth() === today.getMonth();
  };

  const handleNextBirthdayClick = (birthday: Birthday) => {
    if (birthday.nextBirthdays && birthday.nextBirthdays.length > 0) {
      setSelectedBirthday({
        dates: birthday.nextBirthdays.map(date => new Date(date)),
        name: `${birthday.firstName} ${birthday.lastName}`
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4 px-6 py-3">
        <div className="flex items-center">
          {isAdmin && (
            <>
              <input
                type="checkbox"
                checked={selectedIds.size === birthdays.length && birthdays.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {selectedIds.size > 0 && (
                <div className="ml-4 space-x-2">
                  <button
                    onClick={() => onDelete(Array.from(selectedIds))}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete Selected ({selectedIds.size})
                  </button>
                  <button
                    onClick={() => onArchive(Array.from(selectedIds))}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Archive Selected ({selectedIds.size})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => formatWhatsAppMessage(birthdays)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Copy to WhatsApp
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isAdmin && (
              <th scope="col" className="w-12 px-6 py-3">
                <span className="sr-only">Select</span>
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gregorian Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hebrew Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Birthday
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            {isAdmin && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {birthdays.map((birthday) => (
            <tr 
              key={birthday.id} 
              className={`hover:bg-gray-50 ${isUpcoming(birthday) ? 'bg-yellow-50' : ''}`}
            >
              {isAdmin && (
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(birthday.id)}
                    onChange={(e) => onSelect(birthday.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {birthday.firstName} {birthday.lastName}
                    {isThisMonth(birthday) && (
                      <Cake className="h-4 w-4 ml-2 inline text-pink-500" />
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {format(new Date(birthday.birthDate), 'dd/MM/yyyy')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{birthday.hebrewDate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleNextBirthdayClick(birthday)}
                    className="text-sm text-gray-900 hover:text-indigo-600"
                  >
                    {birthday.nextBirthday 
                      ? format(new Date(birthday.nextBirthday), 'dd/MM/yyyy')
                      : 'Calculating...'}
                  </button>
                  {birthday.nextBirthday && (
                    <CalendarButton birthday={birthday} type="hebrew" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{birthday.age}</div>
              </td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(birthday)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBirthday && (
        <NextBirthdaysPopup
          birthdays={selectedBirthday.dates}
          name={selectedBirthday.name}
          onClose={() => setSelectedBirthday(null)}
        />
      )}
    </div>
  );
}