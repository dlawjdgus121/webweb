import React from 'react';
import styled from 'styled-components';
import Grid from '../elements/Grid';
import Button from '../elements/Button';
import Input from '../elements/Input';
import Image from '../elements/Image';
import Text from '../elements/Text';

import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as userActions } from '../redux/modules/user'; // as : 별명 주는거
import { actionCreators as postActions } from '../redux/modules/post'; // as : 별명 주는거

// 페이지 이동
import { history } from '../redux/configureStore';

// 리액트 아이콘
import { BiSearchAlt2 } from 'react-icons/bi';
import { BsCoin } from 'react-icons/bs';

const Header = () => {
  const dispatch = useDispatch();

  const is_token = localStorage.getItem('login-token') ? true : false;

  const [searchWord, setSearchWord] = React.useState('');

  // 로그인 체크
  const isLogin = useSelector((state) => state.user.is_login);

  React.useEffect(() => {
    console.log(isLogin);
  }, [isLogin]);

  const search = () => {
    if (searchWord === '') {
      alert('검색할 단어를 입력해주세요.');
      return;
    }

    dispatch(postActions.searchAPI(searchWord));
    history.push(`/search/${searchWord}`);
    console.log(searchWord);
  };

  if (is_token) {
    return (
      <HeaderBox>
        <Grid is_flex is_header>
          {/* 로고 이미지 */}
          <Grid
            width="20rem"
            _onClick={() => {
              window.location.replace('/');
            }}
            cursor
          >
            <Image shape="logo" src={'/img/logo2.png'} />
          </Grid>
          {/* 검색창, 로그인 회원가입 버튼 */}
          <Grid is_flex margin="0 5vw">
            <Grid>
              <Input
                placeholder="상품명 입력"
                is_header
                value={searchWord}
                _onChange={(e) => {
                  setSearchWord(e.target.value);
                }}
              />
            </Grid>
            <Grid width="5rem">
              <Button
                border_radius="0 20% 20% 0"
                _onClick={() => {
                  search();
                }}
              >
                <BiSearchAlt2 size={34} />
              </Button>
            </Grid>
          </Grid>
          <Grid is_flex width="30rem">
            <Grid>
              <Button
                margin="0 1px"
                _onClick={() => {
                  window.location.replace('/write');
                }}
                border_radius="5px"
              >
                <Grid is_flex padding="0 1vw">
                  <BsCoin size={25} />
                  <span>판매하기</span>
                </Grid>
              </Button>
            </Grid>
            <Grid>
              <Button
                text="로그아웃"
                margin="0 2px"
                _onClick={() => {
                  dispatch(userActions.logoutDB());
                }}
                border_radius="5px"
              />
            </Grid>
          </Grid>
        </Grid>
      </HeaderBox>
    );
  } else {
    return (
      <HeaderBox>
        <Grid is_flex is_header>
          {/* 로고 이미지 */}
          <Grid
            width="20rem"
            _onClick={() => {
              window.location.replace('/');
            }}
            cursor
          >
            <Image shape="logo" src={'/img/logo2.png'} />
          </Grid>
          {/* 검색창, 로그인 회원가입 버튼 */}
          <Grid is_flex margin="0 5vw">
            <Grid>
              <Input
                placeholder="상품명 입력"
                is_header
                value={searchWord}
                _onChange={(e) => {
                  setSearchWord(e.target.value);
                }}
              />
            </Grid>
            <Grid width="5rem">
              <Button
                border_radius="0 20% 20% 0"
                _onClick={() => {
                  search();
                }}
              >
                <BiSearchAlt2 size={34} />
              </Button>
            </Grid>
          </Grid>
          <Grid is_flex width="30rem">
            <Grid>
              <Button
                text="로그인"
                margin="0 1px"
                _onClick={() => {
                  history.push('/login');
                }}
                border_radius="5px"
              />
            </Grid>
            <Grid>
              <Button
                text="회원가입"
                margin="0 2px"
                _onClick={() => {
                  history.push('/signup');
                }}
                border_radius="5px"
              />
            </Grid>
          </Grid>
        </Grid>
      </HeaderBox>
    );
  }
};

const HeaderBox = styled.div`
  background-color: #fff;
  width: 100%;
  min-width: 375px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 0 13vw;
  @media (max-width: 595px) {
    padding: 0 1vw;
  }
`;

export default Header;
