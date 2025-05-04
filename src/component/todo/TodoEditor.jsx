import {useState} from "react";

function TodoEditor({onCreate}) {
    const [todo, setTodo] = useState('')

    return (
        <>
            <label>
                <input
                    type="text"
                    value={todo}
                    onChange={e => setTodo(e.target.value)}
                    placeholder=""
                />
            </label>
            <button onClick={() => { onCreate(todo); setTodo('');}}>Add To-Do</button>
        </>
    )
}

export default TodoEditor