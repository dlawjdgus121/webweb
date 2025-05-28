// response.js
export const RESP = {
  POSTS: {
    ok: true,
    posts: [
      {
        postId: 'aalasdf',
        title: '아이폰 10',
        content: '아이폰 팔아요',
        price: 1000,
        imgurl: 'http://gi.esmplus.com/dodomae/NAR/Monami/pluspen3000.jpg',
        createdAt: '2022-02-22',
        updatedAt: '2022-02-25',
        nickname: 'fasdfasdf',
        userId: 'id',
        isSold: true,
      },
    ],
  },
  POST: {
    ok: true,
    post: {
      postId: 'aalasdf',
      title: '아이폰 10',
      content: '아이폰 팔아요',
      price: 1000,
      imgurl: 'http://gi.esmplus.com/dodomae/NAR/Monami/pluspen3000.jpg',
      createdAt: '2022-02-22',
      updatedAt: '2022-02-25',
      nickname: 'fasdfasdf',
      userId: 'id',
      isSold: true,
    },
    comments: [
      {
        commentId: 'asdfasdf',
        comment: '댓글달았어요',
        nickname: '닉네임입니다',
        userId: 'id',
      },
    ],
  },
  SIGNUP: {
    ok: true,
  },
  CHECK_ID: {
    ok: true,
  },
  LOGIN: {
    ok: true,
    token: 'eyJ0eXAi...',
  },
  WRITE_POST: {
    ok: true,
    result: '판매 상품이 등록되었습니다',
  },
  IMAGE_UPLOAD: {
    ok: true,
    result: '이미지 업로드 완료',
    imgurl: 'http://gi.esmplus.com/dodomae/NAR/Monami/pluspen3000.jpg',
  },
  POST_UPDATE: {
    ok: true,
    result: '판매상품이 수정 되었습니다',
  },
  POST_DELETE: {
    ok: true,
    result: '판매상품이 삭제 되었습니다',
  },
  WRITE_COMMENT: {
    ok: true,
    result: '댓글이 등록되었습니다',
  },
  DELETE_COMMENT: {
    ok: true,
    result: '댓글이 삭제 되었습니다',
  },
  STATUS_UPDATE: {
    ok: true,
    result: '판매 상태가 변경 되었습니다',
  },
};
