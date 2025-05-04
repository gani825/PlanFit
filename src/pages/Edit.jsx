import { useNavigate, useParams } from 'react-router-dom';
import useDiary from '../hooks/useDiary';
import Button from '../component/Button';
import Editor from '../component/Editor';
import { useContext } from 'react';
import { DiaryDispatchContext } from './Diary';
import Header from '../component/Header';
import './Edit.css'

const Edit = () => {
    const { id } = useParams();
    const data = useDiary(id);
    const navigate = useNavigate();
    const { onUpdate, onDelete } = useContext(DiaryDispatchContext);

    const goBack = () => {
        navigate(-1);
    };

    const onClickDelete = () => {
        if (window.confirm('다이어리를 정말 삭제할까요? 다시 복구되지 않아요!')) {
            onDelete(id);
            navigate('/diary', { replace: true });
        }
    };

    const onSubmit = (date, title, content) => {
        onUpdate(id, date, title, content);
        navigate('/diary', { replace: true });
    };

    if (!data) {
        return <div>다이어리를 불러오고 있습니다...</div>;
    }

    return (
        <div>
            <Header
                title="다이어리 수정하기"
                leftChild={<Button text="뒤로가기" onClick={goBack} className="backButton"/>}
                rightChild={<Button text="삭제하기" type="negative" onClick={onClickDelete}/>}
            />
            <Editor initData={data} onSubmit={onSubmit}/>
        </div>
    );
};

export default Edit;
