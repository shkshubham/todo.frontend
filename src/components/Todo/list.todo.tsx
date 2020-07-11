import React, { useState, useEffect, useRef } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Table, Nav, Col, Row } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import { v4 as uuid4 } from 'uuid';
import Loader from '../includes/Loader/loader';

const ListTodo = () => {
    const {todos, newAddedTodos, addTodo, editedTodos, service, pagination, setTodos, setPagination, deletedTodos, addedTodos, completedTodos, isLoadingTodos: {loaded, error}, setIsLoadingTodos} = TodoContext.useContainer();
    const [todo, setTodo] = useState("")
    const [currentSelectedNav, setCurrentSelectedNav] = useState("todos")
    const [lastTodoElement, setLastTodoElement] = useState<HTMLTableRowElement | null>(null)
    const localTodosAndPagination = useRef({
        todos,
        pagination,
        loading: false
    })
    
    const observer =  React.useRef(
        new IntersectionObserver(
          entries => {
            const first = entries[0];
            const {loading, todos, pagination} = localTodosAndPagination.current;
            if (!loading && first.isIntersecting && todos.length < pagination.total) {
                setIsLoadingTodos({loaded: false, error: false})
                localTodosAndPagination.current.loading = true
                service.get(null, todos.length).then(({data, limit, skip, total}) => {
                    localTodosAndPagination.current.loading = false
                    setIsLoadingTodos({loaded: true, error: false})
                    setPagination({limit, skip, total})
                    setTodos((previousTodo) => [...previousTodo, ...data])
                }).catch(err => {
                    setIsLoadingTodos({loaded: true, error: true})
                })
            }
          },
          { threshold: 1 }
        )
    )

    useEffect(() => {
        localTodosAndPagination.current.todos = todos;
    }, [todos])

    useEffect(() => {
        localTodosAndPagination.current.pagination = pagination;
    }, [pagination])

    const renderTodo = (todoList: any[], type: string) => {
        return todoList.map((todo) => {
            return (
                    <ShowTodo 
                        setLastTodoElement={setLastTodoElement}
                        loading={(
                        editedTodos.hasOwnProperty(todo.id) ||
                        deletedTodos.hasOwnProperty(todo.id) ||
                        (addedTodos.hasOwnProperty(todo.title) && !todo.id) ||
                        completedTodos.hasOwnProperty(todo.id)

                    )} todo={todo} key={todo.id ? `todo_${todo.id}`: `inactive_todo_${uuid4()}`} />
            );
        })
    }

    useEffect(() => {
        const currentElement = lastTodoElement;
        const currentObserver = observer.current;
        if (currentElement) {
            currentObserver.observe(currentElement);
        }
        return () => {
          if (currentElement) {
            currentObserver.unobserve(currentElement);
          }
        };
    }, [lastTodoElement])

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

    const setQuery = (query: any, category: string) => {
        switch(category) {
            case "active":
                query.completed = false
                break;
            case "completed":
                query.completed = true
                break;
            default: 
                return;
        }
    }

    const onSelectTodoTab = (category: string) => {
        setCurrentSelectedNav(category)
        const query = {}
        setQuery(query, category)
        setIsLoadingTodos({loaded: false, error: false})
        service.get(query).then(({data, limit, skip, total}) => {
            setIsLoadingTodos({loaded: true, error: false})
            setPagination({limit, skip, total})
            setTodos(data)
        }).catch(err => {
            setIsLoadingTodos({loaded: true, error: true})
        })
    }

    const renderMessage = (msg: string) => {
        return  <tr className="text-center">
            <td>
                <h4>{msg}</h4>
            </td>
        </tr>
    }

    return (
        <>
            <div className="sticky-top py-4" id="top-menu">
                <Form onSubmit={onSubmitAddTask}>
                    <Form.Control type="text" placeholder="Add Task"value={todo} onChange={handleOnChange} />
                </Form>
                <Row>
                    <Col xs={12}>
                       <h6 className="my-3"> Showing todo: <b>{todos.length}/{pagination.total}</b></h6>
                    </Col>
                </Row>
                <Nav className="my-4" justify onSelect={onSelectTodoTab} variant="pills" defaultActiveKey="todos">
                    <Nav.Item>
                        <Nav.Link eventKey="todos">All</Nav.Link>
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
                    {
                        (loaded || todos.length)
                        ? (todos.length
                            ? <>
                                {renderTodo(todos, "active")}
                                {renderTodo(newAddedTodos, "inactive")}
                            </>
                            : (!error && renderMessage(`No ${currentSelectedNav} todo found`))
                        ): null
                    }
                        {
                            !loaded ? <td><Loader /></td> : (error && renderMessage(`Something went wrong`)) 
                        }
                </tbody>
            </Table>
        </>
    )
}

export default ListTodo;