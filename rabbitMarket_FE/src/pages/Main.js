import React from 'react';
import styled from 'styled-components';

import Grid from '../elements/Grid';
import Post from '../components/Post';
import Button from '../elements/Button';
import Text from '../elements/Text';
import ControlledCarousel from '../components/ControlledCarousel';
import DropDown from '../components/DropDown';
import Sidebar from '../components/SideBar'; // ✅ 추가

import { useSelector, useDispatch } from 'react-redux';
import { actionCreators as postActions } from '../redux/modules/post';

const Main = (props) => {

  
  const dispatch = useDispatch();
  const post_list = useSelector((state) => state.post.list);
  const filterState = useSelector((state) => state.post.filterState);
  const user=useSelector((state)=>state.user.user);
  const { history } = props;

  React.useEffect(() => {
    dispatch(postActions.setFilterState(0));
    dispatch(postActions.getPostAPI());
  }, []);

  React.useEffect(() => {
    if (filterState === 0) dispatch(postActions.getPostAPI());
    else dispatch(postActions.filterAPI(filterState));
  }, [filterState]);

  return (
    <PageWrapper>
      <Sidebar />
      <ContentArea>
        <ControlledCarousel />
        <Grid padding="2vw 13vw 0vw 13vw">
          <DropDown />
        </Grid>
        <Grid padding="2vw 13vw 0vw 13vw" is_grid is_wrap>
          {post_list.map((p, idx) => (
            <Grid
              bg={p.isSold ? '#868e96' : ''}
              opacity={p.isSold ? '0.5' : ''}
              key={p.id}
              width="100%"
              min_width="320px"   // ✅ 최소 너비 키움
              max_width="400px"  
              margin="0.5rem 0"
              border
              cursor
              _onClick={() => {
                if(!user){
                  alert("로그인 후 게시글을 볼 수 있습니다.");
                  return;
                }
                history.push(`/post/${p.id}`);
              }}
            >
              <Post key={p.id} {...p} />
            </Grid>
          ))}
        </Grid>
      </ContentArea>
    </PageWrapper>
  );
};

// ✅ 레이아웃 스타일 추가
const PageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const ContentArea = styled.div`
  margin-left: 200px;         // ✅ 사이드바 너비만큼 밀기
  flex: 1;
  padding: 2rem 3vw;
  display: flex;
  flex-direction: column;
`;


export default Main;
