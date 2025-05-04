import {useState} from "react";
import './EditPassword.css'
const EditPassword = ({onEditPassword}) => {
    const [password, setPassword] = useState('');

    return (
        <div className={'EditPassword'}>
            <h2>⚠변경하실 비밀번호를 입력해 주세요.</h2>
            <input name={'password'} type={'password'} value={password} placeholder={'비밀번호는 최소 6자 이상 입력해 주세요.'}
                   onChange={event => setPassword(event.target.value)}/>
            <div className="buttonWrap">
                <button onClick={() => onEditPassword(password)}>비밀번호 변경</button>
            </div>
        </div>
    )
}

export default EditPassword;