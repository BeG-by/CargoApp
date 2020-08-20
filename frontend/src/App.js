import React from "react";
import "./App.css";
import {BrowserRouter} from "react-router-dom";
import {Route} from "react-router-dom";
import interceptors from "../src/security/Interceptors";
import LoginForm from "./login-form/login-form";
import MainPage from "./main-page/main-page";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <BrowserRouter>
                        <Route exact path="/" component={LoginForm}/>
                        <Route exact path="/mainPage" component={MainPage}/>
                    </BrowserRouter>
                </header>
            </div>
        );
    }
}

export default App;
