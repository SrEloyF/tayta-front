'use client';

import { useState } from 'react';
import { UsersTable } from "./components/UsersTable";
import { UserForm } from "./components/UserForm";
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import { Plus, UserPlus, ArrowLeft } from 'lucide-react';

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
        <div className="flex items-center space-x-4">
          {showUserForm && (
            <Button 
              onClick={handleFormCancel}
              variant="outline"
              className="text-gray-300 hover:text-white border-gray-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          )}
          <h1 className="text-2xl font-bold text-yellow-400">
            {showUserForm ? (selectedUser ? 'Editar Usuario' : 'Nuevo Usuario') : 'Gestión de Usuarios'}
          </h1>
        </div>
        
        {!showUserForm && (
          <Button 
            onClick={handleNewUser}
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {showUserForm ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
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