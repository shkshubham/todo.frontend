import React, { useState, useEffect, useRef } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Table, Nav, Col, Row } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import Loader from '../includes/Loader/loader';
import { TodoType, UpdateTodoType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const ListTodo = () => {
    const {
        todos,
        newAddedTodos,
        addedTodos,
        addTodo,
        service,
        pagination,
        setTodos,
        setPagination,
        isLoadingTodos: {loaded, error},
        setIsLoadingTodos
    } = TodoContext.useContainer();
    const [todo, setTodo] = useState("")
    const [currentSelectedNav, setCurrentSelectedNav] = useState("todos")
    const [lastTodoElement, setLastTodoElement] = useState<HTMLTableRowElement | null>(null)
    const localTodosAndPagination = useRef({
        todos,
        pagination,
        loading: false
    })
    
     /**
     * Observer for pagination
     *
     * @description To do server side pagination
     * 
     * @param todo: New todo data
     * 
    */
    const observer = React.useRef(
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
                }).catch(() => {
                    setIsLoadingTodos({loaded: true, error: true})
                })
            }
          },
          { threshold: 1 }
        )
    )

    /**
     * Use effect Hook
     *
     * @description To set todos to local ref
     * 
    */
    useEffect(() => {
        localTodosAndPagination.current.todos = todos;
    }, [todos])

    /**
     * Use effect Hook
     *
     * @description To set pagination to local ref
     * 
    */
    useEffect(() => {
        localTodosAndPagination.current.pagination = pagination;
    }, [pagination])

    /**
     * Use effect Hook
     *
     * @description To observe current element using lastTodoElement
     * 
    */
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

    /**
     * Handle Add Todo Input Field
     * 
     * @description To set state on add task input field.
     *      
     * @param e: Event.
     *   
    */
    const handleAddTodoInputField = (e: any) => {
        setTodo(e.target.value)
    }

    /**
     * On Submit Add Todo
     * 
     * @description To add todo when user add todo.
     *      
     * @param e: Event.
     *   
    */
    const onSubmitAddTodo = (e: React.SyntheticEvent) => {
        e.preventDefault()
        if(todo.length) {
            setTodo("")
            addTodo({
                ref: uuidv4(),
                title: todo,
                completed: false
            });
        }
    }

    /**
     * Set Query
     * 
     * @description To render warning and error message.
     *      
     * @param query: Todo get query object.
     * @param category: (active | completed | todos).
     *   
    */
    const setQuery = (query: UpdateTodoType, category: string) => {
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

    /**
     * Render Todo
     *      
     * @description To render warning and error message.
     * 
     * @param todoList: Todo Array which have to display.
     *   
    */
    const onSelectTodoTab = (category: string) => {
        setCurrentSelectedNav(category)
        const query = {}
        setQuery(query, category)
        setIsLoadingTodos({loaded: false, error: false})
        service.get(query).then(({data, limit, skip, total}) => {
            setIsLoadingTodos({loaded: true, error: false})
            setPagination({limit, skip, total})
            setTodos(data)
        }).catch(() => {
            setIsLoadingTodos({loaded: true, error: true})
        })
    }

    /**
     * Render Todo
     *      
     * @description To render todo.
     * 
     * @param todoList: Todo Array which have to display.
     *   
    */
    const renderTodo = (todoList: TodoType[]) => {
        return todoList.map((todo) => {
            return (
                    <ShowTodo 
                        setLastTodoElement={setLastTodoElement}
                        todo={todo}
                        key={todo.id} 
                        loading={addedTodos.hasOwnProperty(todo.id)}
                    />
            );
        })
    }

    /**
     * Render Message
     * 
     * @description To render warning and error message.
     *      
     * @param msg: message to display to user.
     *   
    */
    const renderMessage = (msg: string) => {
        return  <tr className="text-center">
            <td>
                <h4>{msg}</h4>
            </td>
        </tr>
    }

    /**
     * Main Return
     *      
    */
    return (
        <>
            <div className="sticky-top py-4" id="top-menu">
                <Form onSubmit={onSubmitAddTodo}>
                    <Form.Control type="text" placeholder="Add Task"value={todo} onChange={handleAddTodoInputField} />
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
                                {renderTodo(todos)}
                                {renderTodo(newAddedTodos)}
                            </>
                            : (!error && renderMessage(`No ${currentSelectedNav} todo found`))
                        ): null
                    }
                        {
                            !loaded ? <tr><td><Loader /></td></tr> : (error && renderMessage(`Something went wrong`)) 
                        }
                </tbody>
            </Table>
        </>
    )
}

export default ListTodo;