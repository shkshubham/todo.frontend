import React, { useState, useEffect, useRef, useMemo } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Form, Nav, Col, Row } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import Loader from '../includes/Loader/loader';
import { TodoType, UpdateTodoType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const ListTodo = () => {
    const {
        todos,
        newAddedTodos,
        addTodo,
        service,
        pagination,
        setTodos,
        setPagination,
        isLoadingTodos: {loaded, error},
        setIsLoadingTodos,
        count,
        setCount
    } = TodoContext.useContainer();
    const [todo, setTodo] = useState("");
    const [currentSelectedNav, setCurrentSelectedNav] = useState("todos");
    const categories = useMemo(() => ["All", "Active", "Completed"], [])
    const [lastTodoElement, setLastTodoElement] = useState<HTMLTableRowElement | null>(null);
    const todosAndPaginationCount = useRef({
        todos: todos.length,
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
            const {loading, todos, pagination} = todosAndPaginationCount.current;
            if (!loading && first.isIntersecting && todos < pagination.total) {
                setIsLoadingTodos({loaded: false, error: false})
                todosAndPaginationCount.current.loading = true
                service.get(null, todos).then(({data, limit, skip, total}) => {
                    todosAndPaginationCount.current.loading = false
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
        todosAndPaginationCount.current.todos = todos.length;
        setCount((previousState) => {
            return {...previousState, todos: todos.length}
        })
    }, [todos, setCount])
    /**
     * Use effect Hook
     *
     * @description To set pagination to local ref
     * 
    */
    useEffect(() => {
        todosAndPaginationCount.current.pagination = pagination;
        setCount((previousState) => {
            return {...previousState, total: pagination.total}
        })
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
            setCount(({total, todos}) => {
                return {total: total + 1, todos: todos + 1}
            })
            addTodo({
                title: todo,
                completed: false
            }, uuidv4());
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
            case "Active":
                query.completed = false
                break;
            case "Completed":
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
    const renderAllTodos = () => {
        return todos.map((todo) => {
            return renderTodo(todo, false, false);
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
        return  <div className="text-center">
                <h4>{msg}</h4>
        </div>
    }

    /**
     * Render New Added Todos
     * 
     * @description To render new added todos
     *      
    */
    const renderTodoNewAddedTodos = () => {
        return Object.keys(newAddedTodos).map((key: string) => {
            const todo = newAddedTodos[key];
            return renderTodo(
                todo,
                newAddedTodos.hasOwnProperty(todo.id) && !newAddedTodos[todo.id].error,
                newAddedTodos.hasOwnProperty(todo.id) && newAddedTodos[todo.id].error
            )
        })
    }

    /**
     * Render Todo
     * 
     * @description To render todo
     *      
    */
    const renderTodo = (todo: TodoType, addingTodoLoading: boolean, addingTodoError: boolean) => {
        return (
            <Col className="todo-item" key={todo.id} xs={12}>
                <ShowTodo 
                    setLastTodoElement={setLastTodoElement}
                    todo={todo}
                    addingTodoLoading={addingTodoLoading}
                    addingTodoError={addingTodoError}
                />
            </Col>
        );
    }

    /**
     * Render Nav item
     * 
     * @description To render nav item
     *      
    */
    const renderNavItem = () => {
        return categories.map((category) => {
            return (
                <Nav.Item>
                    <Nav.Link eventKey={category}>{category}</Nav.Link>
                </Nav.Item>
            )
        })
    }

    /**
     * Render Navigation
     * 
     * @description To render navigation
     *      
    */
    const renderTodoCategory = () => {
        return (
            <Nav className="todo-nav" justify onSelect={onSelectTodoTab} variant="pills" defaultActiveKey="All">
                {renderNavItem()}
            </Nav>
        )
    }
    /**
     * Main Return
     *      
    */
    return (
        <>
            <div className="sticky-top py-2" id="top-menu">
                <Row>
                    <Col xs={12}>
                        <Form id="add-todo-form" onSubmit={onSubmitAddTodo}>
                            <input
                                type="text" 
                                id="add-todo"
                                className="todo-input rounded shadow-sm"
                                placeholder="Add todo..." 
                                maxLength={256}
                                value={todo} 
                                onChange={handleAddTodoInputField} 
                            />
                        </Form>
                    </Col>
                    <Col xs={12}>
                        <Row className="my-3">
                            <Col sm={8}>
                                <h6 className="my-3"> Showing todo: <b>{count.todos}/{count.total}</b></h6>
                            </Col>
                            <Col sm={4}>
                                {
                                    renderTodoCategory()
                                }
                            </Col>    
                        </Row>  
                    </Col>
                </Row>
                </div>
                <Row>
                    <Col xs={12}>
                        <hr />
                    </Col>
                    {
                        (loaded || todos.length)
                        ? ((todos.length || Object.keys(newAddedTodos).length)
                            ? <>
                                {renderTodoNewAddedTodos()}
                                {renderAllTodos()}
                            </>
                            : 
                            <Col xs={12}>
                                {
                                    !error && renderMessage(`No ${currentSelectedNav} found`)
                                }
                            </Col>
                        ): null
                    }
                    {renderTodoNewAddedTodos()}
                </Row>
                <Col className="text-center">
                    {
                        !loaded ? <Loader /> : (error && renderMessage(`Something went wrong`)) 
                    }
                </Col>
        </>
    )
}

export default ListTodo;