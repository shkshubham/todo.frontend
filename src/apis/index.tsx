import { REACT_APP_API_URL } from "../config";
import axios, { AxiosResponse } from 'axios';

export default class {
    private readonly service: string;

    constructor(service: string) {
        this.service = `${REACT_APP_API_URL}/${service}`;
    }
    
    async checkAndGetResponse(response: Response) {
        if (response.ok) {
            return await response.json();
        }
        return response;
    }

    async get(query:any = null, skip = 0, limit=10) {
        let url = `${this.service}?$skip=${skip}&$limit=${limit}`

        if(query) {
            Object.keys(query).forEach(key => {
                url += `&${key}=${query[key]}`
            })
        }
        
        try {
            const response = await fetch(url);
            return this.checkAndGetResponse(response)
        } catch(err) {
            throw new Error(err);
        }
    }

    async post(data: any, Ref: string) {
        try {
            const response = await axios.post(this.service, data, {
                headers: {
                    Ref
                }
            })
            return {...response.data, ...this.privateGetRef(response)}
        } catch(err) {
            throw this.privateGetRef(err.response);
        }
    }

    async updateOrDelete(method: string, param: string, data?: any) {
        try {
            const response = await fetch(`${this.service}/${param}`, {
                method,
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
              });
            return this.checkAndGetResponse(response)
        } catch(err) {
            throw new Error(err);
        }
    }

    privateGetRef(response: AxiosResponse<any>): any {
        return {
            ref: response.config.headers.Ref
        };
    }
}