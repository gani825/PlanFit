// // New.js
// import { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Editor from '../component/Editor';
// import { DiaryDispatchContext } from './Diary';
// import { db, auth } from '../js/firebaseApp'; // Firebase import
// import { ref, set, push } from 'firebase/database'; // Firebase에서 set, push 사용
//
// const New = () => {
//     const { onCreate } = useContext(DiaryDispatchContext);
//     const navigate = useNavigate();
//
//     const handleCreate = async (date, title, content) => {
//         try {
//             // date 값이 유효한지 확인하고, 유효하지 않으면 현재 날짜로 설정
//             const validDate = date ? new Date(date) : new Date();
//             const timestamp = validDate.getTime();
//
//             // 유효한 날짜인지 확인
//             if (isNaN(timestamp)) {
//                 console.error('Invalid date:', date); // 유효하지 않은 날짜에 대한 로그
//                 return; // 유효하지 않은 날짜일 경우 더 이상 진행하지 않음
//             }
//
//             const userUid = auth.currentUser.uid; // 로그인한 사용자의 UID
//             const diaryRef = ref(db, `diaries/${userUid}`); // Firebase 경로
//
//             const newDiary = {
//                 date: timestamp,  // timestamp로 날짜를 저장
//                 title: title || '제목 없음',  // 제목이 없으면 기본값 사용
//                 content: content || '',  // 내용이 없으면 기본값 사용
//                 isDeleted: false,  // 삭제되지 않은 상태
//             };
//
//             // 새로운 다이어리 항목 추가 (push 사용)
//             const newDiaryRef = push(diaryRef);
//             await set(newDiaryRef, newDiary); // Firebase에 다이어리 추가
//
//             onCreate(newDiary);  // 상태 업데이트
//             navigate('/diary');  // 다이어리 목록 페이지로 이동
//         } catch (error) {
//             console.error('새 다이어리 생성 실패:', error);
//         }
//     };
//
//     return (
//         <div>
//             <Editor onSubmit={handleCreate} />
//         </div>
//     );
// };
//
// export default New;


import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '../component/Editor';
import { DiaryDispatchContext } from './Diary';

const New = () => {
    const { onCreate } = useContext(DiaryDispatchContext);
    const navigate = useNavigate();

    const handleCreate = (date, title, content) => {
        onCreate(date, title, content);
        navigate('/diary'); // 다이어리 홈으로 이동
    };

    return (
        <div>
            <Editor onSubmit={handleCreate} />
        </div>
    );
};

export default New;
