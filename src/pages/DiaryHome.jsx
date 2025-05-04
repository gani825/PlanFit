import './DiaryHome.css';
import React, { useState, useContext, useEffect } from 'react';
import Header from '../component/Header';
import Button from '../component/Button';
import DiaryList from '../component/DiaryList';
import { DiaryStateContext } from './Diary';
import { getMonthRangeByDate } from '../util';
import { db, auth } from '../js/firebaseApp'; // Firebase import
import { ref, get, set } from 'firebase/database'; // Firebase에서 set 함수 사용

const DiaryHome = () => {
    const data = useContext(DiaryStateContext);
    const [pivotDate, setPivotDate] = useState(new Date()); // 현재 날짜를 기준으로 설정
    const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터

    // Firebase에서 데이터를 불러오기
    const fetchData = async () => {
        const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
        const diaryRef = ref(db, 'diaries/' + userUid); // Firebase 경로
        const snapshot = await get(diaryRef);

        if (snapshot.exists()) {
            const fetchedData = snapshot.val(); // Firebase에서 가져온 데이터
            const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
            setFilteredData(diaryList);
        } else {
            console.log("사용자의 다이어리가 없습니다.");
            setFilteredData([]); // 사용자의 다이어리가 없을 경우 빈 배열로 설정
        }
    };

    // 컴포넌트가 처음 렌더링될 때 데이터 불러오기
    useEffect(() => {
        if (auth.currentUser) {
            fetchData(); // Firebase에서 데이터 가져오기
        }
    }, []); // 컴포넌트가 처음 렌더링될 때만 실행

    // 월별로 다이어리 필터링
    useEffect(() => {
        if (data.length > 0) {
            const { beginTimeStamp, endTimeStamp } = getMonthRangeByDate(pivotDate);
            setFilteredData(data.filter(it => beginTimeStamp <= it.date && it.date <= endTimeStamp && !it.isDeleted)); // isDeleted 체크
        } else {
            setFilteredData([]); // 데이터가 없으면 빈 배열
        }
    }, [data, pivotDate]);

    const headerTitle = `${pivotDate.getFullYear()}. ${pivotDate.getMonth() + 1}`;

    const onIncreaseMonth = () => {
        setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1));
    };

    const onDecreaseMonth = () => {
        setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1));
    };

    return (
        <div className='home-wrap'>
            <Header
                title={headerTitle}
                leftChild={<Button text={'◀'} onClick={onDecreaseMonth} />}
                rightChild={<Button text={'▶'} onClick={onIncreaseMonth} />}
            />
            <DiaryList data={filteredData} pivotDate={pivotDate} /> {/* pivotDate를 전달 */}
        </div>
    );
};

export default DiaryHome;


// import './DiaryHome.css';
// import React, { useState, useContext, useEffect } from 'react';
// import Header from '../component/Header';
// import Button from '../component/Button';
// import DiaryList from '../component/DiaryList';
// import { DiaryStateContext } from './Diary';
// import { getMonthRangeByDate } from '../util';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, get, set } from 'firebase/database'; // Firebase에서 set 함수 사용
//
// const DiaryHome = () => {
//     const data = useContext(DiaryStateContext);
//     const [pivotDate, setPivotDate] = useState(new Date());
//     const [filteredData, setFilteredData] = useState([]);
//
//     // Firebase에서 데이터를 불러오기
//     const fetchData = async () => {
//         const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
//         const diaryRef = ref(db, 'diaries/' + userUid); // Firebase 경로
//         const snapshot = await get(diaryRef);
//
//         if (snapshot.exists()) {
//             const fetchedData = snapshot.val(); // Firebase에서 가져온 데이터
//             const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
//             setFilteredData(diaryList);
//         } else {
//             console.log("사용자의 다이어리가 없습니다.");
//             setFilteredData([]); // 사용자의 다이어리가 없을 경우 빈 배열로 설정
//         }
//     };
//
//     // 컴포넌트가 처음 렌더링될 때 데이터 불러오기
//     useEffect(() => {
//         if (auth.currentUser) {
//             fetchData(); // Firebase에서 데이터 가져오기
//         }
//     }, []); // 컴포넌트가 처음 렌더링될 때만 실행
//
//     // 월별로 다이어리 필터링
//     useEffect(() => {
//         if (data.length > 0) {
//             const { beginTimeStamp, endTimeStamp } = getMonthRangeByDate(pivotDate);
//             setFilteredData(data.filter(it => beginTimeStamp <= it.date && it.date <= endTimeStamp && !it.isDeleted)); // isDeleted 체크
//         } else {
//             setFilteredData([]); // 데이터가 없으면 빈 배열
//         }
//     }, [data, pivotDate]);
//
//     // 삭제 함수 추가 (isDeleted 필드 사용)
//     const handleDelete = async (id) => {
//         try {
//             const userUid = auth.currentUser.uid; // 로그인한 사용자의 UID
//             const diaryRef = ref(db, `diaries/${userUid}/${id}`); // 해당 다이어리 항목 경로
//
//             // Firebase에서 해당 다이어리 항목에 isDeleted 필드를 추가하여 삭제 상태로 설정
//             await set(diaryRef, {
//                 ...data.find(item => item.id === id),  // 기존 데이터 그대로 가져오기
//                 isDeleted: true  // isDeleted 값을 true로 설정
//             });
//
//             // 데이터 새로 불러오기
//             fetchData();  // 데이터를 새로 불러와서 상태 갱신
//         } catch (error) {
//             console.error("삭제 실패:", error);
//         }
//     };
//
//     const headerTitle = `${pivotDate.getFullYear()}. ${pivotDate.getMonth() + 1}`;
//
//     const onIncreaseMonth = () => {
//         setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1));
//     };
//
//     const onDecreaseMonth = () => {
//         setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1));
//     };
//
//     return (
//         <div className='home-wrap'>
//             <Header
//                 title={headerTitle}
//                 leftChild={<Button text={'◀'} onClick={onDecreaseMonth} />}
//                 rightChild={<Button text={'▶'} onClick={onIncreaseMonth} />}
//             />
//             <DiaryList data={filteredData} onDelete={handleDelete} /> {/* 삭제 함수 추가 */}
//         </div>
//     );
// };
//
// export default DiaryHome;


//
//
// import './DiaryHome.css';
// import React, { useState, useContext, useEffect } from 'react';
// import Header from '../component/Header';
// import Button from '../component/Button';
// import DiaryList from '../component/DiaryList';
// import { DiaryStateContext } from './Diary';
// import { getMonthRangeByDate } from '../util';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, get, set } from 'firebase/database'; // Firebase에서 set 함수 사용
//
// const DiaryHome = () => {
//     const data = useContext(DiaryStateContext);
//     const [pivotDate, setPivotDate] = useState(new Date());
//     const [filteredData, setFilteredData] = useState([]);
//
//     // Firebase에서 데이터를 불러오기
//     const fetchData = async () => {
//         const userUid = auth.currentUser.uid; // 로그인한 사용자 UID
//         const diaryRef = ref(db, 'diaries/' + userUid); // Firebase 경로
//         const snapshot = await get(diaryRef);
//
//         if (snapshot.exists()) {
//             const fetchedData = snapshot.val(); // Firebase에서 가져온 데이터
//             const diaryList = Object.values(fetchedData); // 객체를 배열로 변환
//             setFilteredData(diaryList);
//         } else {
//             console.log("사용자의 다이어리가 없습니다.");
//             setFilteredData([]); // 사용자의 다이어리가 없을 경우 빈 배열로 설정
//         }
//     };
//
//     // 컴포넌트가 처음 렌더링될 때 데이터 불러오기
//     useEffect(() => {
//         if (auth.currentUser) {
//             fetchData(); // Firebase에서 데이터 가져오기
//         }
//     }, []); // 컴포넌트가 처음 렌더링될 때만 실행
//
//     // 월별로 다이어리 필터링
//     useEffect(() => {
//         if (data.length > 0) {
//             const { beginTimeStamp, endTimeStamp } = getMonthRangeByDate(pivotDate);
//             setFilteredData(data.filter(it => beginTimeStamp <= it.date && it.date <= endTimeStamp && !it.isDeleted)); // isDeleted 체크
//         } else {
//             setFilteredData([]); // 데이터가 없으면 빈 배열
//         }
//     }, [data, pivotDate]);
//
//     // 삭제 함수 추가 (isDeleted 필드 사용)
//     const handleDelete = async (id) => {
//         try {
//             const userUid = auth.currentUser.uid; // 로그인한 사용자의 UID
//             const diaryRef = ref(db, `diaries/${userUid}/${id}`); // 해당 다이어리 항목 경로
//
//             // Firebase에서 해당 다이어리 항목에 isDeleted 필드를 추가하여 삭제 상태로 설정
//             await set(diaryRef, {
//                 ...data.find(item => item.id === id),  // 기존 데이터 그대로 가져오기
//                 isDeleted: true  // isDeleted 값을 true로 설정
//             });
//
//             // 상태에서 해당 항목 삭제 (dispatch)
//             fetchData();  // 데이터를 새로 불러와서 상태 갱신
//         } catch (error) {
//             console.error("삭제 실패:", error);
//         }
//     };
//
//     const headerTitle = `${pivotDate.getFullYear()}. ${pivotDate.getMonth() + 1}`;
//
//     const onIncreaseMonth = () => {
//         setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1));
//     };
//
//     const onDecreaseMonth = () => {
//         setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() - 1));
//     };
//
//     return (
//         <div className='home-wrap'>
//             <Header
//                 title={headerTitle}
//                 leftChild={<Button text={'◀'} onClick={onDecreaseMonth} />}
//                 rightChild={<Button text={'▶'} onClick={onIncreaseMonth} />}
//             />
//             <DiaryList data={filteredData} onDelete={handleDelete} /> {/* 삭제 함수 추가 */}
//         </div>
//     );
// };
//
// export default DiaryHome;
//
