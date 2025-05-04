

import './Editor.css';
import { useState, useEffect } from 'react';
import { getFormattedDate } from '../util';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../js/firebaseApp'; // auth 임포트 추가
import { ref, set, push } from 'firebase/database'; // push를 사용하기 위해 import

const Editor = ({ initData, onSubmit }) => {
    const navigate = useNavigate();

    const [state, setState] = useState({
        date: getFormattedDate(new Date()),
        title: '',
        content: '',
    });

    useEffect(() => {
        if (initData) {
            setState({
                ...initData,
                date: getFormattedDate(new Date(initData.date)),
            });
        }
    }, [initData]);

    const handleChange = (field) => (e) => {
        setState({ ...state, [field]: e.target.value });
    };

    const handleSubmit = async () => {
        // Firebase에서 사용자의 고유 경로 가져오기
        const userId = auth.currentUser.uid; // 현재 사용자 ID
        const diaryRef = ref(db, `diaries/${userId}`); // Firebase 경로

        if (initData) {
            // initData가 있으면 수정하는 작업
            const diaryIdRef = ref(db, `diaries/${userId}/${initData.id}`); // 기존 데이터의 ID로 수정
            await set(diaryIdRef, {
                ...state,
                date: new Date(state.date).getTime(), // 날짜는 timestamp로 저장
            });
        } else {
            // 새 데이터일 경우 push로 고유 ID 생성
            const newDiaryRef = push(diaryRef); // push로 새로 추가하고 고유 ID 생성
            const newDiaryId = newDiaryRef.key; // Firebase가 자동으로 생성한 고유 ID

            // 새로 생성된 ID를 포함하여 데이터를 저장
            await set(newDiaryRef, {
                id: newDiaryId, // ID를 데이터에 포함
                ...state,
                date: new Date(state.date).getTime(), // 날짜는 timestamp로 저장
            });
        }

        navigate('/diary'); // 작성 후 다이어리 홈으로 이동
    };

    const handleOnGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="Editor">
            <div className="editor_section">
                <h4>오늘의 날짜</h4>
                <input type="date" value={state.date} className="widthSet" onChange={handleChange('date')} />
            </div>
            <div className="editor_section">
                <h4>오늘의 일기</h4>
                <input type="text" placeholder="제목을 입력해주세요." className="borderSet" value={state.title} onChange={handleChange('title')} />
                <textarea placeholder="내용을 입력해주세요." className="borderSet" value={state.content} onChange={handleChange('content')} />
            </div>
            <div className="editor_section bottom_section">
                <Button className="buttonShape" text="취소하기" onClick={handleOnGoBack} />
                <Button className="buttonShape" text={initData ? "수정 완료" : "작성 완료"} type="positive" onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default Editor;


//
//
//
//
// import './Editor.css';
// import { useState, useEffect } from 'react';
// import { getFormattedDate } from '../util';
// import Button from './Button';
// import { useNavigate } from 'react-router-dom';
// import { db, auth } from '../js/firebaseApp'; // auth 임포트 추가
// import { ref, set, push } from 'firebase/database'; // push를 사용하기 위해 import
//
// const Editor = ({ initData, onSubmit }) => {
//     const navigate = useNavigate();
//
//     const [state, setState] = useState({
//         date: getFormattedDate(new Date()),
//         title: '',
//         content: '',
//     });
//
//     useEffect(() => {
//         if (initData) {
//             setState({
//                 ...initData,
//                 date: getFormattedDate(new Date(initData.date)),
//             });
//         }
//     }, [initData]);
//
//     const handleChange = (field) => (e) => {
//         setState({ ...state, [field]: e.target.value });
//     };
//
//     const handleSubmit = async () => {
//         // Firebase에서 사용자의 고유 경로 가져오기
//         const diaryRef = ref(db, 'diaries/' + auth.currentUser.uid); // Firebase 경로
//
//         if (initData) {
//             // initData가 있으면 수정하는 작업
//             const diaryIdRef = ref(diaryRef, initData.id); // 기존 데이터의 ID로 수정
//             await set(diaryIdRef, {
//                 ...state,
//                 date: new Date(state.date).getTime(), // 날짜는 timestamp로 저장
//             });
//         } else {
//             // 새 데이터일 경우 push로 고유 ID 생성
//             const newDiaryRef = push(diaryRef); // push로 새로 추가하고 고유 ID 생성
//             const newDiaryId = newDiaryRef.key; // Firebase가 자동으로 생성한 고유 ID
//
//             // 새로 생성된 ID를 포함하여 데이터를 저장
//             await set(newDiaryRef, {
//                 id: newDiaryId, // ID를 데이터에 포함
//                 ...state,
//                 date: new Date(state.date).getTime(), // 날짜는 timestamp로 저장
//             });
//         }
//
//         navigate('/diary'); // 작성 후 다이어리 홈으로 이동
//     };
//
//     const handleOnGoBack = () => {
//         navigate(-1);
//     };
//
//     return (
//         <div className="Editor">
//             <div className="editor_section">
//                 <h4>오늘의 날짜</h4>
//                 <input type="date" value={state.date} onChange={handleChange('date')} />
//             </div>
//             <div className="editor_section">
//                 <h4>오늘의 일기</h4>
//                 <input type="text" placeholder="제목을 입력해주세요." value={state.title} onChange={handleChange('title')} />
//                 <textarea placeholder="내용을 입력해주세요." value={state.content} onChange={handleChange('content')} />
//             </div>
//             <div className="editor_section bottom_section">
//                 <Button text="취소하기" onClick={handleOnGoBack} />
//                 <Button text={initData ? "수정 완료" : "작성 완료"} type="positive" onClick={handleSubmit} />
//             </div>
//         </div>
//     );
// };
//
// export default Editor;
