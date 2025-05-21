import React from 'react';
import moment from 'moment';

const Message = ({ message, loggedInUser }) => {
  const senderId = message.senderId?._id || message.senderId;
  const isSentByMe = senderId === loggedInUser;

  return (
    <div className={`mb-3 flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      <div className="bg-gray-100 p-3 rounded-lg max-w-xs w-fit shadow">
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-gray-400 text-right mt-1">
          {moment(message.timestamp).fromNow()}
        </p>
      </div>
    </div>
  );
};

export default Message;
