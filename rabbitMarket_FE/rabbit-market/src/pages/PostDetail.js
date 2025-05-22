import React from 'react';

import { apis } from '../shared/api';

//컴포넌트 임포트
import CommentWrite from '../components/CommentWrite';
import CommentList from '../components/CommentList';
import Grid from '../elements/Grid';
import Image from '../elements/Image';
import Text from '../elements/Text';
import Button from '../elements/Button';

import { transformDate } from '../shared/transformDate';
import { numberWithCommas } from '../shared/numberWithCommas';

import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as postActions } from '../redux/modules/post';

import { history } from '../redux/configureStore';

const PostDetail = (props) => {
  //클릭한 포스트 정보 가져오기
  const post = useSelector((store) => store.post.post);
  console.log(post, 'galksdjf;alweijfal;dskfj');
  const comment_cnt = useSelector((store) => store.post.comments.length);
  const user = useSelector((store) => store.user.user);

  const dispatch = useDispatch();

  // 판매 상태 저장 state
  const [isId, setIsId] = React.useState('');
  const [nickname, setnickname] = React.useState('');

  // 포스트 아이디 찾아내기
  const postId = props.match.params.id;

  //store.post의 유저아이디 받아오기
  const writeUserId = post.userId;

  //토큰으로 아이디 가져와서 useState로 넘겨주기
  function checkLogin() {
    const token = localStorage.getItem('login-token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    apis
      .checkLogin(config)
      .then(function (res) {
        const get_id = res.data.user.userId;
        setIsId(get_id);
        setnickname(res.data.user.nickname);
        return setIsId;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // 판매 상태 수정 함수
  function setState() {
    dispatch(postActions.statePostAPI(postId));
  }

  React.useEffect(() => {
    checkLogin();
    dispatch(postActions.getOnePostAPI(postId));
  }, []);

  return (
    <Grid padding="0 13vw">
      {/* 판매 상품 이미지, 제목, 가격, 날짜, 판매 여부  */}
      <Grid is_flex border_bottom padding="2vh 0">
        <Image src={post.imgurl} size="30" />

        <Grid width="57%">
          <Grid border_bottom>
            <Text size="2.5vw" bold>
              {post.title}
            </Text>
            <Text size="3vw" bold>
              {numberWithCommas(post.price)} 원
            </Text>
          </Grid>
          <Text size="3vw" bold></Text>
          <Text size="1.5vw" is_end>
            {transformDate(post.createdAt)}
          </Text>
          <Text size="1.5vw" is_end>
            {post.isSold ? '판매 완료' : '판매중'}
          </Text>
        </Grid>
      </Grid>
      {/* 상품 정보 */}
      <Grid margin="2vh 0 0">
        <div>
          <Text Text size="1.5vw" bold>
            상품 정보
          </Text>
          <Text Text size="1.5vw" is_contents>
            {post.content}
          </Text>
        </div>
      </Grid>

      <CommentWrite postId={postId} />
      <Text size=".4rem" margin="0.5rem 0 0 0">
        댓글 수 : {comment_cnt}개
      </Text>
      <CommentList postId={postId} />
      {isId === writeUserId ? (
        <Grid is_flex margin="10vh 0 0">
          <Grid width="10rem" padding="1px">
            <Button
              text="상품 삭제"
              _onClick={() => {
                dispatch(postActions.deletePostAPI(postId));
              }}
              border_radius="2px"
            />
          </Grid>
          <Grid is_flex width="20rem">
            <Grid padding="1px">
              <Button
                text="상품 수정"
                _onClick={() => {
                  history.push(`/write/${postId}`);
                }}
                border_radius="2px"
              />
            </Grid>

            <Grid padding="1px">
              <Button
                text={post.isSold ? '판매 완료' : '판매중'}
                _onClick={() => {
                  setState();
                }}
                border_radius="2px"
              />
            </Grid>
          </Grid>
        </Grid>
      ) : (
        ''
      )}
    </Grid>
  );
};

export default PostDetail;
