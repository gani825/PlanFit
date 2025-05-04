// import React from 'react';
// import './CalendarButton.css';
// import {getAuth} from "firebase/auth";
// import {db} from "../js/firebaseApp";
// import {ref, set} from "firebase/database";
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises,
//                             setFooterText,
//                         }) => {
//     const auth = getAuth();
//
//     // 선택된 날짜의 텍스트를 설정하고 Firebase에 저장
//     const saveExercise = (userId, selectedDate, exercises) => {
//         const formattedDate = new Date(selectedDate).toISOString().slice(0, 10); // YYYY-MM-DD 형식으로 변환
//         const exerciseRef = ref(db, `exercises/${userId}/${formattedDate}`);
//         set(exerciseRef, { exercises });
//     };
//
//     return (
//         <>
//             <div className="footer">
//                 {selectedDate && (
//                     <span className="footer-text">{formatDate(selectedDate)}</span>
//                 )}
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {exercisesForSelectedDate &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <p>
//                                 <strong>{exercise.name}</strong>&nbsp;| {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                             </p>
//                             <div className="action-buttons">
//                                 <span
//                                     className="edit-button"
//                                     onClick={() =>
//                                         handleEditExercise(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                                     수정
//                                 </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                                     삭제
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;


import React, { useEffect, useState } from 'react';
import './CalendarButton.css';
import { getAuth } from 'firebase/auth';
import { db } from '../js/firebaseApp';
import { onValue, ref, set } from 'firebase/database';

const CalendarButton = ({
                            selectedDate,
                            formatDate,
                            setShowPopup,
                            exercisesForSelectedDate,
                            handleEditExercise,
                            handleDeleteExerciseWithConfirmation,
                            selectedExercises,
                            setFooterText,
                        }) => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    // 완료 상태를 추적하는 상태 배열
    const [completedExercises, setCompletedExercises] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태

    // 오늘 날짜로 selectedDate 초기화 (최초 로드 시)
    const [currentDate, setCurrentDate] = useState(new Date());

    // Firebase에서 완료 상태 불러오기
    useEffect(() => {
        if (userId && selectedDate) {
            const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
            const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);

            onValue(completedRef, (snapshot) => {
                const data = snapshot.val();
                if (data && Array.isArray(data)) {
                    setCompletedExercises(data);
                } else {
                    setCompletedExercises(
                        exercisesForSelectedDate?.exercises?.map(() => false) || []
                    );
                }
                setLoading(false); // 데이터 로드 후 로딩 종료
            });
        } else {
            // 로그인하지 않았을 경우 로딩을 종료하고 기본 상태로 설정
            setLoading(false);
        }
    }, [userId, selectedDate, exercisesForSelectedDate]);

    // 체크박스를 클릭했을 때 호출되는 함수
    const handleCheckboxChange = (index) => {
        const updatedCompletedExercises = [...completedExercises];
        updatedCompletedExercises[index] = !updatedCompletedExercises[index];
        setCompletedExercises(updatedCompletedExercises);

        // Firebase에 완료 상태 저장
        if (userId && selectedDate) {
            const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
            const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
            set(completedRef, updatedCompletedExercises);
        }
    };

    // 오늘 날짜로 `selectedDate` 설정
    useEffect(() => {
        const today = new Date();
        setCurrentDate(today); // 오늘 날짜로 설정
    }, []);

    // selectedDate가 없으면 기본값으로 currentDate 설정
    const dateToUse = selectedDate || currentDate;

    return (
        <>
            <div className="footer">
                {dateToUse && (
                    <span className="footer-text">{formatDate(dateToUse)}</span>
                )}
                <br />
                <br />
                <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
            </div>

            {/* 선택된 날짜의 운동 목록 */}
            <div className="exercise-list-container">
                {/* 로그인하지 않은 경우 로딩 중 메시지 안 보이게 처리 */}
                {!userId ? (
                    <div></div> // 로그인 후 사용가능합니다
                ) : (
                    loading ? (
                        <div>로딩 중...</div> // 로딩 상태 표시
                    ) : (
                        exercisesForSelectedDate &&
                        Array.isArray(exercisesForSelectedDate.exercises) &&
                        exercisesForSelectedDate.exercises.map((exercise, index) => (
                            <div key={index} className="exercise-entry">
                                <input
                                    type="checkbox"
                                    checked={completedExercises[index] || false}
                                    onChange={() => handleCheckboxChange(index)}
                                />
                                <p className={completedExercises[index] ? 'completed-text' : ''}>
                                    <span className="exercise-name">
                                        <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
                                    </span>
                                    {completedExercises[index]}
                                </p>
                                <div className="action-buttons">
                                    <span
                                        className="edit-button"
                                        onClick={() =>
                                            handleEditExercise(
                                                selectedExercises.findIndex((entry) => entry.date === dateToUse),
                                                index
                                            )
                                        }
                                    >
                                        수정
                                    </span>
                                    <span className="divider">|</span>
                                    <span
                                        className="delete-button"
                                        onClick={() =>
                                            handleDeleteExerciseWithConfirmation(
                                                selectedExercises.findIndex((entry) => entry.date === dateToUse),
                                                index
                                            )
                                        }
                                    >
                                        삭제
                                    </span>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </>
    );
};

export default CalendarButton;


// import React, { useEffect, useState } from 'react';
// import './CalendarButton.css';
// import { getAuth } from 'firebase/auth';
// import { db } from '../js/firebaseApp';
// import { onValue, ref, set } from 'firebase/database';
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises,
//                             setFooterText,
//                         }) => {
//     const auth = getAuth();
//     const userId = auth.currentUser?.uid;
//
//     // 완료 상태를 추적하는 상태 배열
//     const [completedExercises, setCompletedExercises] = useState([]);
//     const [loading, setLoading] = useState(true); // 로딩 상태
//
//     // 오늘 날짜로 selectedDate 초기화 (최초 로드 시)
//     const [currentDate, setCurrentDate] = useState(new Date());
//
//     // Firebase에서 완료 상태 불러오기
//     useEffect(() => {
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//
//             onValue(completedRef, (snapshot) => {
//                 const data = snapshot.val();
//                 if (data && Array.isArray(data)) {
//                     setCompletedExercises(data);
//                 } else {
//                     setCompletedExercises(
//                         exercisesForSelectedDate?.exercises?.map(() => false) || []
//                     );
//                 }
//                 setLoading(false); // 데이터 로드 후 로딩 종료
//             });
//         }
//     }, [userId, selectedDate, exercisesForSelectedDate]);
//
//     // 체크박스를 클릭했을 때 호출되는 함수
//     const handleCheckboxChange = (index) => {
//         const updatedCompletedExercises = [...completedExercises];
//         updatedCompletedExercises[index] = !updatedCompletedExercises[index];
//         setCompletedExercises(updatedCompletedExercises);
//
//         // Firebase에 완료 상태 저장
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//             set(completedRef, updatedCompletedExercises);
//         }
//     };
//
//     // 오늘 날짜로 `selectedDate` 설정
//     useEffect(() => {
//         const today = new Date();
//         setCurrentDate(today); // 오늘 날짜로 설정
//     }, []);
//
//     // selectedDate가 없으면 기본값으로 currentDate 설정
//     const dateToUse = selectedDate || currentDate;
//
//     return (
//         <>
//             <div className="footer">
//                 {dateToUse && (
//                     <span className="footer-text">{formatDate(dateToUse)}</span>
//                 )}
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {loading ? (
//                     <div>로딩 중...</div> // 로딩 상태 표시
//                 ) : (
//                     exercisesForSelectedDate &&
//                     Array.isArray(exercisesForSelectedDate.exercises) &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <input
//                                 type="checkbox"
//                                 checked={completedExercises[index] || false}
//                                 onChange={() => handleCheckboxChange(index)}
//                             />
//                             <p className={completedExercises[index] ? 'completed-text' : ''}>
//                                 <span className="exercise-name">
//                                     <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                                 </span>
//                                 {completedExercises[index]}
//                             </p>
//                             <div className="action-buttons">
//                                 <span
//                                     className="edit-button"
//                                     onClick={() =>
//                                         handleEditExercise(
//                                             selectedExercises.findIndex((entry) => entry.date === dateToUse),
//                                             index
//                                         )
//                                     }
//                                 >
//                                     수정
//                                 </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(
//                                             selectedExercises.findIndex((entry) => entry.date === dateToUse),
//                                             index
//                                         )
//                                     }
//                                 >
//                                     삭제
//                                 </span>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;


// import React, { useEffect, useState } from 'react';
// import './CalendarButton.css';
// import { getAuth } from 'firebase/auth';
// import { db } from '../js/firebaseApp';
// import { onValue, ref, set } from 'firebase/database';
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises,
//                             setFooterText,
//                         }) => {
//     const auth = getAuth();
//     const userId = auth.currentUser?.uid;
//
//     // 완료 상태를 추적하는 상태 배열
//     const [completedExercises, setCompletedExercises] = useState([]);
//
//     // 오늘 날짜로 selectedDate 초기화 (최초 로드 시)
//     const [currentDate, setCurrentDate] = useState(new Date());
//
//     // Firebase에서 완료 상태 불러오기
//     useEffect(() => {
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//
//             onValue(completedRef, (snapshot) => {
//                 const data = snapshot.val();
//                 if (data && Array.isArray(data)) {
//                     setCompletedExercises(data);
//                 } else {
//                     setCompletedExercises(
//                         exercisesForSelectedDate?.exercises?.map(() => false) || []
//                     );
//                 }
//             });
//         }
//     }, [userId, selectedDate, exercisesForSelectedDate]);
//
//     // 체크박스를 클릭했을 때 호출되는 함수
//     const handleCheckboxChange = (index) => {
//         const updatedCompletedExercises = [...completedExercises];
//         updatedCompletedExercises[index] = !updatedCompletedExercises[index];
//         setCompletedExercises(updatedCompletedExercises);
//
//         // Firebase에 완료 상태 저장
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//             set(completedRef, updatedCompletedExercises);
//         }
//     };
//
//     // 오늘 날짜로 `selectedDate` 설정
//     useEffect(() => {
//         const today = new Date();
//         setCurrentDate(today); // 오늘 날짜로 설정
//     }, []);
//
//     // selectedDate가 없으면 기본값으로 currentDate 설정
//     const dateToUse = selectedDate || currentDate;
//
//     return (
//         <>
//             <div className="footer">
//                 {dateToUse && (
//                     <span className="footer-text">{formatDate(dateToUse)}</span>
//                 )}
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {exercisesForSelectedDate &&
//                     Array.isArray(exercisesForSelectedDate.exercises) &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <input
//                                 type="checkbox"
//                                 checked={completedExercises[index] || false}
//                                 onChange={() => handleCheckboxChange(index)}
//                             />
//                             <p className={completedExercises[index] ? 'completed-text' : ''}>
//                 <span className="exercise-name">
//                   <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                 </span>
//                                 {completedExercises[index]}
//                             </p>
//                             <div className="action-buttons">
//                 <span
//                     className="edit-button"
//                     onClick={() =>
//                         handleEditExercise(
//                             selectedExercises.findIndex((entry) => entry.date === dateToUse),
//                             index
//                         )
//                     }
//                 >
//                   수정
//                 </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(
//                                             selectedExercises.findIndex((entry) => entry.date === dateToUse),
//                                             index
//                                         )
//                                     }
//                                 >
//                   삭제
//                 </span>
//                             </div>
//                         </div>
//                     ))}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;


// import React, {useEffect, useState} from 'react';
// import './CalendarButton.css';
// import {getAuth} from "firebase/auth";
// import {db} from "../js/firebaseApp";
// import {onValue, ref, set} from "firebase/database";
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises,
//                             setFooterText,
//                         }) => {
//     const auth = getAuth();
//     const userId = auth.currentUser?.uid;
//
//     // 완료 상태를 추적하는 상태 배열
//     const [completedExercises, setCompletedExercises] = useState([]);
//
//     // Firebase에서 완료 상태 불러오기
//     useEffect(() => {
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//
//             onValue(completedRef, (snapshot) => {
//                 const data = snapshot.val();
//                 if (data && Array.isArray(data)) {
//                     setCompletedExercises(data);
//                 } else {
//                     setCompletedExercises(
//                         exercisesForSelectedDate?.exercises?.map(() => false) || []
//                     );
//                 }
//             });
//         }
//     }, [userId, selectedDate, exercisesForSelectedDate]);
//
//     // 체크박스를 클릭했을 때 호출되는 함수
//     const handleCheckboxChange = (index) => {
//         const updatedCompletedExercises = [...completedExercises];
//         updatedCompletedExercises[index] = !updatedCompletedExercises[index];
//         setCompletedExercises(updatedCompletedExercises);
//
//         // Firebase에 완료 상태 저장
//         if (userId && selectedDate) {
//             const formattedDate = new Date(selectedDate).toISOString().slice(0, 10);
//             const completedRef = ref(db, `completedExercises/${userId}/${formattedDate}`);
//             set(completedRef, updatedCompletedExercises);
//         }
//     };
//
//     return (
//         <>
//             <div className="footer">
//                 {selectedDate && (
//                     <span className="footer-text">{formatDate(selectedDate)}</span>
//                 )}
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {exercisesForSelectedDate &&
//                     Array.isArray(exercisesForSelectedDate.exercises) &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <input
//                                 type="checkbox"
//                                 checked={completedExercises[index] || false}
//                                 onChange={() => handleCheckboxChange(index)}
//                             />
//                             <p className={completedExercises[index] ? 'completed-text' : ''}>
//                     <span className="exercise-name">
//                         <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                     </span>
//                                 {completedExercises[index]}
//                             </p>
//                             <div className="action-buttons">
//                     <span
//                         className="edit-button"
//                         onClick={() =>
//                             handleEditExercise(
//                                 selectedExercises.findIndex((entry) => entry.date === selectedDate),
//                                 index
//                             )
//                         }
//                     >
//                         수정
//                     </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                                     삭제
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;

// import React from 'react';
// import './CalendarButton.css';
// import {getAuth} from "firebase/auth";
// import {db} from "../js/firebaseApp";
// import {ref, set} from "firebase/database";
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises,
//                             setFooterText,
//                         }) => {
//     const auth = getAuth();
//
//     // 선택된 날짜의 텍스트를 설정하고 Firebase에 저장
//     const saveExercise = (userId, selectedDate, exercises) => {
//         const formattedDate = new Date(selectedDate).toISOString().slice(0, 10); // YYYY-MM-DD 형식으로 변환
//         const exerciseRef = ref(db, `exercises/${userId}/${formattedDate}`);
//         set(exerciseRef, { exercises });
//     };
//
//     return (
//         <>
//             <div className="footer">
//                 {selectedDate && (
//                     <span className="footer-text">{formatDate(selectedDate)}</span>
//                 )}
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {exercisesForSelectedDate &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <p>
//                                 <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                             </p>
//                             <div className="action-buttons">
//                                 <span
//                                     className="edit-button"
//                                     onClick={() =>
//                                         handleEditExercise(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                                     수정
//                                 </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                                     삭제
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;

// import React from 'react';
// import './CalendarButton.css';
//
// const CalendarButton = ({
//                             selectedDate,
//                             formatDate,
//                             setShowPopup,
//                             exercisesForSelectedDate,
//                             handleEditExercise,
//                             handleDeleteExerciseWithConfirmation,
//                             selectedExercises
//                         }) => {
//     console.log({ selectedDate, exercisesForSelectedDate, selectedExercises }); // 디버그용 콘솔 로그
//
//     return (
//         <>
//             <div className="footer">
//                 <span className="footer-text">{formatDate(selectedDate)}</span>
//                 <br />
//                 <br />
//                 <button onClick={() => setShowPopup(true)}>운동 계획하기</button>
//             </div>
//
//             {/* 선택된 날짜의 운동 목록 */}
//             <div className="exercise-list-container">
//                 {exercisesForSelectedDate &&
//                     exercisesForSelectedDate.exercises.map((exercise, index) => (
//                         <div key={index} className="exercise-entry">
//                             <p>
//                                 <strong>{exercise.name}</strong> | {exercise.time}분 (소모 칼로리: {exercise.calories} kcal)
//                             </p>
//                             <div className="action-buttons">
//                 <span
//                     className="edit-button"
//                     onClick={() =>
//                         handleEditExercise(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                     }
//                 >
//                   수정
//                 </span>
//                                 <span className="divider">|</span>
//                                 <span
//                                     className="delete-button"
//                                     onClick={() =>
//                                         handleDeleteExerciseWithConfirmation(selectedExercises.findIndex((entry) => entry.date === selectedDate), index)
//                                     }
//                                 >
//                   삭제
//                 </span>
//                             </div>
//                         </div>
//                     ))}
//             </div>
//         </>
//     );
// };
//
// export default CalendarButton;
