// ✅ App.js - 라우터 통일, ChatRoomWrapper 제거

import { ConnectedRouter } from 'connected-react-router';
import { history } from '../redux/configureStore';
import { Route } from 'react-router-dom';
import React from 'react';

import Main from '../pages/Main';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PostWrite from '../pages/PostWrite';
import PostDetail from '../pages/PostDetail';
import Search from '../pages/Search';
import ChatRoom from '../pages/ChatRoom';
import ChatList from '../pages/ChatList';

import Grid from '../elements/Grid';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { useDispatch } from 'react-redux';
import { actionCreators as userActions } from '../redux/modules/user';
import EditProfile from '../pages/EditProfile';
import Withdraw from '../pages/Withdraw';
function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const token = localStorage.getItem('login-token');
    if (token) {
      dispatch(userActions.checkLoginDB());
    }
  }, []);

  return (
    <React.Fragment>
      <Header />
      <ConnectedRouter history={history}>
        <Grid margin="5.8rem 0">
          <Route path="/" exact component={Main} />
          <Route path="/login" exact component={Login} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/write" exact component={PostWrite} />
          <Route path="/write/:id" exact component={PostWrite} />
          <Route path="/post/:id" exact component={PostDetail} />
          <Route path="/search/:searchWord" exact component={Search} />
          <Route path="/chatlist" exact component={ChatList} />
          <Route path="/chat/:postId" exact render={(props) => <ChatRoom {...props} />} />
          <Route path="/edit-profile" exact component={EditProfile} />
<Route path="/withdraw" exact component={Withdraw} />
        </Grid>
      </ConnectedRouter>
      <Footer />
    </React.Fragment>
  );
}

export default App;
