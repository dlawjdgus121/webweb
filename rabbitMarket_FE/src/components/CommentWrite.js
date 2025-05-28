import React from 'react';

import Grid from '../elements/Grid';
import Input from '../elements/Input';
import Button from '../elements/Button';

import { actionCreators as commentActions } from '../redux/modules/post';

import { useDispatch, useSelector } from 'react-redux';

import { AiOutlineEnter } from 'react-icons/ai';

const CommentWrite = (props) => {
  const [comment, setComment] = React.useState('');
  const dispatch = useDispatch(null);

  const user = useSelector((state) => state.user);
  const is_token = localStorage.getItem('login-token') ? true : false;

  const _setComment = (e) => {
    setComment(e.target.value);
  };

  const writeComment = () => {
    dispatch(commentActions.addCommentAPI(props.postId, comment));
    setComment('');
  };

  return (
    <React.Fragment>
      <Grid is_flex padding="10vh 0 0">
        <Input
          placeholder="댓글 내용을 입력해주세요 :)"
          value={comment}
          _onChange={(e) => {
            _setComment(e);
          }}
        ></Input>
        <Button
          width="50px"
          margin="0px 2px"
          _onClick={() => {
            writeComment();
          }}
          is_disabled={!is_token || comment === ''}
          border_radius="5px"
        >
          <AiOutlineEnter size={20} />
        </Button>
      </Grid>
    </React.Fragment>
  );
};

export default CommentWrite;
