import errorHandler from "./errorHandler";
import axios, { AxiosRequestConfig } from "axios";
// Axios retry doesnt accept ES6^
const axiosRetry = require("axios-retry");

export default class Requester {
  private idUser: string;
  private passwordUser: string;
  private authUrl: string;
  // tslint:disable-next-line:no-any
  private token: any = null;
  private retries = 5;
  private maxCalls = 0;

  constructor(idUser: string, passwordUser: string, authUrl: string) {
    axiosRetry(axios, { retries: this.retries });
    this.idUser = idUser;
    this.passwordUser = passwordUser;
    this.authUrl = authUrl;
  }

  get = async (
    URL: string,
    options: AxiosRequestConfig = {},
    // tslint:disable-next-line:no-any
    authenticated: boolean
  ): Promise<any> => {
    if (authenticated) {
      if (!this.token) await this.authenticate();

      this.changeAuthorizationHeader(options);
    }

    try {
      const { data, status } = await axios.get(URL, options);

      return {
        data,
        status
      };
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        await this.authenticate();

        if (this.reachedMaxCalls()) return this.errorMessage(401);
        this.maxCalls++;
        return this.get(URL, options, authenticated);
      } else {
        errorHandler(err, this.get.name);
        throw err;
      }
    }
  };

  post = async (
    URL: string,
    payloadData?: {},
    options: AxiosRequestConfig = {},
    // tslint:disable-next-line:no-any
    authenticated = false
  ): Promise<any> => {
    if (authenticated) {
      if (!this.token) await this.authenticate();

      this.changeAuthorizationHeader(options);
    }

    try {
      const { data, status } = await axios.post(URL, payloadData, options);

      return {
        data,
        status
      };
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        await this.authenticate();

        if (this.reachedMaxCalls()) return this.errorMessage(401);
        this.maxCalls++;
        return this.post(URL, payloadData, options, authenticated);
      } else {
        errorHandler(err, this.post.name);
        throw err;
      }
    }
  };

  put = async (
    URL: string,
    payloadData?: {},
    options: AxiosRequestConfig = {},
    // tslint:disable-next-line:no-any
    authenticated = false
  ): Promise<any> => {
    if (authenticated) {
      if (!this.token) await this.authenticate();

      this.changeAuthorizationHeader(options);
    }

    try {
      const { data, status } = await axios.put(URL, payloadData, options);

      return {
        data,
        status
      };
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        await this.authenticate();

        if (this.reachedMaxCalls()) return this.errorMessage(401);
        this.maxCalls++;
        return this.put(URL, payloadData, options, authenticated);
      } else {
        errorHandler(err, this.put.name);
        throw err;
      }
    }
  };

  delete = async (
    URL: string,
    options: AxiosRequestConfig = {},
    // tslint:disable-next-line:no-any
    authenticated = false
  ): Promise<any> => {
    if (authenticated) {
      if (!this.token) await this.authenticate();

      this.changeAuthorizationHeader(options);
    }

    try {
      const { data, status } = await axios.delete(URL, options);

      return {
        data,
        status
      };
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        await this.authenticate();

        if (this.reachedMaxCalls()) return this.errorMessage(401);
        this.maxCalls++;
        return this.delete(URL, options, authenticated);
      } else {
        errorHandler(err, this.delete.name);
        throw err;
      }
    }
  };

  private authenticate = async () => {
    try {
      const { data } = await axios.post(this.authUrl, null, {
        auth: {
          username: this.idUser,
          password: this.passwordUser
        }
      });

      this.token = data["access_token"];
    } catch (err) {
      errorHandler(err, "authenticate");
      this.token = "Not authenticated";
      throw err;
    }
  };

  private errorMessage = (status: number) => ({
    data: "failed",
    status
  });

  private reachedMaxCalls = (): boolean => {
    if (this.maxCalls >= 2) {
      this.maxCalls = 0;
      return true;
    }
    return false;
  };

  private changeAuthorizationHeader = (options: AxiosRequestConfig): void => {
    options["headers"] = {
      ...options["headers"],
      Authorization: `Bearer ${this.token}`
    };
  };
}
