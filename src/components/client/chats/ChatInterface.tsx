// src/components/ChatInterface.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { 
  MessageCircle, 
  Search, 
  Paperclip, 
  Send, 
  User, 
  Star, 
  CheckCircle, 
  Clock 
} from 'lucide-react';
import { ImageWithAuth } from '@/components/ui/ImageWithAuth';
import { Button } from '@/components/ui/Button';

// Definimos _id opcional para manejar mensajes temporales
export interface User {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  url_img?: string;
  rating?: number;
}

export interface Chat {
  _id: string;
  idParticipantes: number[];
  ultimoMensaje?: string;
  fechaUltimoMensaje?: string;
}

export interface Mensaje {
  _id?: string;
  idChat: string;
  idEmisor: number;
  contenido: string;
  timestamp: string;
  _idTemp?: string;
  estado?: 'enviado' | 'entregado' | 'leido';
}

interface ChatInterfaceProps {
  userId: number;
  users: User[];
  chats: Chat[];
  mensajes: Mensaje[];
  socket: Socket | null;
  activeChatId: string;
  onSend: (texto: string, chatId: string) => void;
  onSelectUser: (otherId: number) => void;
  onSelectChat: (chatId: string) => void;
}

// Componente de Sidebar de Chats
const ChatSidebar: React.FC<{
  chats: Chat[];
  users: User[];
  userId: number;
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  onSelectUser: (userId: number) => void;
}> = ({ chats, users, userId, activeChatId, onSelectChat, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Eliminar chats duplicados y asegurar que solo se muestre un chat por usuario
  const filteredChats = chats
    .filter(chat => {
      const otherUserId = chat.idParticipantes.find(id => id !== userId);
      const otherUser = users.find(u => u.id_usuario === otherUserId);
      return otherUser && 
        (`${otherUser.nombres} ${otherUser.apellidos}`)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
    })
    // Eliminar chats duplicados (mismo usuario)
    .filter((chat, index, self) => {
      const otherUserId = chat.idParticipantes.find(id => id !== userId);
      // Mantener solo el primer chat con este usuario
      return index === self.findIndex(c => {
        const otherUserInList = c.idParticipantes.find(id => id !== userId);
        return otherUserInList === otherUserId;
      });
    })
    // Ordenar por fecha del último mensaje (más reciente primero)
    .sort((a, b) => {
      const dateA = a.fechaUltimoMensaje ? new Date(a.fechaUltimoMensaje).getTime() : 0;
      const dateB = b.fechaUltimoMensaje ? new Date(b.fechaUltimoMensaje).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="w-96 bg-gradient-to-br from-blue-50 to-blue-100 border-r border-gray-200 shadow-lg">
      <div className="p-6 bg-white border-b">
        <div className="flex items-center space-x-4 mb-4">
          <MessageCircle className="text-blue-600 w-8 h-8" />
          <h2 className="text-2xl font-bold text-gray-800">Mensajes</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-300 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
        {filteredChats.map(chat => {
          
          const otherUserId = chat.idParticipantes.find(id => id !== userId);
          const otherUser = users.find(u => u.id_usuario === otherUserId);

          return otherUser ? (
            <div 
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={`
                flex items-center p-4 cursor-pointer transition 
                ${activeChatId === chat._id 
                  ? 'bg-blue-100 border-l-4 border-blue-600' 
                  : 'hover:bg-blue-50'}
              `}
            >
              <ImageWithAuth
                imagePath={`user_imgs/${otherUser.url_img}`}
                alt={`${otherUser.nombres} ${otherUser.apellidos}`}
                className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-md"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    {otherUser.nombres} {otherUser.apellidos}
                  </h3>
                  {otherUser.rating && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">{otherUser.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.ultimoMensaje || 'Sin mensajes'}
                </p>
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

// Componente de Mensajes
const MessageList: React.FC<{
  mensajes: Mensaje[];
  userId: number;
  users: User[];
  activeChatId: string;
}> = ({ mensajes, userId, users, activeChatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, activeChatId]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      {mensajes.map((mensaje, index) => {
        const isOwnMessage = mensaje.idEmisor === userId;
        const sender = users.find(u => u.id_usuario === mensaje.idEmisor);

        return (
          <div 
            key={mensaje._id || mensaje._idTemp} 
            className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            {!isOwnMessage && sender && (
              <ImageWithAuth
                imagePath={`user_imgs/${sender.url_img}`}
                alt={`${sender.nombres} ${sender.apellidos}`}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
            )}
            <div 
              className={`
                max-w-md p-3 rounded-2xl shadow-md 
                ${isOwnMessage 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800'}
              `}
            >
              <p>{mensaje.contenido}</p>
              <div className="text-xs mt-1 opacity-70 flex justify-between items-center">
                <span>{new Date(mensaje.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isOwnMessage && (
                  <CheckCircle 
                    className={`w-4 h-4 ${
                      mensaje.estado === 'leido' 
                        ? 'text-green-400' 
                        : mensaje.estado === 'entregado' 
                          ? 'text-blue-300' 
                          : 'text-gray-300'
                    }`} 
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Componente de Input de Mensaje
const MessageInput: React.FC<{
  onSend: (mensaje: string) => void;
  disabled?: boolean;
}> = ({ onSend, disabled = false }) => {
  const [mensaje, setMensaje] = useState('');

  const handleSend = () => {
    if (mensaje.trim()) {
      onSend(mensaje);
      setMensaje('');
    }
  };

  return (
    <div className="bg-white p-4 border-t flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        disabled={disabled}
        className="text-gray-500 hover:text-blue-600 p-2"
      >
        <Paperclip />
      </Button>
      
      <div className="flex-1">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled}
          className="w-full p-2 border rounded-full focus:ring-2 focus:ring-blue-300 transition"
        />
      </div>
      
      <Button 
        variant="blue" 
        size="sm" 
        onClick={handleSend} 
        disabled={disabled || !mensaje.trim()}
        className="p-2"
      >
        <Send />
      </Button>
    </div>
  );
};

// Componente Principal de Chat
export default function ChatInterface({
  userId, 
  users, 
  chats, 
  mensajes, 
  socket,
  activeChatId, 
  onSend, 
  onSelectUser, 
  onSelectChat
}: ChatInterfaceProps) {
  const [filteredMensajes, setFilteredMensajes] = useState<Mensaje[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  useEffect(() => {
    // Filtrar mensajes del chat activo
    const filtered = mensajes.filter(m => m.idChat === activeChatId);
    setFilteredMensajes(filtered);

    // Encontrar el chat activo
    const chat = chats.find(c => c._id === activeChatId);
    setActiveChat(chat || null);
  }, [activeChatId, chats, mensajes]);

  const handleSendMessage = (texto: string) => {
    if (activeChatId) {
      onSend(texto, activeChatId);
    }
  };

  // Si no hay chat seleccionado, mostrar la lista de chats
  if (!activeChatId) {
    return (
      <div className="flex h-full">
        <ChatSidebar
          chats={chats}
          users={users}
          userId={userId}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          onSelectUser={onSelectUser}
        />
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <MessageCircle className="w-24 h-24 text-blue-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a Tayta Chat</h2>
          <p className="text-gray-600 text-center max-w-md mb-8">
            Selecciona una conversación o inicia un nuevo chat para comenzar a conectar con emprendedores locales.
          </p>
        </div>
      </div>
    );
  }

  // Obtener información del otro usuario en el chat
  const otherUserId = activeChat?.idParticipantes.find(id => id !== userId);
  const otherUser = users.find(u => u.id_usuario === otherUserId);

  return (
    <div className="flex h-full">
      <ChatSidebar
        chats={chats}
        users={users}
        userId={userId}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onSelectUser={onSelectUser}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header del Chat */}
        {otherUser && (
          <div className="bg-white p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ImageWithAuth
                imagePath={`user_imgs/${otherUser.url_img}`}
                alt={`${otherUser.nombres} ${otherUser.apellidos}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {otherUser.nombres} {otherUser.apellidos}
                </h3>
                <p className="text-sm text-gray-500">
                  {otherUser.rating ? `Calificación: ${otherUser.rating}/5` : 'Vendedor local'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-500 p-2">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Mensajes */}
        <MessageList
          mensajes={filteredMensajes}
          userId={userId}
          users={users}
          activeChatId={activeChatId}
        />

        {/* Input de Mensaje */}
        <MessageInput 
          onSend={handleSendMessage} 
          disabled={!activeChatId}
        />
      </div>
    </div>
  );
}

/*
  Sugerencias de testing:
  - Testear que el scroll automático funciona correctamente.
  - Testear que los mensajes se muestran en orden y con el estilo correcto según emisor.
  - Testear que el input se limpia al enviar y no permite enviar vacío.
  - Testear selección de usuario y chat.
*/