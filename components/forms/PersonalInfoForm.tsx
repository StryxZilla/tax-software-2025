'use client';

import React from 'react';
import { PersonalInfo, FilingStatus } from '../../types/tax-types';

const filingStatusOptions: FilingStatus[] = [
  'Single',
  'Married Filing Jointly',
  'Married Filing Separately',
  'Head of Household',
  'Qualifying Surviving Spouse',
];

interface PersonalInfoFormProps {
  value: PersonalInfo;
  onChange: (updates: Partial<PersonalInfo>) => void;
}

export default function PersonalInfoForm({ value, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, newValue: any) => {
    onChange({ [field]: newValue });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={value.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={value.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Social Security Number</label>
          <input
            type="text"
            value={value.ssn}
            onChange={(e) => handleChange('ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Filing Status</label>
          <select
            value={value.filingStatus}
            onChange={(e) => handleChange('filingStatus', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {filingStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={value.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
          <input
            type="text"
            value={value.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={value.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value.isBlind}
            onChange={(e) => handleChange('isBlind', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Check if you are legally blind
          </label>
        </div>
      </div>

      {value.filingStatus === 'Married Filing Jointly' && (
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-6">Spouse Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse First Name</label>
              <input
                type="text"
                value={value.spouseInfo?.firstName || ''}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  firstName: e.target.value 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse Last Name</label>
              <input
                type="text"
                value={value.spouseInfo?.lastName || ''}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  lastName: e.target.value 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse SSN</label>
              <input
                type="text"
                value={value.spouseInfo?.ssn || ''}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  ssn: e.target.value 
                })}
                placeholder="XXX-XX-XXXX"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse Age</label>
              <input
                type="number"
                value={value.spouseInfo?.age || 0}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  age: parseInt(e.target.value) 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value.spouseInfo?.isBlind || false}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  isBlind: e.target.checked 
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Check if spouse is legally blind
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}