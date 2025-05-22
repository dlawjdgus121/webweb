import React from 'react';
import Grid from '../elements/Grid';
import Post from '../components/Post';
import Button from '../elements/Button';
import Text from '../elements/Text';
import ControlledCarousel from '../components/ControlledCarousel';
import DropDown from '../components/DropDown';

import { useSelector, useDispatch } from 'react-redux';

import { actionCreators as postActions } from '../redux/modules/post';

const Main = (props) => {
  const dispatch = useDispatch();

  const post_list = useSelector((state) => state.post.list);
  const filterState = useSelector((state) => state.post.filterState);

  const { history } = props;

  React.useEffect(() => {
    dispatch(postActions.setFilterState(0));
    dispatch(postActions.getPostAPI());
  }, []);

  React.useEffect(() => {
    if (filterState === 0) return;
    else dispatch(postActions.filterAPI(filterState));
  }, [filterState]);

  return (
    <>
      <ControlledCarousel />

      <Grid padding="2vw 13vw 0vw 13vw">
        <DropDown />
      </Grid>
      <Grid padding="2vw 13vw 0vw 13vw" is_grid is_wrap>
        {post_list.map((p, idx) => {
          return (
            <Grid
              bg={p.isSold ? '#868e96' : ''}
              opacity={p.isSold ? '0.5' : ''}
              key={p.id}
              width="100%"
              min_width="8.7rem"
              margin="0.5rem 0"
              border
              cursor
              _onClick={() => {
                history.push(`/post/${p.id}`);
              }}
            >
              <Post key={p.id} {...p}></Post>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default Main;
