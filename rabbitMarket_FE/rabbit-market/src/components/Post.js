import React from 'react';

import Grid from '../elements/Grid';
import Text from '../elements/Text';
import Image from '../elements/Image';

import { transformDate } from '../shared/transformDate';
import { numberWithCommas } from '../shared/numberWithCommas';

const Post = (props) => {
  return (
    <>
      <Image src={props.imgurl} size="25" is_main={true} />
      <Grid padding="1vw 1vw 0">
        <Text bold size="1rem">
          상품명 : {props.title}
        </Text>
        <Text size=".9rem">가격 : {numberWithCommas(props.price)}</Text>
        <Text size=".7rem">작성시간 : {transformDate(props.createdAt)}</Text>
        <Text size=".4rem">댓글 수 : {props.comments_cnt}개</Text>
      </Grid>
    </>
  );
};

Post.defaultProps = {
  title: '타이틀',
  price: 122222,
  nickname: '닉네임',
  imgurl:
    'https://s1.best-wallpaper.net/wallpaper/m/1812/Portugal-Porto-river-bridge-city-morning_m.jpg',
  content: '컨텐트',
  comment_cnt: 10,
  createdAt: '2022-02-04 10:00:00',
  is_me: false,
  isSold: false,
};

export default Post;
