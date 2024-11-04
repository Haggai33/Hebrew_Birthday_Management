import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import Papa from 'papaparse';
import { format, parse } from 'date-fns';

interface CSVImportProps {
  onImport: (data: any[]) => void;
}

export function CSVImport({ onImport }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateHeaders = (headers: string[]) => {
    const requiredHeaders = ['First Name', 'Last Name', 'Birthday'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      setErrorMessage(`Missing required columns: ${missingHeaders.join(', ')}. Please ensure your CSV file contains these columns.`);
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        if (!validateHeaders(Object.keys(results.data[0]))) {
          return;
        }

        const processedData = results.data.map((row: any) => {
          let birthDate = null;
          try {
            birthDate = parse(row.Birthday, 'dd/MM/yyyy', new Date());
          } catch {
            try {
              birthDate = parse(row.Birthday, 'yyyy-MM-dd', new Date());
            } catch (error) {
              console.error('Could not parse date:', row.Birthday);
              return null;
            }
          }

          if (!birthDate || isNaN(birthDate.getTime())) {
            console.error('Invalid date:', row.Birthday);
            return null;
          }

          return {
            firstName: row['First Name'] || '',
            lastName: row['Last Name'] || '',
            birthDate: format(birthDate, 'yyyy-MM-dd'),
            gender: row.Gender?.toLowerCase() === 'male' ? 'male' : 'female',
            afterSunset: row['After Sunset']?.toLowerCase() === 'yes'
          };
        }).filter(Boolean);

        if (processedData.length === 0) {
          setErrorMessage('No valid data found in the CSV file. Please check the format and try again.');
          setShowError(true);
          return;
        }

        onImport(processedData);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setErrorMessage('Error parsing CSV file. Please check the file format and try again.');
        setShowError(true);
      }
    });
  };

  return (
    <>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Upload className="h-5 w-5 mr-2" />
          Import CSV
        </button>
      </div>

      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Import Error</h3>
              <button
                onClick={() => setShowError(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700">{errorMessage}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowError(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}