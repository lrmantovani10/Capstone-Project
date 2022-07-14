import "./Profile.css";
import { useEffect } from "react";
import axios from "axios";
import "@fontsource/abel";
import Error from "../Error/Error";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";
export default function Profile(props) {
  const basePath = "uploads/";
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
            const user = response.data;
            if (user.profile_picture.length > 0) {
              props.setProfileImage(
                basePath + "profiles/" + user._id + "." + user.profile_picture
              );
            } else {
              props.setProfileImage(basePath + "profiles/default.png");
            }
            let newExtras = [];
            user.other_pictures.map((element, index) => {
              if (element.length > 0) {
                newExtras.push(
                  basePath +
                    "others/" +
                    user._id +
                    "_" +
                    (index + 1) +
                    "." +
                    element
                );
              } else {
                newExtras.push(basePath + "others/default.png");
              }
            });
            props.setExtras(newExtras);
            props.setCurrentUser(user);
          })
          .catch((error) => {
            console.log(error);
            props.setCurrentUser("error");
          });
      } else {
        window.location.replace("/login");
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);

  if (props.currentUser == "error") {
    return <Error />;
  } else if (props.currentUser.type == 0) {
    return (
      <div className="profilePage">
        <div className="profileHeader">
          <ThemeProvider theme={props.blueTheme}>
            <Button
              variant="contained"
              onClick={props.handleEdit}
              id="editButton"
            >
              Edit Profile
            </Button>
          </ThemeProvider>

          <h1 className="abelFont">{props.currentUser.name}</h1>
          <p id="subheader">{props.currentUser.email}</p>

          <div className="swipingBasic">
            <img id="profileImage" src={props.profileImage} />
            <div className="secondItem">
              <div>
                <h2 className="abelFont">Intro</h2>
                <p className="myIntro">{props.currentUser.about}</p>
                <p className="myIntro">
                  {props.currentUser.occupation} in the{" "}
                  {props.currentUser.sector} sector
                </p>
              </div>

              <div id="currentInfo" className="abelFont">
                <div>
                  {props.currentUser.age} year-old
                  <span> </span>living in <span> </span>
                  {props.currentUser.location}📍
                </div>

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50695.7145465034!2d-122.17036949424246!3d37.425712997784714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb07b9dba1c39%3A0xe1ff55235f576cf!2sPalo%20Alto%2C%20CA!5e0!3m2!1sen!2sus!4v1657561721738!5m2!1sen!2sus"
                  id="userLocation"
                  loading="lazy"
                  allowFullScreen={true}
                ></iframe>

                <div id="currentLinks">
                  <a
                    href={props.currentUser.resume_link}
                    target="_blank"
                    className="personalLink"
                  >
                    Resume
                  </a>
                  <a
                    href={props.currentUser.other_link}
                    target="_blank"
                    className="personalLink"
                  >
                    Personal Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="profileBody">
            <div className="swipingBasic">
              <div className="horizontalImages">
                {props.extraImages.map((element, index) => {
                  if (element.length > 0) {
                    return (
                      <img
                        key={"aboutMeImage" + (index + 1)}
                        alt={`professional memory picture ${index + 1}`}
                        src={element}
                        className="extraImage"
                      />
                    );
                  } else {
                    return (
                      <img
                        key={"insertAboutMeImage" + (index + 1)}
                        alt="Insert Image!"
                        src="https://i.insider.com/624daec15bc85a0018d74321?width=700"
                        className="extraImage"
                      />
                    );
                  }
                })}
              </div>
            </div>
          </div>

          <div className="profileFooter">
            <div className="swipingBasic">
              <div className="interestsDiv">
                <h3 className="abelFont">Sectors of Interest</h3>
                <div className="currentInterests">
                  {props.currentUser.interested_sectors.map(
                    (element, index) => {
                      return (
                        <p className="interestElement" key={"sector" + index}>
                          {element}
                        </p>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="interestsDiv">
                <h3 className="abelFont">Positions of Interest</h3>
                <div className="currentInterests">
                  {props.currentUser.interested_positions.map(
                    (element, index) => {
                      return (
                        <p className="interestElement" key={"position" + index}>
                          {element}
                        </p>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="interestsDiv">
                <h3 className="abelFont">Locations of Interest</h3>
                <div className="currentInterests">
                  {props.currentUser.interested_locations.map(
                    (element, index) => {
                      return (
                        <p className="interestElement" key={"location" + index}>
                          {element}
                        </p>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="dangerZone">
          <h4 id="dangerWarning">Danger Zone</h4>
          <div className="dangerButtons">
            <ThemeProvider theme={props.redTheme}>
              <Button
                variant="contained"
                onClick={props.handleLogout}
                className="dangerButton"
              >
                Log Out
              </Button>
            </ThemeProvider>

            <ThemeProvider theme={props.redTheme}>
              <Button
                variant="contained"
                onClick={props.handleDelete}
                className="dangerButton"
              >
                Delete Account
              </Button>
            </ThemeProvider>
          </div>
        </div>
        <div id="logoutStatus"></div>
      </div>
    );
  }
}
