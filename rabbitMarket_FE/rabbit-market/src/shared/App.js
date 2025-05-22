import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '../redux/configureStore';
import styled from 'styled-components';

import Main from '../pages/Main';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PostWrite from '../pages/PostWrite';
import PostDetail from '../pages/PostDetail';
import Search from '../pages/Search';

import Grid from '../elements/Grid';
import Header from '../components/Header';
import React from 'react';
import Footer from '../components/Footer';
import { useDispatch } from 'react-redux';
import { actionCreators as userActions } from '../redux/modules/user';


function App() {

    const dispatch = useDispatch();
React.useEffect(() => {
    const token = localStorage.getItem('login-token');
    if (token) {
      dispatch(userActions.checkLoginDB());  // 이게 핵심!!
    }
  }, []);
  return (
    <React.Fragment>
      <Header></Header>
      <ConnectedRouter history={history}>
        <Grid margin="5.8rem 0">
          <Route path="/" exact component={Main}></Route>
          <Route path="/login" exact component={Login}></Route>
          <Route path="/signup" exact component={Signup}></Route>
          {/* 게시물 작성 */}
          <Route path="/write" exact component={PostWrite}></Route>
          {/* 게시물 수정 */}
          <Route path="/write/:id" exact component={PostWrite}></Route>
          {/* 상세 페이지 */}
          <Route path="/post/:id" exact component={PostDetail}></Route>
          {/* 검색 결과 페이지 */}
          <Route path="/search/:searchWord" exact component={Search}></Route>
        </Grid>
      </ConnectedRouter>
      <Footer></Footer>
    </React.Fragment>
  );
}

export default App;
