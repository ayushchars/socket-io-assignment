import React, { useEffect, useState } from 'react';
import Users from './users';
import Chat from './chat';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate()

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
      }
    }, []);

  return (
    <div className="h-screen flex">
      <div className="w-1/4 border-r">
        <Users onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      </div>
      <div className="w-3/4 flex flex-col">
        <Chat selectedUser={selectedUser} />
      </div>
    </div>
  );
}

export default Dashboard;
