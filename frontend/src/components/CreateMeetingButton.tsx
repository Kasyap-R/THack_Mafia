import React, { useState } from "react";
import styled from "styled-components";
import { Meeting } from "../services/meetingService";
import DocumentUploadModal from "./DocumentUploadModal";

interface CreateMeetingButtonProps {
  userName: string;
  userId: string;
  onMeetingCreated: (meeting: Meeting) => void;
}

const MeetingButton = styled.button`
  width: 100%;
  padding: 15px;
  font-size: 18px;
  background-color: transparent;
  color: #007bff;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CreateMeetingButton = ({
  userName,
  userId,
  onMeetingCreated,
}: CreateMeetingButtonProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [meetingName, setMeetingName] = useState("");

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(false);
    setIsUploadModalOpen(true);
  };

  const handleMeetingCreated = (meeting: Meeting) => {
    setIsUploadModalOpen(false);
    onMeetingCreated(meeting);
  };

  return (
    <>
      <ButtonContainer>
        <MeetingButton onClick={() => setIsCreateModalOpen(true)}>
          New Meeting
        </MeetingButton>
        <MeetingButton onClick={() => console.log("Schedule Meeting clicked")}>
          Schedule Meeting
        </MeetingButton>
      </ButtonContainer>
      {isCreateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Create New Meeting</h2>
            <input
              type="text"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Enter meeting name"
              style={styles.meetingInput}
            />
            <div style={styles.buttonGroup}>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleCreateMeeting} style={styles.createBtn}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onMeetingCreated={handleMeetingCreated}
          meetingName={meetingName}
          userId={userId}
        />
      )}
    </>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "300px",
  },
  modalTitle: {
    marginTop: 0,
    color: "#333",
    fontSize: "20px",
    marginBottom: "15px",
  },
  meetingInput: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box" as const,
    fontSize: "16px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    marginRight: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#f0f0f0",
    color: "#333",
    fontSize: "14px",
  },
  createBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "14px",
  },
};

export default CreateMeetingButton;
