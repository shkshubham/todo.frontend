export default class {
    async get(url: string) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            }
            return response;
        } catch(err) {
            throw new Error(err);
        }
    }
}