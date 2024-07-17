import React, { useEffect, useState } from "react";
import { useMeetingStore } from "../stores/MeetingStore";
import { useUserStore } from "../stores/UserStore";
import CreateMeetingButton from "../components/CreateMeetingButton";
import { Meeting } from "../services/meetingService";
import { usePageStore, Page } from "../stores/PageStore";
import { API_ENDPOINTS } from "../config/api";

const Home = () => {
  const { user } = useUserStore();
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const { currentMeeting, setCurrentMeeting, chatHistory, updateChatHistory } =
    useMeetingStore((state) => ({
      chatHistory: state.chatHistory,
      updateChatHistory: state.updateChatHistory,
      currentMeeting: state.currentMeeting,
      setCurrentMeeting: state.setCurrentMeeting,
    }));
  const { setPage } = usePageStore((state) => ({
    setPage: state.setPage,
  }));

  useEffect(() => {
    // Fetch meeting list from an endpoint
    const fetchMeetings = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch(API_ENDPOINTS.MEETING.MEETING_LIST);
        const meetings = await response.json();
        setMeetingList(meetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  const handleMeetingCreated = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setPage(Page.MEETING);
  };

  return (
    <div style={styles.homeContainer}>
      <h1 style={styles.heading}>Welcome, {user.name}!</h1>
      <CreateMeetingButton
        userName={user.name}
        userId={user.id as unknown as string}
        onMeetingCreated={handleMeetingCreated}
      />
      <h2 style={styles.heading}>Your Meetings</h2>
      <ul style={styles.meetingList}>
        {meetingList.map((meeting) => (
          <li key={meeting.id} style={styles.meetingItem}>
            <span>{meeting.name}</span>
            <button
              onClick={() => setCurrentMeeting(meeting)}
              style={styles.joinButton}
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  homeContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  heading: {
    color: "#333",
  },
  meetingList: {
    listStyleType: "none",
    padding: 0,
  },
  meetingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    margin: "10px 0",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  joinButton: {
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    padding: "10px 20px",
    textAlign: "center" as const,
    textDecoration: "none",
    display: "inline-block",
    fontSize: "14px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default Home;
