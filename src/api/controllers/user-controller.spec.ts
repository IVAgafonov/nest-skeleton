import axios from "axios";
import "jasmine";

const BASE_URL = 'http://localhost:8040';

describe('Test user controller', () => {

    it('Test get user without token', (done) => {
        axios.get(BASE_URL + '/api/user/get').then(function (res) {
            throw new Error("Must be forbidden");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: {
                    statusCode: 403,
                    message: 'Forbidden resource',
                    error: 'Forbidden'
                },
                status: 403,
                message: 'Forbidden resource'
            });
            done();
        });
    });

    it('Test register user wrong email', (done) => {
        axios.post(BASE_URL + '/api/user/register', {
            "email": "test",
            "name": "test",
            "password": "test"
        }).then(function (res) {
            throw new Error("User must not be created");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: 'Errors',
                status: 400,
                message: 'Errors',
                errors: [
                    {
                        response: 'Invalid value',
                        status: 400,
                        message: 'Invalid email',
                        field: 'email'
                    }
                ]
            });
            done();
        });
    });

    it('Test register user wrong name', (done) => {
        axios.post(BASE_URL + '/api/user/register', {
            "email": "test@test.com",
            "name": "",
            "password": "test"
        }).then(function (res) {
            throw new Error("User must not be created");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: 'Errors',
                status: 400,
                message: 'Errors',
                errors: [
                    {
                        response: 'Invalid value',
                        status: 400,
                        message: 'Invalid name',
                        field: 'name'
                    }
                ]
            });
            done();
        });
    });

    it('Test register user wrong password', (done) => {
        axios.post(BASE_URL + '/api/user/register', {
            "email": "test@test.com",
            "name": "test",
            "password": "te"
        }).then(function (res) {
            throw new Error("User must not be created");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: 'Errors',
                status: 400,
                message: 'Errors',
                errors: [
                    {
                        response: 'Invalid value',
                        status: 400,
                        message: 'Invalid password',
                        field: 'password'
                    }
                ]
            });
            done();
        });
    });

    const email = 'test_' + Date.now().toString().slice(8) + '_' + Math.random() +'@test.com';
    let token: string|null = null;
    let secondToken: string|null = null;

    it('Test register user', (done) => {
        axios.post(BASE_URL + '/api/user/register', {
            "email": email,
            "name": "test",
            "password": "test_password"
        }).then(function (res) {
            token = res.data.token;
            expect(res.data).toEqual(jasmine.objectContaining({type: 'TEMPORARY'}));
            done();
        }, function (err) {
            throw new Error("User must be created");
        });
    });

    it('Test register user with same email', (done) => {
        axios.post(BASE_URL + '/api/user/register', {
            "email": email,
            "name": "test",
            "password": "test_password"
        }).then(function (res) {
            throw new Error("User must not be created");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: 'Bad request',
                status: 400,
                message: 'User already exists'
            });
            done();
        });
    });

    it('Test get user with token', (done) => {
        axios.get(BASE_URL + '/api/user/get', {
            headers: {
                'authorization': 'bearer ' + token
            }
        }).then(function (res) {
            expect(res.data).toEqual(jasmine.objectContaining({
                email: email,
                name: 'test',
                groups: [ 'USER' ],
            }));
            done();
        }, function (err) {
            throw new Error("Must be working");
        });
    });

    it('Test auth user', (done) => {
        axios.post(BASE_URL + '/api/user/auth', {
            "email": email,
            "password": "test_password",
            "type": 'PERMANENT'
        }).then(function (res) {
            secondToken = res.data.token;
            expect(res.data).toEqual(jasmine.objectContaining({type: 'PERMANENT'}));
            done();
        }, function (err) {
            throw new Error("User must be created");
        });
    });

    it('Test get user with second token', (done) => {
        axios.get(BASE_URL + '/api/user/get', {
            headers: {
                'authorization': 'bearer ' + secondToken
            }
        }).then(function (res) {
            expect(res.data).toEqual(jasmine.objectContaining({
                email: email,
                name: 'test',
                groups: [ 'USER' ],
            }));
            done();
        }, function (err) {
            throw new Error("Must be working");
        });
    });

    it('Logout user with first token', (done) => {
        axios.get(BASE_URL + '/api/user/logout', {
            headers: {
                'authorization': 'bearer ' + token
            }
        }).then(function (res) {
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({
                message: "Logged out"
            });
            done();
        }, function (err) {
            console.log(err.response);
            throw new Error("Must be working");
        });
    });

    it('Test get user with first token', (done) => {
        axios.get(BASE_URL + '/api/user/get', {
            headers: {
                'authorization': 'bearer ' + token
            }
        }).then(function (res) {
            throw new Error("Must not be working");
        }, function (err) {
            expect(err.response.data).toEqual({
                response: {
                    statusCode: 403,
                    message: 'Forbidden resource',
                    error: 'Forbidden'
                },
                status: 403,
                message: 'Forbidden resource'
            });
            done();
        });
    });

    it('Logout all devices', (done) => {
        axios.get(BASE_URL + '/api/user/logout', {
            headers: {
                'authorization': 'bearer ' + secondToken
            }
        }).then(function (res) {
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({
                message: "Logged out"
            });
            done();
        }, function (err) {
            console.log(err.response);
            throw new Error("Must be working");
        });
    });

    it('Test get user with second token (permanent)', (done) => {
        axios.get(BASE_URL + '/api/user/get', {
            headers: {
                'authorization': 'bearer ' + secondToken
            }
        }).then(function (res) {
            throw new Error("Must not be working");

        }, function (err) {
            expect(err.response.data).toEqual({
                response: {
                    statusCode: 403,
                    message: 'Forbidden resource',
                    error: 'Forbidden'
                },
                status: 403,
                message: 'Forbidden resource'
            });
            done();
        });
    });

});