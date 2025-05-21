import React, { useEffect, useState } from 'react';
import { authAxios } from '../../config/config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_REACT_APP_BASEURL); 

function Users({ onSelectUser, selectedUser }) {
  const [users, setUsers] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem('userDetail'));
  const loggedInUserName = storedUser?.name || 'User';
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAxios().get(`/auth/allusers`);
        if (response.data.status === 1) {
          setUsers(response.data.data);
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
    };
  
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  
const handleLogout = () => {
  const storedUser = JSON.parse(localStorage.getItem('userDetail'));
  const userId = storedUser?.id;

  if (userId) {
    socket.emit('unregister', userId);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('userDetail');
  navigate('/');
};

  return (
    <div className="bg-white h-full p-4">
    <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Hello {loggedInUserName}</h2>
  <button
    onClick={handleLogout}
    className="text-sm bg-black text-white px-3 py-1 rounded cursor-pointer"
  >
    Logout
  </button>
</div>
      {users.map(user => (
        <div
          key={user._id} 
          onClick={() => onSelectUser(user)}
          className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedUser?._id === user._id ? 'bg-gray-200' : ''}`}
        >
          <div className="flex items-center gap-2">
            <img src="/avatar.jpg" alt="avatar" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
            </div>
          </div>
          <span className={`text-xs ${user.isOnline  ? 'text-green-500' : 'text-gray-400'}`}>
          {user.isOnline ? 'online' : 'offline'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Users;
