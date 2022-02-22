const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(_request, _response, _next) {
  const { username } = _request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return _response
      .status(404)
      .json({
        error: 'User not found!'
      })
  }

  _request.user = user

  return _next()
}

app.post('/users', (_request, _response) => {
  const { name, username } = _request.body

  const userExists = users.find((user) => user.username === username)

  if (userExists) {
    return _response
      .status(400)
      .json({
        error: 'User already exists!'
      })
  }

  const newUser = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return _response.status(201).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (_request, _response) => {
  const { user } = _request

  return _response.json(user.todos)
})


app.post('/todos', checksExistsUserAccount, (_request, _response) => {
  const { user } = _request
  const { title, deadline } = _request.body

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return _response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (_request, _response) => {
  const { user } = _request
  const { id } = _request.params
  const { title, deadline } = _request.body

  const userTodo = user.todos.find((todo) => todo.id === id)

  if (!userTodo) {
    return _response
      .status(404)
      .json({
        error: 'Invalid todo id!'
      })
  }

  userTodo.title = title
  userTodo.deadline = deadline

  return _response.json(userTodo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (_request, _response) => {
  const { user } = _request
  const { id } = _request.params

  const userTodo = user.todos.find((todo) => todo.id === id)

  if (!userTodo) {
    return _response
      .status(404)
      .json({
        error: 'Invalid todo id!'
      })
  }

  userTodo.done = true

  return _response.json(userTodo)
})


app.delete('/todos/:id', checksExistsUserAccount, (_request, _response) => {
  const { user } = _request
  const { id } = _request.params

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if (todoIndex === -1) {
    return _response
      .status(404)
      .json({
        error: 'Invalid todo id!'
      })
  }

  user.todos.splice(todoIndex, 1)
  
  return _response.status(204).send()
})

module.exports = app;