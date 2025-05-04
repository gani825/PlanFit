import React, {useState, useEffect} from 'react';
import './Calendar.css';
import CalendarButton from '../component/CalendarButton';
import ExercisePopup from './ExercisePopup'; // 팝업 컴포넌트 임포트
import {get, ref, set, update} from 'firebase/database';
import {db} from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
import {getAuth, onAuthStateChanged} from 'firebase/auth';


const Calendar = () => {
    const today = new Date(); // 오늘 날짜
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const saveExercisesToDatabase = (selectedExercises) => {
        if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
        set(ref(db, `exercises/${userId}`), selectedExercises)
            .then(() => console.log('Exercises saved to database'))
            .catch((error) => console.error('Error saving exercises:', error));
    };

    const saveSelectedDateToDatabase = (selectedDate) => {
        if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
        update(ref(db, `selectedDate/${userId}`), { date: selectedDate })
            .then(() => console.log('Selected date saved to database'))
            .catch((error) => console.error('Error saving selected date:', error));
    };


    const [selectedDate, setSelectedDate] = useState('');

    const [showPopup, setShowPopup] = useState(false); // 팝업 상태

    const [selectedExercises, setSelectedExercises] = useState([]);

    const [editExercise, setEditExercise] = useState(null); // 수정할 운동 상태

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [userId, setUserId] = useState(null);

// 로그인 상태 확인
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return; // 로그인한 사용자만 데이터 불러오기

            try {
                const dateSnapshot = await get(ref(db, `selectedDate/${userId}`));
                if (dateSnapshot.exists()) {
                    setSelectedDate(dateSnapshot.val().date);
                } else {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                }

                const exercisesSnapshot = await get(ref(db, `exercises/${userId}`));
                if (exercisesSnapshot.exists()) {
                    setSelectedExercises(exercisesSnapshot.val());
                } else {
                    setSelectedExercises([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userId]);

    // 수정할 운동을 선택하고 팝업 열기
    const handleEditExercise = (entryIndex, exerciseIndex) => {
        const exerciseToEdit = selectedExercises[entryIndex].exercises[exerciseIndex];
        setEditExercise({...exerciseToEdit, entryIndex, exerciseIndex});
        setShowPopup(true); // 팝업 열기
    };


    // 수정된 운동을 반영하는 함수
    const handleUpdateExercise = (updatedExercise) => {
        setSelectedExercises((prevExercises) => {
            const updatedExercises = [...prevExercises];
            updatedExercises[editExercise.entryIndex].exercises[editExercise.exerciseIndex] = updatedExercise;

            // 리얼타임 데이터베이스에 저장
            saveExercisesToDatabase(updatedExercises);

            return updatedExercises;
        });
        setEditExercise(null); // 수정 상태 초기화
        setShowPopup(false); // 팝업 닫기
    };


    // 공휴일
    const holidays = [{month: 1, day: 1, name: 'New Year\'s Day'}, {
        month: 3,
        day: 1,
        name: 'Independence Movement Day'
    }, {month: 5, day: 5, name: 'Children\'s Day'}, {month: 6, day: 6, name: 'Memorial Day'}, {
        month: 8,
        day: 15,
        name: 'Liberation Day'
    }, {month: 10, day: 3, name: 'National Foundation Day'}, {month: 10, day: 9, name: 'Hangul Day'}, {
        month: 12,
        day: 25,
        name: 'Christmas Day'
    },];

    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    const generateCalendarDays = () => {
        const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day);
        }

        const remainingSpaces = 7 - (calendarDays.length % 7);
        for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
            calendarDays.push(null);
        }

        return calendarDays;
    };

    const calendarDays = generateCalendarDays();

    const onDateClick = (day) => {
        if (day === null) return;
        const newSelectedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('sv-SE');
        setSelectedDate(newSelectedDate);
        saveSelectedDateToDatabase(newSelectedDate); // 리얼타임 데이터베이스에 저장
    };

    const handleExerciseConfirm = (exercises) => {
        setSelectedExercises((prevExercises) => {
            if (editExercise) {
                const {entryIndex, exerciseIndex} = editExercise;
                const updatedExercises = [...prevExercises];
                updatedExercises[entryIndex].exercises[exerciseIndex] = exercises[0];
                setEditExercise(null);
                saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
                return updatedExercises;
            } else {
                const existingEntryIndex = prevExercises.findIndex((entry) => entry.date === selectedDate);
                if (existingEntryIndex !== -1) {
                    const updatedExercises = [...prevExercises];
                    updatedExercises[existingEntryIndex].exercises.push(...exercises);
                    saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
                    return updatedExercises;
                } else {
                    const newExercises = [...prevExercises, {date: selectedDate, exercises}];
                    saveExercisesToDatabase(newExercises); // 리얼타임 데이터베이스에 저장
                    return newExercises;
                }
            }
        });
        setShowPopup(false);
    };

    const handleDeleteExercise = (entryIndex, exerciseIndex) => {
        setSelectedExercises((prevExercises) => {
            const updatedExercises = [...prevExercises];
            updatedExercises[entryIndex].exercises.splice(exerciseIndex, 1);

            if (updatedExercises[entryIndex].exercises.length === 0) {
                updatedExercises.splice(entryIndex, 1); // 운동이 없으면 해당 날짜 항목 제거
            }

            // 리얼타임 데이터베이스에 저장
            saveExercisesToDatabase(updatedExercises);

            return updatedExercises;
        });
    };


    const handleDeleteExerciseWithConfirmation = (entryIndex, exerciseIndex) => {
        if (window.confirm('정말 이 운동을 삭제하시겠습니까?')) {
            handleDeleteExercise(entryIndex, exerciseIndex);
        }
    };


    const exercisesForSelectedDate = selectedExercises.find((entry) => entry.date === selectedDate);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };


    // 공휴일인지 확인하는 함수
    const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);

    return (<div className="calendar-container">
        {/* 월 네비게이션 버튼 */}
        <div className="month-navigation">
            <button onClick={handlePrevMonth}>◀</button>
            <span id="monthYear">
                    {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
                </span>
            <button onClick={handleNextMonth}>▶</button>
        </div>

        {/* 요일 헤더 */}
        <div className="calendar">
            {weekdays.map((weekday, index) => (
                <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
                    {weekday}
                </div>))}

            {/* 날짜 셀 */}
            {calendarDays.map((day, index) => {
                const dayOfWeek = index % 7;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                const formattedDate = day ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;

                const exercisesForDay = selectedExercises.find((entry) => entry.date === formattedDate);
                const holiday = day !== null && isHoliday(day);

                return (<div key={index} className={`day ${day === null ? 'null' : ''}`}
                             onClick={() => onDateClick(day)}>
                    {day !== null && (<span
                        className={isToday ? 'today' : holiday ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}>
                                    {day}
                                </span>)}
                    {exercisesForDay && (<div className="exercise-tag-container">
                        {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
                            <div key={i} className="exercise-tag">
                                {exercise.name}
                            </div>))}
                        {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
                    </div>)}
                </div>);
            })}
        </div>

        <CalendarButton
            selectedDate={selectedDate}
            formatDate={(dateString) => new Date(dateString).toLocaleDateString('ko-KR', {
                month: 'long',
                day: '2-digit',
                weekday: 'long'
            })}
            setShowPopup={setShowPopup}
            exercisesForSelectedDate={exercisesForSelectedDate}
            handleEditExercise={handleEditExercise}
            handleDeleteExerciseWithConfirmation={handleDeleteExerciseWithConfirmation}
            selectedExercises={selectedExercises}
        />


        {/* 팝업 컴포넌트 */}
        {showPopup && (<ExercisePopup
            onClose={() => setShowPopup(false)}
            onConfirm={editExercise ? handleUpdateExercise : handleExerciseConfirm}
            editExercise={editExercise || null} // editExercise가 없을 때 null 전달
        />)}
    </div>);
};

export default Calendar;


// import React, { useState, useEffect } from 'react';
// import './Calendar.css';
// import CalendarButton from '../component/CalendarButton';
// import ExercisePopup from './ExercisePopup'; // 팝업 컴포넌트 임포트
// import { get, ref, set, update } from 'firebase/database';
// import { db } from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
//
// const Calendar = () => {
//     const today = new Date(); // 오늘 날짜
//     const [currentMonth, setCurrentMonth] = useState(today.getMonth());
//     const [currentYear, setCurrentYear] = useState(today.getFullYear());
//
//     const saveExercisesToDatabase = (selectedExercises) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         set(ref(db, `exercises/${userId}`), selectedExercises)
//             .then(() => console.log('Exercises saved to database'))
//             .catch((error) => console.error('Error saving exercises:', error));
//     };
//
//     const saveSelectedDateToDatabase = (selectedDate) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         update(ref(db, `selectedDate/${userId}`), { date: selectedDate })
//             .then(() => console.log('Selected date saved to database'))
//             .catch((error) => console.error('Error saving selected date:', error));
//     };
//
//     const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]); // 오늘 날짜 기본값 설정
//
//     const [showPopup, setShowPopup] = useState(false); // 팝업 상태
//
//     const [selectedExercises, setSelectedExercises] = useState([]);
//
//     const [editExercise, setEditExercise] = useState(null); // 수정할 운동 상태
//
//     const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
//     const [userId, setUserId] = useState(null);
//
//     // 로그인 상태 확인
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserId(user.uid);
//             } else {
//                 setUserId(null);
//             }
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!userId) return; // 로그인한 사용자만 데이터 불러오기
//
//             try {
//                 // 선택한 날짜 데이터 가져오기
//                 const dateSnapshot = await get(ref(db, `selectedDate/${userId}`));
//                 if (dateSnapshot.exists()) {
//                     setSelectedDate(dateSnapshot.val().date);
//                 } else {
//                     setSelectedDate(today.toISOString().split('T')[0]); // 기본 오늘 날짜
//                 }
//
//                 // 운동 데이터 가져오기
//                 const exercisesSnapshot = await get(ref(db, `exercises/${userId}`));
//                 if (exercisesSnapshot.exists()) {
//                     const exercisesData = exercisesSnapshot.val();
//                     // 객체를 배열로 변환
//                     const exercisesArray = Array.isArray(exercisesData) ? exercisesData : Object.values(exercisesData);
//                     setSelectedExercises(exercisesArray);
//                 } else {
//                     setSelectedExercises([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };
//
//         fetchData();
//     }, [userId]);
//
//     // 공휴일
//     const holidays = [
//         { month: 1, day: 1, name: 'New Year\'s Day' },
//         { month: 3, day: 1, name: 'Independence Movement Day' },
//         { month: 5, day: 5, name: 'Children\'s Day' },
//         { month: 6, day: 6, name: 'Memorial Day' },
//         { month: 8, day: 15, name: 'Liberation Day' },
//         { month: 10, day: 3, name: 'National Foundation Day' },
//         { month: 10, day: 9, name: 'Hangul Day' },
//         { month: 12, day: 25, name: 'Christmas Day' }
//     ];
//
//     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
//
//     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//
//     const generateCalendarDays = () => {
//         const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
//         const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//         const calendarDays = [];
//
//         for (let i = 0; i < firstDayOfMonth; i++) {
//             calendarDays.push(null);
//         }
//
//         for (let day = 1; day <= daysInMonth; day++) {
//             calendarDays.push(day);
//         }
//
//         const remainingSpaces = 7 - (calendarDays.length % 7);
//         for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
//             calendarDays.push(null);
//         }
//
//         return calendarDays;
//     };
//
//     const calendarDays = generateCalendarDays();
//
//     const onDateClick = (day) => {
//         if (day === null) return;
//         const newSelectedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('sv-SE');
//         setSelectedDate(newSelectedDate);
//         saveSelectedDateToDatabase(newSelectedDate); // 리얼타임 데이터베이스에 저장
//     };
//
//     const handleExerciseConfirm = (exercises) => {
//         setSelectedExercises((prevExercises) => {
//             if (editExercise) {
//                 const { entryIndex, exerciseIndex } = editExercise;
//                 const updatedExercises = [...prevExercises];
//                 updatedExercises[entryIndex].exercises[exerciseIndex] = exercises[0];
//                 setEditExercise(null);
//                 saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                 return updatedExercises;
//             } else {
//                 const existingEntryIndex = prevExercises.findIndex((entry) => entry.date === selectedDate);
//                 if (existingEntryIndex !== -1) {
//                     const updatedExercises = [...prevExercises];
//                     updatedExercises[existingEntryIndex].exercises.push(...exercises);
//                     saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                     return updatedExercises;
//                 } else {
//                     const newExercises = [...prevExercises, { date: selectedDate, exercises }];
//                     saveExercisesToDatabase(newExercises); // 리얼타임 데이터베이스에 저장
//                     return newExercises;
//                 }
//             }
//         });
//         setShowPopup(false);
//     };
//
//     const handleDeleteExercise = (entryIndex, exerciseIndex) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[entryIndex].exercises.splice(exerciseIndex, 1);
//
//             if (updatedExercises[entryIndex].exercises.length === 0) {
//                 updatedExercises.splice(entryIndex, 1); // 운동이 없으면 해당 날짜 항목 제거
//             }
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//     };
//
//     const handleDeleteExerciseWithConfirmation = (entryIndex, exerciseIndex) => {
//         if (window.confirm('정말 이 운동을 삭제하시겠습니까?')) {
//             handleDeleteExercise(entryIndex, exerciseIndex);
//         }
//     };
//
//     const exercisesForSelectedDate = selectedExercises.find((entry) => entry.date === selectedDate);
//
//     const handlePrevMonth = () => {
//         if (currentMonth === 0) {
//             setCurrentMonth(11);
//             setCurrentYear((prev) => prev - 1);
//         } else {
//             setCurrentMonth((prev) => prev - 1);
//         }
//     };
//
//     const handleNextMonth = () => {
//         if (currentMonth === 11) {
//             setCurrentMonth(0);
//             setCurrentYear((prev) => prev + 1);
//         } else {
//             setCurrentMonth((prev) => prev + 1);
//         }
//     };
//
//     // 공휴일인지 확인하는 함수
//     const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);
//
//     // 수정하려는 운동을 설정하는 함수
//     const handleEditExercise = (entryIndex, exerciseIndex) => {
//         setEditExercise({ entryIndex, exerciseIndex });
//         setShowPopup(true); // 팝업을 열어 수정할 수 있도록
//     };
//
//     // 운동 수정 후 업데이트하는 함수
//     const handleUpdateExercise = (updatedExercises) => {
//         setSelectedExercises((prevExercises) => {
//             const updated = [...prevExercises];
//             const { entryIndex, exerciseIndex } = editExercise;
//             updated[entryIndex].exercises[exerciseIndex] = updatedExercises[0]; // 운동 정보 수정
//             setEditExercise(null);
//             saveExercisesToDatabase(updated); // 리얼타임 데이터베이스에 저장
//             return updated;
//         });
//         setShowPopup(false);
//     };
//
//     return (
//         <div className="calendar-container">
//             {/* 월 네비게이션 버튼 */}
//             <div className="month-navigation">
//                 <button onClick={handlePrevMonth}>◀</button>
//                 <span id="monthYear">
//                     {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
//                 </span>
//                 <button onClick={handleNextMonth}>▶</button>
//             </div>
//
//             {/* 요일 헤더 */}
//             <div className="calendar">
//                 {weekdays.map((weekday, index) => (
//                     <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
//                         {weekday}
//                     </div>
//                 ))}
//
//                 {/* 날짜 셀 */}
//                 {calendarDays.map((day, index) => {
//                     const dayOfWeek = index % 7;
//                     const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
//
//                     const formattedDate = day ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
//
//                     const exercisesForDay = selectedExercises.find((entry) => entry.date === formattedDate);
//                     const holiday = day !== null && isHoliday(day);
//
//                     return (
//                         <div key={index} className={`day ${day === null ? 'null' : ''}`} onClick={() => onDateClick(day)}>
//                             {day !== null && (
//                                 <span
//                                     className={isToday ? 'today' : holiday ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}
//                                 >
//                                     {day}
//                                 </span>
//                             )}
//                             {exercisesForDay && (
//                                 <div className="exercise-tag-container">
//                                     {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
//                                         <div key={i} className="exercise-tag">
//                                             {exercise.name}
//                                         </div>
//                                     ))}
//                                     {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//
//             <CalendarButton
//                 selectedDate={selectedDate}
//                 formatDate={(dateString) => new Date(dateString).toLocaleDateString('ko-KR', {
//                     month: 'long',
//                     day: '2-digit',
//                     weekday: 'long'
//                 })}
//                 setShowPopup={setShowPopup}
//                 exercisesForSelectedDate={exercisesForSelectedDate}
//                 handleEditExercise={handleEditExercise}
//                 handleDeleteExerciseWithConfirmation={handleDeleteExerciseWithConfirmation}
//                 selectedExercises={Array.isArray(selectedExercises) ? selectedExercises : []} // 배열로 보장
//             />
//
//             {/* 팝업 컴포넌트 */}
//             {showPopup && (
//                 <ExercisePopup
//                     onClose={() => setShowPopup(false)}
//                     onConfirm={editExercise ? handleUpdateExercise : handleExerciseConfirm}
//                     editExercise={editExercise || null} // editExercise가 없을 때 null 전달
//                 />
//             )}
//         </div>
//     );
// };
//
// export default Calendar;





// import React, {useState, useEffect} from 'react';
// import './Calendar.css';
// import CalendarButton from '../component/CalendarButton';
// import ExercisePopup from './ExercisePopup'; // 팝업 컴포넌트 임포트
// import {get, ref, set, update} from 'firebase/database';
// import {db} from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
// import {getAuth, onAuthStateChanged} from 'firebase/auth';
//
//
// const Calendar = () => {
//     const today = new Date(); // 오늘 날짜
//     const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//     const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//
//     const saveExercisesToDatabase = (selectedExercises) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         set(ref(db, `exercises/${userId}`), selectedExercises)
//             .then(() => console.log('Exercises saved to database'))
//             .catch((error) => console.error('Error saving exercises:', error));
//     };
//
//     const saveSelectedDateToDatabase = (selectedDate) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         update(ref(db, `selectedDate/${userId}`), { date: selectedDate })
//             .then(() => console.log('Selected date saved to database'))
//             .catch((error) => console.error('Error saving selected date:', error));
//     };
//
//
//     const [selectedDate, setSelectedDate] = useState('');
//
//     const [showPopup, setShowPopup] = useState(false); // 팝업 상태
//
//     const [selectedExercises, setSelectedExercises] = useState([]);
//
//     const [editExercise, setEditExercise] = useState(null); // 수정할 운동 상태
//
//     const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
//     const [userId, setUserId] = useState(null);
//
// // 로그인 상태 확인
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserId(user.uid);
//             } else {
//                 setUserId(null);
//             }
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!userId) return; // 로그인한 사용자만 데이터 불러오기
//
//             try {
//                 const dateSnapshot = await get(ref(db, `selectedDate/${userId}`));
//                 if (dateSnapshot.exists()) {
//                     setSelectedDate(dateSnapshot.val().date);
//                 } else {
//                     setSelectedDate(new Date().toISOString().split('T')[0]);
//                 }
//
//                 const exercisesSnapshot = await get(ref(db, `exercises/${userId}`));
//                 if (exercisesSnapshot.exists()) {
//                     const exercisesData = exercisesSnapshot.val();
//                     // 객체를 배열로 변환
//                     const exercisesArray = Array.isArray(exercisesData) ? exercisesData : Object.values(exercisesData);
//                     setSelectedExercises(exercisesArray);
//                 } else {
//                     setSelectedExercises([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };
//
//         fetchData();
//     }, [userId]);
//
//
//     // 수정할 운동을 선택하고 팝업 열기
//     const handleEditExercise = (entryIndex, exerciseIndex) => {
//         if (
//             Array.isArray(selectedExercises) &&
//             selectedExercises[entryIndex] &&
//             Array.isArray(selectedExercises[entryIndex].exercises)
//         ) {
//             const exerciseToEdit = selectedExercises[entryIndex].exercises[exerciseIndex];
//             setEditExercise({ ...exerciseToEdit, entryIndex, exerciseIndex });
//             setShowPopup(true);
//         } else {
//             console.warn('Invalid selectedExercises data structure');
//         }
//     };
//
//
//     // 수정된 운동을 반영하는 함수
//     const handleUpdateExercise = (updatedExercise) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[editExercise.entryIndex].exercises[editExercise.exerciseIndex] = updatedExercise;
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//         setEditExercise(null); // 수정 상태 초기화
//         setShowPopup(false); // 팝업 닫기
//     };
//
//
//     // 공휴일
//     const holidays = [{month: 1, day: 1, name: 'New Year\'s Day'}, {
//         month: 3,
//         day: 1,
//         name: 'Independence Movement Day'
//     }, {month: 5, day: 5, name: 'Children\'s Day'}, {month: 6, day: 6, name: 'Memorial Day'}, {
//         month: 8,
//         day: 15,
//         name: 'Liberation Day'
//     }, {month: 10, day: 3, name: 'National Foundation Day'}, {month: 10, day: 9, name: 'Hangul Day'}, {
//         month: 12,
//         day: 25,
//         name: 'Christmas Day'
//     },];
//
//     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
//
//     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//
//     const generateCalendarDays = () => {
//         const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
//         const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//         const calendarDays = [];
//
//         for (let i = 0; i < firstDayOfMonth; i++) {
//             calendarDays.push(null);
//         }
//
//         for (let day = 1; day <= daysInMonth; day++) {
//             calendarDays.push(day);
//         }
//
//         const remainingSpaces = 7 - (calendarDays.length % 7);
//         for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
//             calendarDays.push(null);
//         }
//
//         return calendarDays;
//     };
//
//     const calendarDays = generateCalendarDays();
//
//     const onDateClick = (day) => {
//         if (day === null) return;
//         const newSelectedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('sv-SE');
//         setSelectedDate(newSelectedDate);
//         saveSelectedDateToDatabase(newSelectedDate); // 리얼타임 데이터베이스에 저장
//     };
//
//     const handleExerciseConfirm = (exercises) => {
//         setSelectedExercises((prevExercises) => {
//             if (editExercise) {
//                 const {entryIndex, exerciseIndex} = editExercise;
//                 const updatedExercises = [...prevExercises];
//                 updatedExercises[entryIndex].exercises[exerciseIndex] = exercises[0];
//                 setEditExercise(null);
//                 saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                 return updatedExercises;
//             } else {
//                 const existingEntryIndex = prevExercises.findIndex((entry) => entry.date === selectedDate);
//                 if (existingEntryIndex !== -1) {
//                     const updatedExercises = [...prevExercises];
//                     updatedExercises[existingEntryIndex].exercises.push(...exercises);
//                     saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                     return updatedExercises;
//                 } else {
//                     const newExercises = [...prevExercises, {date: selectedDate, exercises}];
//                     saveExercisesToDatabase(newExercises); // 리얼타임 데이터베이스에 저장
//                     return newExercises;
//                 }
//             }
//         });
//         setShowPopup(false);
//     };
//
//     const handleDeleteExercise = (entryIndex, exerciseIndex) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[entryIndex].exercises.splice(exerciseIndex, 1);
//
//             if (updatedExercises[entryIndex].exercises.length === 0) {
//                 updatedExercises.splice(entryIndex, 1); // 운동이 없으면 해당 날짜 항목 제거
//             }
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//     };
//
//
//     const handleDeleteExerciseWithConfirmation = (entryIndex, exerciseIndex) => {
//         if (window.confirm('정말 이 운동을 삭제하시겠습니까?')) {
//             handleDeleteExercise(entryIndex, exerciseIndex);
//         }
//     };
//
//
//     const exercisesForSelectedDate = selectedExercises.find((entry) => entry.date === selectedDate);
//
//     const handlePrevMonth = () => {
//         if (currentMonth === 0) {
//             setCurrentMonth(11);
//             setCurrentYear((prev) => prev - 1);
//         } else {
//             setCurrentMonth((prev) => prev - 1);
//         }
//     };
//
//     const handleNextMonth = () => {
//         if (currentMonth === 11) {
//             setCurrentMonth(0);
//             setCurrentYear((prev) => prev + 1);
//         } else {
//             setCurrentMonth((prev) => prev + 1);
//         }
//     };
//
//
//     // 공휴일인지 확인하는 함수
//     const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);
//
//     return (<div className="calendar-container">
//         {/* 월 네비게이션 버튼 */}
//         <div className="month-navigation">
//             <button onClick={handlePrevMonth}>◀</button>
//             <span id="monthYear">
//                     {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
//                 </span>
//             <button onClick={handleNextMonth}>▶</button>
//         </div>
//
//         {/* 요일 헤더 */}
//         <div className="calendar">
//             {weekdays.map((weekday, index) => (
//                 <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
//                     {weekday}
//                 </div>))}
//
//             {/* 날짜 셀 */}
//             {calendarDays.map((day, index) => {
//                 const dayOfWeek = index % 7;
//                 const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
//
//                 const formattedDate = day ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
//
//                 const exercisesForDay = selectedExercises.find((entry) => entry.date === formattedDate);
//                 const holiday = day !== null && isHoliday(day);
//
//                 return (<div key={index} className={`day ${day === null ? 'null' : ''}`}
//                              onClick={() => onDateClick(day)}>
//                     {day !== null && (<span
//                         className={isToday ? 'today' : holiday ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}>
//                                     {day}
//                                 </span>)}
//                     {exercisesForDay && (<div className="exercise-tag-container">
//                         {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
//                             <div key={i} className="exercise-tag">
//                                 {exercise.name}
//                             </div>))}
//                         {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
//                     </div>)}
//                 </div>);
//             })}
//         </div>
//
//         <CalendarButton
//             selectedDate={selectedDate}
//             formatDate={(dateString) => new Date(dateString).toLocaleDateString('ko-KR', {
//                 month: 'long',
//                 day: '2-digit',
//                 weekday: 'long'
//             })}
//             setShowPopup={setShowPopup}
//             exercisesForSelectedDate={exercisesForSelectedDate}
//             handleEditExercise={handleEditExercise}
//             handleDeleteExerciseWithConfirmation={handleDeleteExerciseWithConfirmation}
//             selectedExercises={Array.isArray(selectedExercises) ? selectedExercises : []} // 배열로 보장
//         />
//
//         {/* 팝업 컴포넌트 */}
//         {showPopup && (<ExercisePopup
//             onClose={() => setShowPopup(false)}
//             onConfirm={editExercise ? handleUpdateExercise : handleExerciseConfirm}
//             editExercise={editExercise || null} // editExercise가 없을 때 null 전달
//         />)}
//     </div>);
// };
//
// export default Calendar;


//
// import React, {useState, useEffect} from 'react';
// import './Calendar.css';
// import CalendarButton from '../component/CalendarButton';
// import ExercisePopup from './ExercisePopup'; // 팝업 컴포넌트 임포트
// import {get, ref, set, update} from 'firebase/database';
// import {db} from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
// import {getAuth, onAuthStateChanged} from 'firebase/auth';
//
//
// const Calendar = () => {
//     const today = new Date(); // 오늘 날짜
//     const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//     const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//
//     const saveExercisesToDatabase = (selectedExercises) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         set(ref(db, `exercises/${userId}`), selectedExercises)
//             .then(() => console.log('Exercises saved to database'))
//             .catch((error) => console.error('Error saving exercises:', error));
//     };
//
//     const saveSelectedDateToDatabase = (selectedDate) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         update(ref(db, `selectedDate/${userId}`), { date: selectedDate })
//             .then(() => console.log('Selected date saved to database'))
//             .catch((error) => console.error('Error saving selected date:', error));
//     };
//
//
//     const [selectedDate, setSelectedDate] = useState('');
//
//     const [showPopup, setShowPopup] = useState(false); // 팝업 상태
//
//     const [selectedExercises, setSelectedExercises] = useState([]);
//
//     const [editExercise, setEditExercise] = useState(null); // 수정할 운동 상태
//
//     const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
//     const [userId, setUserId] = useState(null);
//
// // 로그인 상태 확인
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserId(user.uid);
//             } else {
//                 setUserId(null);
//             }
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!userId) return; // 로그인한 사용자만 데이터 불러오기
//
//             try {
//                 const dateSnapshot = await get(ref(db, `selectedDate/${userId}`));
//                 if (dateSnapshot.exists()) {
//                     setSelectedDate(dateSnapshot.val().date);
//                 } else {
//                     setSelectedDate(new Date().toISOString().split('T')[0]);
//                 }
//
//                 const exercisesSnapshot = await get(ref(db, `exercises/${userId}`));
//                 if (exercisesSnapshot.exists()) {
//                     setSelectedExercises(exercisesSnapshot.val());
//                 } else {
//                     setSelectedExercises([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };
//
//         fetchData();
//     }, [userId]);
//
//     // 수정할 운동을 선택하고 팝업 열기
//     const handleEditExercise = (entryIndex, exerciseIndex) => {
//         const exerciseToEdit = selectedExercises[entryIndex].exercises[exerciseIndex];
//         setEditExercise({...exerciseToEdit, entryIndex, exerciseIndex});
//         setShowPopup(true); // 팝업 열기
//     };
//
//
//     // 수정된 운동을 반영하는 함수
//     const handleUpdateExercise = (updatedExercise) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[editExercise.entryIndex].exercises[editExercise.exerciseIndex] = updatedExercise;
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//         setEditExercise(null); // 수정 상태 초기화
//         setShowPopup(false); // 팝업 닫기
//     };
//
//
//     // 공휴일
//     const holidays = [{month: 1, day: 1, name: 'New Year\'s Day'}, {
//         month: 3,
//         day: 1,
//         name: 'Independence Movement Day'
//     }, {month: 5, day: 5, name: 'Children\'s Day'}, {month: 6, day: 6, name: 'Memorial Day'}, {
//         month: 8,
//         day: 15,
//         name: 'Liberation Day'
//     }, {month: 10, day: 3, name: 'National Foundation Day'}, {month: 10, day: 9, name: 'Hangul Day'}, {
//         month: 12,
//         day: 25,
//         name: 'Christmas Day'
//     },];
//
//     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
//
//     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//
//     const generateCalendarDays = () => {
//         const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
//         const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//         const calendarDays = [];
//
//         for (let i = 0; i < firstDayOfMonth; i++) {
//             calendarDays.push(null);
//         }
//
//         for (let day = 1; day <= daysInMonth; day++) {
//             calendarDays.push(day);
//         }
//
//         const remainingSpaces = 7 - (calendarDays.length % 7);
//         for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
//             calendarDays.push(null);
//         }
//
//         return calendarDays;
//     };
//
//     const calendarDays = generateCalendarDays();
//
//     const onDateClick = (day) => {
//         if (day === null) return;
//         const newSelectedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('sv-SE');
//         setSelectedDate(newSelectedDate);
//         saveSelectedDateToDatabase(newSelectedDate); // 리얼타임 데이터베이스에 저장
//     };
//
//     const handleExerciseConfirm = (exercises) => {
//         setSelectedExercises((prevExercises) => {
//             if (editExercise) {
//                 const {entryIndex, exerciseIndex} = editExercise;
//                 const updatedExercises = [...prevExercises];
//                 updatedExercises[entryIndex].exercises[exerciseIndex] = exercises[0];
//                 setEditExercise(null);
//                 saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                 return updatedExercises;
//             } else {
//                 const existingEntryIndex = prevExercises.findIndex((entry) => entry.date === selectedDate);
//                 if (existingEntryIndex !== -1) {
//                     const updatedExercises = [...prevExercises];
//                     updatedExercises[existingEntryIndex].exercises.push(...exercises);
//                     saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                     return updatedExercises;
//                 } else {
//                     const newExercises = [...prevExercises, {date: selectedDate, exercises}];
//                     saveExercisesToDatabase(newExercises); // 리얼타임 데이터베이스에 저장
//                     return newExercises;
//                 }
//             }
//         });
//         setShowPopup(false);
//     };
//
//     const handleDeleteExercise = (entryIndex, exerciseIndex) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[entryIndex].exercises.splice(exerciseIndex, 1);
//
//             if (updatedExercises[entryIndex].exercises.length === 0) {
//                 updatedExercises.splice(entryIndex, 1); // 운동이 없으면 해당 날짜 항목 제거
//             }
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//     };
//
//
//     const handleDeleteExerciseWithConfirmation = (entryIndex, exerciseIndex) => {
//         if (window.confirm('정말 이 운동을 삭제하시겠습니까?')) {
//             handleDeleteExercise(entryIndex, exerciseIndex);
//         }
//     };
//
//
//     const exercisesForSelectedDate = selectedExercises.find((entry) => entry.date === selectedDate);
//
//     const handlePrevMonth = () => {
//         if (currentMonth === 0) {
//             setCurrentMonth(11);
//             setCurrentYear((prev) => prev - 1);
//         } else {
//             setCurrentMonth((prev) => prev - 1);
//         }
//     };
//
//     const handleNextMonth = () => {
//         if (currentMonth === 11) {
//             setCurrentMonth(0);
//             setCurrentYear((prev) => prev + 1);
//         } else {
//             setCurrentMonth((prev) => prev + 1);
//         }
//     };
//
//
//     // 공휴일인지 확인하는 함수
//     const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);
//
//     return (<div className="calendar-container">
//         {/* 월 네비게이션 버튼 */}
//         <div className="month-navigation">
//             <button onClick={handlePrevMonth}>◀</button>
//             <span id="monthYear">
//                     {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
//                 </span>
//             <button onClick={handleNextMonth}>▶</button>
//         </div>
//
//         {/* 요일 헤더 */}
//         <div className="calendar">
//             {weekdays.map((weekday, index) => (
//                 <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
//                     {weekday}
//                 </div>))}
//
//             {/* 날짜 셀 */}
//             {calendarDays.map((day, index) => {
//                 const dayOfWeek = index % 7;
//                 const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
//
//                 const formattedDate = day ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
//
//                 const exercisesForDay = selectedExercises.find((entry) => entry.date === formattedDate);
//                 const holiday = day !== null && isHoliday(day);
//
//                 return (<div key={index} className={`day ${day === null ? 'null' : ''}`}
//                              onClick={() => onDateClick(day)}>
//                     {day !== null && (<span
//                         className={isToday ? 'today' : holiday ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}>
//                                     {day}
//                                 </span>)}
//                     {exercisesForDay && (<div className="exercise-tag-container">
//                         {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
//                             <div key={i} className="exercise-tag">
//                                 {exercise.name}
//                             </div>))}
//                         {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
//                     </div>)}
//                 </div>);
//             })}
//         </div>
//
//         <CalendarButton
//             selectedDate={selectedDate}
//             formatDate={(dateString) => new Date(dateString).toLocaleDateString('ko-KR', {
//                 month: 'long',
//                 day: '2-digit',
//                 weekday: 'long'
//             })}
//             setShowPopup={setShowPopup}
//             exercisesForSelectedDate={exercisesForSelectedDate}
//             handleEditExercise={handleEditExercise}
//             handleDeleteExerciseWithConfirmation={handleDeleteExerciseWithConfirmation}
//             selectedExercises={selectedExercises}
//         />
//
//
//         {/* 팝업 컴포넌트 */}
//         {showPopup && (<ExercisePopup
//             onClose={() => setShowPopup(false)}
//             onConfirm={editExercise ? handleUpdateExercise : handleExerciseConfirm}
//             editExercise={editExercise || null} // editExercise가 없을 때 null 전달
//         />)}
//     </div>);
// };
//
// export default Calendar;


// import React, {useState, useEffect} from 'react';
// import './Calendar.css';
// import CalendarButton from '../component/CalendarButton';
// import ExercisePopup from './ExercisePopup'; // 팝업 컴포넌트 임포트
// import {get, ref, set, update} from 'firebase/database';
// import {db} from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
// import {getAuth, onAuthStateChanged} from 'firebase/auth';
//
//
// const Calendar = () => {
//     const today = new Date(); // 오늘 날짜
//     const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//     const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//
//     const saveExercisesToDatabase = (selectedExercises) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         set(ref(db, `exercises/${userId}`), selectedExercises)
//             .then(() => console.log('Exercises saved to database'))
//             .catch((error) => console.error('Error saving exercises:', error));
//     };
//
//     const saveSelectedDateToDatabase = (selectedDate) => {
//         if (!userId) return; // 사용자가 로그인하지 않은 경우 저장하지 않음
//         update(ref(db, `selectedDate/${userId}`), { date: selectedDate })
//             .then(() => console.log('Selected date saved to database'))
//             .catch((error) => console.error('Error saving selected date:', error));
//     };
//
//
//     const [selectedDate, setSelectedDate] = useState('');
//
//     const [showPopup, setShowPopup] = useState(false); // 팝업 상태
//
//     const [selectedExercises, setSelectedExercises] = useState([]);
//
//     const [editExercise, setEditExercise] = useState(null); // 수정할 운동 상태
//
//     const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
//     const [userId, setUserId] = useState(null);
//
// // 로그인 상태 확인
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserId(user.uid);
//             } else {
//                 setUserId(null);
//             }
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!userId) return; // 로그인한 사용자만 데이터 불러오기
//
//             try {
//                 const dateSnapshot = await get(ref(db, `selectedDate/${userId}`));
//                 if (dateSnapshot.exists()) {
//                     setSelectedDate(dateSnapshot.val().date);
//                 } else {
//                     setSelectedDate(new Date().toISOString().split('T')[0]);
//                 }
//
//                 const exercisesSnapshot = await get(ref(db, `exercises/${userId}`));
//                 if (exercisesSnapshot.exists()) {
//                     setSelectedExercises(exercisesSnapshot.val());
//                 } else {
//                     setSelectedExercises([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };
//
//         fetchData();
//     }, [userId]);
//
//     // 수정할 운동을 선택하고 팝업 열기
//     const handleEditExercise = (entryIndex, exerciseIndex) => {
//         const exerciseToEdit = selectedExercises[entryIndex].exercises[exerciseIndex];
//         setEditExercise({...exerciseToEdit, entryIndex, exerciseIndex});
//         setShowPopup(true); // 팝업 열기
//     };
//
//
//     // 수정된 운동을 반영하는 함수
//     const handleUpdateExercise = (updatedExercise) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[editExercise.entryIndex].exercises[editExercise.exerciseIndex] = updatedExercise;
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//         setEditExercise(null); // 수정 상태 초기화
//         setShowPopup(false); // 팝업 닫기
//     };
//
//
//     // 공휴일
//     const holidays = [{month: 1, day: 1, name: 'New Year\'s Day'}, {
//         month: 3,
//         day: 1,
//         name: 'Independence Movement Day'
//     }, {month: 5, day: 5, name: 'Children\'s Day'}, {month: 6, day: 6, name: 'Memorial Day'}, {
//         month: 8,
//         day: 15,
//         name: 'Liberation Day'
//     }, {month: 10, day: 3, name: 'National Foundation Day'}, {month: 10, day: 9, name: 'Hangul Day'}, {
//         month: 12,
//         day: 25,
//         name: 'Christmas Day'
//     },];
//
//     const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
//
//     const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//
//     const generateCalendarDays = () => {
//         const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
//         const daysInMonth = getDaysInMonth(currentYear, currentMonth);
//         const calendarDays = [];
//
//         for (let i = 0; i < firstDayOfMonth; i++) {
//             calendarDays.push(null);
//         }
//
//         for (let day = 1; day <= daysInMonth; day++) {
//             calendarDays.push(day);
//         }
//
//         const remainingSpaces = 7 - (calendarDays.length % 7);
//         for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
//             calendarDays.push(null);
//         }
//
//         return calendarDays;
//     };
//
//     const calendarDays = generateCalendarDays();
//
//     const onDateClick = (day) => {
//         if (day === null) return;
//         const newSelectedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('sv-SE');
//         setSelectedDate(newSelectedDate);
//         saveSelectedDateToDatabase(newSelectedDate); // 리얼타임 데이터베이스에 저장
//     };
//
//     const handleExerciseConfirm = (exercises) => {
//         setSelectedExercises((prevExercises) => {
//             if (editExercise) {
//                 const {entryIndex, exerciseIndex} = editExercise;
//                 const updatedExercises = [...prevExercises];
//                 updatedExercises[entryIndex].exercises[exerciseIndex] = exercises[0];
//                 setEditExercise(null);
//                 saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                 return updatedExercises;
//             } else {
//                 const existingEntryIndex = prevExercises.findIndex((entry) => entry.date === selectedDate);
//                 if (existingEntryIndex !== -1) {
//                     const updatedExercises = [...prevExercises];
//                     updatedExercises[existingEntryIndex].exercises.push(...exercises);
//                     saveExercisesToDatabase(updatedExercises); // 리얼타임 데이터베이스에 저장
//                     return updatedExercises;
//                 } else {
//                     const newExercises = [...prevExercises, {date: selectedDate, exercises}];
//                     saveExercisesToDatabase(newExercises); // 리얼타임 데이터베이스에 저장
//                     return newExercises;
//                 }
//             }
//         });
//         setShowPopup(false);
//     };
//
//     const handleDeleteExercise = (entryIndex, exerciseIndex) => {
//         setSelectedExercises((prevExercises) => {
//             const updatedExercises = [...prevExercises];
//             updatedExercises[entryIndex].exercises.splice(exerciseIndex, 1);
//
//             if (updatedExercises[entryIndex].exercises.length === 0) {
//                 updatedExercises.splice(entryIndex, 1); // 운동이 없으면 해당 날짜 항목 제거
//             }
//
//             // 리얼타임 데이터베이스에 저장
//             saveExercisesToDatabase(updatedExercises);
//
//             return updatedExercises;
//         });
//     };
//
//
//     const handleDeleteExerciseWithConfirmation = (entryIndex, exerciseIndex) => {
//         if (window.confirm('정말 이 운동을 삭제하시겠습니까?')) {
//             handleDeleteExercise(entryIndex, exerciseIndex);
//         }
//     };
//
//
//     const exercisesForSelectedDate = selectedExercises.find((entry) => entry.date === selectedDate);
//
//     const handlePrevMonth = () => {
//         if (currentMonth === 0) {
//             setCurrentMonth(11);
//             setCurrentYear((prev) => prev - 1);
//         } else {
//             setCurrentMonth((prev) => prev - 1);
//         }
//     };
//
//     const handleNextMonth = () => {
//         if (currentMonth === 11) {
//             setCurrentMonth(0);
//             setCurrentYear((prev) => prev + 1);
//         } else {
//             setCurrentMonth((prev) => prev + 1);
//         }
//     };
//
//
//     // 공휴일인지 확인하는 함수
//     const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);
//
//     return (<div className="calendar-container">
//         {/* 월 네비게이션 버튼 */}
//         <div className="month-navigation">
//             <button onClick={handlePrevMonth}>◀</button>
//             <span id="monthYear">
//                     {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
//                 </span>
//             <button onClick={handleNextMonth}>▶</button>
//         </div>
//
//         {/* 요일 헤더 */}
//         <div className="calendar">
//             {weekdays.map((weekday, index) => (
//                 <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
//                     {weekday}
//                 </div>))}
//
//             {/* 날짜 셀 */}
//             {calendarDays.map((day, index) => {
//                 const dayOfWeek = index % 7;
//                 const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
//
//                 const formattedDate = day ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
//
//                 const exercisesForDay = selectedExercises.find((entry) => entry.date === formattedDate);
//                 const holiday = day !== null && isHoliday(day);
//
//                 return (<div key={index} className={`day ${day === null ? 'null' : ''}`}
//                              onClick={() => onDateClick(day)}>
//                     {day !== null && (<span
//                         className={isToday ? 'today' : holiday ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}>
//                                     {day}
//                                 </span>)}
//                     {exercisesForDay && (<div className="exercise-tag-container">
//                         {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
//                             <div key={i} className="exercise-tag">
//                                 {exercise.name}
//                             </div>))}
//                         {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
//                     </div>)}
//                 </div>);
//             })}
//         </div>
//
//         <CalendarButton
//             selectedDate={selectedDate}
//             formatDate={(dateString) => new Date(dateString).toLocaleDateString('ko-KR', {
//                 month: 'long',
//                 day: '2-digit',
//                 weekday: 'long'
//             })}
//             setShowPopup={setShowPopup}
//             exercisesForSelectedDate={exercisesForSelectedDate}
//             handleEditExercise={handleEditExercise}
//             handleDeleteExerciseWithConfirmation={handleDeleteExerciseWithConfirmation}
//             selectedExercises={selectedExercises}
//         />
//
//
//         {/* 팝업 컴포넌트 */}
//         {showPopup && (<ExercisePopup
//             onClose={() => setShowPopup(false)}
//             onConfirm={editExercise ? handleUpdateExercise : handleExerciseConfirm}
//             editExercise={editExercise || null} // editExercise가 없을 때 null 전달
//         />)}
//     </div>);
// };
//
// export default Calendar;
