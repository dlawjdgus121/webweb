// PostDetail.js (신고 팝업이 화면 중앙에 뜨도록 수정)

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
import { reportPostAPI } from '../redux/modules/post';  // 경로는 상황에 맞게 변경

const PostDetail = (props) => {
  const post = useSelector((store) => store.post.post);
  const comment_cnt = useSelector((store) => store.post.comments.length);
  const dispatch = useDispatch();
const [showReportModal, setShowReportModal] = React.useState(false);
const [reportReason, setReportReason] = React.useState('');
const [showReportPopup, setShowReportPopup] = React.useState(false);

  const [isId, setIsId] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [reportText, setReportText] = React.useState('');

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
const hasReported = post.reports?.some(report => report.userId === isId);




  React.useEffect(() => {
    checkLogin();
    dispatch(postActions.getOnePostAPI(postId));
  }, []);

  return (
    <Grid padding="0 13vw" style={{ position: 'relative' }}>
      {post.reportCount >= 3 && (
        <Grid padding="1vh" bg="#ffe0e0" border_radius="8px" margin="1vh 0">
          <Text bold color="red">⚠️ 해당 게시물은 {post.reportCount}건의 신고를 당한 게시물입니다.</Text>
<Text>최근 신고 내용:</Text>
{post.reports && post.reports.length > 0 ? (
  post.reports.map((report, index) => (
    <Text key={index}>- {report.content}</Text>
  ))
) : (
  <Text>신고 내역이 없습니다.</Text>
)}
        </Grid>
      )}

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

     {isId !== writeUserId && (
  <Grid margin="2vh 0 0">
    <Button
      text={hasReported ? "이미 신고한 게시물입니다" : "🚨 상품 신고"}
      _onClick={() => {
        if (hasReported) {
          alert("이미 이 게시물에 대해 신고하셨습니다.");
          return;
        }
        setShowReportModal(true);
      }}
      disabled={hasReported}
      border_radius="2px"
      padding="0.3rem 0.7rem"
    />
  </Grid>
)}

      {/* 신고 팝업 */}
       {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>신고 사유를 입력하세요</h3>
            <textarea
              style={{ width: '100%', height: '100px', marginBottom: '1rem', resize: 'none' }}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button text="취소" _onClick={() => setShowReportModal(false)} />
              <Button
                text="신고하기"
                _onClick={() => {
                  dispatch(postActions.reportPostAPI(postId, reportReason));
                  setShowReportModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
    </Grid>
  );
};

export default PostDetail;
