import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from '../js/firebaseApp';  // firebaseApp.js에서 auth와 db를 가져옴
import './MyPage.css';
import manIcon from '../img/manIcon.png'
import womanIcon from '../img/womanIcon.png'

const MyPage = () => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // 로그인 상태 확인
        onAuthStateChanged(auth, async (user) => {  // auth 객체를 사용
            if (user) {
                // 로그인된 사용자라면 Realtime Database에서 사용자 정보 가져오기
                const userRef = ref(db, 'users/' + user.uid);  // 로그인한 사용자의 UID를 기준으로 데이터 가져옴
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    setUserInfo(snapshot.val());  // 사용자 정보를 state에 저장
                } else {
                    console.log("해당 사용자 정보가 존재하지 않습니다.");
                }
            } else {
                console.log("로그인되지 않았습니다.");
            }
        });
    }, []);

    // 만 나이 계산 함수
    const calculateAge = (birthday) => {
        const birthDate = new Date(birthday);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        const dayDifference = today.getDate() - birthDate.getDate();

        // 생일이 지나지 않았다면 나이에서 1살을 빼기
        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
            age--;
        }

        return age;
    };

    // BMR 계산 함수
    const calculateBMR = (gender, weight, height, age) => {
        if (gender === "남성") {
            // 남성 BMR 공식
            return 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
        } else if (gender === "여성") {
            // 여성 BMR 공식
            return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
        }
        return 0;
    };

    // BMI 계산 함수
    const calculateBMI = (gender, weight, height) => {
        if (gender === "남성") {
            // 남성 BMI 공식
            return (1.10 * weight) - (128 * (weight / height));
        } else if (gender === "여성") {
            // 여성 BMI 공식
            return (1.07 * weight) - (128 * (weight / height));
        }
        return 0;
    };

    if (!userInfo) {
        return <div>회원 정보가 없습니다.</div>;
    }

    const age = calculateAge(userInfo.birthday); // 만 나이 계산
    const bmr = calculateBMR(userInfo.gender, userInfo.weight, userInfo.height, age); // BMR 계산
    const bmi = calculateBMI(userInfo.gender, userInfo.weight, userInfo.height); // BMI 계산

    return (
        <div className="MyPage">
            <div className="profileRectangle">
                {/* 성별에 따라 아이콘 이미지 렌더링 */}
                <img
                    src={userInfo.gender === "남성" ? manIcon : womanIcon}
                    alt={userInfo.gender === "남성" ? "남자 아이콘" : "여자 아이콘"}
                    className="profileIcon"
                />
            </div>

            <h2>{userInfo.name}</h2>
            <div className="infoBox">
                <div className="heightBox">
                    <p>키</p>
                    <p>{userInfo.height} cm</p>
                </div>
                <div className="weightBox">
                    <p>체중</p>
                    <p>{userInfo.weight} kg</p>
                </div>
                <div className="ageBox">
                    <p>만 나이</p>
                    <p>{age}세</p>
                </div>
            </div>
            <div className="bodyInfo">
                <p>신체 정보 분석 결과</p>
                <p>BMI</p> {/* BMR 출력 */}
                <p className="fontSet">{userInfo.name}님의 비만도는 {bmi.toFixed(2)} 입니다</p>
                <p>BMR</p>
                <p className="fontSet">{userInfo.name}님의 기초대사량은 {bmr.toFixed(2)} kcal 입니다</p> {/* BMR 출력 */}
            </div>
        </div>
    );
};

export default MyPage;


// import React, { useEffect, useState } from 'react';
// import { onAuthStateChanged } from "firebase/auth";
// import { ref, get } from "firebase/database";
// import { auth, db } from '../js/firebaseApp';  // firebaseApp.js에서 auth와 db를 가져옴
// import './MyPage.css';
// import manIcon from '../img/manIcon.png'
// import womanIcon from '../img/womanIcon.png'
// const MyPage = () => {
//     const [userInfo, setUserInfo] = useState(null);
//
//     useEffect(() => {
//         // 로그인 상태 확인
//         onAuthStateChanged(auth, async (user) => {  // auth 객체를 사용
//             if (user) {
//                 // 로그인된 사용자라면 Realtime Database에서 사용자 정보 가져오기
//                 const userRef = ref(db, 'users/' + user.uid);  // 로그인한 사용자의 UID를 기준으로 데이터 가져옴
//                 const snapshot = await get(userRef);
//
//                 if (snapshot.exists()) {
//                     setUserInfo(snapshot.val());  // 사용자 정보를 state에 저장
//                 } else {
//                     console.log("해당 사용자 정보가 존재하지 않습니다.");
//                 }
//             } else {
//                 console.log("로그인되지 않았습니다.");
//             }
//         });
//     }, []);
//
//     // 만 나이 계산 함수
//     const calculateAge = (birthday) => {
//         const birthDate = new Date(birthday);
//         const today = new Date();
//
//         let age = today.getFullYear() - birthDate.getFullYear();
//         const monthDifference = today.getMonth() - birthDate.getMonth();
//         const dayDifference = today.getDate() - birthDate.getDate();
//
//         // 생일이 지나지 않았다면 나이에서 1살을 빼기
//         if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
//             age--;
//         }
//
//         return age;
//     };
//
//     // BMR 계산 함수
//     const calculateBMR = (gender, weight, height, age) => {
//         if (gender === "남성") {
//             // 남성 BMR 공식
//             return 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
//         } else if (gender === "여성") {
//             // 여성 BMR 공식
//             return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
//         }
//         return 0;
//     };
//
//     // BMI 계산 함수
//     const calculateBMI = (gender, weight, height) => {
//         if (gender === "남성") {
//             // 남성 BMI 공식
//             return (1.10 * weight) - (128 * (weight / height));
//         } else if (gender === "여성") {
//             // 여성 BMI 공식
//             return (1.07 * weight) - (128 * (weight / height));
//         }
//         return 0;
//     };
//
//     if (!userInfo) {
//         return <div>회원 정보가 없습니다.</div>;
//     }
//
//     const age = calculateAge(userInfo.birthday); // 만 나이 계산
//     const bmr = calculateBMR(userInfo.gender, userInfo.weight, userInfo.height, age); // BMR 계산
//     const bmi = calculateBMI(userInfo.gender, userInfo.weight, userInfo.height); // BMI 계산
//
//     return (
//         <div className="MyPage">
//             <div className="profileRectangle"></div>
//             <h2>{userInfo.name}</h2>
//             <div className="infoBox">
//                 <div className="heightBox">
//                     <p>키</p>
//                     <p>{userInfo.height} cm</p>
//                 </div>
//                 <div className="weightBox">
//                     <p>체중</p>
//                     <p>{userInfo.weight} kg</p>
//                 </div>
//                 <div className="ageBox">
//                     <p>만 나이</p>
//                     <p>{age}세</p>
//                 </div>
//             </div>
//             <div className="bodyInfo">
//                 <p>신체 정보 분석 결과</p>
//                 <p>BMI</p> {/* BMR 출력 */}
//                 <p className="fontSet">{userInfo.name}님의 비만도는 {bmi.toFixed(2)} 입니다</p>
//                 <p>BMR</p>
//                 <p className="fontSet">{userInfo.name}님의 기초대사량은 {bmr.toFixed(2)} kcal 입니다</p> {/* BMR 출력 */}
//             </div>
//             {/*<p>이메일: {userInfo.email}</p>*/}
//             {/*<p>생년월일: {userInfo.birthday}</p>*/}
//
//             {/*<p>성별: {userInfo.gender}</p>*/}
//
//             {/*<p>BMI: {bmi.toFixed(2)}</p> /!* BMI 출력 *!/*/}
//         </div>
//     );
// };
//
// export default MyPage;