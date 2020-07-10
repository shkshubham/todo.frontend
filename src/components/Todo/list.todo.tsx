import React, { useState } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Table } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';

const ListTodo = () => {
    const {todos, newAddedTodos, setNewAddedTodos, addTodo, editedTodos, deletedTodos} = TodoContext.useContainer();
    const [todo, setTodo] = useState("")
    const renderTodo = (todoList: any[]) => {
        return todoList.map((todo, index) => {
            return (
                <ShowTodo loading={(
                    editedTodos.hasOwnProperty(todo.id) ||
                    deletedTodos.hasOwnProperty(todo.id)

                )} todo={todo} key={`todo_${todo.id}`} />
            );
        })
    }

    const handleOnChange = (e: any) => {
        setTodo(e.target.value)
    }

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        if(todo.length) {
            setTodo("")
            setNewAddedTodos([...newAddedTodos, {title: todo, completed: false}])
            addTodo({
                title: todo,
                completed: false
            });
        }
    }

    return (
        <>
            <Form onSubmit={onSubmit}>
                <Form.Control type="text" placeholder="Add Todo"value={todo} onChange={handleOnChange} />
            </Form>
            <Table responsive>
                <tbody>
                    {renderTodo(todos)}
                    {renderTodo(newAddedTodos)}
                </tbody>
            </Table>
        </>
    )
}

export default ListTodo;