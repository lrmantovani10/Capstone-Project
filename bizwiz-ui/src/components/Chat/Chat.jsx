import SendbirdApp from "@sendbird/uikit-react/App";
import "@sendbird/uikit-react/dist/index.css";
import axios from "axios";
import { useEffect } from "react";
import Message from "../Message/Message";
import Channel from "@sendbird/uikit-react/Channel";

export default function Chat(props) {
  useEffect(() => {
    props.setCurrentUser("Loading");
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) {
        const headers = {
          headers: {
            authorization: userToken,
          },
        };
        axios
          .get(`${props.apiURL}/get_user`, headers)
          .then((response) => {
            props.updateParameters(response.data, props.setCurrentUser);
          })
          .catch(() => {
            props.setCurrentUser("error");
          });
      } else {
        window.location.replace("/login");
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);

  const App = () => {
    if (props.currentUser == "Loading") {
      return <Message message={"Loading..."} />;
    } else if (props.currentUser == "error") {
      return <Message />;
    } else if (props.currentUser != "") {
      return (
        <div className="App">
          <SendbirdApp
            appId={props.applicationId}
            userId={props.currentUser._id}
            accessToken={props.currentUser.email}
            nickname={props.currentUser.name}
            profileUrl={
              props.profileImage.length > 0
                ? props.profileImage
                : props.profilesPath + "default.png"
            }
            showSearchIcon={true}
          >
            {/* <Channel channelUrl={props.channelUrl} showSearchIcon={true} /> */}
          </SendbirdApp>
        </div>
      );
    }
  };
  return App();
}
