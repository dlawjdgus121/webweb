import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { history } from '../redux/configureStore';

// component import
import Grid from '../elements/Grid';
import Text from '../elements/Text';
import Button from '../elements/Button';
import Image from '../elements/Image';
import Input from '../elements/Input';

import { actionCreators as postActions } from '../redux/modules/post';

const PostWrite = (props) => {
  const dispatch = useDispatch(null);
  
  const post = useSelector((store) => store.post.post);

  const is_token = localStorage.getItem('login-token') ? true : false;

  const edit_id = props.match.params.id;
  const [is_edit, setIsEdit] = React.useState(edit_id ? true : false);
  const [contents, setContent] = React.useState(is_edit ? post.content : '');
  const [price, setPrice] = React.useState(is_edit ? post.price : '');
  const [title, setTitle] = React.useState(is_edit ? post.title : '');

  const img_url = useSelector((store) => store.post.img);

console.log('img_url:', img_url);
  const [fileImage, setFileImage] = React.useState(
    post.imgurl !== '' && is_edit
      ? post.imgurl
      : 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FlOeQ2%2Fbtrtys8M1UX%2FEXvjbkD77erg12mnimKaK0%2Fimg.png'
  );

  const editPost = () => {
    dispatch(
      postActions.editPostAPI(post.id, title, price, fileImage, contents)
    );
  };

  // 새로고침 시 데이터 유지하기 (나중에 할 일)
  React.useEffect(() => {
    dispatch(postActions.getOnePostAPI(edit_id));
  }, []);

  const changePrice = (e) => {
    setPrice(e.target.value);
  };

  const changeContents = (e) => {
    setContent(e.target.value);
  };

  const changeTitle = (e) => {
    setTitle(e.target.value);
  };

  const addPost = () => {
    
  dispatch(postActions.addPostAPI(title, price, img_url, contents));

};

  const saveFileImage = (e) => {
    const img = e.target.files[0];
    const formData = new FormData();
    formData.append('imgUrl', img);
    console.log(formData); // FormData {}
    for (const keyValue of formData) console.log(keyValue);
    dispatch(postActions.imageAPI(formData));
    setFileImage(URL.createObjectURL(e.target.files[0]));
  };

  // 로그인 상태 체크
  if (!is_token) {
    return (
      <Grid margin="100px 0px" padding="16px" center>
        <Text size="32px" bold>
          앗! 잠깐!
        </Text>
        <Text size="16px">로그인 후에만 글을 쓸 수 있어요!</Text>
        <Grid width="10rem" margin="auto">
          <Button
            _onClick={() => {
              history.replace('/login');
            }}
          >
            로그인하러 가기
          </Button>
        </Grid>
      </Grid>
    );
  }
  // 글 쓰기 페이지
  return (
    <Grid padding="0 13vw">
      {/* 글 제목 */}
      <Grid is_flex border_bottom>
        <Grid width="6rem">
          <Text font=".7rem" bold>
            제목
          </Text>
        </Grid>

        <Grid margin="2vw">
          <Input type="text" value={title} _onChange={changeTitle} />
        </Grid>
        <Grid width="6rem">
          <Text font=".7rem" bold>
            0/40
          </Text>
        </Grid>
      </Grid>
      {/* 판매 가격 */}
      <Grid only_flex border_bottom>
        <Grid is_flex width="50%">
          <Grid width="6rem">
            <Text font=".7rem" bold>
              가격
            </Text>
          </Grid>

          <Grid margin="2vw">
            <Input
              value={price}
              type="number"
              placeholder="숫자만 입력해주세요."
              _onChange={changePrice}
            />
          </Grid>
        </Grid>

        <Grid width="6rem">
          <Text font=".7rem" bold>
            원
          </Text>
        </Grid>
      </Grid>

      {/* 상품 이미지 */}
      <Grid is_flex border_bottom>
        <Grid width="10rem">
          <Text font=".7rem" bold>
            상품 이미지
          </Text>
        </Grid>
        <Grid margin="2vw" width="30vw">
          <Input type="file" _onChange={saveFileImage} size="30" />
        </Grid>
        <Grid margin="2vw">
          <Image shape="rectangle" src={fileImage} is_main />
        </Grid>
      </Grid>
      {/* 게시글 작성 */}
      <Grid padding="16px">
        <Input
          value={contents}
          _onChange={changeContents}
          label="설명"
          placeholder="상품 설명을 입력해주세요."
          multiLine
        ></Input>
      </Grid>

      <Grid padding="16px" is_right>
        {is_edit ? (
          <Button
            text="상품 수정하기"
            _onClick={() => {
              editPost();
            }}
            is_disabled={
              title === '' || price === '' || contents === '' ? true : false
            }
          ></Button>
        ) : (
          <Button 
            text="상품 등록하기"
            _onClick={() => {
                console.log('버튼 클릭됨');
              addPost();  
            }}
            is_disabled={
              title === '' || price === '' || contents === '' ? true : false
            }
          ></Button>
          
        )}
      </Grid>
    </Grid>
  );
};

export default PostWrite;
