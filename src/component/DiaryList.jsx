import React, { useState, useEffect } from 'react';
import './DiaryList.css';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import DiaryItem from './DiaryItem';

const sortOptionList = [
    { value: 'latest', name: '최신 작성순' },
    { value: 'oldest', name: '오래된 작성순' },
];

const DiaryList = ({ data, pivotDate, onDelete }) => {
    const [sortType, setSortType] = useState('latest');
    const [sortedData, setSortedData] = useState([]);

    const navigate = useNavigate();

    // 정렬된 데이터를 설정하는 useEffect
    useEffect(() => {
        const compare = (a, b) => {
            const dateA = new Date(a.date).getTime(); // a.date를 Date 객체로 변환
            const dateB = new Date(b.date).getTime(); // b.date를 Date 객체로 변환

            // 최신순, 오래된 순에 따라 정렬
            return sortType === 'latest' ? dateB - dateA : dateA - dateB;
        };

        let copyList = [...data];
        copyList.sort(compare);

        // 월별 및 연도별 필터링
        const year = pivotDate.getFullYear();
        const month = pivotDate.getMonth();

        copyList = copyList.filter(diary => {
            const diaryDate = new Date(diary.date);
            return diaryDate.getFullYear() === year && diaryDate.getMonth() === month; // 연도와 월을 비교
        });

        setSortedData(copyList);
    }, [data, sortType, pivotDate]); // pivotDate에 의존

    // 정렬 방식을 변경하는 함수
    const onChangeSortType = (e) => setSortType(e.target.value);

    // 새 다이어리 작성 페이지로 이동하는 함수
    const onClickNew = () => navigate('/diary/new');

    return (
        <div className="DiaryList">
            <div className="menu_wrapper">
                <div className="left_col">
                    {/* 정렬 옵션 */}
                    <select value={sortType} onChange={onChangeSortType}>
                        {sortOptionList.map((option, idx) => (
                            <option key={idx} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="right_col">
                    <Button text="새 다이어리 쓰기" onClick={onClickNew} />
                </div>
            </div>
            <div className="list_wrapper">
                {sortedData.length > 0 ? (
                    sortedData.map(it => (
                        <DiaryItem key={it.id} id={it.id} title={it.title} date={it.date} isDeleted={it.isDeleted} />
                    ))
                ) : (
                    <p>작성된 다이어리가 없습니다. 새 다이어리를 작성해보세요!</p>
                )}
            </div>
        </div>
    );
};

export default DiaryList;


// import React, { useState, useEffect } from 'react';
// import './DiaryList.css';
// import Button from './Button';
// import { useNavigate } from 'react-router-dom';
// import DiaryItem from './DiaryItem';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, onValue } from 'firebase/database'; // Firebase에서 onValue 함수 사용
//
// const sortOptionList = [
//     { value: 'latest', name: '최신 작성순' },
//     { value: 'oldest', name: '오래된 작성순' },
// ];
//
// const DiaryList = ({ onDelete }) => {
//     const [sortType, setSortType] = useState('latest');
//     const [data, setData] = useState([]);
//     const [sortedData, setSortedData] = useState([]);
//     const [selectedMonth, setSelectedMonth] = useState(''); // 선택된 월 상태
//     const navigate = useNavigate();
//
//     // Firebase에서 데이터를 실시간으로 가져오기
//     useEffect(() => {
//         const userId = auth.currentUser.uid;
//         const diariesRef = ref(db, `diaries/${userId}`);
//
//         const unsubscribe = onValue(diariesRef, (snapshot) => {
//             const fetchedData = [];
//             snapshot.forEach(childSnapshot => {
//                 fetchedData.push({ id: childSnapshot.key, ...childSnapshot.val() });
//             });
//             setData(fetchedData);
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//     // 정렬된 데이터를 설정하는 useEffect
//     useEffect(() => {
//         const compare = (a, b) => {
//             const dateA = new Date(a.date).getTime(); // a.date를 Date 객체로 변환
//             const dateB = new Date(b.date).getTime(); // b.date를 Date 객체로 변환
//
//             // 최신순, 오래된 순에 따라 정렬
//             return sortType === 'latest' ? dateB - dateA : dateA - dateB;
//         };
//
//         let copyList = [...data];
//         copyList.sort(compare);
//
//         // 월별 필터링
//         if (selectedMonth !== '') {
//             copyList = copyList.filter(diary => {
//                 const diaryMonth = new Date(diary.date).getMonth(); // 월 추출
//                 return diaryMonth === parseInt(selectedMonth, 10); // 선택된 월과 일치하는지 확인
//             });
//         }
//
//         setSortedData(copyList);
//     }, [data, sortType, selectedMonth]);
//
//     // 정렬 방식을 변경하는 함수
//     const onChangeSortType = (e) => setSortType(e.target.value);
//
//     // 월 필터링을 변경하는 함수
//     const onChangeMonthFilter = (e) => setSelectedMonth(e.target.value);
//
//     // 새 다이어리 작성 페이지로 이동하는 함수
//     const onClickNew = () => navigate('/diary/new');
//
//     return (
//         <div className="DiaryList">
//             <div className="menu_wrapper">
//                 <div className="left_col">
//                     {/* 정렬 옵션 */}
//                     <select value={sortType} onChange={onChangeSortType}>
//                         {sortOptionList.map((option, idx) => (
//                             <option key={idx} value={option.value}>
//                                 {option.name}
//                             </option>
//                         ))}
//                     </select>
//
//                     {/* 월 필터링 */}
//                     <select value={selectedMonth} onChange={onChangeMonthFilter}>
//                         <option value="">전체</option>
//                         {[...Array(12).keys()].map(month => (
//                             <option key={month} value={month}>
//                                 {month + 1}월
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="right_col">
//                     <Button text="새 다이어리 쓰기" onClick={onClickNew} />
//                 </div>
//             </div>
//             <div className="list_wrapper">
//                 {sortedData.length > 0 ? (
//                     sortedData.map(it => (
//                         <DiaryItem key={it.id} id={it.id} title={it.title} date={it.date} isDeleted={it.isDeleted} />
//                     ))
//                 ) : (
//                     <p>작성된 다이어리가 없습니다. 새 다이어리를 작성해보세요!</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default DiaryList;


// import React, { useState, useEffect } from 'react';
// import './DiaryList.css';
// import Button from './Button';
// import { useNavigate } from 'react-router-dom';
// import DiaryItem from './DiaryItem';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, onValue } from 'firebase/database'; // Firebase에서 onValue 함수 사용
//
// const sortOptionList = [
//     { value: 'latest', name: '최신 작성순' },
//     { value: 'oldest', name: '오래된 작성순' },
// ];
//
// const DiaryList = ({ onDelete }) => {
//     const [sortType, setSortType] = useState('latest');
//     const [data, setData] = useState([]);
//     const [sortedData, setSortedData] = useState([]);
//     const navigate = useNavigate();
//
//     // Firebase에서 데이터를 실시간으로 가져오기
//     useEffect(() => {
//         const userId = auth.currentUser.uid;
//         const diariesRef = ref(db, `diaries/${userId}`);
//
//         const unsubscribe = onValue(diariesRef, (snapshot) => {
//             const fetchedData = [];
//             snapshot.forEach(childSnapshot => {
//                 fetchedData.push({ id: childSnapshot.key, ...childSnapshot.val() });
//             });
//             setData(fetchedData);
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//     // 정렬된 데이터를 설정하는 useEffect
//     useEffect(() => {
//         const compare = (a, b) => {
//             const dateA = new Date(a.date).getTime(); // a.date를 Date 객체로 변환
//             const dateB = new Date(b.date).getTime(); // b.date를 Date 객체로 변환
//
//             // 최신순, 오래된 순에 따라 정렬
//             return sortType === 'latest' ? dateB - dateA : dateA - dateB;
//         };
//
//         const copyList = [...data];
//         copyList.sort(compare);
//         setSortedData(copyList);
//     }, [data, sortType]);
//
//     // 정렬 방식을 변경하는 함수
//     const onChangeSortType = (e) => setSortType(e.target.value);
//
//     // 새 다이어리 작성 페이지로 이동하는 함수
//     const onClickNew = () => navigate('/diary/new');
//
//     return (
//         <div className="DiaryList">
//             <div className="menu_wrapper">
//                 <div className="left_col">
//                     <select value={sortType} onChange={onChangeSortType}>
//                         {sortOptionList.map((option, idx) => (
//                             <option key={idx} value={option.value}>
//                                 {option.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="right_col">
//                     <Button text="새 다이어리 쓰기" onClick={onClickNew} />
//                 </div>
//             </div>
//             <div className="list_wrapper">
//                 {sortedData.length > 0 ? (
//                     sortedData.map(it => (
//                         <DiaryItem key={it.id} id={it.id} title={it.title} date={it.date} isDeleted={it.isDeleted} />
//                     ))
//                 ) : (
//                     <p>작성된 다이어리가 없습니다. 새 다이어리를 작성해보세요!</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default DiaryList;


// import React, { useState, useEffect } from 'react';
// import './DiaryList.css';
// import Button from './Button';
// import { useNavigate } from 'react-router-dom';
// import DiaryItem from './DiaryItem';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, onValue } from 'firebase/database'; // Firebase에서 onValue 함수 사용
//
// const sortOptionList = [
//     { value: 'latest', name: '최신 작성순' },
//     { value: 'oldest', name: '오래된 작성순' },
// ];
//
// const DiaryList = ({ onDelete }) => {
//     const [sortType, setSortType] = useState('latest');
//     const [data, setData] = useState([]);
//     const [sortedData, setSortedData] = useState([]);
//     const navigate = useNavigate();
//
//     // Firebase에서 데이터를 실시간으로 가져오기
//     useEffect(() => {
//         const userId = auth.currentUser.uid;
//         const diariesRef = ref(db, `diaries/${userId}`);
//
//         const unsubscribe = onValue(diariesRef, (snapshot) => {
//             const fetchedData = [];
//             snapshot.forEach(childSnapshot => {
//                 fetchedData.push({ id: childSnapshot.key, ...childSnapshot.val() });
//             });
//             setData(fetchedData);
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//     // 정렬된 데이터를 설정하는 useEffect
//     useEffect(() => {
//         const compare = (a, b) => {
//             return sortType === 'latest' ? Number(b.date) - Number(a.date) : Number(a.date) - Number(b.date);
//         };
//         const copyList = [...data];
//         copyList.sort(compare);
//         setSortedData(copyList);
//     }, [data, sortType]);
//
//     // 정렬 방식을 변경하는 함수
//     const onChangeSortType = (e) => setSortType(e.target.value);
//
//     // 새 다이어리 작성 페이지로 이동하는 함수
//     const onClickNew = () => navigate('/diary/new');
//
//     return (
//         <div className="DiaryList">
//             <div className="menu_wrapper">
//                 <div className="left_col">
//                     <select value={sortType} onChange={onChangeSortType}>
//                         {sortOptionList.map((option, idx) => (
//                             <option key={idx} value={option.value}>
//                                 {option.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="right_col">
//                     <Button text="새 다이어리 쓰기" onClick={onClickNew} />
//                 </div>
//             </div>
//             <div className="list_wrapper">
//                 {sortedData.length > 0 ? (
//                     sortedData.map(it => (
//                         <DiaryItem key={it.id} id={it.id} title={it.title} date={it.date} isDeleted={it.isDeleted} />
//                     ))
//                 ) : (
//                     <p>작성된 다이어리가 없습니다. 새 다이어리를 작성해보세요!</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default DiaryList;


//
//
//
//
// import React, { useState, useEffect } from 'react';
// import './DiaryList.css';
// import Button from './Button';
// import { useNavigate } from 'react-router-dom';
// import DiaryItem from './DiaryItem';
//
// const sortOptionList = [
//     { value: 'latest', name: '최신 작성순' },
//     { value: 'oldest', name: '오래된 작성순' },
// ];
//
// const DiaryList = ({ data, onDelete }) => {
//     const [sortType, setSortType] = useState('latest');
//     const [sortedData, setSortedData] = useState([]);
//     const navigate = useNavigate();
//
//     // 정렬된 데이터를 설정하는 useEffect
//     useEffect(() => {
//         const compare = (a, b) => {
//             return sortType === 'latest' ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id);
//         };
//         const copyList = [...data];
//         copyList.sort(compare);
//         setSortedData(copyList);
//     }, [data, sortType]);
//
//     // 정렬 방식을 변경하는 함수
//     const onChangeSortType = (e) => setSortType(e.target.value);
//
//     // 새 다이어리 작성 페이지로 이동하는 함수
//     const onClickNew = () => navigate('/diary/new');
//
//     return (
//         <div className="DiaryList">
//             <div className="menu_wrapper">
//                 <div className="left_col">
//                     <select value={sortType} onChange={onChangeSortType}>
//                         {sortOptionList.map((option, idx) => (
//                             <option key={idx} value={option.value}>
//                                 {option.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div className="right_col">
//                     <Button text="새 다이어리 쓰기" onClick={onClickNew} />
//                 </div>
//             </div>
//             <div className="list_wrapper">
//                 {sortedData.length > 0 ? (
//                     sortedData.map(it => (
//                         <DiaryItem key={it.id} id={it.id} title={it.title} date={it.date} isDeleted={it.isDeleted} />
//                     ))
//                 ) : (
//                     <p>작성된 다이어리가 없습니다. 새 다이어리를 작성해보세요!</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default DiaryList;
//
