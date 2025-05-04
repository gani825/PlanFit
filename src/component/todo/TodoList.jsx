import TodoItem from "./TodoItem";

function TodoList({todos, onUpdate, onDelete}) {
    return (
        <ul>
            {todos.map(it => <TodoItem key={it.id} {...it} onUpdate={onUpdate} onDelete={onDelete} />)}
        </ul>
    )
}

export default TodoList