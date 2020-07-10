import React, { useState, useEffect, useMemo } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Table, Nav } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import { TodoType } from '../../types';
import { v4 as uuid4 } from 'uuid';

const ListTodo = () => {
    const {todos, newAddedTodos, addTodo, editedTodos, deletedTodos, addedTodos, completedTodos} = TodoContext.useContainer();
    const [todo, setTodo] = useState("")
    const [displayTodo, setDisplayTodo] = useState<TodoType[]>([])
    const renderTodo = (todoList: any[]) => {
        console.log(completedTodos)
        return todoList.map((todo) => {
            return (
                <ShowTodo loading={(
                    editedTodos.hasOwnProperty(todo.id) ||
                    deletedTodos.hasOwnProperty(todo.id) ||
                    (addedTodos.hasOwnProperty(todo.title) && !todo.id) ||
                    completedTodos.hasOwnProperty(todo.id)

                )} todo={todo} key={todo.id ? `todo_${todo.id}`: `inactive_todo_${uuid4()}`} />
            );
        })
    }

    const handleOnChange = (e: any) => {
        setTodo(e.target.value)
    }

    const onSubmitAddTask = (e: React.SyntheticEvent) => {
        e.preventDefault()
        if(todo.length) {
            setTodo("")
            addTodo({
                title: todo,
                completed: false
            });
        }
    }

    const getFilteredTodos = useMemo(() => (completed: boolean) => {
        return todos.filter((todo) => todo.completed === completed)
    }, [todos])

    const onSelectTodoTab = (category: string) => {
        let filteredTodos = []
        switch(category) {
            case "all":
                filteredTodos = todos;
                break;
            case "active":
                filteredTodos = getFilteredTodos(false)
                break;
            case "completed":
                filteredTodos = getFilteredTodos(true)
                break;
            default: 
                return
        }
        setDisplayTodo(filteredTodos)
    }

    useEffect(() => {
        setDisplayTodo(todos)
    }, [todos, setDisplayTodo])

    return (
        <>
            <div className="sticky-top py-4" id="top-menu">
                <Form onSubmit={onSubmitAddTask}>
                    <Form.Control type="text" placeholder="Add Task"value={todo} onChange={handleOnChange} />
                </Form>
                <Nav className="my-4" justify onSelect={onSelectTodoTab} variant="pills" defaultActiveKey="all">
                    <Nav.Item>
                        <Nav.Link eventKey="all">All</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="active">Active</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="completed">Completed</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <Table className="todo-table" responsive>
                <tbody>
                    {renderTodo(displayTodo)}
                    {renderTodo(newAddedTodos)}
                </tbody>
            </Table>
        </>
    )
}

export default ListTodo;