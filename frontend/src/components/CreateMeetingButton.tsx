import React, { useState } from "react";
import { Meeting, meetingApi } from "../services/meetingService";

interface CreateMeetingButtonProps {
  userName: string;
  userId: string;
  onMeetingCreated: (meeting: Meeting) => void;
}

const CreateMeetingButton = ({
  userName,
  userId,
  onMeetingCreated,
}: CreateMeetingButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingName, setMeetingName] = useState("");

  const handleCreateMeeting = async () => {
    try {
      const meeting = await meetingApi.createMeeting({
        meeting_name: meetingName,
        creator_id: String(userId),
      });
      onMeetingCreated(meeting);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={styles.createMeetingBtn}
      >
        New Meeting
      </button>
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleCreateMeeting} style={styles.createBtn}>
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  createMeetingBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "18px",
    backgroundColor: "#dfdfdf",
    color: "#007bff",
    fontWeight: "bold" as const,
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "left" as const,
    marginBottom: "10px",
    transition: "background-color 0.3s, color 0.3s",
  },
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
