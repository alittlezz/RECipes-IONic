export const baseUrl = 'localhost:3000';

export const getLogger: (tag: string) => (...args: any) => void =
    tag => (...args) => console.log(tag, ...args);

const log = getLogger('api');

export interface ResponseProps<T> {
    data: T;
}

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    return promise
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

export const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const authConfig = (token?: string) => ({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
});
