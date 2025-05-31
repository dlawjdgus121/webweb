import axios from 'axios';
import { reportPostAPI } from '../redux/modules/post';

const token = localStorage.getItem('login-token');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    accept: 'application/json,',
    Authorization: `Bearer ${token}`,
  },
});
// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('login-token'); // 매 요청마다 최신 토큰 조회
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const instance = axios.create({
  baseURL: 'http://localhost:3003/api',
  withCredentials: true,
});

export const apis = {
  // user
  login: (id, pw) => api.post('/api/login', { loginId: id, password: pw }),
  signup: (id, pw, nickname) =>
    api.post('/api/signup', {
      loginId: id,
      password: pw,
      nickname: nickname,
    }),
  checkId: (id) =>
    api.post('/api/checkid', {
      loginId: id,
    }),
  checkLogin: (token) => api.get('/api/checklogin', token),

  // post
  posts: () => api.get('/api/posts'),
  post: (postId) => api.get(`/api/posts/${postId}`),
add: (data, config) => api.post('/api/posts', data, config),
  image: (formData) =>
  api.post('/api/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  edit: (postId, title, price, imgurl, content) =>
    api.put(`/api/posts`, {postId, title, price, imgurl, content}),
  del: (postId) => api.delete(`/api/posts`, postId),
  changeStatus: (postId) => api.patch(`/api/status`, postId),
reportPost: (postId, data) => api.post(`/api/report/${postId}`, data),

  addComment: (postId, comment) => api.post(`/api/comments`, postId, comment),
  delComment: (commentId) => api.delete(`/api/comments`, commentId),
  editComment: (commentId, comment) =>
    api.patch(`/api/comments`, commentId, comment),


  editProfile: (data,config) => instance.put('/user/edit', data,config),


withdraw: (config) => instance.delete('/user/withdraw',config),


  addToWishlist: (postId, token) => {
    return api.post(`/api/wishlist/${postId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  removeFromWishlist: (postId, token) => {
    return api.delete(`/api/wishlist/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: null,
    });
  },
  getWishlist: () => {
    return api.get('/api/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  checkWishlist: (postId, token) => {
  return api.get(`/api/wishlist/check/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
},
};

