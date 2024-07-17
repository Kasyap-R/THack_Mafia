import { API_ENDPOINTS } from "../config/api";

export interface CreateMeetingRequest {
    meeting_name: string;
    creator_id: string;
}

// Interface to represent the Meeting structure
export interface Meeting {
    id: string;
    name: string;
    creator_id: string;
    participants: string[];
}


export interface JoinMeetingRequest {
    meeting_id: string;
    user_id: string;
}


export const meetingApi = {
    createMeeting: async (request: CreateMeetingRequest): Promise<Meeting> => {
        console.log(API_ENDPOINTS.MEETING.CREATE);
        console.log(typeof(request.creator_id));
        console.log('Creating meeting with:', { meeting_name: request.meeting_name, creator_id: request.creator_id });
        const response = await fetch(API_ENDPOINTS.MEETING.CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        return response.json() as Promise<Meeting>;
    },

    joinMeeting: async (request: JoinMeetingRequest): Promise<Meeting> => {
        const response = await fetch(API_ENDPOINTS.MEETING.JOIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        return response.json() as Promise<Meeting>;
    },

    // You can add more meeting-related API calls here as needed
};