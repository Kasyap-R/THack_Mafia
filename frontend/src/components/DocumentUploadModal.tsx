import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Meeting, meetingApi } from "../services/meetingService";
import { API_ENDPOINTS } from "../config/api";

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

const UploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${(props) => (props.isDragging ? "#00ff00" : "#007bff")};
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
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
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const meeting = await meetingApi.createMeeting({
        meeting_name: meetingName,
        creator_id: userId,
      });
      if (files && files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        try {
          const response = await fetch(API_ENDPOINTS.AI.UPLOAD, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("File upload failed");
          }
        } catch (error) {
          console.error("Error uploading files:", error);
        }
      }
      onMeetingCreated(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>Upload Documents</Title>
        <UploadArea
          isDragging={isDragging}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            {files && files.length > 0
              ? `${files.length} file(s) selected`
              : "Click or drag files to upload"}
          </label>
        </UploadArea>
        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ContinueButton onClick={handleCreateMeeting}>
            {files && files.length > 0
              ? "Upload and Create Meeting"
              : "Create Meeting without Documents"}
          </ContinueButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DocumentUploadModal;
