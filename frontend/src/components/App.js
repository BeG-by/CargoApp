import React from "react";
import "./App.css";
import {BrowserRouter} from "react-router-dom";
import {Switch} from "react-router-dom";
import {Route} from "react-router-dom";
import interceptors from "../../src/security/Interceptors";
import MainPage from "./pages/main-page/main-page";
import WelcomePage from "./pages/welcome-page/welcome-page";
import NotFound from "./pages/error-page/error-404";
import WaybillPage from "./pages/waybill-page/waybill-page";
import InfoPage from "./pages/info-page/info-page";
import ContactsPage from "./pages/contacts-page/contacts-page";
import SendMailPage from "./pages/send-mail-page/send-mail-page";
import MainBodyDispatcher from "./pages/main-page/main-body-dispatcher";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="App">
                <div className="App-body">
                    <BrowserRouter>
                        <Switch>
                            <Route exact path="/" component={WelcomePage}/>
                            <Route exact path="/mainPage" component={MainPage}/>
                            {/*<Route exact path="/waybill" component={WaybillPage}/>*/}
                            <Route exact path="/info" component={InfoPage}/>
                            <Route exact path="/contacts" component={ContactsPage}/>
                            <Route exact path="/sendMail" component={SendMailPage}/>
                            {/*<Route exact path="/dispatcher" component={MainBodyDispatcher}/>*/}
                            <Route component={NotFound}/>
                        </Switch>
                    </BrowserRouter>
                </div>
            </div>
        );
    }
}

export default App;
