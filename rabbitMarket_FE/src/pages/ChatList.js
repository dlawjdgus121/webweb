import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const ChatList = () => {
  const history = useHistory();
  const [chatRooms, setChatRooms] = useState([]);
  const [userNickname, setUserNickname] = useState('');

  // ✅ localStorage에서 항상 최신 nickname을 가져옴
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    if (!nickname) return;
    setUserNickname(nickname);
  }, []); // ← 이건 컴포넌트가 처음 렌더링될 때만 실행

  // ✅ nickname이 바뀌었을 때만 채팅방 다시 불러옴
  useEffect(() => {
    if (!userNickname) return;
    console.log("📌 현재 닉네임:", userNickname);

    fetch(`http://localhost:3003/api/chat/chatrooms/${userNickname}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setChatRooms(data.rooms);
        } else {
          console.error("❌ 채팅방 불러오기 실패:", data.error);
        }
      })
      .catch((err) => {
        console.error("❌ API 통신 에러:", err);
      });
  }, [userNickname]); // ← nickname이 바뀌면 자동으로 다시 불러옴

  const handleRoomClick = (room) => {
    if (!room.roomId) {
      alert("방 정보가 없습니다.");
      return;
    }

    history.push(`/chat/${room.postId}`, {
      postId: room.postId,
      postTitle: room.postTitle,
      buyerNickname: room.buyerNickname,
      sellerNickname: room.sellerNickname,
      roomId: room.roomId,
    });
  };

  return (
    <div>
      <h2>📂 채팅 목록</h2>
      {chatRooms.length === 0 ? (
        <p>채팅 내역이 없습니다.</p>
      ) : (
        <ul>
          {chatRooms.map((room, i) => {
            const opponent =
              userNickname === room.buyerNickname
                ? room.sellerNickname
                : room.buyerNickname;

            return (
              <li
                key={room.roomId || i}
                onClick={() => handleRoomClick(room)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #ccc',
                  padding: '10px 0',
                }}
              >
                <strong>{room.postTitle}</strong><br />
                상대: {opponent} <br />
                마지막: {room.lastMessage || '메시지 없음'}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
