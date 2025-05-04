import React, { useState, useEffect, useContext } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import CalendarOnly from './CalendarOnly';
import Weather from '../component/Weather';
import { db } from '../js/firebaseApp';
import { ref, onValue, set, update, remove } from 'firebase/database'; // remove 함수 추가
import Chart from "../component/Chart";

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userInfo } = useContext(AuthContext);
    const auth = getAuth();
    const [footerText, setFooterText] = useState('');
    const [savedExercises, setSavedExercises] = useState([]);
    const [completedExercises, setCompletedExercises] = useState({});
    const [banList, setBanList] = useState(''); // 금지 리스트 상태 (입력 필드 값)
    const [userId, setUserId] = useState(null);
    const [savedBanList, setSavedBanList] = useState([]); // Firebase에서 가져온 금지 리스트
    const today = new Date().toISOString().slice(0, 10);

    const goToLoginPage = () => navigate('/login');
    const goToJoinPage = () => navigate('/join');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 실패:', error.message);
            alert('로그아웃에 실패했습니다.');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);

                const exercisesRef = ref(db, `exercises/${user.uid}`);
                const completedRef = ref(db, `completedExercises/${user.uid}/${today}`);
                const banListRef = ref(db, `banList/${user.uid}`); // 금지 리스트 경로

                // 운동 데이터 불러오기
                onValue(exercisesRef, (snapshot) => {
                    const data = snapshot.val();
                    const dataArray = data ? Object.values(data) : [];
                    const todayData = dataArray.find((item) => item.date === today);

                    if (todayData?.exercises) {
                        setSavedExercises(todayData.exercises);
                        setFooterText(
                            todayData.exercises
                                .map(
                                    (exercise) =>
                                        `${exercise.name} | ${exercise.time}분 (소모 칼로리: ${exercise.calories} kcal)`
                                )
                                .join('\n')
                        );
                    } else {
                        setSavedExercises([]);
                        setFooterText('오늘 등록된 운동이 없습니다.');
                    }
                });

                // 완료된 운동 상태 불러오기
                onValue(completedRef, (snapshot) => {
                    const data = snapshot.val();
                    setCompletedExercises(data || {});
                });

                // 금지 리스트 불러오기
                onValue(banListRef, (snapshot) => {
                    const data = snapshot.val();
                    const banListArray = data ? Object.entries(data) : []; // key-value 쌍으로 저장
                    setSavedBanList(banListArray); // key-value 형태로 저장
                });
            } else {
                setFooterText('로그인이 필요합니다.');
                setSavedExercises([]);
                setCompletedExercises({});
            }
        });

        return () => unsubscribe();
    }, [auth, today]);

    const handleCheckboxChange = (index) => {
        const updatedCompletedExercises = { ...completedExercises };
        updatedCompletedExercises[index] = !updatedCompletedExercises[index];

        setCompletedExercises(updatedCompletedExercises);

        if (userId) {
            const completedRef = ref(db, `completedExercises/${userId}/${today}`);
            set(completedRef, updatedCompletedExercises)
                .then(() => console.log('Completed exercises saved successfully'))
                .catch((error) => console.error('Error saving completed exercises:', error));
        }
    };

    const handleSaveBanList = () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            if (banList.trim() === "") {
                alert("금지 리스트를 입력하세요.");
                return;
            }
            if (window.confirm('리스트를 저장하시겠습니까?')) {
                // 고유 ID 생성 (현재 시간을 기준으로 고유한 ID를 만듦)
                const newBanItemKey = new Date().getTime().toString(); // 고유한 ID를 생성

                // 기존 리스트를 그대로 가져오고, 새 항목만 추가합니다.
                const newBanList = {
                    ...savedBanList.reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {}),
                    [newBanItemKey]: banList, // 고유 ID와 텍스트만 추가
                };

                update(ref(db, `banList/${userId}`), newBanList)
                    .then(() => {
                        // 새로 추가된 항목만 상태 업데이트
                        setSavedBanList(Object.entries(newBanList)); // 상태를 업데이트
                        setBanList(''); // 입력 필드 초기화
                        alert('저장되었습니다.');
                    })
                    .catch((error) => {
                        console.error('금지 리스트 저장 실패:', error);
                        alert('저장 실패!');
                    });
            }
        }
    };

    const handleDeleteBanItem = (itemId) => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;

            // 삭제 전에 사용자에게 확인을 요청
            if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
                // Firebase에서 해당 항목 삭제
                const banItemRef = ref(db, `banList/${userId}/${itemId}`);
                remove(banItemRef)
                    .then(() => {
                        // 삭제 후 상태 업데이트
                        const updatedBanList = savedBanList.filter((item) => item[0] !== itemId);
                        setSavedBanList(updatedBanList);
                        alert('삭제되었습니다.');
                    })
                    .catch((error) => {
                        console.error('삭제 실패:', error);
                        alert('삭제 실패!');
                    });
            } else {
                // 사용자가 취소를 눌렀을 경우
                console.log('삭제가 취소되었습니다.');
            }
        }
    };

    // 완료된 운동 갯수 계산
    const completedCount = Object.values(completedExercises).filter((completed) => completed).length;

    return (
        <div className="home-container">
            <div className="main-content">
                <div className="calendar-only">
                    <CalendarOnly />
                </div>
                <div className="right-panel">
                    <div className="sign-in">
                        {isAuthenticated ? (
                            <>
                                <button className="sign-in-button" onClick={handleLogout}>
                                    Sign Out
                                </button>
                                <div className="signButtonBox">
                                    <p>{userInfo ? `${userInfo.name}님 환영합니다.` : '환영합니다.'}</p>
                                    <Link to="/EditPassword">비밀번호 변경하기</Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <button className="sign-in-button" onClick={goToLoginPage}>
                                    Sign In
                                </button>
                                <p onClick={goToJoinPage}>회원가입</p>
                            </>
                        )}
                    </div>
                    <div className="widgets">
                        <div className="widget">
                            <h3>오늘의 운동 계획🏋️‍♂️</h3>
                            {savedExercises.slice(0, 4).map((exercise, index) => (
                                <div key={index} className="home-exercise-entry">
                                    <input
                                        type="checkbox"
                                        checked={completedExercises[index] || false}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                    <span className={completedExercises[index] ? 'home-completed-text' : ''}>
                                        {exercise.name} | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
                                    </span>
                                </div>
                            ))}
                            {savedExercises.length > 4 && (
                                <div className="more-text">더 많은 운동은 캘린더에서 확인하세요!</div>
                            )}
                        </div>
                        <div className="widget">
                            <h3>오늘의 운동 진행률💪</h3>
                            <div className="chartSet">
                                <Chart completedCount={completedCount} totalCount={savedExercises.length} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottom-widgets">
                <div className="bottom-widget">
                    <h3>오늘의 날씨⛅</h3>
                    <Weather />
                </div>
                <div className="bottom-widget">
                    <h3 className="marginSet">금지 리스트❌</h3>
                    {savedBanList.length > 0 && (
                        <div className="saved-ban-list">
                            <ol>
                                {savedBanList.map(([itemId, item]) => (
                                    <li key={itemId}>
                                        {item}
                                        <button onClick={() => handleDeleteBanItem(itemId)} className="delete-btn">
                                            삭제
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                    <div className="inputBox">
                        <input
                            className="inputSet"
                            type="text"
                            value={banList}
                            onChange={(e) => setBanList(e.target.value)}
                            placeholder="금지 리스트를 입력하세요..."
                        />
                        <button className="prohibition" onClick={handleSaveBanList}>
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;


// import React, { useState, useEffect, useContext } from 'react';
// import './Home.css';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../App';
// import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
// import CalendarOnly from './CalendarOnly';
// import Weather from '../component/Weather';
// import { db } from '../js/firebaseApp';
// import { ref, onValue, set, update, remove } from 'firebase/database'; // remove 함수 추가
// import Chart from "../component/Chart";
//
// const Home = () => {
//     const navigate = useNavigate();
//     const { isAuthenticated, userInfo } = useContext(AuthContext);
//     const auth = getAuth();
//     const [footerText, setFooterText] = useState('');
//     const [savedExercises, setSavedExercises] = useState([]);
//     const [completedExercises, setCompletedExercises] = useState({});
//     const [banList, setBanList] = useState(''); // 금지 리스트 상태 (입력 필드 값)
//     const [userId, setUserId] = useState(null);
//     const [savedBanList, setSavedBanList] = useState([]); // Firebase에서 가져온 금지 리스트
//     const today = new Date().toISOString().slice(0, 10);
//
//     const goToLoginPage = () => navigate('/login');
//     const goToJoinPage = () => navigate('/join');
//
//     const handleLogout = async () => {
//         try {
//             await signOut(auth);
//             navigate('/login');
//         } catch (error) {
//             console.error('로그아웃 실패:', error.message);
//             alert('로그아웃에 실패했습니다.');
//         }
//     };
//
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserId(user.uid);
//
//                 const exercisesRef = ref(db, `exercises/${user.uid}`);
//                 const completedRef = ref(db, `completedExercises/${user.uid}/${today}`);
//                 const banListRef = ref(db, `banList/${user.uid}`); // 금지 리스트 경로
//
//                 // 운동 데이터 불러오기
//                 onValue(exercisesRef, (snapshot) => {
//                     const data = snapshot.val();
//                     const dataArray = data ? Object.values(data) : [];
//                     const todayData = dataArray.find((item) => item.date === today);
//
//                     if (todayData?.exercises) {
//                         setSavedExercises(todayData.exercises);
//                         setFooterText(
//                             todayData.exercises
//                                 .map(
//                                     (exercise) =>
//                                         `${exercise.name} | ${exercise.time}분 (소모 칼로리: ${exercise.calories} kcal)`
//                                 )
//                                 .join('\n')
//                         );
//                     } else {
//                         setSavedExercises([]);
//                         setFooterText('오늘 등록된 운동이 없습니다.');
//                     }
//                 });
//
//                 // 완료된 운동 상태 불러오기
//                 onValue(completedRef, (snapshot) => {
//                     const data = snapshot.val();
//                     setCompletedExercises(data || {});
//                 });
//
//                 // 금지 리스트 불러오기
//                 onValue(banListRef, (snapshot) => {
//                     const data = snapshot.val();
//                     const banListArray = data ? Object.entries(data) : []; // key-value 쌍으로 저장
//                     setSavedBanList(banListArray); // key-value 형태로 저장
//                 });
//             } else {
//                 setFooterText('로그인이 필요합니다.');
//                 setSavedExercises([]);
//                 setCompletedExercises({});
//             }
//         });
//
//         return () => unsubscribe();
//     }, [auth, today]);
//
//     const handleCheckboxChange = (index) => {
//         const updatedCompletedExercises = { ...completedExercises };
//         updatedCompletedExercises[index] = !updatedCompletedExercises[index];
//
//         setCompletedExercises(updatedCompletedExercises);
//
//         if (userId) {
//             const completedRef = ref(db, `completedExercises/${userId}/${today}`);
//             set(completedRef, updatedCompletedExercises)
//                 .then(() => console.log('Completed exercises saved successfully'))
//                 .catch((error) => console.error('Error saving completed exercises:', error));
//         }
//     };
//
//     const handleSaveBanList = () => {
//         if (auth.currentUser) {
//             const userId = auth.currentUser.uid;
//             if (banList.trim() === "") {
//                 alert("금지 리스트를 입력하세요.");
//                 return;
//             }
//             if (window.confirm('리스트를 저장하시겠습니까?')) {
//                 // 고유 ID 생성 (현재 시간을 기준으로 고유한 ID를 만듦)
//                 const newBanItemKey = new Date().getTime().toString(); // 고유한 ID를 생성
//
//                 // 기존 리스트를 그대로 가져오고, 새 항목만 추가합니다.
//                 const newBanList = {
//                     ...savedBanList.reduce((acc, [key, value]) => {
//                         acc[key] = value;
//                         return acc;
//                     }, {}),
//                     [newBanItemKey]: banList, // 고유 ID와 텍스트만 추가
//                 };
//
//                 update(ref(db, `banList/${userId}`), newBanList)
//                     .then(() => {
//                         // 새로 추가된 항목만 상태 업데이트
//                         setSavedBanList(Object.entries(newBanList)); // 상태를 업데이트
//                         setBanList(''); // 입력 필드 초기화
//                         alert('저장되었습니다.');
//                     })
//                     .catch((error) => {
//                         console.error('금지 리스트 저장 실패:', error);
//                         alert('저장 실패!');
//                     });
//             }
//         }
//     };
//
//     const handleDeleteBanItem = (itemId) => {
//         if (auth.currentUser) {
//             const userId = auth.currentUser.uid;
//
//             // Firebase에서 해당 항목 삭제
//             const banItemRef = ref(db, `banList/${userId}/${itemId}`);
//             remove(banItemRef)
//                 .then(() => {
//                     // 삭제 후 상태 업데이트
//                     const updatedBanList = savedBanList.filter((item) => item[0] !== itemId);
//                     setSavedBanList(updatedBanList);
//                     alert('삭제되었습니다.');
//                 })
//                 .catch((error) => {
//                     console.error('삭제 실패:', error);
//                     alert('삭제 실패!');
//                 });
//         }
//     };
//
//     // 완료된 운동 갯수 계산
//     const completedCount = Object.values(completedExercises).filter((completed) => completed).length;
//
//     return (
//         <div className="home-container">
//             <div className="main-content">
//                 <div className="calendar-only">
//                     <CalendarOnly />
//                 </div>
//                 <div className="right-panel">
//                     <div className="sign-in">
//                         {isAuthenticated ? (
//                             <>
//                                 <button className="sign-in-button" onClick={handleLogout}>
//                                     Sign Out
//                                 </button>
//                                 <div className="signButtonBox">
//                                     <p>{userInfo ? `${userInfo.name}님 환영합니다.` : '환영합니다.'}</p>
//                                     <Link to="/EditPassword">비밀번호 변경하기</Link>
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 <button className="sign-in-button" onClick={goToLoginPage}>
//                                     Sign In
//                                 </button>
//                                 <p onClick={goToJoinPage}>회원가입</p>
//                             </>
//                         )}
//                     </div>
//                     <div className="widgets">
//                         <div className="widget">
//                             <h3>오늘의 운동 계획🏋️‍♂️</h3>
//                             {savedExercises.slice(0, 4).map((exercise, index) => (
//                                 <div key={index} className="home-exercise-entry">
//                                     <input
//                                         type="checkbox"
//                                         checked={completedExercises[index] || false}
//                                         onChange={() => handleCheckboxChange(index)}
//                                     />
//                                     <span className={completedExercises[index] ? 'home-completed-text' : ''}>
//                                         {exercise.name} | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                                     </span>
//                                 </div>
//                             ))}
//                             {savedExercises.length > 4 && (
//                                 <div className="more-text">더 많은 운동은 캘린더에서 확인하세요!</div>
//                             )}
//                         </div>
//                         <div className="widget">
//                             <h3>오늘의 운동 진행률💪</h3>
//                             <div className="chartSet">
//                                 <Chart completedCount={completedCount} totalCount={savedExercises.length} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="bottom-widgets">
//                 <div className="bottom-widget">
//                     <h3>오늘의 날씨⛅</h3>
//                     <Weather />
//                 </div>
//
//                 <div className="bottom-widget">
//                     <h3 className="marginSet">금지 리스트❌</h3>
//                     {savedBanList.length > 0 && (
//                         <div className="saved-ban-list">
//                             <ol>
//                                 {savedBanList.map(([itemId, item]) => (
//                                     <li key={itemId}>
//                                         {item}
//                                         <button onClick={() => handleDeleteBanItem(itemId)} className="delete-btn">
//                                             삭제
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ol>
//                         </div>
//                     )}
//                     <div className="inputBox">
//                         <input
//                             className="inputSet"
//                             type="text"
//                             value={banList}
//                             onChange={(e) => setBanList(e.target.value)}
//                             placeholder="금지 리스트를 입력하세요..."
//                         />
//                         <button className="prohibition" onClick={handleSaveBanList}>
//                             저장
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default Home;
//
