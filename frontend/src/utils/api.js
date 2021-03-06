
import axios from 'axios'

const Endpoints = {
    USERS: '/api/users',
    LOGIN: '/oauth/token',
    LOGOUT: '/api/s/logout',
    USER_INFO: '/api/s/userInfo',
    ALL_TASKS: '/api/s/allTasks',
    TASK: '/api/s/task',
    UPDATE_TASK: '/api/s/updateTask',
    PREFERENCES: 'api/s/preferences',
    PROFILE_PIC_UPLOAD: 'api/s/uploadProfilePicture',
    PROFILE_PIC_GET: '/api/s/getProfilePicture'
}

export default class MissionCompleteApi {

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
    
    createUser(username, email, password) {
        return axios.post(Endpoints.USERS, {
            username: username,
            email: email,
            password: password,
            passwordConf: password
        })
    }

    login(username, password) {

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        params.append('grant_type', 'password');

        return this.getBasicInstance().post(Endpoints.LOGIN, params)
            .then(function (response) {
                storeAccessToken(response.data['access_token']);
                return;
            })
    }

    logout() {
        return this.getBearerInstance().post(Endpoints.LOGOUT)
            .then(() => deleteAccessToken())
    }

    getUserInfo() {
        return this.getBearerInstance().get(Endpoints.USER_INFO)
    }

    uploadProfilePicture(image) {
        let formData = new FormData();
        formData.set('file', image);
        return this.getBearerInstance().post(Endpoints.PROFILE_PIC_UPLOAD, formData, {
            'content-type': 'multipart/form-data'
        })
    }

    getProfilePicture(username) {
        return this.getBearerInstance().get(Endpoints.PROFILE_PIC_GET + '/' + (username || 0));
    }

    getTasks() {
        return this.getBearerInstance().get(Endpoints.ALL_TASKS)
    }

    addTask(task) {
        // Remove undefined props:
        Object.keys(task).forEach(key => task[key] === undefined ? delete task[key] : {});
        return this.getBearerInstance().post(Endpoints.TASK, new URLSearchParams(task))
	}
	
	removeTask(task_id) {
        return this.getBearerInstance().delete(Endpoints.TASK + '/' + task_id)
	}
	
	updateTask(updateValues) {
		return this.getBearerInstance().post(Endpoints.UPDATE_TASK, updateValues, {headers: {'Content-Type': 'application/json'}})
	}

    async isLoggedIn() {
        // A user is logged in if they have an access token AND can access their profile
        if (localStorage.accessToken == null) {
            return false;
        }
        try {
            await this.getUserInfo();
            return true;
        } catch (e) {
            return false;
        }
    }

    getPreferences() {
        return this.getBearerInstance().get(Endpoints.PREFERENCES)
    }

    savePreferences(newPrefs) {
        return this.getBearerInstance().post(Endpoints.PREFERENCES, {prefs: newPrefs}, {headers: {'Content-Type': 'application/json'}})
    }

}

function storeAccessToken(token) {
    localStorage.accessToken = token;
}

export function deleteAccessToken() {
    localStorage.removeItem('accessToken');
}

function getAccessToken() {
    return localStorage.accessToken;
}

export const api = new MissionCompleteApi()