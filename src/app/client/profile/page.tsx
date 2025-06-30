// app/client/profile/page.tsx
'use client';
import { Tab } from '@headlessui/react';
import { PersonalInfoForm } from '@/components/client/profile/PersonalInfoForm';
import { ChangePasswordForm } from '@/components/client/profile/ChangePasswordForm';
import { PaymentMethods } from '@/components/client/profile/PaymentMethods';

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {['Información Personal', 'Seguridad', 'Métodos de Pago'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-md py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-blue-700'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                }`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <PersonalInfoForm />
          </Tab.Panel>
          <Tab.Panel>
            <ChangePasswordForm />
          </Tab.Panel>
          <Tab.Panel>
            <PaymentMethods />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}