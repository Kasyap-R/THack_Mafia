import React from "react";
import { usePageStore, Page } from "../stores/PageStore";
import { useUserStore } from "../stores/UserStore";
import { useMeetingStore } from "../stores/MeetingStore";
import { Meeting } from "../services/meetingService";
//import logo from "../images/mAItLogoGlow.png";
//import userIcon from "../images/user.png";
//import settingsIcon from "../images/settings.png";
import CreateMeetingButton from "../components/CreateMeetingButton";

const HomeSidebar: React.FC = () => {
  const { setPage } = usePageStore();
  const { user } = useUserStore();
  const { setCurrentMeeting } = useMeetingStore();

  const handleMeetingCreated = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setPage(Page.MEETING);
  };

  return (
    <div style={styles.sidebar}>
      <div>
        <div style={styles.logo}>
          {/* <img src={logo} alt="Logo" style={styles.logoImage} /> */}
        </div>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <CreateMeetingButton
              userName={user.name}
              userId={String(user.id)}
              onMeetingCreated={handleMeetingCreated}
            />
          </li>
        </ul>
      </div>
      <div style={styles.minibuttonsContainer}>
        <button
          style={{
            ...styles.minibutton /*backgroundImage: `url(${userIcon})`*/,
          }}
        ></button>
        <button
          style={{
            ...styles.minibutton,
            //backgroundImage: `url(${settingsIcon})`,
          }}
        ></button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    height: "100vh",
    width: "250px",
    backgroundColor: "#e0e0e0",
    padding: "20px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  logo: {
    marginBottom: "20px",
  },
  logoImage: {
    width: "185px",
    marginLeft: "30px",
  },
  ul: {
    listStyleType: "none",
    padding: 0,
    flexGrow: 1,
  },
  li: {
    marginBottom: "15%",
  },
  minibutton: {
    backgroundColor: "#e0e0e0",
    width: "40px",
    height: "40px",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    border: "none",
    margin: "25px 0",
  },
  minibuttonsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    marginTop: "-100px",
  },
};

export default HomeSidebar;
