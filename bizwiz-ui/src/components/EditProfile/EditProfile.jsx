import "./EditProfile.css";
import { useEffect } from "react";
import Error from "../Error/Error";
import axios from "axios";
import "@fontsource/abel";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { ThemeProvider } from "@mui/material";

export default function EditProfile(props) {
  function calibrateValue(e) {
    let years = e.value;
    {
      years < 0 ? (years = 0) : years > 40 ? (years = 40) : years;
    }
    let newUser = {
      ...props.currentUser,
    };
    newUser["interested_years"] = years;
    props.setCurrentUser(newUser);
  }
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
                props.profilesPath + user._id + "." + user.profile_picture
              );
            } else {
              props.setProfileImage(props.profilesPath + "default.png");
            }

            if (user.type == 0 && user.resume.length > 0) {
              props.setResume(props.resumesPath + user._id + "." + user.resume);
            } else {
              props.setResume(props.resumesPath + "");
            }

            let newExtras = [];
            user.other_pictures.map((element, index) => {
              if (element.length > 0) {
                newExtras.push(
                  props.othersPath +
                    user._id +
                    "_" +
                    (index + 1) +
                    "." +
                    element
                );
              } else {
                newExtras.push(props.othersPath + "default.png");
              }
            });

            props.setExtras(newExtras);
            props.setCurrentUser(user);
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

  if (props.currentUser == "error") {
    return <Error />;
  } else if (props.currentUser !== "") {
    return (
      <div id="editProfile">
        <h1 id="editProfileHeader" className="abelFont">
          {props.currentUser.name}{" "}
        </h1>

        <div id="horizontalColumns">
          <div id="editProfileImages">
            <h2 id="editImageHeader" className="abelFont">
              Profile Image
            </h2>
            <div className="imageAlign">
              <img
                id="profilePicPreview"
                src={props.profileImage}
                className="picPreview"
                alt="profile picture preview"
              />
              <div className="attributeSelection" id="editProfileImage">
                <input
                  id="profilePicChange"
                  type="file"
                  accept=".png, .jpeg, .jpg"
                  onChange={(event) =>
                    props.handleChangeImage(event, "profilePicPreview")
                  }
                />
              </div>
            </div>
            <h2 className="abelFont">Other Images</h2>
            {[...Array(6).keys()].map((index) => {
              return (
                <div key={"imageDiv" + index}>
                  <img
                    key={"additionalChangeImage" + index}
                    id={"editPicture" + index}
                    src={props.extraImages[index]}
                    className="picPreview"
                    alt={"additional picture " + (index + 1) + " preview"}
                  />

                  <div
                    key={"attributeSelection" + index}
                    className="attributeSelection"
                  >
                    <input
                      id={"imageInput" + index}
                      key={"inputImage" + index}
                      type="file"
                      accept=".png, .jpeg, .jpg"
                      onChange={(event) =>
                        props.handleChangeImage(event, "editPicture" + index)
                      }
                    />
                  </div>
                </div>
              );
            })}{" "}
          </div>

          <div id="editProfileParameters">
            {props.currentUser.type == 0 ? (
              <div className="attributeSelection">
                <div className="abelFont">Age:</div>
                <input
                  id="ageChange"
                  className="textInput"
                  type="number"
                  defaultValue={props.currentUser.age}
                  onChange={calibrateValue}
                />
              </div>
            ) : (
              <></>
            )}

            <div className="attributeSelection">
              <div className="abelFont">Email:</div>
              <input
                id="emailChange"
                className="textInput"
                type="email"
                maxLength="50"
                defaultValue={props.currentUser.email}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Password:</div>
              <input
                id="passwordChange"
                className="textInput"
                type="password"
                maxLength="50"
                defaultValue={props.currentUser.password}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Sector:</div>
              <input
                id="sectorChange"
                className="textInput"
                type="text"
                maxLength="50"
                defaultValue={props.currentUser.sector}
              />
            </div>

            {props.currentUser.type == 0 ? (
              <div className="attributeSelection">
                <div className="abelFont">Position:</div>
                <input
                  id="occupationChange"
                  className="textInput"
                  type="text"
                  maxLength="50"
                  defaultValue={props.currentUser.occupation}
                />
              </div>
            ) : (
              <></>
            )}

            <div className="attributeSelection">
              <div className="abelFont">Location:</div>
              <input
                id="locationChange"
                className="textInput"
                type="text"
                maxLength="50"
                defaultValue={props.currentUser.location}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Intro:</div>
              <textarea
                id="aboutChange"
                defaultValue={props.currentUser.about}
                maxLength="300"
              />
            </div>

            <div className="attributeSelection">
              {props.currentUser.type == 0 ? (
                <div className="abelFont">Personal Website URL:</div>
              ) : (
                <div className="abelFont">Organization Website:</div>
              )}
              <input
                id="websiteChange"
                className="textInput"
                type="url"
                maxLength="50"
                defaultValue={props.currentUser.other_link}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">LinkedIn URL:</div>
              <input
                id="linkedinChange"
                className="textInput"
                type="url"
                maxLength="50"
                defaultValue={props.currentUser.linkedin}
              />
            </div>

            {props.currentUser.type == 0 ? (
              <div className="attributeSelection">
                <div className="abelFont">Resume:</div>
                <input
                  id="resumeChange"
                  type="file"
                  accept=".docx, .txt, .pdf, .doc"
                />
              </div>
            ) : (
              <></>
            )}

            {props.currentUser.type == 0 && props.currentResume.length > 0 ? (
              <div className="attributeSelection">
                <a id="currentResume" href={props.currentResume} download>
                  {" "}
                  Download current resume
                </a>
              </div>
            ) : (
              <></>
            )}

            <div className="attributeSelection">
              <div className="abelFont">Years of Experience:</div>
              <input
                id="experienceChange"
                className="textInput"
                type="number"
                min="0"
                max="40"
                defaultValue={props.currentUser.interested_years}
                onChange={calibrateValue}
              />
            </div>

            {["sectors", "positions", "locations"].map((element, index) => {
              const firstUppercase =
                element.charAt(0).toUpperCase() + element.slice(1);
              const baseInterest = props.currentUser;
              const basicInterest = element.slice(0, -1);
              const parameterArray = [
                baseInterest.interested_sectors,
                baseInterest.interested_positions,
                baseInterest.interested_locations,
              ];

              return (
                <div key={"interestWrapper" + index}>
                  <div className="attributeSelection interestDiv">
                    <div className="abelFont">
                      {firstUppercase} of Interest:
                    </div>
                    <div className="chosenInterest">
                      {parameterArray[index].map((interest, idx) => {
                        return (
                          <p
                            key={"chosen" + firstUppercase + idx}
                            className="chosenInterestBox"
                            onClick={() => {
                              props.handleRemove(idx, "interested_" + element);
                            }}
                          >
                            {interest}
                          </p>
                        );
                      })}{" "}
                    </div>
                  </div>

                  <div className="attributeSelection">
                    <div className="abelFont">Add a new {basicInterest}:</div>
                    <input
                      id={"new" + firstUppercase}
                      className="textInput"
                      type="text"
                      placeholder={`Enter ${basicInterest}...`}
                    />
                    <span>
                      <AddIcon
                        onClick={() => {
                          props.handleAdd(
                            "new" + firstUppercase,
                            "interested_" + element
                          );
                        }}
                        className="addIcon"
                        sx={{
                          backgroundColor: props.deepPurple[500],
                          fontSize: 25,
                        }}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="actionButtons">
          <ThemeProvider theme={props.blueTheme}>
            <Button
              variant="contained"
              onClick={() => props.handleSave(props.currentUser.other_pictures)}
              className="editProfileButton"
            >
              Save Changes
            </Button>
          </ThemeProvider>

          <ThemeProvider theme={props.redTheme}>
            <Button
              variant="contained"
              onClick={props.handleDiscard}
              className="editProfileButton"
            >
              Discard Changes
            </Button>
          </ThemeProvider>
        </div>
        <div id="saveStatus"></div>
      </div>
    );
  }
}
