import React from 'react';
import './App.scss';
import ListTodo from '../Todo/list.todo';
import TodoContext from '../../contexts/todo.context'
import { Navbar } from 'react-bootstrap';
function App() {
  return (
    <>
     <Navbar variant="dark" bg="dark">
        <Navbar.Brand>
         Todo
        </Navbar.Brand>
      </Navbar>
      <div className="container mt-4">
        <TodoContext.Provider>
          <ListTodo />
        </TodoContext.Provider>
    </div>
    </>
  );
}

export default App;
