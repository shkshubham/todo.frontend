import { REACT_APP_API_URL } from "../config";

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

    async get() {
        try {
            const response = await fetch(this.service);
            return this.checkAndGetResponse(response)
        } catch(err) {
            throw new Error(err);
        }
    }

    async post(data: any) {
        try {
            const response = await fetch(this.service, {
                method: 'POST',
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
}