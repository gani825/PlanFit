import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {DiaryStateContext} from "../pages/Diary";

const useDiary = id => {
    const data = useContext(DiaryStateContext);
    const [diary, setDiary] = useState()
    const navigate = useNavigate();

    useEffect(() => {
        const matchDiary = data.find(it => String(it.id) === String(id))
        if (matchDiary) {
            setDiary(matchDiary)
        } else {
            alert('해당 다이어리가 삭제되었습니다.')
            navigate('/diary', {replace: true})
        }
    }, [data, id])

    return diary
}

export default useDiary