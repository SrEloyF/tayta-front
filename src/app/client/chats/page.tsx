// src/app/client/chats/page.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/features/auth/api';
import { useSocket } from '@/providers/SocketProvider';
import ChatInterface, { type User as ChatUser, type Chat, type Mensaje } from '@/components/client/chats/ChatInterface';
import { toast } from '@/components/ui/use-toast';
import { MessageCircle, MessageSquare, Send, User, Loader2, Search } from 'lucide-react';

export default function ChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [initialVendedorId, setInitialVendedorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  const fetchInitialData = useCallback(async () => {
    if (!initialized || !user) return;

    try {
      setLoading(true);
      const [usersRes, chatsRes, mensajesRes] = await Promise.all([
        api.get<ChatUser[]>('/usuarios'),
        api.get<Chat[]>('/chats'),
        api.get<Mensaje[]>('/mensajes')
      ]);

      setUsers(usersRes.data);
      setChats(
        chatsRes.data.filter(c => c.idParticipantes.includes(Number(user.id)))
          .sort((a, b) => new Date(b.fechaUltimoMensaje || 0).getTime() - new Date(a.fechaUltimoMensaje || 0).getTime())
      );
      setMensajes(mensajesRes.data);

      // Manejar vendedorId de parámetros
      const vendedorIdParam = searchParams.get('vendedorId');
      if (vendedorIdParam) {
        setInitialVendedorId(Number(vendedorIdParam));
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar los chats. Intenta de nuevo más tarde.');
      toast({
        title: "Error de Conexión",
        description: "No se pudieron cargar los chats. Verifica tu conexión.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [initialized, user, searchParams]);

  // Efecto de carga inicial
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Iniciar chat con vendedor
  useEffect(() => {
    const initChatWithVendedor = async () => {
      if (initialVendedorId && user && users.length > 0) {
        try {
          const res = await api.post<Chat>('/chats', { 
            idParticipantes: [Number(user.id), initialVendedorId] 
          });
          
          setChats(prev => {
            // Evitar duplicados
            const existingChatIndex = prev.findIndex(c => c._id === res.data._id);
            if (existingChatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[existingChatIndex] = res.data;
              return updatedChats;
            }
            return [res.data, ...prev];
          });
          
          setActiveChatId(res.data._id);
          setInitialVendedorId(null);
        } catch (error) {
          console.error('Error iniciando chat con vendedor:', error);
          toast({
            title: "Error al Iniciar Chat",
            description: "No se pudo iniciar la conversación con el vendedor.",
            variant: "destructive"
          });
        }
      }
    };

    initChatWithVendedor();
  }, [initialVendedorId, user, users]);

  // Manejar mensajes en tiempo real
  useEffect(() => {
    if (!socket || !initialized) return;

    const handleNewMessage = (msg: Mensaje) => {
      setMensajes(prev => {
        // Evitar mensajes duplicados
        const existingIndex = prev.findIndex(m => 
          m._idTemp === msg._idTemp || m._id === msg._id
        );

        if (existingIndex !== -1) {
          const updatedMensajes = [...prev];
          updatedMensajes[existingIndex] = msg;
          return updatedMensajes;
        }

        return [...prev, msg];
      });

      // Actualizar chats
      setChats(prev => {
        const chatExists = prev.some(c => c._id === msg.idChat);
        if (!chatExists) {
          api.get<Chat>(`/chats/${msg.idChat}`)
            .then(res => {
              setChats(prevChats => [res.data, ...prevChats]);
            });
        }
        return prev;
      });
    };

    socket.on('mensaje', handleNewMessage);
    return () => { socket.off('mensaje', handleNewMessage); };
  }, [socket, initialized]);

  // Manejadores de eventos
  const handleSelectUser = async (otherId: number) => {
    if (!user) return;
    try {
      const res = await api.post<Chat>('/chats', { 
        idParticipantes: [Number(user.id), otherId] 
      });
      
      setChats(prev => {
        const existingIndex = prev.findIndex(c => c._id === res.data._id);
        if (existingIndex !== -1) {
          const updatedChats = [...prev];
          updatedChats[existingIndex] = res.data;
          return updatedChats;
        }
        return [res.data, ...prev];
      });
      
      setActiveChatId(res.data._id);
    } catch (error) {
      console.error('Error seleccionando usuario:', error);
      toast({
        title: "Error de Chat",
        description: "No se pudo iniciar la conversación.",
        variant: "destructive"
      });
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleSend = (texto: string, chatId: string) => {
    if (!socket || !user || !chatId) return;

    const tempId = Date.now().toString();
    const nuevoMensaje: Mensaje = {
      _idTemp: tempId,
      idChat: chatId,
      idEmisor: Number(user.id),
      contenido: texto,
      timestamp: new Date().toISOString(),
      estado: 'enviado'
    };

    // Enviar mensaje por socket
    socket.emit('mensaje', {
      _idTemp: tempId,
      idChat: chatId,
      emisor: Number(user.id),
      contenido: texto,
      timestamp: nuevoMensaje.timestamp
    });

    // Actualizar estado de mensajes
    setMensajes(prev => [...prev, nuevoMensaje]);

    // Actualizar último mensaje en chats
    setChats(prev => prev.map(chat => 
      chat._id === chatId 
        ? { ...chat, ultimoMensaje: texto, fechaUltimoMensaje: nuevoMensaje.timestamp } 
        : chat
    ));
  };

  // Estado de carga o error
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <MessageCircle className="mx-auto w-24 h-24 text-blue-600 animate-pulse" />
          <p className="mt-4 text-xl text-gray-700">Cargando chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <div className="text-center">
          <MessageCircle className="mx-auto w-24 h-24 text-red-600" />
          <p className="mt-4 text-xl text-red-800">{error}</p>
          <button 
            onClick={fetchInitialData} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      userId={Number(user?.id ?? '')}
      users={users}
      chats={chats}
      mensajes={mensajes}
      socket={socket}
      activeChatId={activeChatId}
      onSelectUser={handleSelectUser}
      onSelectChat={handleSelectChat}
      onSend={handleSend}
    />
  );
}
