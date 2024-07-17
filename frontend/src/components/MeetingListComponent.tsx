import React from "react";
import styled from "styled-components";
import { Meeting } from "../services/meetingService";

interface MeetingListComponentProps {
  meeting: Meeting;
  onJoin: (meeting: Meeting) => void;
}

const MeetingItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const MeetingInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MeetingName = styled.span`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ParticipantCount = styled.span`
  font-size: 14px;
  color: #666;
`;

const JoinButton = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
`;

const MeetingListComponent: React.FC<MeetingListComponentProps> = ({
  meeting,
  onJoin,
}) => {
  return (
    <MeetingItem>
      <MeetingInfo>
        <MeetingName>{meeting.name}</MeetingName>
        <ParticipantCount>
          Participants: {meeting.participants.length}
        </ParticipantCount>
      </MeetingInfo>
      <JoinButton onClick={() => onJoin(meeting)}>Join</JoinButton>
    </MeetingItem>
  );
};

export default MeetingListComponent;
