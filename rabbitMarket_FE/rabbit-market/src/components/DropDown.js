import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { actionCreators as postActions } from '../redux/modules/post';

const DropDown = (props) => {
  const [choice, setChoice] = React.useState('전체보기');
  const dispatch = useDispatch();

  const setFilter = (num) => {
    setChoice(num === 0 ? '전체보기' : num === 1 ? '판매중' : '판매완료');
    dispatch(postActions.setFilterState(num));
  };

  return (
    <>
      <Ul>
        {choice}
        <Li onClick={() => setFilter(0)}>전체보기</Li>
        <Li onClick={() => setFilter(1)}>판매중</Li>
        <Li onClick={() => setFilter(2)}>판매완료</Li>
      </Ul>
    </>
  );
};

const Ul = styled.ul`
  z-index: 999;

  padding: 0;
  text-align: center;
  background: #fff;
  color: black;
  line-height: 50px;
  margin: auto;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    Li {
      display: block;
      border-bottom: 1px solid #999;
    }
  }
`;

const Li = styled.li`
  display: none;
  cursor: pointer;
`;

export default DropDown;
