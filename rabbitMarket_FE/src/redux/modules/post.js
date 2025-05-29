import { createAction, handleActions } from 'redux-actions';
import { immerable, produce } from 'immer';
import axios from 'axios';
import { apis } from '../../shared/api';

// post
const SET_POST = 'SET_POST';
const ADD_POST = 'ADD_POST';
const EDIT_POST = 'EDIT_POST';
const DELETE_POST = 'DELETE_POST';
const ONE_POST = 'ONE_POST';
const STATE_POST = 'STATE_POST';

// Image
const IMAGE_URL = 'IMAGE_URL';

// search
const SEARCH_TITLE = 'SEARCH_TITLE';

// filter
const SET_FILTER_STATE = 'SET_FILTER_STATE';

// comment
const GET_COMMENTS = 'GET_COMMENTS';
const SET_COMMENTS = 'SET_COMMENTS';
const DEL_COMMENTS = 'DEL_COMMENTS';
const EDIT_COMMENTS = 'EDIT_COMMENTS';

const setPost = createAction(SET_POST, (post_list) => ({ post_list }));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const deletePost = createAction(DELETE_POST, (post_id) => ({ post_id }));
const getOnePost = createAction(ONE_POST, (post, comments) => ({
  post,
  comments,
}));
const statePost = createAction(STATE_POST, () => ({}));

// 이미지 url 저장
const getImageUrl = createAction(IMAGE_URL, (img_url) => ({ img_url }));

// 검색 결과 저장
const searchTitle = createAction(SEARCH_TITLE, (search_res) => ({
  search_res,
}));

// filter
const setFilterState = createAction(SET_FILTER_STATE, (filterState) => ({
  filterState,
}));

const getComments = createAction(GET_COMMENTS, (comments) => ({ comments }));
const setComments = createAction(
  SET_COMMENTS,
  (comment, nickname, updatedAt, userId, commentId) => ({
    comment,
    nickname,
    updatedAt,
    userId,
    commentId,
  })
);
const delComment = createAction(DEL_COMMENTS, (del_idx) => ({ del_idx }));
const editComment = createAction(EDIT_COMMENTS, (comment) => ({ comment }));

const initialState = {
  list: [],
  post: [],
  comments: [],
  img: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FlOeQ2%2Fbtrtys8M1UX%2FEXvjbkD77erg12mnimKaK0%2Fimg.png',
  searchList: [],
  filterState: 0, // 0 : 전체보기 1 : 판매 중 2: 판매 완료
};

const initialPost = {
  postId: 'aalasdf',
  title: '아이폰 10',
  content: '아이폰 팔아요',
  price: 1000,
  imgurl: 'http://gi.esmplus.com/dodomae/NAR/Monami/pluspen3000.jpg',
  createdAt: '2022-02-22',
  updatedAt: '2022-02-25',
  nickname: 'fasdfasdf',
  userId: 'id',
  isSold: false,
};

//middleware
const reportPostAPI = (postId, reason) => {
  return function (dispatch, getState, { history }) {
    apis.reportPost(postId, { content: reason })
      .then((res) => {
        alert('신고가 접수되었습니다.');
        // 신고 이후 게시물 정보 다시 불러오기
        dispatch(getOnePostAPI(postId));
      })
      .catch((err) => {
        alert('신고 처리 중 오류가 발생했습니다.');
        console.error(err);
      });
  };
};
//전체 상품 조회
const getPostAPI = () => {
  return async function (dispatch, useState, { history }) {
    await apis.posts().then(function (res) {
      dispatch(setPost(res.data.posts));
    });
  };
};
//판매 상품 등록
const addPostAPI = (title, price, imgurl = '', content) => {
  return async function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');

    console.log("전송할 데이터:", title, price, imgurl, content);

    apis
      .add(
        { title, price, imgurl, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(function (res) {
         console.log("서버 응답:", res);
        
        window.location.replace('/');
      })
      .catch((err) => {
        console.error("게시글 등록 실패:", err);
      });
  };
};
//판매 상품 하나만 가져오기
const getOnePostAPI = (postId) => {
  return async function (dispatch, useState, { history }) {
    await apis.post(postId).then(function (res) {
      dispatch(getOnePost(res.data.post, res.data.comments));
      // 해당 글의 댓글 가져오기
      dispatch(getComments(res.data.comments));
    });
  };
};
//판매 상품 수정
const editPostAPI = (postId, title, price, imgurl, content) => {
  return async function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');
    console.log('확인하기', postId, title, price, imgurl, content);
    apis
      .edit(
        { postId, title, price, imgurl, content },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'  },
        }
      )
      .then(function (res) {
        history.replace('/');
      });
  };
};
//판매 상품 삭제
const deletePostAPI = (post_id) => {
  return async function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');

    apis
      .del({
        data: { postId: post_id },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'  },
      })
      .then(function (res) {
        console.log(res);
        history.replace('/');
      });
  };
};

//상세페이지 판매 상태 변경
const statePostAPI = (postId) => {
  return function (dispatch, useState, { history }) {
    apis.changeStatus({ postId }).then(function (res) {
      dispatch(statePost());
      // history.replace(`/post/${postId}`);
    });
  };
};

// 검색하기 기능
const searchAPI = (title) => {
  return function (dispatch, useState, { history }) {
    axios
      .get(`http://localhost:3001/api/search?title=${encodeURIComponent(title)}`)
      .then(function (res) {
        dispatch(searchTitle(res.data.posts));
      })
      .catch(function (error) {
        console.error('검색 API 에러:', error);
      });
  };
};

// 필터 기능
const filterAPI = (number) => {
  return function (dispatch, useState, { history }) {
    const boolNum = number === 1 ? false : true;
    axios
      .get(`http://localhost:3001/api/sales?isSold=${boolNum}`)
      .then(function (res) {
        dispatch(setPost(res.data.posts));
      })
      .catch(function (error) {
        console.log(error);
      });
  };
};

// 이미지 #######################################################3

// 이미지 등록하기 (url 받아오기)
const imageAPI = (file) => {
  for (const keyValue of file) console.log(keyValue);
  return async function (dispatch, useState, { history }) {
    apis.image(file).then(function (res) {
      console.log(res.data.imgurl);
      dispatch(getImageUrl(res.data.imgurl));
    });
  };
};  

const uploadImage = (file) => {
  return async function (dispatch, getState, { history }) {
    const formData = new FormData();
    formData.append('imgUrl', file); // 'imgUrl'은 백엔드 multer 필드명과 일치해야 함

    try {
      const res = await apis.image(formData);
      console.log(res.data.imgurl);
      dispatch(getImageUrl(res.data.imgurl));
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };
};
// 댓글 #######################################################3

// 댓글 등록
const addCommentAPI = (postId, comment) => {
  return function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');

    apis.addComment({ postId, comment }).then(function (res) {
      console.log(res);
      dispatch(
        setComments(
          comment,
          res.data.result.nickname,
          res.data.result.updatedAt,
          res.data.result.userId,
          res.data.result.commentId
        )
      );
    });
  };
};

// 댓글 삭제하기
const delCommentAPI = (commentId) => {
  return function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');

    apis
      .delComment({
        data: { commentId },
        headers: { Authorization: `Bearer ${token}` , 'Content-Type': 'application/json' },
      })
      .then(function (res) {
        const del_idx = useState().post.comments.findIndex(
          (c) => c.commentId === commentId
        );
        console.log(del_idx);
        // 삭제 액션 수행
        dispatch(delComment(del_idx));
      });
  };
};

// 댓글 수정하기
const editCommentAPI = (commentId, comment) => {
  return function (dispatch, useState, { history }) {
    const token = localStorage.getItem('login-token');

    apis
      .editComment(
        { commentId, comment },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'  },
        }
      )
      .then(function (res) {
        console.log(res.data.result);
        dispatch(editComment(res.data.result));
      });
  };
};

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload.post_list;
      }),
    [ONE_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.post = action.payload.post;
        draft.post.comments = action.payload.comments;
      }),
    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload;
      }),
    [DELETE_POST]: (state, action) =>
      produce(state, (draft) => {
        let deleted = draft.list.filter((e, i) => {
          return parseInt(action.payload.post_idx) !== i;
        });
        draft.list = deleted;
      }),
    [STATE_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.post.isSold = !state.post.isSold;
        // console.log(list);
        console.log(state.post);
      }),

    // 이미지
    [IMAGE_URL]: (state, action) =>
      produce(state, (draft) => {
        draft.img = action.payload.img_url;
      }),

    // 검색
    [SEARCH_TITLE]: (state, action) =>
      produce(state, (draft) => {
        console.log(action.payload.search_res);
        draft.searchList = action.payload.search_res;
      }),

    [SET_FILTER_STATE]: (state, action) =>
      produce(state, (draft) => {
        console.log(action.payload.filterState);
        draft.filterState = action.payload.filterState;
      }),

    // 댓글
    [GET_COMMENTS]: (state, action) =>
      produce(state, (draft) => {
        draft.comments = action.payload.comments;
      }),

    [SET_COMMENTS]: (state, action) =>
      produce(state, (draft) => {
        draft.comments.unshift(action.payload);
        console.log(action.payload);
      }),

    [DEL_COMMENTS]: (state, action) =>
      produce(state, (draft) => {
        let deleted = draft.comments.filter((e, i) => {
          return parseInt(action.payload.del_idx) !== i;
        });
        draft.comments = deleted;
      }),
    [EDIT_COMMENTS]: (state, action) =>
      produce(state, (draft) => {
        let edited = [];
        state.comments.map((c, i) => {
          if (action.payload.comment.commentId !== c.commentId) edited.push(c);
          else edited.push(action.payload.comment);
        });
        draft.comments = edited;
      }),
  },
  initialState
);

const actionCreators = {
  setPost,
  addPost,
  editPost,
  deletePost,
  getOnePost,
  statePost,
  getOnePostAPI,
  getPostAPI,
  addPostAPI,
  editPostAPI,
  deletePostAPI,
  statePostAPI,
  reportPostAPI,
  imageAPI,

  searchAPI,

  setFilterState,
  filterAPI,

  addCommentAPI,
  delCommentAPI,
  editCommentAPI,
};

export { actionCreators };
