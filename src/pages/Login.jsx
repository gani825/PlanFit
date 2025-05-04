import { useState } from "react";
import './Login.css'
import {useNavigate} from "react-router-dom";
const Login = ({onLogin}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleGoToJoin = () => {
        // 회원가입 페이지로 이동
        navigate('/join');
    };
    return (
        <div className="Login">
            <h1>로그인 페이지</h1>
            <h3>🌎이메일 입력</h3>
            <input name={'email'} type={'email'} value={email} placeholder={'이메일을 입력해 주세요.'}
                   onChange={event => setEmail(event.target.value)}/><br/>
            <h3>⚠비밀번호 입력</h3>
            <input name={'password'} type={'password'} value={password} placeholder={'비밀번호 6자리 이상 입력해 주세요.'}
                   onChange={event => setPassword(event.target.value)}/><br/>
            <div className="buttonBox">
                <button className="go-to-join" onClick={handleGoToJoin}>회원가입</button>
                <button onClick={() => onLogin(email, password)}>로그인</button>
            </div>
        </div>
    )
}

export default Login;

// import { useState } from "react";
//
// const Login = ({onLogin}) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//
//     return (
//         <div className="Login">
//             <h1>Login 페이지입니다.</h1>
//             <input name={'email'} type={'email'} value={email} placeholder={'Email'}
//                    onChange={event => setEmail(event.target.value)}/><br/>
//             <input name={'password'} type={'password'} value={password} placeholder={'Password'}
//                    onChange={event => setPassword(event.target.value)}/><br/>
//             <button onClick={() => onLogin(email, password)}>로그인</button>
//         </div>
//     )
// }
//
// export default Login;