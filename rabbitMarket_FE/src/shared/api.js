import axios from 'axios';

const token = localStorage.getItem('login-token');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    accept: 'application/json,',
    Authorization: `Bearer ${token}`,
  },
});

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
    api.put(`/api/posts`, postId, title, price, imgurl, content),
  del: (postId) => api.delete(`/api/posts`, postId),
  changeStatus: (postId) => api.patch(`/api/status`, postId),

  // comment
  addComment: (postId, comment) => api.post(`/api/comments`, postId, comment),
  delComment: (commentId) => api.delete(`/api/comments`, commentId),
  editComment: (commentId, comment) =>
    api.patch(`/api/comments`, commentId, comment),


  editProfile: (data,config) => instance.put('/user/edit', data,config),
withdraw: (config) => instance.delete('/user/withdraw',config),


};

