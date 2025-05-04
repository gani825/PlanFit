import './DiaryItem.css';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../util';
import { useContext } from 'react';
import { DiaryDispatchContext } from '../pages/Diary';
import { db } from '../js/firebaseApp'; // Firebase import
import { ref, remove } from 'firebase/database'; // Firebase에서 remove 함수 사용

const DiaryItem = ({ id, title = '제목 없음', date, isDeleted }) => {
    const navigate = useNavigate();
    const { onDelete } = useContext(DiaryDispatchContext);

    if (isDeleted) {
        return null; // 삭제된 항목은 렌더링하지 않음
    }

    // 상세보기 페이지로 이동
    const goDetail = () => {
        navigate(`/diary/${id}`);
    };

    // 수정 페이지로 이동
    const goToEdit = (e) => {
        e.stopPropagation();  // 부모 요소로 이벤트 전파를 막음
        navigate(`/diary/edit/${id}`); // 수정 페이지로 이동
    };

    const handleDelete = async (e) => {
        e.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 방지
        if (window.confirm('정말 삭제하시겠습니까?')) {
            // Firebase에서 해당 다이어리 삭제
            const diaryRef = ref(db, `diaries/${id}`); // Firebase에서 해당 ID의 다이어리 레퍼런스 가져오기
            try {
                await remove(diaryRef); // Firebase에서 삭제하기
                onDelete(id);  // 로컬 상태에서 삭제 상태로 변경
                alert("다이어리가 삭제되었습니다.");
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제에 실패했습니다.");
            }
        }
    };

    return (
        <div className="DiaryItem" onClick={goDetail}>
            <div className="info_section">
                <div className="date_wrapper">
                    {formatDate(new Date(parseInt(date)))}
                </div>
                <div className="title_wrapper">
                    <strong>{title}</strong>
                </div>
            </div>
            <div className="bottom_section">
                <span className="edit_text" onClick={goToEdit}>
                    수정&nbsp; | &nbsp;
                </span>
                <span className="delete_text" onClick={handleDelete}>
                    삭제
                </span>
            </div>
        </div>
    );
};

export default DiaryItem;


// import './DiaryItem.css';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../util';
// import { useContext } from 'react';
// import { DiaryDispatchContext } from '../pages/Diary';
// import { db } from '../js/firebaseApp'; // Firebase import
// import { ref, remove } from 'firebase/database'; // Firebase에서 remove 함수 사용
//
// const DiaryItem = ({ id, title = '제목 없음', date, isDeleted }) => {
//     const navigate = useNavigate();
//     const { onDelete } = useContext(DiaryDispatchContext);
//
//     if (isDeleted) {
//         return null; // 삭제된 항목은 렌더링하지 않음
//     }
//
//     const goDetail = () => {
//         navigate(`/diary/${id}`);
//     };
//
//     const handleDelete = async (e) => {
//         e.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 방지
//         if (window.confirm('정말 삭제하시겠습니까?')) {
//             // Firebase에서 해당 다이어리 삭제
//             const diaryRef = ref(db, `diaries/${id}`); // Firebase에서 해당 ID의 다이어리 레퍼런스 가져오기
//             try {
//                 await remove(diaryRef); // Firebase에서 삭제하기
//                 onDelete(id);  // 로컬 상태에서 삭제 상태로 변경
//                 alert("다이어리가 삭제되었습니다.");
//             } catch (error) {
//                 console.error("삭제 실패:", error);
//                 alert("삭제에 실패했습니다.");
//             }
//         }
//     };
//
//     const goToEdit = () => {
//         navigate(`/diary/edit/${id}`); // 수정 페이지로 이동 (ID 전달)
//     };
//
//
//
//     return (
//         <div className="DiaryItem" onClick={goDetail}>
//             <div className="info_section">
//                 <div className="date_wrapper">
//                     {formatDate(new Date(parseInt(date)))}
//                 </div>
//                 <div className="title_wrapper">
//                     <strong>{title}</strong>
//                 </div>
//             </div>
//             <div className="bottom_section">
//                  <span className="edit_text" onClick={goToEdit}>
//                     수정&nbsp; | &nbsp;
//                 </span>
//                 <span className="delete_text" onClick={handleDelete}>
//                     삭제
//                 </span>
//             </div>
//         </div>
//     );
// };
//
// export default DiaryItem;


// import './DiaryItem.css';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../util';
// import { useContext } from 'react';
// import { DiaryDispatchContext } from '../pages/Diary';
// import { db } from '../js/firebaseApp'; // Firebase import
// import { ref, remove } from 'firebase/database'; // Firebase에서 remove 함수 사용
//
// const DiaryItem = ({ id, title = '제목 없음', date, isDeleted }) => {
//     const navigate = useNavigate();
//     const { onDelete } = useContext(DiaryDispatchContext);
//
//     if (isDeleted) {
//         return null; // 삭제된 항목은 렌더링하지 않음
//     }
//
//     const goDetail = () => {
//         navigate(`/diary/${id}`);
//     };
//
//     const handleDelete = async (e) => {
//         e.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 방지
//         if (window.confirm('정말 삭제하시겠습니까?')) {
//             // Firebase에서 해당 다이어리 삭제
//             const diaryRef = ref(db, `diaries/${id}`); // Firebase에서 해당 ID의 다이어리 레퍼런스 가져오기
//             try {
//                 await remove(diaryRef); // Firebase에서 삭제하기
//                 onDelete(id);  // 로컬 상태에서 삭제 상태로 변경
//                 alert("다이어리가 삭제되었습니다.");
//             } catch (error) {
//                 console.error("삭제 실패:", error);
//                 alert("삭제에 실패했습니다.");
//             }
//         }
//     };
//
//     return (
//         <div className="DiaryItem" onClick={goDetail}>
//             <div className="info_section">
//                 <div className="date_wrapper">
//                     {formatDate(new Date(parseInt(date)))}
//                 </div>
//                 <div className="title_wrapper">
//                     <strong>{title}</strong>
//                 </div>
//             </div>
//             <div className="bottom_section">
//                 <span className="delete_text" onClick={handleDelete}>
//                     삭제
//                 </span>
//             </div>
//         </div>
//     );
// };
//
// export default DiaryItem;

// import './DiaryItem.css';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../util';
// import { useContext } from 'react';
// import { DiaryDispatchContext } from '../pages/Diary';
// import { db } from '../js/firebaseApp'; // Firebase import
// import { ref, remove } from 'firebase/database'; // Firebase에서 remove 함수 사용
//
// const DiaryItem = ({ id, title = '제목 없음', date, isDeleted }) => {
//     const navigate = useNavigate();
//     const { onDelete } = useContext(DiaryDispatchContext);
//
//     if (isDeleted) {
//         return null; // 삭제된 항목은 렌더링하지 않음
//     }
//
//     const goDetail = () => {
//         navigate(`/diary/${id}`);
//     };
//
//     const handleDelete = async (e) => {
//         e.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 방지
//         if (window.confirm('정말 삭제하시겠습니까?')) {
//             // Firebase에서 해당 다이어리 삭제
//             const diaryRef = ref(db, `diaries/${id}`); // Firebase에서 해당 ID의 다이어리 레퍼런스 가져오기
//             try {
//                 await remove(diaryRef); // Firebase에서 삭제하기
//                 onDelete(id);  // 로컬 상태에서 삭제 상태로 변경
//                 alert("다이어리가 삭제되었습니다.");
//             } catch (error) {
//                 console.error("삭제 실패:", error);
//                 alert("삭제에 실패했습니다.");
//             }
//         }
//     };
//
//     return (
//         <div className="DiaryItem" onClick={goDetail}>
//             <div className="info_section">
//                 <div className="date_wrapper">
//                     {formatDate(new Date(parseInt(date)))}
//                 </div>
//                 <div className="title_wrapper">
//                     <strong>{title}</strong>
//                 </div>
//             </div>
//             <div className="bottom_section">
//                 <span className="delete_text" onClick={handleDelete}>
//                     삭제
//                 </span>
//             </div>
//         </div>
//     );
// };
//
// export default DiaryItem;
//
