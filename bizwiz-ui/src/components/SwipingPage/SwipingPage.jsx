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
            props.setCurrentUser(response.data.type);
          })
          .catch(() => {
            props.setProfiles(["error"]);
          });
        axios
          .get(`${props.apiURL}/get_profiles`, headers)
          .then((response) => {
            props.setProfiles(response.data);
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
  }, [props.currentUser]);

  if (props.profiles.length > 0 && props.profiles[0] == "error") {
    return <Error />;
  } else if (props.profiles.length > 0 && props.currentUser == 1) {
    return (
      <div className="swipingGeneral">
        <div className="swipingProfile" id="randomKey">
          <h1>
            {props.profiles[props.profiles.length - 1].name} |{" "}
            {props.profiles[props.profiles.length - 1].age}
          </h1>
          <div className="swipingBasic">
            <img
              id="profileImage"
              src={props.profiles[props.profiles.length - 1].picture_url}
            />
            <div className="aboutMe">
              <h2>Intro</h2>
              <p className="myIntro">
                {props.profiles[props.profiles.length - 1].about}
              </p>
            </div>
          </div>

          <div className="workPictures">
            <div className="pictureHorizontal">
              {props.profiles[props.profiles.length - 1].other_pictures.map(
                (index, picture) => {
                  return (
                    <img
                      alt={"professional memory picture " + (index + 1)}
                      className="workPicture"
                      src={picture}
                    ></img>
                  );
                }
              )}
            </div>
          </div>

          <div className="externals">
            <a target="_blank" className="qualification">
              {props.profiles[props.profiles.length - 1].occupation}
            </a>
            <a
              target="_blank"
              href={props.profiles[props.profiles.length - 1].linkedin}
              className="qualification"
            >
              LinkedIn
            </a>
            <a
              target="_blank"
              href={props.profiles[props.profiles.length - 1].resume_link}
              className="qualification"
            >
              Resume
            </a>
            <a
              target="_blank"
              href={props.profiles[props.profiles.length - 1].other_link}
              className="qualification"
            >
              Website
            </a>
          </div>
        </div>
        <div className="buttonChoice">
          <ThemeProvider theme={props.purpleTheme}>
            <Button
              onClick={() => props.handleReject()}
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
              onClick={() => props.handleMatch()}
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
  } else if (props.profiles.length > 0 && props.currentUser == 0) {
    return (
      <div className="swipingGeneral">
        <div className="swipingProfile" id="randomKey">
          <h1>
            {props.profiles[props.profiles.length - 1].name} | Years:{" "}
            {props.profiles[props.profiles.length - 1].interested_years}
          </h1>
          <div className="swipingBasic">
            <img
              id="profileImage"
              src={props.profiles[props.profiles.length - 1].picture_url}
            />
            <div className="aboutMe">
              <h2>Intro</h2>
              <p className="myIntro">
                {props.profiles[props.profiles.length - 1].about}
              </p>
            </div>
          </div>

          <div className="workPictures">
            <div className="pictureHorizontal">
              {props.profiles[props.profiles.length - 1].other_pictures.map(
                (index, picture) => {
                  return (
                    <img
                      alt={"professional memory picture " + (index + 1)}
                      className="workPicture"
                      src={picture}
                    ></img>
                  );
                }
              )}
            </div>
          </div>

          <div className="externals">
            <a target="_blank" className="qualification">
              {props.profiles[props.profiles.length - 1].sector}
            </a>
            <a
              target="_blank"
              href={props.profiles[props.profiles.length - 1].other_link}
              className="qualification"
            >
              Website
            </a>
          </div>
        </div>
        <div className="buttonChoice">
          <ThemeProvider theme={props.purpleTheme}>
            <Button
              onClick={() => props.handleReject()}
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
              onClick={() => props.handleMatch()}
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
      <div>
        No potential matches! Broaden filters or come back later for more!
      </div>
    );
  }
}
