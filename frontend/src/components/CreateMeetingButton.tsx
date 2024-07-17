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
        Create New Meeting
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
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    padding: "15px 32px",
    textAlign: "center" as const,
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "background-color 0.3s",
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
    animation: "fadeIn 0.3s",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    animation: "slideIn 0.3s",
  },
  modalTitle: {
    marginTop: 0,
    color: "#333",
  },
  meetingInput: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box" as const,
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    marginLeft: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
  },
  createBtn: {
    padding: "10px 20px",
    marginLeft: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
  },
};

export default CreateMeetingButton;
