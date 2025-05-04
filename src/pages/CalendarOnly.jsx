import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { ref, get } from 'firebase/database';
import { db } from '../js/firebaseApp'; // Firebase 설정 파일에서 db 가져오기
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Authentication import

const CalendarOnly = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [exercises, setExercises] = useState([]);
    const [userId, setUserId] = useState(null);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 공휴일 데이터
    const holidays = [
        { month: 1, day: 1, name: "New Year's Day" },
        { month: 3, day: 1, name: 'Independence Movement Day' },
        { month: 5, day: 5, name: "Children's Day" },
        { month: 6, day: 6, name: 'Memorial Day' },
        { month: 8, day: 15, name: 'Liberation Day' },
        { month: 10, day: 3, name: 'National Foundation Day' },
        { month: 10, day: 9, name: 'Hangul Day' },
        { month: 12, day: 25, name: 'Christmas Day' },
    ];

    // Firebase Authentication에서 사용자 ID 가져오기
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setExercises([]); // 로그아웃 또는 다른 아이디로 로그인 시 데이터 초기화
            }
        });

        return () => unsubscribe();
    }, []);

    // Firebase에서 사용자별 운동 데이터 불러오기
    useEffect(() => {
        const fetchExercises = async () => {
            if (!userId) return; // 로그인하지 않은 경우 데이터 불러오지 않음

            try {
                const snapshot = await get(ref(db, `exercises/${userId}`));
                if (snapshot.exists()) {
                    setExercises(snapshot.val());
                } else {
                    setExercises([]);
                }
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    }, [userId]);

    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    // 달력 날짜 생성
    const generateCalendarDays = () => {
        const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const calendarDays = [];

        // 첫 주의 공백 채우기
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(null);
        }

        // 실제 날짜 추가
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day);
        }

        // 마지막 줄의 공백 채우기
        const remainingSpaces = 7 - (calendarDays.length % 7);
        for (let i = 0; i < remainingSpaces && remainingSpaces < 7; i++) {
            calendarDays.push(null);
        }

        return calendarDays;
    };

    const calendarDays = generateCalendarDays();

    // 월 변경 함수
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

    // 공휴일 확인 함수
    const isHoliday = (day) => holidays.some((holiday) => holiday.month === currentMonth + 1 && holiday.day === day);

    // 선택된 날짜에 해당하는 운동 찾기
    const getExercisesForDate = (day) => {
        if (!day) return null;
        const formattedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return exercises.find((entry) => entry.date === formattedDate);
    };

    return (
        <div className="calendar-container">
            <div className="month-navigation">
                <button onClick={handlePrevMonth}>◀</button>
                <span id="monthYear">
                    {currentYear}. {(currentMonth + 1).toString().padStart(2, '0')}
                </span>
                <button onClick={handleNextMonth}>▶</button>
            </div>

            <div className="calendar">
                {weekdays.map((weekday, index) => (
                    <div key={index} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
                        {weekday}
                    </div>
                ))}

                {calendarDays.map((day, index) => {
                    const dayOfWeek = index % 7;
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    const exercisesForDay = getExercisesForDate(day);

                    return (
                        <div key={index} className={`day ${day === null ? 'null' : ''}`}>
                            {day !== null && (
                                <>
                                    <span className={isToday ? 'today' : isHoliday(day) ? 'holiday' : dayOfWeek === 0 ? 'sunday-date' : dayOfWeek === 6 ? 'saturday-date' : ''}>
                                        {day}
                                    </span>
                                    {exercisesForDay && (
                                        <div className="exercise-tag-container">
                                            {exercisesForDay.exercises.slice(0, 2).map((exercise, i) => (
                                                <div key={i} className="exercise-tag">
                                                    {exercise.name}
                                                </div>
                                            ))}
                                            {exercisesForDay.exercises.length > 2 && <div className="more-tag">...</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarOnly;
