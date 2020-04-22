
import axios from 'axios'

const Endpoints = {
    USERS: '/api/users',
    LOGIN: '/oauth/token',
    LOGOUT: '/api/s/logout',
    ALL_TASKS: '/api/s/allTasks',
    TASK: '/api/s/task'
}

export default class MissionCompleteApi {

    constructor() {
        console.log("Instantiated API!")
    }

    getBasicInstance() {
        return axios.create({
            headers: {
                'Authorization': 'Basic dGFzc2stY2xpZW50Ojk3SDdGNEZENzJKRjdCUFFMMEdBQ1ox',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    getBearerInstance() {
        return axios.create({
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }
    
    createUser(username, email, password, callback) {
        axios.post(Endpoints.USERS, {
            username: username,
            email: email,
            password: password,
            passwordConf: password
        })
        .then(function (response) {
            callback(response);
        })
        .catch(function (error) {
            callback(error);
        });
    }

    login(username, password, callback) {

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        params.append('grant_type', 'password');

        this.getBasicInstance().post(Endpoints.LOGIN, params)
        .then(function (response) {
            storeAccessToken(response.data['access_token']);
            callback(response);
        })
        .catch(function (error) {
            callback(error);
        });
    }

    logout(callback) {
        this.getBearerInstance().post(Endpoints.LOGOUT)
        .then(function (response) {
            callback(response);
        })
        .catch(function (error) {
            callback(error);
        });
    }

    getTasks(callback) {
        this.getBearerInstance().get(Endpoints.ALL_TASKS)
        .then(function(response) {
            callback(response);
        })
        .catch(function (error) {
            callback(error);
        });
    }

    addTask(task, callback) {
        this.getBearerInstance().post(Endpoints.TASK, new URLSearchParams(task))
        .then(function(response) {
            callback(response);
        })
        .catch(function (error) {
            callback(error);
        });
    }

}


function storeAccessToken(token) {
    localStorage.accessToken = token;
}

function getAccessToken() {
    return localStorage.accessToken;
}