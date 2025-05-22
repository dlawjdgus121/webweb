import React from 'react';
import Grid from '../elements/Grid';
import Post from '../components/Post';
import Text from '../elements/Text';

import { useSelector, useDispatch } from 'react-redux';

import { actionCreators as postActions } from '../redux/modules/post';

const Search = (props) => {
  const dispatch = useDispatch();

  const word = props.match.params.searchWord;

  const search_list = useSelector((state) => state.post.searchList);

  const { history } = props;

  React.useEffect(() => {
    dispatch(postActions.searchAPI(word));
  }, []);

  return (
    <>
      <Grid padding="2vw 13vw 0vw 13vw">
        <Text size="2rem" margin="0">
          검색 단어 : {word}
        </Text>
      </Grid>
      <Grid padding="2vw 13vw 0vw 13vw" is_grid is_wrap>
        {search_list.map((p, idx) => {
          return (
            <Grid
              bg={p.isSold ? '#868e96' : ''}
              opacity={p.isSold ? '0.5' : ''}
              key={p.id}
              width="100%"
              min_width="8.7rem"
              margin="0.5rem 0"
              border
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

export default Search;
