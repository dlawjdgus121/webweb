import React from 'react';

import Grid from '../elements/Grid';
import Text from '../elements/Text';
import Image from '../elements/Image';

import { transformDate } from '../shared/transformDate';
import { numberWithCommas } from '../shared/numberWithCommas';

const Post = (props) => {
  return (
    <>
      <Image src={props.imgurl} size="20" is_main={true} />
      <Grid padding="1vw 1vw 0">
                <Text size="1rem">작성자 : {props.nickname}</Text>

        <Text bold size="1.3rem">
          상품명 : {props.title}
        </Text>
        <Text size="1.3rem">가격 : {numberWithCommas(props.price)} 원</Text>
        <Text size="1rem">작성시간 : {transformDate(props.createdAt)}</Text>
        <Text size="1rem">댓글 수 : {props.comments_cnt}개</Text>
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
