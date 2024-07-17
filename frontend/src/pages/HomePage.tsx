import React, { useEffect, useState } from "react";
import { useMeetingStore } from "../stores/MeetingStore";
import { useUserStore } from "../stores/UserStore";
import { Meeting } from "../services/meetingService";
import { usePageStore, Page } from "../stores/PageStore";
import { API_ENDPOINTS } from "../config/api";
import HomeSidebar from "../components/HomeSidebar";

const Home = () => {
  const { user } = useUserStore();
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const { setCurrentMeeting } = useMeetingStore((state) => ({
    setCurrentMeeting: state.setCurrentMeeting,
  }));
  const { setPage } = usePageStore((state) => ({
    setPage: state.setPage,
  }));

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MEETING.MEETING_LIST);
        const meetings = await response.json();
        setMeetingList(meetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, []);

  return (
    <div style={styles.container}>
      <HomeSidebar />
      <div style={styles.content}>
        <h1 style={styles.heading}>Welcome, {user.name}!</h1>
        <h2 style={styles.heading}>Your Meetings</h2>
        <ul style={styles.meetingList}>
          {meetingList.map((meeting) => (
            <li key={meeting.id} style={styles.meetingItem}>
              <span>{meeting.name}</span>
              <button
                onClick={() => {
                  setCurrentMeeting(meeting);
                  setPage(Page.MEETING);
                }}
                style={styles.joinButton}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  content: {
    flex: 1,
    padding: "20px",
    overflowY: "auto" as const,
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
