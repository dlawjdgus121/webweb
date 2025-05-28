import React from 'react';
import { useSelector } from 'react-redux';

const Permit = (props) => {
  // 유저 정보가 있는 지, 토큰이 있는 지를 체크합니다!
  const is_login = useSelector((state) => state.user.user);

  // 세션이 있나 확인합니다
  const is_token = localStorage.getItem('login-token');

  if (is_token && is_login) {
    return <React.Fragment>{props.children}</React.Fragment>;
  }
  return null;
};

export default Permit;
