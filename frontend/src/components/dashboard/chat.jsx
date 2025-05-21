import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { authAxios } from '../../config/config';
import Message from './message';

const socket = io(import.meta.env.VITE_REACT_APP_BASEURL);

function Chat({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [userStatus, setUserStatus] = useState(selectedUser?.isOnline || false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('userDetail'));
  const loggedInUser = storedUser?.id?.toString();

  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedUserRef = useRef(null); 

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (loggedInUser) {
      socket.emit('register', loggedInUser);
    }
  }, [loggedInUser]);

  useEffect(() => {
    let statusInterval;

    const fetchUserStatus = async () => {
      if (!selectedUser?._id) return;
      try {
        const res = await authAxios().post('/auth/getUserbyId', {
          id: selectedUser._id,
        });

        if (res.data?.status === 1) {
          setUserStatus(res.data.data?.[0]?.isOnline);
        }
      } catch (err) {
        console.error('Error fetching user status:', err);
      }
    };

    if (selectedUser?._id) {
      fetchUserStatus();
      statusInterval = setInterval(fetchUserStatus, 5000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [selectedUser]);

  useEffect(() => {
    const initiateChat = async () => {
      if (!selectedUser || !loggedInUser) return;

      try {
        const response = await authAxios().post(`/chat/chats`, {
          sender: loggedInUser,
          receiver: selectedUser._id,
        });

        if (response.data.status === 1) {
          setChatId(response.data.data.chatId);
        }
      } catch (err) {
        console.error('Error creating/fetching chat:', err);
      }
    };

    initiateChat();
  }, [selectedUser, loggedInUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        const response = await authAxios().post(`/chat/getChatbyId`, {
          id: chatId,
        });

        if (response.data.status === 1) {
          setMessages(response.data.data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const handleIncoming = ({ chatId: incomingChatId, message }) => {
      if (incomingChatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('messageReceived', handleIncoming);
    return () => socket.off('messageReceived', handleIncoming);
  }, [chatId]);

  useEffect(() => {
    const handleTyping = ({ chatId: incomingChatId, senderId }) => {
      if (
        incomingChatId === chatId &&
        senderId === selectedUserRef.current?._id
      ) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ chatId: incomingChatId, senderId }) => {
      if (
        incomingChatId === chatId &&
        senderId === selectedUserRef.current?._id
      ) {
        setOtherUserTyping(false);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [chatId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !chatId || !selectedUser || !loggedInUser) return;

    const payload = {
      chatId,
      senderId: loggedInUser,
      receiverId: selectedUser._id,
      text: newMessage,
    };

    socket.emit('sendMessage', payload);
    setNewMessage('');
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
  
    if (!socket || !chatId || !selectedUser) return;
  
    if (value.trim() === '') {
      socket.emit('stopTyping', {
        chatId,
        senderId: loggedInUser,
        receiverId: selectedUser._id,
      });
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }
  
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        chatId,
        senderId: loggedInUser,
        receiverId: selectedUser._id,
      });
    }
  
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId,
        senderId: loggedInUser,
        receiverId: selectedUser._id,
      });
      setIsTyping(false);
    }, 1500);
  };

  if (!selectedUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Select a user to start chat</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="font-semibold">{selectedUser?.name || "User"}</div>
        <div className={`text-sm ${userStatus ? 'text-green-400' : 'text-gray-400'}`}>
          {userStatus ? 'online' : 'offline'}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} loggedInUser={loggedInUser} />
        ))}
        <div ref={messageEndRef} />
      </div>

      {otherUserTyping && (
        <div className="text-sm text-gray-500 px-4 pb-2 italic">
          {selectedUser?.name || 'User'} is typing...
        </div>
      )}

      <div className="p-3 border-t flex items-center gap-2">
        <input
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;
