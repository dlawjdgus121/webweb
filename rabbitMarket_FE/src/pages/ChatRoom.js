import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('http://localhost:3002');

const ChatRoom = (props) => {
  const location = useLocation();
  const {
    postId=props.match.params.postId,
    postTitle,
    sellerNickname,
    buyerNickname,
    roomId: passedRoomId,
  } = location.state || {};

  const currentUserNickname = localStorage.getItem('nickname');
  const roomId = passedRoomId || (postId && currentUserNickname ? `${postId}_${currentUserNickname}` : null);

  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);

  const handleReceiveMessage = useCallback((data) => {
    if (data.roomId === roomId) {
      setChatList((prev) => [...prev, data]);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !currentUserNickname) {
      alert("채팅방 정보가 올바르지 않습니다.");
      return;
    }

    console.log("🔥 진입한 roomId:", roomId);
    setChatList([]);
    socket.emit('join_room', roomId);

    // 채팅 불러오기
    fetch(`http://localhost:3003/api/chat/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chats) {
          console.log("📥 채팅 불러옴:", data.chats);
          setChatList(data.chats);
        }
      });

    // 메시지 수신 핸들러 등록
    socket.on('receive_message', handleReceiveMessage);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [roomId, handleReceiveMessage, currentUserNickname]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const payload = {
      roomId,
      postId,
      postTitle,
      buyerNickname: currentUserNickname,
      sellerNickname,
      sender: currentUserNickname,
      message,
    };

    console.log("📤 보내는 메시지:", payload);
    socket.emit('send_message', payload);
    setMessage('');
  };

  return (
    <div>
      <h3>
        📬 {postTitle && sellerNickname
          ? `${postTitle} 게시물 채팅방 (판매자: ${sellerNickname})`
          : '채팅방'}
      </h3>
      <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid gray', padding: '8px' }}>
        {chatList.map((chat, i) => (
          <div key={i}>
            <strong>{chat.sender}:</strong> {chat.message}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
};

export default ChatRoom;
