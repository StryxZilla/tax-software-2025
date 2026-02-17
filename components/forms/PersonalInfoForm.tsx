'use client';

import React from 'react';
import { PersonalInfo, FilingStatus } from '../../types/tax-types';
import { User, MapPin, Shield, Heart } from 'lucide-react';

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
    <div className="space-y-8 max-w-3xl mx-auto px-4 py-6 fade-in">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Personal Information</h2>
        <p className="text-slate-600">Let's start with your basic information for your tax return.</p>
      </div>
      
      {/* Basic Information Card */}
      <div className="card-premium p-6 space-y-6">
        <div className="flex items-center space-x-2 text-slate-700 border-b pb-3 mb-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Social Security Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={value.ssn}
                onChange={(e) => handleChange('ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Your information is secure and encrypted</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Filing Status <span className="text-red-500">*</span>
            </label>
            <select
              value={value.filingStatus}
              onChange={(e) => handleChange('filingStatus', e.target.value)}
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            >
              {filingStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={value.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              placeholder="Your age"
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center pt-8">
            <input
              type="checkbox"
              id="isBlind"
              checked={value.isBlind}
              onChange={(e) => handleChange('isBlind', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
            />
            <label htmlFor="isBlind" className="ml-3 text-sm font-medium text-slate-700">
              I am legally blind
            </label>
          </div>
        </div>
      </div>

      {/* Address Information Card */}
      <div className="card-premium p-6 space-y-6">
        <div className="flex items-center space-x-2 text-slate-700 border-b pb-3 mb-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Address</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City name"
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="12345"
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spouse Information (conditional) */}
      {value.filingStatus === 'Married Filing Jointly' && (
        <div className="card-premium p-6 space-y-6 border-2 border-blue-100">
          <div className="flex items-center space-x-2 text-slate-700 border-b pb-3 mb-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Spouse Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Spouse First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value.spouseInfo?.firstName || ''}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  firstName: e.target.value 
                })}
                placeholder="Enter spouse's first name"
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Spouse Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value.spouseInfo?.lastName || ''}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  lastName: e.target.value 
                })}
                placeholder="Enter spouse's last name"
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Spouse SSN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={value.spouseInfo?.ssn || ''}
                  onChange={(e) => handleChange('spouseInfo', { 
                    ...value.spouseInfo,
                    ssn: e.target.value 
                  })}
                  placeholder="XXX-XX-XXXX"
                  className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Spouse Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={value.spouseInfo?.age || 0}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  age: parseInt(e.target.value) 
                })}
                placeholder="Spouse's age"
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="spouseIsBlind"
                checked={value.spouseInfo?.isBlind || false}
                onChange={(e) => handleChange('spouseInfo', { 
                  ...value.spouseInfo,
                  isBlind: e.target.checked 
                })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
              />
              <label htmlFor="spouseIsBlind" className="ml-3 text-sm font-medium text-slate-700">
                Spouse is legally blind
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
