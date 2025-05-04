const TodoItem = ({id, completed, text, onUpdate, onDelete}) => {
    return (
        <li key={id}>
            <input
                type="checkbox"
                checked={completed}
                onChange={(e) => onUpdate(id, e.target.checked)}
            />
            <span style={{textDecoration: completed ? "line-through" : "none"}}>
              {text}
            </span>
            <button onClick={() => onDelete(id)}>삭제</button>
        </li>
    )
}

export default TodoItem