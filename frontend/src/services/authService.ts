import { API_ENDPOINTS } from "../config/api";

// Simple example of how we can model both the input and output of the API and bundle
// the functionality of the API call in one file
export interface UserCredentials {
    username: string,
    password: string,
}

export interface AuthUserResponse {
    did_user_exist: boolean,
    user_id: number | null,
    username: string | null,
}

export const auth= {
    login: async (credentials: UserCredentials): Promise<AuthUserResponse> => {
        console.log(API_ENDPOINTS.AUTH.LOGIN);
        const url = `${API_ENDPOINTS.AUTH.LOGIN}/${credentials.username}/${credentials.password}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json() as Promise<AuthUserResponse>;
    },
    register: async (credentials: UserCredentials): Promise<AuthUserResponse> => {
        const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(credentials),
        });
        return response.json() as Promise<AuthUserResponse>;
    }
}
