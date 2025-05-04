import { useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { DiaryStateContext } from './Diary';
import { formatDate } from '../util';
import Button from '../component/Button';
import Viewer from '../component/Viewer';
import Header from "../component/Header";
import './DiaryDiary.css';

const DiaryDiary = () => {
    const { id } = useParams();
    const data = useContext(DiaryStateContext);
    const navigate = useNavigate();

    // 데이터가 없거나, id가 존재하지 않으면 로딩 상태로 간주
    if (!data) {
        return <div>일기를 불러오고 있습니다...</div>;
    }

    const targetDiary = data.find(it => String(it.id) === String(id)); // id 비교를 문자열로 맞추어 정확히 비교

    const goBack = () => {
        navigate(-1);
    };

    const goEdit = () => {
        navigate(`/diary/edit/${id}`);
    };

    if (!targetDiary) {
        return <div>해당 일기를 찾을 수 없습니다.</div>; // targetDiary가 없을 때 처리
    }

    const { date, content } = targetDiary;
    const title = `${formatDate(new Date(Number(date)))}`;

    return (
        <div className={'diary_diary'}>
            <div className='diary_header'>
                <Header
                    title={title}
                    leftChild={<Button text="뒤로가기" onClick={goBack} />}
                    rightChild={<Button text="수정하기" onClick={goEdit} />}
                />
                <div className={'todayp'}>오늘의 기록</div>
            </div>
            <Viewer content={content} />
        </div>
    );
};

export default DiaryDiary;


// import { useNavigate, useParams } from 'react-router-dom';
// import { useContext } from 'react';
// import { DiaryStateContext } from './Diary';
// import { formatDate } from '../util';
// import Button from '../component/Button';
// import Viewer from '../component/Viewer';
// import Header from "../component/Header";
// import './DiaryDiary.css';
//
// const DiaryDiary = () => {
//     const { id } = useParams();
//     const data = useContext(DiaryStateContext);
//     const navigate = useNavigate();
//
//     const targetDiary = data.find(it => it.id === id);
//
//     const goBack = () => {
//         navigate(-1);
//     };
//
//     const goEdit = () => {
//         navigate(`/diary/edit/${id}`);
//     };
//
//     if (!targetDiary) {
//         return <div>일기를 불러오고 있습니다...</div>;
//     }
//
//     const { date, content } = targetDiary;
//     const title = `${formatDate(new Date(Number(date)))}`;
//
//     return (
//         <div className={'diary_diary'}>
//             <div className='diary_header'>
//                 <Header
//                     title={title}
//                     leftChild={<Button text="< 뒤로가기" onClick={goBack}  />}
//                     rightChild={<Button text="수정하기" onClick={goEdit}  />}
//                 />
//                 <div className={'todayp'}>오늘의 기록</div>
//             </div>
//             <Viewer content={content} />
//         </div>
//     );
// };
//
// export default DiaryDiary;
