import "./Profile.css";
import { useEffect } from "react";
import axios from "axios";
import "@fontsource/abel";
import Message from "../Message/Message";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import ProfileComponents from "./ProfileComponents";

export default function Profile(props) {
  useEffect(() => {
    props.setCurrentUser(1);
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) {
        const headers = {
          headers: {
            authorization: userToken,
          },
        };
        axios
          .get(`${process.env.REACT_APP_APIURL}/get_user`, headers)
          .then((response) => {
            props.AppFunctions.updateParameters(
              response.data,
              props.setCurrentUser
            );
          })
          .catch(() => {
            props.setCurrentUser(0);
          });
      } else {
        window.location.replace("/login");
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);

  useLoadScript({ googleMapsApiKey: process.env.REACT_APP_MAPS_KEY });

  if (props.currentUser == 1) {
    return <Message message={1} />;
  } else if (props.currentUser == 0) {
    return <Message />;
  } else if (props.currentUser != 2) {
    return (
      <div className="profilePage">
        <div className="profileHeader">
          <ThemeProvider theme={props.blueTheme}>
            <Button
              variant="contained"
              onClick={() => {
                window.location.replace("/edit_profile");
              }}
              id="editButton"
            >
              Edit Profile
            </Button>
          </ThemeProvider>

          <h1 className="abelFont whiteAbel">{props.currentUser.name}</h1>
          <p id="subheader">{props.currentUser.email}</p>

          <div className="swipingBasic">
            <img
              id="profileImage"
              src={
                props.profileImage.length > 0
                  ? props.profileImage
                  : process.env.REACT_APP_PROFILES + "default.png"
              }
            />
            <div className="secondItem">
              <div>
                <h2 className="abelFont whiteAbel">Intro</h2>
                <p className="myIntro">{props.currentUser.about}</p>
                <p className="myIntro" id="generalInfo">
                  {props.currentUser.sector.length > 0 ? (
                    props.currentUser.type == 0 ? (
                      props.currentUser.occupation +
                      " in the " +
                      props.currentUser.sector +
                      " sector  with " +
                      props.currentUser.interested_years +
                      " years of experience"
                    ) : (
                      "In the " +
                      props.currentUser.sector +
                      " sector looking for hires with " +
                      props.currentUser.interested_years +
                      "+ years of experience"
                    )
                  ) : (
                    <></>
                  )}{" "}
                </p>
              </div>

              <div id="currentInfo" className="abelFont whiteAbel">
                {props.currentUser.readable_address ? (
                  <>
                    <div>
                      {" "}
                      {props.currentUser.type == 0 ? (
                        <>
                          {" "}
                          {props.currentUser.age}
                          &nbsp; year-old living in &nbsp;
                        </>
                      ) : (
                        <span>Located in</span>
                      )}
                      {props.currentUser.readable_address}📍
                    </div>
                    <GoogleMap
                      center={props.currentUser.location}
                      mapContainerClassName="myMap"
                      zoom={12}
                    >
                      <Marker position={props.currentUser.location} />
                    </GoogleMap>
                  </>
                ) : (
                  <div></div>
                )}

                <div id="currentLinks">
                  {props.currentUser.type == 0 ? (
                    props.currentResume.length > 0 ? (
                      <a
                        href={props.currentResume}
                        target="_blank"
                        className="personalLink"
                        download
                      >
                        Resume
                      </a>
                    ) : (
                      <a
                        className="personalLink"
                        onClick={() => {
                          alert("Edit your profile to add a resume!");
                        }}
                      >
                        Resume
                      </a>
                    )
                  ) : (
                    <></>
                  )}
                  {props.currentUser.other_link.length > 0 ? (
                    <a
                      href={props.currentUser.other_link}
                      target="_blank"
                      className="personalLink"
                    >
                      Website
                    </a>
                  ) : (
                    <a
                      className="personalLink"
                      onClick={() => {
                        alert(
                          "Edit your profile to add a personal website link!"
                        );
                      }}
                    >
                      Website
                    </a>
                  )}{" "}
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
                })}{" "}
              </div>
            </div>
          </div>

          <div className="profileFooter">
            <div className="swipingBasic">
              <ProfileComponents
                parameter={"sector"}
                title={"Sectors of Interest"}
                userArray={props.currentUser.interested_sectors}
              />

              <ProfileComponents
                parameter={"position"}
                title={"Positions of Interest"}
                userArray={props.currentUser.interested_positions}
              />

              <ProfileComponents
                parameter={"location"}
                title={"Locations of Interest"}
                userArray={props.currentUser.interested_locations}
              />
            </div>
          </div>
        </div>

        <div id="dangerZone">
          <h4 id="dangerWarning">Danger Zone</h4>
          <div className="dangerButtons">
            <ThemeProvider theme={props.redTheme}>
              <Button
                variant="contained"
                onClick={props.ProfileFunctions.handleLogout}
                className="dangerButton"
              >
                Log Out
              </Button>
            </ThemeProvider>

            <ThemeProvider theme={props.redTheme}>
              <Button
                variant="contained"
                onClick={() => {
                  props.ProfileFunctions.handleDelete(props.currentUser);
                }}
                className="dangerButton"
              >
                Delete Account
              </Button>
            </ThemeProvider>
          </div>
        </div>
        <div id="returnResult"></div>
      </div>
    );
  }
}
