import React, { useState, useEffect, useMemo } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Table, Nav } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import { TodoType } from '../../types';

const ListTodo = () => {
    const {todos, newAddedTodos, setNewAddedTodos, addTodo, editedTodos, deletedTodos} = TodoContext.useContainer();
    const [todo, setTodo] = useState("")
    const [displayTodo, setDisplayTodo] = useState<TodoType[]>([])
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
                <Form onSubmit={onSubmit}>
                    <Form.Control type="text" placeholder="Add Todo"value={todo} onChange={handleOnChange} />
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