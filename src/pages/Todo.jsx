import TodoEditor from "../component/todo/TodoEditor";
import TodoList from "../component/todo/TodoList";
import {useContext, useEffect, useState} from "react";
import app from "../js/firebaseApp";
import {getDatabase, ref, query, orderByChild, onValue,
    serverTimestamp, push, remove, update, equalTo
} from "firebase/database";
import {AuthContext} from "../App";


const database = getDatabase(app);
const Todo = () => {
    const [todos, setTodos] = useState([]);
    const todosRef = ref(database, 'todoList');
    const { user } = useContext(AuthContext);
    // 목록 조회
    useEffect(() => {
        const todoQuery = query(todosRef, orderByChild("uid"), equalTo(user.uid));
        const unsubscribe = onValue(todoQuery, (snapshot) => {
            const todosArray = [];
            snapshot.forEach((item) => {
                todosArray.push({
                    id: item.key,
                    ...item.val(),
                });
            });
            console.log(todosArray);
            setTodos(todosArray.reverse());
        });

        return () => unsubscribe();
    }, []);

    // 등록
    const onCreate = async (text) => {
        if (text.trim()) {
            const newTodo = {
                uid : user.uid,
                text: text,
                completed: false,
                addTime: serverTimestamp(),
            };
            await push(todosRef, newTodo);
        }
    };

    // 삭제
    const onDelete = async targetId => {
        await remove(ref(database, `todoList/${targetId}`));
    }

    // 완료 / 미완료 수정
    const onUpdate = async (targetId, completed) => {
        await update(ref(database, `todoList/${targetId}`), { completed });
    }

    return (
        <div className={'Todo'}>
            <h2>Todo 페이지 입니다.</h2>
            <TodoEditor onCreate={onCreate} />
            <TodoList todos={todos} onDelete={onDelete} onUpdate={onUpdate}/>
        </div>
    )
}

export default Todo;