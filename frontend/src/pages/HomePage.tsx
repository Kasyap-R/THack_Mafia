import React, { useEffect, useState } from "react";
import { useMeetingStore } from "../stores/MeetingStore";
import { useUserStore } from "../stores/UserStore";
import { Meeting } from "../services/meetingService";
import { usePageStore, Page } from "../stores/PageStore";
import { API_ENDPOINTS } from "../config/api";
import HomeSidebar from "../components/HomeSidebar";
import MeetingListComponent from "../components/MeetingListComponent";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Heading = styled.h1`
  color: #333;
`;

const SubHeading = styled.h2`
  color: #333;
`;

const MeetingList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const Home = () => {
  const { user } = useUserStore();
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const { currrentMeeting, setCurrentMeeting } = useMeetingStore((state) => ({
    setCurrentMeeting: state.setCurrentMeeting,
    currrentMeeting: state.currentMeeting,
  }));
  const { setPage } = usePageStore((state) => ({
    setPage: state.setPage,
  }));

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MEETING.MEETING_LIST);
        const meetings: any = await response.json();
        const fake: Meeting = {
          id: "2",
          name: "Executive Onboarding",
          creator_id: "4",
          participants: [" ", " . ", ""],
        };
        setMeetingList([...meetings, fake]);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, []);

  const handleJoinMeeting = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setPage(Page.MEETING);
  };

  return (
    <Container>
      <HomeSidebar />
      <Content>
        <Heading>Welcome, {user.name}!</Heading>
        <SubHeading>Your Meetings</SubHeading>
        <MeetingList>
          {meetingList.map((meeting) => (
            <MeetingListComponent
              key={meeting.id}
              meeting={meeting}
              onJoin={handleJoinMeeting}
            />
          ))}
        </MeetingList>
      </Content>
    </Container>
  );
};

export default Home;
