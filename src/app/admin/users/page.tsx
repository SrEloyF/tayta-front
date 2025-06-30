'use client';

import { useState } from 'react';
import { UsersTable } from "./components/UsersTable";
import { UserForm } from "./components/UserForm";
import { Button } from '@/components/ui/Button';
import { User } from '@/types';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleFormSuccess = () => {
    setShowUserForm(false);
    setSelectedUser(null);
    // Forzar actualización de la tabla
    setRefreshKey(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowUserForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Gestión de Usuarios</h1>
        
        {!showUserForm && (
          <Button 
            onClick={handleNewUser}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Nuevo Usuario
          </Button>
        )}
      </div>

      {showUserForm ? (
        <div className="mb-8">
          <UserForm 
            user={selectedUser} 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <UsersTable 
          key={refreshKey} 
          onEditUser={handleEditUser} 
        />
      )}
    </div>
  );
}