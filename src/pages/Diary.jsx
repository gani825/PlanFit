import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DiaryHome from './DiaryHome';
import New from './New';
import Edit from './Edit';
import DiaryDiary from './DiaryDiary';
import { db, auth } from '../js/firebaseApp'; // Firebase import
import { ref, push, set, get } from 'firebase/database'; // Firebase database functions
import './Diary.css'
export const DiaryStateContext = createContext();
export const DiaryDispatchContext = createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE':
            return [action.data, ...state];
        case 'UPDATE':
            return state.map(it => (it.id === action.data.id ? { ...action.data } : it));
        case 'DELETE':
            return state.filter(it => it.id !== action.targetId);
        case 'INIT':
            return action.data;
        default:
            return state;
    }
};

const Diary = () => {
    const [data, dispatch] = useReducer(reducer, []);
    const idRef = useRef(3);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리하는 state 추가
    const navigate = useNavigate(); // 네비게이트 훅 사용

    // Firebase에서 다이어리 데이터를 불러오기
    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return; // 로그인되지 않은 상태에서는 fetchData를 실행하지 않음
            const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
            const diaryRef = ref(db, 'diaries/' + userUid); // Firebase Realtime Database 경로
            const snapshot = await get(diaryRef);
            if (snapshot.exists()) {
                const fetchedData = snapshot.val();
                const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
                dispatch({ type: 'INIT', data: diaryList });
            } else {
                console.log("사용자의 다이어리가 없습니다.");
            }
        };

        // 로그인 상태를 확인하는 리스너
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setIsLoggedIn(true);
                fetchData(); // 로그인 후 데이터 불러오기
            } else {
                setIsLoggedIn(false);
            }
        });

        // 컴포넌트가 언마운트되면 리스너 제거
        return () => unsubscribe();
    }, []); // isLoggedIn을 의존성 배열에 넣지 않음, 로그인 상태는 onAuthStateChanged에서 처리되므로

    // 다이어리 작성
    const onCreate = async (date, title, content) => {
        if (!isLoggedIn || !auth.currentUser) {
            alert('로그인 후 다이어리를 작성할 수 있습니다.');
            return;
        }
        const newDiary = {
            id: idRef.current.toString(),
            date: new Date(date).getTime(),
            title: title || '제목 없음',
            content: content || '',
        };
        const userUid = auth.currentUser.uid;
        const diaryRef = ref(db, 'diaries/' + userUid);
        const newDiaryRef = push(diaryRef); // 새 다이어리 항목 추가
        await set(newDiaryRef, newDiary); // Firebase에 저장
        dispatch({ type: 'CREATE', data: newDiary });
        idRef.current += 1;
    };

    // 다이어리 수정
    const onUpdate = async (id, date, title, content) => {
        if (!isLoggedIn || !auth.currentUser) {
            alert('로그인 후 다이어리를 수정할 수 있습니다.');
            return;
        }
        const updatedDiary = { id, date: new Date(date).getTime(), title, content };
        const userUid = auth.currentUser.uid;
        const diaryRef = ref(db, 'diaries/' + userUid + '/' + id);
        await set(diaryRef, updatedDiary); // Firebase에서 다이어리 업데이트
        dispatch({ type: 'UPDATE', data: updatedDiary });
    };

    // 다이어리 삭제
    const onDelete = async (targetId) => {
        if (!isLoggedIn || !auth.currentUser) {
            alert('로그인 후 다이어리를 삭제할 수 있습니다.');
            return;
        }
        const userUid = auth.currentUser.uid;
        const diaryRef = ref(db, 'diaries/' + userUid + '/' + targetId);
        await set(diaryRef, null); // Firebase에서 다이어리 삭제
        dispatch({ type: 'DELETE', targetId });
    };

    if (!isLoggedIn) {
        return (
            <div className="unLoginState">
                <h2>로그인 후 다이어리를 이용할 수 있습니다.</h2>
                <div className="moveButtonWrap">
                    <button onClick={() => navigate('/')}>홈으로 이동</button>
                    <button onClick={() => navigate('/login')}>로그인 페이지로 이동</button>
                </div>
            </div>
        );
    }

    return (
        <DiaryStateContext.Provider value={data}>
            <DiaryDispatchContext.Provider value={{ onCreate, onUpdate, onDelete }}>
                <Routes>
                    <Route path="/" element={<DiaryHome />} />
                    <Route path="/new" element={<New />} />
                    <Route path="/edit/:id" element={<Edit />} />
                    <Route path="/:id" element={<DiaryDiary />} />
                </Routes>
            </DiaryDispatchContext.Provider>
        </DiaryStateContext.Provider>
    );
};

export default Diary;



// import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import DiaryHome from './DiaryHome';
// import New from './New';
// import Edit from './Edit';
// import DiaryDiary from './DiaryDiary';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, push, set, get, child } from 'firebase/database'; // Firebase database functions
//
// export const DiaryStateContext = createContext();
// export const DiaryDispatchContext = createContext();
//
// const reducer = (state, action) => {
//     switch (action.type) {
//         case 'CREATE':
//             return [action.data, ...state];
//         case 'UPDATE':
//             return state.map(it => (it.id === action.data.id ? { ...action.data } : it));
//         case 'DELETE':
//             return state.filter(it => it.id !== action.targetId);
//         case 'INIT':
//             return action.data;
//         default:
//             return state;
//     }
// };
//
// const Diary = () => {
//     const [data, dispatch] = useReducer(reducer, []);
//     const idRef = useRef(3);
//     const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리하는 state 추가
//
//     // Firebase에서 다이어리 데이터를 불러오기
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!auth.currentUser) return; // 로그인되지 않은 상태에서는 fetchData를 실행하지 않음
//             const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
//             const diaryRef = ref(db, 'diaries/' + userUid); // Firebase Realtime Database 경로
//             const snapshot = await get(diaryRef);
//             if (snapshot.exists()) {
//                 const fetchedData = snapshot.val();
//                 const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
//                 dispatch({ type: 'INIT', data: diaryList });
//             } else {
//                 console.log("사용자의 다이어리가 없습니다.");
//             }
//         };
//
//         // 로그인 상태를 확인하는 리스너
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             if (user) {
//                 setIsLoggedIn(true);
//             } else {
//                 setIsLoggedIn(false);
//             }
//         });
//
//         // 컴포넌트가 언마운트되면 리스너 제거
//         return () => unsubscribe();
//     }, []); // isLoggedIn을 의존성 배열에 넣지 않음, 로그인 상태는 onAuthStateChanged에서 처리되므로
//
//     // 다이어리 작성
//     const onCreate = async (date, title, content) => {
//         if (!isLoggedIn || !auth.currentUser) {
//             alert('로그인 후 다이어리를 작성할 수 있습니다.');
//             return;
//         }
//         const newDiary = {
//             id: idRef.current.toString(),
//             date: new Date(date).getTime(),
//             title: title || '제목 없음',
//             content: content || '',
//         };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid);
//         const newDiaryRef = push(diaryRef); // 새 다이어리 항목 추가
//         await set(newDiaryRef, newDiary); // Firebase에 저장
//         dispatch({ type: 'CREATE', data: newDiary });
//         idRef.current += 1;
//     };
//
//     // 다이어리 수정
//     const onUpdate = async (id, date, title, content) => {
//         if (!isLoggedIn || !auth.currentUser) {
//             alert('로그인 후 다이어리를 수정할 수 있습니다.');
//             return;
//         }
//         const updatedDiary = { id, date: new Date(date).getTime(), title, content };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + id);
//         await set(diaryRef, updatedDiary); // Firebase에서 다이어리 업데이트
//         dispatch({ type: 'UPDATE', data: updatedDiary });
//     };
//
//     // 다이어리 삭제
//     const onDelete = async (targetId) => {
//         if (!isLoggedIn || !auth.currentUser) {
//             alert('로그인 후 다이어리를 삭제할 수 있습니다.');
//             return;
//         }
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + targetId);
//         await set(diaryRef, null); // Firebase에서 다이어리 삭제
//         dispatch({ type: 'DELETE', targetId });
//     };
//
//     if (!isLoggedIn) {
//         return (
//             <div>
//                 <h2>로그인 후 다이어리를 이용할 수 있습니다.</h2>
//                 {/* 여기에 로그인 페이지나 로그인 유도 버튼을 넣을 수 있습니다 */}
//             </div>
//         );
//     }
//
//     return (
//         <DiaryStateContext.Provider value={data}>
//             <DiaryDispatchContext.Provider value={{ onCreate, onUpdate, onDelete }}>
//                 <Routes>
//                     <Route path="/" element={<DiaryHome />} />
//                     <Route path="/new" element={<New />} />
//                     <Route path="/edit/:id" element={<Edit />} />
//                     <Route path="/:id" element={<DiaryDiary />} />
//                 </Routes>
//             </DiaryDispatchContext.Provider>
//         </DiaryStateContext.Provider>
//     );
// };
//
// export default Diary;



// import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import DiaryHome from './DiaryHome';
// import New from './New';
// import Edit from './Edit';
// import DiaryDiary from './DiaryDiary';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, push, set, get, child } from 'firebase/database'; // Firebase database functions
//
// export const DiaryStateContext = createContext();
// export const DiaryDispatchContext = createContext();
//
// const reducer = (state, action) => {
//     switch (action.type) {
//         case 'CREATE':
//             return [action.data, ...state];
//         case 'UPDATE':
//             return state.map(it => (it.id === action.data.id ? { ...action.data } : it));
//         case 'DELETE':
//             return state.filter(it => it.id !== action.targetId);
//         case 'INIT':
//             return action.data;
//         default:
//             return state;
//     }
// };
//
// const Diary = () => {
//     const [data, dispatch] = useReducer(reducer, []);
//     const idRef = useRef(3);
//     const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리하는 state 추가
//
//     // Firebase에서 다이어리 데이터를 불러오기
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!isLoggedIn) return; // 로그인되지 않은 상태에서는 fetchData를 실행하지 않음
//
//             const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
//             const diaryRef = ref(db, 'diaries/' + userUid); // Firebase Realtime Database 경로
//             const snapshot = await get(diaryRef);
//             if (snapshot.exists()) {
//                 const fetchedData = snapshot.val();
//                 const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
//                 dispatch({ type: 'INIT', data: diaryList });
//             } else {
//                 console.log("사용자의 다이어리가 없습니다.");
//             }
//         };
//
//         // 로그인 상태를 확인하는 리스너
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             if (user) {
//                 setIsLoggedIn(true);
//             } else {
//                 setIsLoggedIn(false);
//             }
//         });
//
//         // 컴포넌트가 언마운트되면 리스너 제거
//         return () => unsubscribe();
//     }, [isLoggedIn]); // isLoggedIn이 변경될 때마다 fetchData 실행
//
//     // 다이어리 작성
//     const onCreate = async (date, title, content) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 작성할 수 있습니다.');
//             return;
//         }
//         const newDiary = {
//             id: idRef.current.toString(),
//             date: new Date(date).getTime(),
//             title: title || '제목 없음',
//             content: content || '',
//         };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid);
//         const newDiaryRef = push(diaryRef); // 새 다이어리 항목 추가
//         await set(newDiaryRef, newDiary); // Firebase에 저장
//         dispatch({ type: 'CREATE', data: newDiary });
//         idRef.current += 1;
//     };
//
//     // 다이어리 수정
//     const onUpdate = async (id, date, title, content) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 수정할 수 있습니다.');
//             return;
//         }
//         const updatedDiary = { id, date: new Date(date).getTime(), title, content };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + id);
//         await set(diaryRef, updatedDiary); // Firebase에서 다이어리 업데이트
//         dispatch({ type: 'UPDATE', data: updatedDiary });
//     };
//
//     // 다이어리 삭제
//     const onDelete = async (targetId) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 삭제할 수 있습니다.');
//             return;
//         }
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + targetId);
//         await set(diaryRef, null); // Firebase에서 다이어리 삭제
//         dispatch({ type: 'DELETE', targetId });
//     };
//
//     return (
//         <DiaryStateContext.Provider value={data}>
//             <DiaryDispatchContext.Provider value={{ onCreate, onUpdate, onDelete }}>
//                 <Routes>
//                     <Route path="/" element={<DiaryHome />} />
//                     <Route path="/new" element={<New />} />
//                     <Route path="/edit/:id" element={<Edit />} />
//                     <Route path="/:id" element={<DiaryDiary />} />
//                 </Routes>
//             </DiaryDispatchContext.Provider>
//         </DiaryStateContext.Provider>
//     );
// };
//
// export default Diary;


// import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import DiaryHome from './DiaryHome';
// import New from './New';
// import Edit from './Edit';
// import DiaryDiary from './DiaryDiary';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, push, set, get, child } from 'firebase/database'; // Firebase database functions
//
// export const DiaryStateContext = createContext();
// export const DiaryDispatchContext = createContext();
//
// const reducer = (state, action) => {
//     switch (action.type) {
//         case 'CREATE':
//             return [action.data, ...state];
//         case 'UPDATE':
//             return state.map(it => (it.id === action.data.id ? { ...action.data } : it));
//         case 'DELETE':
//             return state.filter(it => it.id !== action.targetId);
//         case 'INIT':
//             return action.data;
//         default:
//             return state;
//     }
// };
//
// const Diary = () => {
//     const [data, dispatch] = useReducer(reducer, []);
//     const idRef = useRef(3);
//     const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 관리하는 state 추가
//
//     // Firebase에서 다이어리 데이터를 불러오기
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!isLoggedIn) return; // 로그인되지 않은 상태에서는 fetchData를 실행하지 않음
//
//             const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
//             const diaryRef = ref(db, 'diaries/' + userUid); // Firebase Realtime Database 경로
//             const snapshot = await get(diaryRef);
//             if (snapshot.exists()) {
//                 const fetchedData = snapshot.val();
//                 const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
//                 dispatch({ type: 'INIT', data: diaryList });
//             } else {
//                 console.log("사용자의 다이어리가 없습니다.");
//             }
//         };
//
//         // 로그인 상태를 확인하는 리스너
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             if (user) {
//                 setIsLoggedIn(true);
//             } else {
//                 setIsLoggedIn(false);
//             }
//         });
//
//         // 컴포넌트가 언마운트되면 리스너 제거
//         return () => unsubscribe();
//     }, [isLoggedIn]); // isLoggedIn이 변경될 때마다 fetchData 실행
//
//     // 다이어리 작성
//     const onCreate = async (date, title, content) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 작성할 수 있습니다.');
//             return;
//         }
//         const newDiary = {
//             id: idRef.current.toString(),
//             date: new Date(date).getTime(),
//             title: title || '제목 없음',
//             content: content || '',
//         };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid);
//         const newDiaryRef = push(diaryRef); // 새 다이어리 항목 추가
//         await set(newDiaryRef, newDiary); // Firebase에 저장
//         dispatch({ type: 'CREATE', data: newDiary });
//         idRef.current += 1;
//     };
//
//     // 다이어리 수정
//     const onUpdate = async (id, date, title, content) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 수정할 수 있습니다.');
//             return;
//         }
//         const updatedDiary = { id, date: new Date(date).getTime(), title, content };
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + id);
//         await set(diaryRef, updatedDiary); // Firebase에서 다이어리 업데이트
//         dispatch({ type: 'UPDATE', data: updatedDiary });
//     };
//
//     // 다이어리 삭제
//     const onDelete = async (targetId) => {
//         if (!isLoggedIn) {
//             alert('로그인 후 다이어리를 삭제할 수 있습니다.');
//             return;
//         }
//         const userUid = auth.currentUser.uid;
//         const diaryRef = ref(db, 'diaries/' + userUid + '/' + targetId);
//         await set(diaryRef, null); // Firebase에서 다이어리 삭제
//         dispatch({ type: 'DELETE', targetId });
//     };
//
//     return (
//         <DiaryStateContext.Provider value={data}>
//             <DiaryDispatchContext.Provider value={{ onCreate, onUpdate, onDelete }}>
//                 <Routes>
//                     <Route path="/" element={<DiaryHome />} />
//                     <Route path="/new" element={<New />} />
//                     <Route path="/edit/:id" element={<Edit />} />
//                     <Route path="/:id" element={<DiaryDiary />} />
//                 </Routes>
//             </DiaryDispatchContext.Provider>
//         </DiaryStateContext.Provider>
//     );
// };
//
// export default Diary;

