import { apis } from '../../shared/api';

// action type
const SET_WISHLIST = 'SET_WISHLIST';

// action creator
const setWishlist = (wishlist) => ({ type: SET_WISHLIST, wishlist });


// thunk
export const getWishlistAPI = () => {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('login-token');
      const res = await apis.getWishlist(token); // apis.js에서 정의한 함수
      dispatch(setWishlist(res.data.wishlist));
    } catch (err) {
      console.error('찜 목록 불러오기 실패:', err);
    }
  };
};

// 초기 상태
const initialState = {
  list: [],
};

// reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WISHLIST:
      return { ...state, list: action.wishlist };
    default:
      return state;
  }
}
export const actionCreators = {
  getWishlistAPI,
};