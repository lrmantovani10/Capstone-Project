import "./Matches.css";
import { useEffect } from "react";
import "@fontsource/abel";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import axios from "axios";
import Message from "../Message/Message";
import ChannelProvider from "@sendbird/uikit-react/SendbirdProvider";
import MyChatUI from "../Chat/Chat";
import Matching from "./Matching";
export default function Matches(props) {
  useEffect(() => {
    props.setTemporaryMessage("Loading...");
    try {
      if (props.chatting) {
        const userToken = localStorage.getItem("userToken");
        if (userToken.length > 0) {
          const headers = {
            headers: {
              authorization: userToken,
              type: 2,
            },
          };
          axios
            .get(`${props.process.env.REACT_APP_APIURL}/get_user`, headers)
            .then((response) => {
              props.setCurrentUser(response.data);
            })
            .catch(() => {
              props.setMatches("error");
            });
        } else {
          window.location.replace("/login");
        }
      } else {
        Matching.getMatches(
          {
            setCurrentUser: props.setCurrentUser,
            setTemporaryMessage: props.setTemporaryMessage,
            setMatches: props.setMatches,
            setChatting: props.setChatting,
          },
          props.matches
        );
      }
    } catch {
      window.location.replace("/login");
    }
  }, [props.chatting]);

  if (props.matches == "error") {
    return <Message />;
  } else if (props.chatting) {
    const App = () => {
      return (
        <div className="App">
          <ChannelProvider
            appId={process.env.REACT_APP_APPLICATION_ID}
            userId={props.currentUser._id}
            nickname={props.currentUser.name}
            accessToken={props.currentUser.sendbird_access}
          >
            <MyChatUI
              currentChannel={props.currentChannel}
              userType={props.currentUser.type}
            />
          </ChannelProvider>
        </div>
      );
    };
    return App();
  } else {
    if (props.matches.length > 0) {
      return (
        <div id="matchesDiv">
          {props.matches.map((element, index) => {
            return (
              <div key={"match" + index} className="card mb-3 matchIndividual">
                <div className="row no-gutters">
                  <div className="col-md-4">
                    <img
                      src={
                        element.profile_picture.length > 0
                          ? element.profile_picture
                          : process.env.REACT_APP_PROFILES + "default.png"
                      }
                      className="card-img matchPicture"
                      alt={"picture of " + element.name}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <div className="matchHeader">
                        <CloseIcon
                          className="endMatch"
                          onClick={() =>
                            Matching.handleEndMatch(
                              element._id,
                              props.currentUser._id
                            )
                          }
                        />
                      </div>
                      <h4 className="card-title matchName">
                        {element.name}
                        {props.currentUser.type == 0
                          ? ""
                          : " | " + element.age}{" "}
                      </h4>

                      <p className="card-text matchAbout">{element.about}</p>
                      <p className="card-text">
                        <span className="card-text">
                          Email: {element.email}{" "}
                        </span>
                      </p>
                      <p className="card-text">
                        <a href={element.other_link} id="companyWebsite">
                          Website
                        </a>
                      </p>
                      <p className="card-text">
                        <span className="card-text">
                          Sector: {element.sector}{" "}
                        </span>
                      </p>
                      {element.readable_address ? (
                        <p className="card-text">
                          <span className="card-text">
                            Location: {element.readable_address}{" "}
                          </span>
                        </p>
                      ) : (
                        <></>
                      )}
                      <div id="messageButtonDiv">
                        <ThemeProvider theme={props.purpleTheme}>
                          <Button
                            id="messageButton"
                            variant="contained"
                            onClick={async () =>
                              await Matching.handleChat(
                                element._id,
                                props.currentUser._id,
                                element.name,
                                props.currentUser.name,
                                {
                                  setCurrentChannel: props.setCurrentChannel,
                                  setChatting: props.setChatting,
                                  setMatches: props.setMatches,
                                }
                              )
                            }
                          >
                            Message
                          </Button>
                        </ThemeProvider>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}{" "}
        </div>
      );
    } else {
      return <Message message={props.temporaryMessage} />;
    }
  }
}
