// ✅ PostDetail.js (수정됨)

import React from 'react';
import { apis } from '../shared/api';
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
  const post = useSelector((store) => store.post.post);
  const comment_cnt = useSelector((store) => store.post.comments.length);
  const dispatch = useDispatch();

  const [isId, setIsId] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const postId = props.match.params.id;
  const writeUserId = post.userId;

  function checkLogin() {
    const token = localStorage.getItem('login-token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    apis.checkLogin(config)
      .then((res) => {
        const get_id = res.data.user.userId;
        setIsId(get_id);
        setNickname(res.data.user.nickname);
        localStorage.setItem('nickname', res.data.user.nickname);
      })
      .catch((error) => console.log(error));
  }

  function setState() {
    dispatch(postActions.statePostAPI(postId));
  }

  React.useEffect(() => {
    checkLogin();
    dispatch(postActions.getOnePostAPI(postId));
  }, []);

  return (
    <Grid padding="0 13vw">
      <Grid is_flex border_bottom padding="2vh 0">
        <Image src={post.imgurl} size="30" />
        <Grid width="57%">
          <Grid border_bottom>
            <Text size="3vw" bold>{post.title}</Text>
            <Text size="3vw" bold>{numberWithCommas(post.price)} 원</Text>
            <Text size="2vw">작성자: {post.nickname}</Text>
          </Grid>
          <Text size="1.5vw" is_end>{transformDate(post.createdAt)}</Text>
          <Text size="1.5vw" is_end>{post.isSold ? '판매 완료' : '판매중'}</Text>

          {isId !== writeUserId && (
            <Grid margin="3vh 0 0">
              <Button
                text="💬 채팅하기"
                _onClick={() => {
                  history.push(`/chat/${postId}`, {
                    postId,
                    postTitle: post.title,
                    buyerNickname: nickname,
                    sellerNickname: post.nickname,
                    roomId: `${postId}_${nickname}`,
                  });
                }}
              />
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid margin="2vh 0 0">
        <Text size="1.5vw" bold>상품 정보</Text>
        <Text size="1.5vw" is_contents>{post.content}</Text>
      </Grid>

      <CommentWrite postId={postId} />
      <Text size="1.1vw" margin="0.5rem 0 0 0">댓글 수 : {comment_cnt}개</Text>
      <CommentList postId={postId} />

      {isId === writeUserId && (
        <Grid is_flex margin="10vh 0 0">
          <Grid width="10rem" padding="1px">
            <Button
              text="상품 삭제"
              _onClick={() => dispatch(postActions.deletePostAPI(postId))}
              border_radius="2px"
            />
          </Grid>
          <Grid is_flex width="20rem">
            <Grid padding="1px">
              <Button
                text="상품 수정"
                _onClick={() => history.push(`/write/${postId}`)}
                border_radius="2px"
              />
            </Grid>
            <Grid padding="1px">
              <Button
                text={post.isSold ? '판매 완료' : '판매중'}
                _onClick={setState}
                border_radius="2px"
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default PostDetail;
