import React from 'react';

import Grid from '../elements/Grid';
import Text from '../elements/Text';
import Button from '../elements/Button';
import Input from '../elements/Input';

import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as userActions } from '../redux/modules/user';
import { actionCreators as postActions } from '../redux/modules/post';

import { transformDate } from '../shared/transformDate';

// 리액트 아이콘
import { BsFillPencilFill, BsTrashFill } from 'react-icons/bs';
import { AiOutlineEnter } from 'react-icons/ai';

const CommentList = (props) => {
  // 해당 포스트의 댓글 정보
  const comments = useSelector((store) => store.post.comments);
  const user = useSelector((store) => store.user.user);
  const uploading = useSelector((store) => store.user.uploading);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!uploading) dispatch(userActions.checkLoginDB());
    return;
  }, []);

  return (
    <React.Fragment>
      <Grid padding="2vh 0 0">
        {comments.map((comment, idx) => {
          if (user.userId === comment.userId)
            return <CommentItem key={idx} {...comment} isMe />;
          else return <CommentItem key={idx} {...comment} />;
        })}
      </Grid>
    </React.Fragment>
  );
};

export default CommentList;

const CommentItem = (props) => {
  const { nickname, comment, updatedAt, isMe, commentId } = props;
  const dispatch = useDispatch();

  const [isEdit, setIsEdit] = React.useState(false);
  const [edComment, setEdComment] = React.useState('');

  // 댓글 삭제
  const delComment = () => {
    dispatch(postActions.delCommentAPI(commentId));
  };

  // 댓글 수정 시작
  const editComment = () => {
    setEdComment(comment);     // ✅ input에 기존 댓글 내용 세팅
    setIsEdit(true);           // ✅ 수정 모드 on
  };

  // 댓글 수정 완료
  const completeEdit = () => {
    dispatch(postActions.editCommentAPI(commentId, edComment));
    setIsEdit(false);
  };

  if (isMe)
    return (
      <>
        <Grid is_flex margin="1px 0">
          <Grid width="10rem">
            <Text bold>{nickname}</Text>
          </Grid>

          {!isEdit ? (
            <Grid is_flex margin="0px 4px">
              <Text margin="0px">{comment}</Text>
              <Text margin="0px">{transformDate(updatedAt)}</Text>
            </Grid>
          ) : (
            <Grid is_flex margin="1px 0">
              <Grid padding="5px">
                <Input
                  value={edComment}
                  _onChange={(e) => {
                    setEdComment(e.target.value);
                  }}
                />
              </Grid>
              <Grid width="5rem">
                <Button
                  _onClick={completeEdit}
                  border_radius="5px"
                  margin="0 2px"
                >
                  <AiOutlineEnter size={20} />
                </Button>
              </Grid>
            </Grid>
          )}

          <Grid is_flex width="10rem" height="1.5rem">
            <Button
              margin="1px"
              border_radius="1rem"
              _onClick={editComment} // ✅ 수정 진입
            >
              <BsFillPencilFill />
            </Button>
            <Button
              margin="1px"
              border_radius="1rem"
              _onClick={delComment}
            >
              <BsTrashFill />
            </Button>
          </Grid>
        </Grid>
      </>
    );
  else {
    // 다른 사람이 작성한 댓글일 경우
    return (
      <Grid is_flex>
        <Grid width="8.5rem">
          <Text bold>{nickname}</Text>
        </Grid>
        <Grid is_flex margin="0px 4px">
          <Text margin="0px">{comment}</Text>
          <Text margin="0px">{transformDate(updatedAt)}</Text>
        </Grid>
      </Grid>
    );
  }
};


CommentItem.defaultProps = {
  commentId: 'test123',
  comment: '좋은 상품이네요',
  postId: '123',
  nickname: '쇼핑하는 토끼',
  userId: 'user12345',
  createdAt: '2022-02-12T15:40:03.201Z',
  updatedAt: '2022-02-12T15:40:03.201Z',
};
