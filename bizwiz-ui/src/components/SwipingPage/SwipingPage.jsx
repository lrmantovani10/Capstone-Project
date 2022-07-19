import "./SwipingPage.css";
import "@fontsource/abel";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect } from "react";
import axios from "axios";
import Error from "../Error/Error";

export default function SwipingPage(props) {
  useEffect(() => {
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
            props.setCurrentUser(response.data);
          })
          .catch(() => {
            props.setProfiles(["error"]);
          });
        axios
          .get(`${props.apiURL}/get_profiles`, headers)
          .then((response) => {
            props.setProfiles(response.data);
            if (response.data.length > 0) {
              props.updateParameters(
                response.data[response.data.length - 1],
                props.setProfile
              );
            }
          })
          .catch(() => {
            props.setProfiles(["error"]);
          });
      } else {
        window.location.replace("/login");
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);

  if (props.profiles.length > 0 && props.profiles[0] == "error") {
    return <Error />;
  } else if (props.profiles.length > 0 && props.currentUser !== "") {
    return (
      <div className="swipingGeneral">
        <div className="swipingProfile">
          <h1>
            {props.profile.name}
            {props.currentUser.type == 0 ? "" : "| " + props.profile.age}
          </h1>
          <div className="swipingBasic">
            <img
              id="swipingImage"
              src={
                props.profileImage.length > 0
                  ? props.profileImage
                  : props.profilesPath + "default.png"
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
                {props.profile.location.length > 0 ? (
                  " | " + props.profile.location
                ) : (
                  <></>
                )}
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
                        : props.othersPath + "default.png"
                    }
                  ></img>
                );
              })}
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
            )}
          </div>
        </div>
        <div className="buttonChoice">
          <ThemeProvider theme={props.purpleTheme}>
            <Button
              onClick={() => props.handleSwipe(0, props.currentUser.email)}
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
              onClick={() => props.handleSwipe(1, props.currentUser.email)}
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
    return (
      <Error
        message={
          "No potential matches! Broaden filters or come back later for more!"
        }
      />
    );
  }
}
