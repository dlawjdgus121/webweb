import React from 'react';
import { apis } from '../shared/api';

const Withdraw = () => {
  const handleWithdraw = () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;

    const token = localStorage.getItem('login-token');
    if (!token) return alert("로그인이 필요합니다.");

    apis.withdraw({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        alert(res.data.msg || "회원 탈퇴 완료");
        localStorage.removeItem('login-token');
        window.location.replace('/');
      })
      .catch((err) => {
        console.error(err);
        alert("회원 탈퇴 실패");
      });
  };

  return (
    <div>
      <h2>회원 탈퇴</h2>
      <button onClick={handleWithdraw}>회원 탈퇴</button>
    </div>
  );
};

export default Withdraw;
