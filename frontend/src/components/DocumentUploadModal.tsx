import React, { useState } from "react";
import styled from "styled-components";
import { Meeting, meetingApi } from "../services/meetingService";

interface DocumentUploadModalProps {
  onClose: () => void;
  onMeetingCreated: (meeting: Meeting) => void;
  meetingName: string;
  userId: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
`;

const Title = styled.h2`
  margin-top: 0;
  color: #333;
  font-size: 20px;
  margin-bottom: 15px;
`;

const UploadArea = styled.div`
  border: 2px dashed #007bff;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
`;

const CancelButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;
`;

const ContinueButton = styled(Button)`
  background-color: #007bff;
  color: white;
`;

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  onClose,
  onMeetingCreated,
  meetingName,
  userId,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const meeting = await meetingApi.createMeeting({
        meeting_name: meetingName,
        creator_id: userId,
      });

      // Here you would typically upload the files to your backend
      // For now, we'll just log them
      console.log("Files to upload:", files);

      onMeetingCreated(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>Upload Documents</Title>
        <UploadArea>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Click or drag files to upload"}
          </label>
        </UploadArea>
        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ContinueButton onClick={handleCreateMeeting}>
            {files.length > 0
              ? "Upload and Create Meeting"
              : "Create Meeting without Documents"}
          </ContinueButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DocumentUploadModal;
