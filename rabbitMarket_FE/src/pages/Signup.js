import React, { useEffect, useState } from 'react';

import Grid from '../elements/Grid';
import Input from '../elements/Input';
import Text from '../elements/Text';
import Button from '../elements/Button';

import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as userActions } from '../redux/modules/user'; // as : 별명 주는거

const Signup = (props) => {
  const dispatch = useDispatch();

  const [id, setId] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [rePwd, setRePwd] = React.useState('');

  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);


  let disabled = useSelector((state) => state.user.is_check_id);

  const checkId = () => {
    if (id === '') {
      alert('아이디를 입력해 주세요.');
      return;
    }
    dispatch(userActions.checkIdDB(id));
  };

 const sendEmailCode = async () => {
    if (!email.includes('@sungkyul.ac.kr')) {
      alert('성결대 이메일 주소를 입력하세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/user/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmailCode(data.code); // 실서비스에선 이 줄 제거해야 함
        alert('인증 코드가 이메일로 전송되었습니다!');
      } else {
        alert(data.message || '이메일 전송 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 연결 오류');
    }
  };

  const verifyEmailCode = () => {
    if (inputCode === emailCode) {
      setIsEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } else {
      alert('인증 코드가 일치하지 않습니다.');
    }
  };


  const _signUp = () => {
    if (id === '' || nickname === '' || pwd === '' || rePwd === '') {
      alert('빈칸을 다 채워주세요.');
      return;
    } else if (pwd !== rePwd) {
      alert('비밀번호와 비밀번호 확인이 서로 다릅니다. 다시 적어주세요.');
      return;
    }
    if (!disabled) {
      alert('아이디 중복체크를 해주세요.');
      return;
    }

     if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    dispatch(userActions.registerDB(id, pwd, nickname));
  };
useEffect(() => {
  // 예시: id 상태 변경 시 중복확인 reset
  dispatch(userActions.checkid(false));
}, [id, dispatch]); // dispatch 빠지면 eslint 경고 발생
 return (
    <Grid width="28rem" margin="auto" padding="3rem 1rem">
      <Grid padding="16px" center>
        <Text size="2rem" bold>회원가입</Text>
      </Grid>

      {/* 아이디 */}
      <Grid is_flex padding="0px 1rem">
        <Input
          placeholder="아이디"
          border="none"
          border_bottom="1px solid #6667ab"
          is_focus
          value={id}
          _onChange={(e) => {
            setId(e.target.value);
            if (disabled) dispatch(userActions.checkid(false));
          }}
        />
        <Button
          width="5rem"
          border_radius="2rem"
          _onClick={checkId}
          is_disabled={disabled}
        >
          중복확인
        </Button>
      </Grid>
      <Grid padding="0px 1rem">
        <Text size="0.5rem" is_hidden={disabled}>아이디 중복체크를 해주세요 :)</Text>
      </Grid>

      {/* 닉네임, 비밀번호 */}
      <Grid padding="0px 1rem">
        <Input
          placeholder="닉네임"
          border="none"
          border_bottom="1px solid #6667ab"
          is_focus
          _onChange={(e) => setNickname(e.target.value)}
          value={nickname}
        />
      </Grid>
      <Grid padding="0px 1rem">
        <Input
          placeholder="비밀번호"
          border="none"
          type="password"
          border_bottom="1px solid #6667ab"
          is_focus
          _onChange={(e) => setPwd(e.target.value)}
          value={pwd}
        />
      </Grid>
      <Grid padding="0px 1rem">
        <Input
          placeholder="비밀번호 확인"
          border="none"
          type="password"
          border_bottom="1px solid #6667ab"
          is_focus
          _onChange={(e) => setRePwd(e.target.value)}
          value={rePwd}
        />
      </Grid>

      {/* 이메일 */}
      <Grid is_flex padding="0px 1rem">
        <Input
          placeholder="성결대 이메일 주소"
          border="none"
          border_bottom="1px solid #6667ab"
          is_focus
          value={email}
          _onChange={(e) => setEmail(e.target.value)}
        />
        <Button width="5rem" border_radius="2rem" _onClick={sendEmailCode}>
          전송
        </Button>
      </Grid>

      <Grid is_flex padding="0px 1rem">
        <Input
          placeholder="인증 코드 입력"
          border="none"
          border_bottom="1px solid #6667ab"
          is_focus
          value={inputCode}
          _onChange={(e) => setInputCode(e.target.value)}
        />
        <Button width="5rem" border_radius="2rem" _onClick={verifyEmailCode}>
          확인
        </Button>
      </Grid>

      {/* 가입 버튼 */}
      <Grid padding="5px 1rem">
        <Button
          border_radius="30px"
          _onClick={_signUp}
          is_disabled={
            id === '' ||
            nickname === '' ||
            pwd === '' ||
            rePwd === '' ||
            !isEmailVerified
          }
        >
          가입하기
        </Button>
      </Grid>
    </Grid>
  );
};


export default Signup;
