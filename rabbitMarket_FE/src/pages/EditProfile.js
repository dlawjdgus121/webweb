import React, { useState } from 'react';
import { apis } from '../shared/api';

const EditProfile = () => {
  const [nickname, setNickname] = useState('');

  const handleEdit = () => {
    const token = localStorage.getItem('login-token');
    if (!token) return alert("로그인이 필요합니다.");

    apis.editProfile(
      { nickname },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        alert(res.data.msg || "닉네임 수정 완료");
        window.location.replace('/');
      })
      .catch((err) => {
        console.error(err);
        alert("닉네임 수정 실패");
      });
  };

  return (
    <div>
      <h2>회원정보 수정</h2>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="새 닉네임 입력"
      />
      <button onClick={handleEdit}>수정하기</button>
    </div>
  );
};

export default EditProfile;
