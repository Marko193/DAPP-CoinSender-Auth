import { BehaviorSubject } from 'rxjs';
import getConfig from 'next/config';
import Router from 'next/router'

import { fetchWrapper } from '@/helpers';

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/users`;
// const userSubject = new BehaviorSubject(process.browser && JSON.parse(localStorage.getItem('user')));
// @ts-ignore
const userSubject = new BehaviorSubject(process.browser && localStorage.getItem('access_token'));

console.log('data', userSubject);

export const userService = {
    user: userSubject.asObservable(),
    get userValue () { return userSubject.value },
    login,
    logout,
    getAll
};

function login(username, password) {
    return fetchWrapper.post(`${baseUrl}/authenticate`, { username, password })
        .then(user => {
            // publish user with basic auth credentials to subscribers and store in
            // local storage to stay logged in between page refreshes
            user.authdata = window.btoa(username + ':' + password);
            userSubject.next(user);
            localStorage.setItem('user', JSON.stringify(user));
            // console.log('user', user);
            return user;
        });
}

function logout() {
    // remove user from local storage, publish null to user subscribers and redirect to login page
    console.log('logout');
    localStorage.removeItem('authorization_login');
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refresh_token');
    userSubject.next(null);
    Router.push('/auth');
}

function getAll() {
    return fetchWrapper.get(baseUrl);
}
