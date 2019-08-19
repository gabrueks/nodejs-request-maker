import axios, { AxiosRequestConfig } from 'axios'
// Axios retry doesnt accept ES6^
const axiosRetry = require('axios-retry');

import errorHandler from './errorHandler'

export default class Requester {
    public idUser: string;
    public passwordUser: string;
    public authUrl: string;

    private token: any = null;
    private retries: number = 5;

    constructor(idUser: string, passwordUser: string, authUrl: string) {
        axiosRetry(axios, { retries: this.retries });
        this.idUser = idUser;
        this.passwordUser = passwordUser;
        this.authUrl = authUrl;
    }

    public get = async (
        URL: string,
        options: AxiosRequestConfig = {},
        authenticated: boolean): Promise<any> => {
        if (authenticated) {
            options['headers'] = {
                Authorization: `Bearer ${this.token}`
            }
        }

        try {
            const { data, status } = await axios.get(URL, options);

            return { 
                data,
                status
            };
        } catch (err) {
            if (err.response && err.response.status == 401 || !this.token) {
                await this.authenticate();

                return await this.get(URL, options, authenticated);
            } else {
                errorHandler(err, this.get.name);
                return this.errorMessage();
            }
        }
    }

    public post = async (
        URL: string,
        payloadData?: {},
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            options['headers'] = {
                Authorization: `Bearer ${this.token}`
            }
        }

        try {
            const { data, status } = await axios.post(URL, payloadData, options);

            return { 
                data,
                status
            };
        } catch (err) {
            if (err.response && err.response.status == 401 || !this.token) {
                await this.authenticate();
                return await this.post(URL, payloadData, options, authenticated);
            } else {
                errorHandler(err, this.post.name);
                return this.errorMessage();
            }
        }
    }

    public put = async (
        URL: string,
        payloadData?: {},
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            options['headers'] = {
                Authorization: `Bearer ${this.token}`
            }
        }

        try {
            const { data, status } = await axios.put(URL, payloadData, options);

            return { 
                data,
                status
            };
        } catch (err) {
            if (err.response && err.response.status == 401 || !this.token) {
                await this.authenticate();
                return await this.put(URL, payloadData, options, authenticated);
            } else {
                errorHandler(err, this.put.name);
                return this.errorMessage();
            }
        }
    }

    public delete = async (
        URL: string,
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            options['headers'] = {
                Authorization: `Bearer ${this.token}`
            }
        }

        try {
            const { data, status } = await axios.delete(URL, options);

            return { 
                data,
                status
            };
        } catch (err) {
            if (err.response && err.response.status == 401 || !this.token) {
                await this.authenticate();
                return await this.delete(URL, options, authenticated);
            } else {
                errorHandler(err, this.delete.name);
                return this.errorMessage();
            }
        }
    }

    private authenticate = async () => {
        try {
            const { data } = await axios.post(this.authUrl, null, {
                auth: {
                    username: this.idUser,
                    password: this.passwordUser
                }
            });

            this.token = data['access_token'];
        } catch(error) {
            errorHandler(error, 'authenticate')
            this.token = 'Not authenticated';
            return this.errorMessage();
        }
    }

    private errorMessage = () => ({
        failed: true,
        message: 'Fail to request.',
    })
}
