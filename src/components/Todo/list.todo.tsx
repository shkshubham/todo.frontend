import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TodoContext from '../../contexts/todo.context';
import { Nav, Col, Row } from 'react-bootstrap';
import ShowTodo from './show.todo';
import './todo.scss';
import Loader from '../includes/Loader/loader';
import { TodoType, UpdateTodoType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import InputForm from '../includes/Input/input';

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
        setCount,
        chuckNorrisJokes
    } = TodoContext.useContainer();
    const [currentSelectedNav, setCurrentSelectedNav] = useState("All");
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

            // as observing on the last element that's why taking first element.
            const first = entries[0];

            const {loading, todos, pagination} = todosAndPaginationCount.current;
            
            // checking the element is in the screen & not loading
            if (!loading && first.isIntersecting && todos < pagination.total) {
                setIsLoadingTodos({loaded: false, error: false})

                // setting local todo and pagination ref value
                todosAndPaginationCount.current.loading = true

                // fetching the todos
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
     * Check current selected nav
     *
     * @description To check current selected nav.
     *   
     * @returns {number}
    */
    const checkCurrentNav = useCallback(() => {
        return currentSelectedNav === "All" ? 3 : 0
    }, [currentSelectedNav])

    /**
     * Use effect Hook
     *
     * @description To set todos to local ref
     * 
    */
    useEffect(() => {
        todosAndPaginationCount.current.todos = todos.length;
            setCount((previousState) => {
                if(todos.length !== previousState.todos) {
                    return {...previousState, todos: todos.length + checkCurrentNav()}
                }
                return previousState;
            })

    }, [todos, setCount, checkCurrentNav])
    /**
     * Use effect Hook
     *
     * @description To set pagination to local ref
     * 
    */
    useEffect(() => {
        todosAndPaginationCount.current.pagination = pagination;
        setCount((previousState) => {
            if(pagination.total !== previousState.total) {
                return {...previousState, total: pagination.total + checkCurrentNav()}
            }
            return previousState;
        })
    }, [pagination, setCount, checkCurrentNav])

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
     * On Submit Add Todo
     * 
     * @description To add todo when user add todo.
     *      
     * @param e: Event.
     *   
    */
    const onSubmitAddTodo = (e: React.SyntheticEvent, inputValue: string) => {
        e.preventDefault()
        if(inputValue.length) {
            setCount(({total, todos}) => {
                return {total: total + 1, todos: todos + 1}
            })
            addTodo({
                title: inputValue,
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
        return categories.map((category, index) => {
            return (
                <Nav.Item key={`nav_${index}`}>
                    <Nav.Link eventKey={category}>{category}</Nav.Link>
                </Nav.Item>
            )
        })
    }


    /**
     * Render Chuck Jokes
     * 
     * @description To render chuck jokes.
     *      
    */
    const renderChuckJokes = () => {
        return chuckNorrisJokes.map(({value, id}) => {
            return renderTodo({title: value, id, completed: false, joke: true}, false, false)
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

    const checkTodoLength = todos.length || (currentSelectedNav === "All" && chuckNorrisJokes.length);

    /**
     * Main Return
     *      
    */
    return (
        <>
            <div className="sticky-top py-2" id="top-menu">
                <Row>
                    <Col xs={12}>
                        <InputForm 
                            formId="add-todo-form"
                            onSubmitForm={onSubmitAddTodo}
                            inputId="add-todo-input"
                            className="todo-input rounded shadow-sm"
                            placeholder="Add todo..." 
                            size="12"
                        />
                    </Col>
                    <Col xs={12}>
                        <Row className="my-3">
                            <Col sm={8}>
                                <h6 className="m-3 "> Showing todo: 
                                { loaded
                                   ? <b>{count.todos}/{count.total}</b>
                                   : <Loader />
                                }
                                    </h6>
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
                        (loaded || checkTodoLength)
                        ? ((checkTodoLength || Object.keys(newAddedTodos).length)
                            ? <>
                                {
                                    currentSelectedNav === "All" && <>
                                    {renderChuckJokes()}
                                    <Col xs={12}>
                                        <hr />
                                    </Col>
                                    </>
                                }
                                {
                                    loaded &&  
                                    <>
                                        {renderTodoNewAddedTodos()}
                                        {renderAllTodos()}
                                    </>
                                }
                               
                            </>
                            : 
                            <Col xs={12}>
                                {
                                    !error && renderMessage(`No ${currentSelectedNav} found`)
                                }
                            </Col>
                        ): null
                    }
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