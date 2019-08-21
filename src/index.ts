import axios, { AxiosRequestConfig, AxiosStatic } from 'axios'
// Axios retry doesnt accept ES6^
const axiosRetry = require('axios-retry');

import errorHandler from './errorHandler'


export default class Requester {
    private idUser: string;
    private passwordUser: string;
    private authUrl: string;
    private token: any = null;
    private retries: number = 5;
    private maxCalls: number = 0;

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
            if (!this.token) await this.authenticate();

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
            if (err.response && err.response.status == 401) {
                await this.authenticate();

                if (this.reachedMaxCalls()) return this.errorMessage(401);
                this.maxCalls++;
                return await this.get(URL, options, authenticated);
            } else {
                errorHandler(err, this.get.name);
                throw err;
            }
        }
    }

    public post = async (
        URL: string,
        payloadData?: {},
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            if (!this.token) await this.authenticate();

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
            if (err.response && err.response.status == 401) {
                await this.authenticate();

                if (this.reachedMaxCalls()) return this.errorMessage(401);
                this.maxCalls++;
                return await this.post(URL, payloadData, options, authenticated);
            } else {
                errorHandler(err, this.post.name);
                throw err;
            }
        }
    }

    public put = async (
        URL: string,
        payloadData?: {},
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            if (!this.token) await this.authenticate();

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
            if (err.response && err.response.status == 401) {
                await this.authenticate();

                if (this.reachedMaxCalls()) return this.errorMessage(401);
                this.maxCalls++;
                return await this.put(URL, payloadData, options, authenticated);
            } else {
                errorHandler(err, this.put.name);
                throw err;
            }
        }
    }

    public delete = async (
        URL: string,
        options: AxiosRequestConfig = {},
        authenticated: boolean = false): Promise<any> => {
        if (authenticated) {
            if (!this.token) await this.authenticate();

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
            if (err.response && err.response.status == 401) {
                await this.authenticate();

                if (this.reachedMaxCalls()) return this.errorMessage(401);
                this.maxCalls++;
                return await this.delete(URL, options, authenticated);
            } else {
                errorHandler(err, this.delete.name);
                throw err;
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
        } catch(err) {
            errorHandler(err, 'authenticate')
            this.token = 'Not authenticated';
            throw err;
        }
    }

    private errorMessage = (status: number) => ({
        data: 'failed',
        status,
    });

    private reachedMaxCalls = (): boolean => {
        if(this.maxCalls >= 2) {
            this.maxCalls = 0;
            return true;
        }
        return false;
    }
}
