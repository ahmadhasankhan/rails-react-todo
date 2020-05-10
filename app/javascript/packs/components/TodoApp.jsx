import React from 'react'
import ReactDOM from 'react-dom'
import axios from "axios";
import TodoItems from "./TodoItems";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";

class TodoApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            todoItems: [],
            hideCompletedTodoItems: false,
            isLoading: true,
            errorMessage: null
        };
        this.getTodoItems = this.getTodoItems.bind(this);
        this.createTodoItem = this.createTodoItem.bind(this);
        this.toggleCompletedTodoItems = this.toggleCompletedTodoItems.bind(this);
        this.handleErrors = this.handleErrors.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
    }

    componentDidMount() {
        this.getTodoItems();
    }

    toggleCompletedTodoItems() {
        this.setState({
            hideCompletedTodoItems: !this.state.hideCompletedTodoItems
        });
    }

    createTodoItem(todoItem) {
        const todoItems = [todoItem, ...this.state.todoItems];
        this.setState({todoItems});
    }

    handleErrors(errorMessage) {
        this.setState({ errorMessage });
    }

    clearErrors() {
        this.setState({
            errorMessage: null
        });
    }

    getTodoItems() {
        axios
            .get("/api/v1/todo_items")
            .then(response => {
                this.clearErrors();
                this.setState({isLoading: true});
                const todoItems = response.data;
                this.setState({todoItems});
                this.setState({isLoading: false});
            })
            .catch(error => {
                this.setState({isLoading: true});
                this.setState({
                    errorMessage: {
                        message: "There was an error loading your todo items..."
                    }
                });
            });
    }

    render() {
        return (
            <>
                {this.state.errorMessage && (
                    <ErrorMessage errorMessage={this.state.errorMessage} />
                )}
                {!this.state.isLoading && (
                    <>
                        <TodoForm createTodoItem={this.createTodoItem}
                                  handleErrors={this.handleErrors}
                                  clearErrors={this.clearErrors}
                        />
                        <TodoItems toggleCompletedTodoItems={this.toggleCompletedTodoItems}
                                   hideCompletedTodoItems={this.state.hideCompletedTodoItems}>
                            {this.state.todoItems.map(todoItem => (
                                <TodoItem key={todoItem.id} todoItem={todoItem} g
                                          etTodoItems={this.getTodoItems}
                                          hideCompletedTodoItems={this.state.hideCompletedTodoItems}
                                          handleErrors={this.handleErrors}
                                          clearErrors={this.clearErrors}
                                />
                            ))}
                        </TodoItems>
                    </>
                )}
                {this.state.isLoading && <Spinner/>}
            </>
        )
    }
}

document.addEventListener('turbolinks:load', () => {
    const app = document.getElementById('todo-app');
    app && ReactDOM.render(<TodoApp/>, app)
});
