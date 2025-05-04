import { useState } from "react";
import './Join.css';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { db, auth } from '../js/firebaseApp';  // named import 사용 // Firebase 설정 파일 경로
import { useNavigate } from 'react-router-dom';  // navigate import 추가

const Join = ({ onJoin }) => {
    const navigate = useNavigate();  // navigate 훅 사용
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('');

    const handleGenderChange = (event) => {
        setGender(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            // Firebase Authentication을 통해 회원가입
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Realtime Database에 사용자 정보 저장
            const userInfo = { email, name, birthday, height, weight, gender };
            await set(ref(db, 'users/' + user.uid), userInfo);  // user.uid를 기준으로 저장

            alert("회원가입이 완료되었습니다!");

            // 회원가입 성공 후 자동으로 로그인 페이지로 이동
            navigate('/login');  // 로그인 페이지로 이동

            // onJoin();  // 회원가입 성공 후, 다른 처리 필요시 호출
        } catch (error) {
            console.error("회원가입 오류:", error.message);
            alert("회원가입에 실패했습니다. 오류: " + error.message);  // 오류 메시지 출력
        }
    };

    return (
        <div className={'Join'}>
            <h1>회원가입</h1>
            <h3>🌎 이메일 입력</h3>
            <input
                name={'email'}
                type={'email'}
                value={email}
                placeholder={'이메일을 입력해 주세요.'}
                onChange={event => setEmail(event.target.value)}
            /><br/>

            <h3>⚠ 비밀번호 입력</h3>
            <input
                name={'password'}
                type={'password'}
                value={password}
                placeholder={'비밀번호 6자리 이상 입력해 주세요.'}
                onChange={event => setPassword(event.target.value)}
            /><br/>

            <h3>👭 이름 입력</h3>
            <input
                name={'name'}
                value={name}
                placeholder={'사용하실 이름을 입력해 주세요.'}
                onChange={e => setName(e.target.value)}
            /><br/>

            <h3>📅 생년월일 입력</h3>
            <input
                name={'birthday'}
                type={'date'}
                value={birthday}
                onChange={event => setBirthday(event.target.value)}
            /><br/>

            <h3>📏 키 입력 (cm)</h3>
            <input
                name={'height'}
                type={'number'}
                value={height}
                placeholder={'키를 입력해 주세요 (cm)'}
                onChange={event => setHeight(event.target.value)}
            /><br/>

            <h3>⚖ 체중 입력 (kg)</h3>
            <input
                name={'weight'}
                type={'number'}
                value={weight}
                placeholder={'체중을 입력해 주세요 (kg)'}
                onChange={event => setWeight(event.target.value)}
            /><br/>

            <h3>👤 성별 선택</h3>
            <div className="gender-container">
                <label>
                    <input
                        type="radio"
                        value="남성"
                        checked={gender === '남성'}
                        onChange={handleGenderChange}
                    /> 남성
                </label>
                <label>
                    <input
                        type="radio"
                        value="여성"
                        checked={gender === '여성'}
                        onChange={handleGenderChange}
                    /> 여성
                </label>
            </div>
            <div className="joinButton">
                <button onClick={handleSubmit}>회원가입</button>
            </div>
        </div>
    );
};

export default Join;


// import { useState } from "react";
// import './Join.css';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { ref, set } from "firebase/database";
// import { db, auth } from '../js/firebaseApp';  // named import 사용 // Firebase 설정 파일 경로
//
// const Join = ({ onJoin }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [name, setName] = useState('');
//     const [birthday, setBirthday] = useState('');
//     const [height, setHeight] = useState('');
//     const [weight, setWeight] = useState('');
//     const [gender, setGender] = useState('');
//
//     const handleGenderChange = (event) => {
//         setGender(event.target.value);
//     };
//
//     const handleSubmit = async () => {
//         try {
//             // Firebase Authentication을 통해 회원가입
//             const auth = getAuth();
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;
//
//             // Realtime Database에 사용자 정보 저장
//             const userInfo = { email, name, birthday, height, weight, gender };
//             await set(ref(db, 'users/' + user.uid), userInfo);  // user.uid를 기준으로 저장
//
//             alert("회원가입이 완료되었습니다!");
//             onJoin();  // 회원가입 성공 후, 다른 처리 필요시 호출
//         } catch (error) {
//             console.error("회원가입 오류:", error.message);
//             alert("회원가입에 실패했습니다. 오류: " + error.message);  // 오류 메시지 출력
//         }
//     };
//
//     return (
//         <div className={'Join'}>
//             <h1>회원가입</h1>
//             <h3>🌎 이메일 입력</h3>
//             <input
//                 name={'email'}
//                 type={'email'}
//                 value={email}
//                 placeholder={'이메일을 입력해 주세요.'}
//                 onChange={event => setEmail(event.target.value)}
//             /><br/>
//
//             <h3>⚠ 비밀번호 입력</h3>
//             <input
//                 name={'password'}
//                 type={'password'}
//                 value={password}
//                 placeholder={'비밀번호 6자리 이상 입력해 주세요.'}
//                 onChange={event => setPassword(event.target.value)}
//             /><br/>
//
//             <h3>👭 이름 입력</h3>
//             <input
//                 name={'name'}
//                 value={name}
//                 placeholder={'사용하실 이름을 입력해 주세요.'}
//                 onChange={e => setName(e.target.value)}
//             /><br/>
//
//             <h3>📅 생년월일 입력</h3>
//             <input
//                 name={'birthday'}
//                 type={'date'}
//                 value={birthday}
//                 onChange={event => setBirthday(event.target.value)}
//             /><br/>
//
//             <h3>📏 키 입력 (cm)</h3>
//             <input
//                 name={'height'}
//                 type={'number'}
//                 value={height}
//                 placeholder={'키를 입력해 주세요 (cm)'}
//                 onChange={event => setHeight(event.target.value)}
//             /><br/>
//
//             <h3>⚖ 체중 입력 (kg)</h3>
//             <input
//                 name={'weight'}
//                 type={'number'}
//                 value={weight}
//                 placeholder={'체중을 입력해 주세요 (kg)'}
//                 onChange={event => setWeight(event.target.value)}
//             /><br/>
//
//             <h3>👤 성별 선택</h3>
//             <div className="gender-container">
//                 <label>
//                     <input
//                         type="radio"
//                         value="남성"
//                         checked={gender === '남성'}
//                         onChange={handleGenderChange}
//                     /> 남성
//                 </label>
//                 <label>
//                     <input
//                         type="radio"
//                         value="여성"
//                         checked={gender === '여성'}
//                         onChange={handleGenderChange}
//                     /> 여성
//                 </label>
//             </div>
//             <div className="joinButton">
//                 <button onClick={handleSubmit}>회원가입</button>
//             </div>
//         </div>
//     );
// };
//
// export default Join;
