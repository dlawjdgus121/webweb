// src/components/Sidebar.js
import React, { useState } from 'react'; // ✅ useState 추가

import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Sidebar = () => {
      const [hoverMypage, setHoverMypage] = useState(false); // ✅ 상태 선언
      
  return (
    <SidebarContainer>
      <MenuTitle>SKU Market</MenuTitle>
      <MenuItem href="/">홈</MenuItem>
      <MenuItem to="/chatlist">채팅목록</MenuItem> {/* ✅ 이 줄 변경 */}
      <MenuItem href="/wishlist">찜 목록</MenuItem>
       <MypageWrapper
        onMouseEnter={() => setHoverMypage(true)}
        onMouseLeave={() => setHoverMypage(false)}
      >
       <MenuItem as="div">마이페이지</MenuItem>
        {hoverMypage && (
          <SubMenu>
<Link to="/withdraw">회원 탈퇴</Link>
          </SubMenu>
        )}
          </MypageWrapper>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: fixed;     // ✅ 고정

  width: 200px;
  height: 100vh;
  background-color: #2f3542;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  z-index: 1000;        // ✅ 겹침 방지

`;

const MenuTitle = styled.h2`
  margin-bottom: 20px;
`;

const MenuItem =  styled(Link)`
  margin-bottom: 10px;
  color: white;
  text-decoration: none;
  font-size: 16px;
  &:hover {
    color: #ffa502;
  }
`;
const SubMenu =  styled(Link)`
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  padding-left: 10px;
`;

const MypageWrapper = styled.div`
  position: relative;
`;

const SubItem = styled.a`
  color: #ced6e0;
  font-size: 14px;
  margin: 5px 0;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #ffa502;
  }
`;
export default Sidebar;
