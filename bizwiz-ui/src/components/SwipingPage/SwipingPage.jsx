import "./SwipingPage.css";
import "@fontsource/abel";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect } from "react";
import axios from "axios";
import Message from "../Message/Message";

export default function SwipingPage(props) {
  useEffect(() => {
    props.setTemporaryMessage("Loading...");
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) {
        const headers = {
          headers: {
            authorization: userToken,
            type: 0,
          },
        };
        axios
          .get(`${process.env.REACT_APP_APIURL}/get_user`, headers)
          .then((response) => {
            props.setCurrentUser(response.data);
            props.SwipingFunctions.getSwipes(response.data.location);
          })
          .catch(() => {
            props.setProfiles(["error"]);
          });
      } else {
        window.location.replace("/login");
      }
    } catch (error) {
      window.location.replace("/login");
    }
  }, []);

  if (props.profiles.length > 0 && props.profiles[0] == "error") {
    return <Message />;
  } else if (props.profiles.length > 0 && props.currentUser !== "") {
    return (
      <div className="swipingGeneral">
        <div className="swipingProfile">
          <h1>
            {" "}
            {props.profile.name}
            <span></span>
            {props.currentUser.type == 0 ? "" : "| " + props.profile.age}{" "}
          </h1>
          <div className="swipingBasic">
            <img
              id="swipingImage"
              src={
                props.profileImage.length > 0
                  ? props.profileImage
                  : process.env.REACT_APP_PROFILES + "default.png"
              }
            />
            <div className="aboutMe">
              <h2>Intro</h2>
              <p className="profileIntro">{props.profile.about}</p>
              <div id="profileSector">
                {props.profile.sector.length > 0 ? (
                  props.currentUser.type == 1 ? (
                    props.profile.occupation +
                    " in the " +
                    props.profile.sector +
                    " sector"
                  ) : (
                    props.profile.sector + " sector"
                  )
                ) : (
                  <></>
                )}
                {props.profile.distance ? (
                  "  " + props.profile.distance.toFixed(0) + " miles away"
                ) : (
                  <></>
                )}{" "}
              </div>
            </div>
          </div>

          <div className="workPictures">
            <div className="pictureHorizontal">
              {props.extraImages.map((picture, index) => {
                return (
                  <img
                    alt={"professional memory picture " + (index + 1)}
                    key={"professionalMemory" + (index + 1)}
                    className="workPicture"
                    src={
                      picture.length > 0
                        ? picture
                        : process.env.REACT_APP_OTHERS + "default.png"
                    }
                  ></img>
                );
              })}{" "}
            </div>
          </div>

          <div className="externals">
            {props.currentUser.type == 1 && props.profile.resume.length > 0 ? (
              <a
                href={props.currentResume}
                target="_blank"
                className="qualification"
                download
              >
                Resume
              </a>
            ) : (
              <></>
            )}
            {props.profile.other_link.length > 0 ? (
              <a
                target="_blank"
                href={props.profile.other_link}
                className="qualification"
              >
                Website
              </a>
            ) : (
              <></>
            )}
            {props.profile.linkedin.length > 0 ? (
              <a
                target="_blank"
                href={props.profile.linkedin}
                className="qualification"
              >
                LinkedIn
              </a>
            ) : (
              <></>
            )}{" "}
          </div>
        </div>
        <div className="buttonChoice">
          <ThemeProvider theme={props.purpleTheme}>
            <Button
              onClick={() =>
                props.SwipingFunctions.handleSwipe(
                  0,
                  props.currentUser.email,
                  props.profiles,
                  props.profile,
                  props.currentUser,
                  props.swipeCount,
                  props.AppFunctions.updateParameters
                )
              }
              variant="outlined"
              style={{
                backgroundColor: "white",
                marginTop: "30px",
                width: "150px",
                height: "40px",
                borderRadius: "5%",
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() =>
                props.SwipingFunctions.handleSwipe(
                  1,
                  props.currentUser.email,
                  props.profiles,
                  props.profile,
                  props.currentUser,
                  props.swipeCount,
                  props.AppFunctions.updateParameters
                )
              }
              variant="contained"
              style={{
                marginTop: "30px",
                width: "150px",
                height: "40px",
                borderRadius: "5%",
              }}
            >
              Match
            </Button>
          </ThemeProvider>
        </div>
      </div>
    );
  } else {
    return <Message message={props.temporaryMessage} />;
  }
}
