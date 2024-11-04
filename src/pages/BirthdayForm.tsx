import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addBirthday, updateBirthday, getBirthday } from '../services/api';
import type { NewBirthday } from '../types/birthday';

function BirthdayForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewBirthday>();

  const { data: birthday } = useQuery({
    queryKey: ['birthday', id],
    queryFn: () => getBirthday(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (birthday) {
      reset(birthday);
    }
  }, [birthday, reset]);

  const addMutation = useMutation({
    mutationFn: addBirthday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthdays'] });
      navigate('/');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: NewBirthday) => updateBirthday(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthdays'] });
      navigate('/');
    }
  });

  const onSubmit = async (data: NewBirthday) => {
    try {
      if (id) {
        await updateMutation.mutateAsync(data);
      } else {
        await addMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Birthday' : 'Add Birthday'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            {...register('birthDate', { required: 'Birth date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="afterSunset"
              {...register('afterSunset')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="afterSunset" className="ml-2 block text-sm text-gray-700">
              Born after sunset
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('gender', { required: 'Gender is required' })}
                value="male"
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('gender', { required: 'Gender is required' })}
                value="female"
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Female</span>
            </label>
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Birthday'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BirthdayForm;