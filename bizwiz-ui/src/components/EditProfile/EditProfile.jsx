import "./EditProfile.css";
import { useEffect } from "react";
import Message from "../Message/Message";
import axios from "axios";
import "@fontsource/abel";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { ThemeProvider } from "@mui/material";
import EditComponents from "./EditComponents";

export default function EditProfile(props) {
  useEffect(() => {
    try {
      props.setCurrentUser(1);
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) {
        const headers = {
          headers: {
            authorization: userToken,
            type: 1,
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

  if (props.currentUser == 1) {
    return <Message message={1} />;
  } else if (props.currentUser == 0) {
    return <Message />;
  } else if (props.currentUser !== 2) {
    return (
      <div id="editProfile">
        <h1 id="editProfileHeader" className="abelFont whiteAbel">
          {props.currentUser.name}{" "}
        </h1>

        <div id="verticalColumns">
          <div id="profileImageHeader">
            <h4 id="editImageHeader" className="abelFont whiteAbel">
              Profile Image
            </h4>
            <div className="imageAlign">
              <img
                id="profilePicPreview"
                src={props.profileImage}
                alt="profile picture preview"
              />
              <div className="attributeSelection" id="editProfileImage">
                <input
                  id="profilePicChange"
                  type="file"
                  accept=".png, .jpeg, .jpg"
                  onChange={(e) => {
                    props.EditFunctions.handleChangeImage(
                      e,
                      "profilePicPreview"
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <h2 className="abelFont whiteAbel othersHeader">Basic Info</h2>

          <div id="editProfileParameters">
            <div className="parameterGrid">
              <EditComponents
                field={"Email"}
                id={"emailChange"}
                type={"email"}
                userValue={props.currentUser.email}
              />
              <EditComponents
                field={"Password"}
                id={"passwordChange"}
                type={"password"}
                userValue={props.currentUser.password}
              />

              {props.currentUser.type == 0 ? (
                <div className="attributeSelection">
                  <div className="abelFont">Age</div>
                  <input
                    id="ageChange"
                    className="textInput"
                    type="number"
                    min="18"
                    max="110"
                    defaultValue={props.currentUser.age}
                    onChange={(e) => {
                      props.EditFunctions.calibrateValue(e, props.currentUser);
                    }}
                  />
                </div>
              ) : (
                <></>
              )}

              <EditComponents
                field={"Sector"}
                id={"sectorChange"}
                type={"text"}
                userValue={props.currentUser.sector}
              />

              {props.currentUser.type == 0 ? (
                <EditComponents
                  field={"Position"}
                  id={"occupationChange"}
                  type={"text"}
                  userValue={props.currentUser.occupation}
                />
              ) : (
                <></>
              )}

              <div className="attributeSelection">
                <div className="abelFont">Years of Experience</div>
                <input
                  id="experienceChange"
                  className="textInput"
                  type="number"
                  min="0"
                  max="40"
                  defaultValue={props.currentUser.interested_years}
                  onChange={(e) => {
                    props.EditFunctions.calibrateValue(e, props.currentUser);
                  }}
                />
              </div>

              <div className="attributeSelection">
                {props.currentUser.type == 0 ? (
                  <div className="abelFont">Personal Website URL</div>
                ) : (
                  <div className="abelFont">Organization Website</div>
                )}
                <input
                  id="websiteChange"
                  className="textInput"
                  type="url"
                  maxLength="50"
                  defaultValue={props.currentUser.other_link}
                />
              </div>

              <EditComponents
                field={"LinkedIn URL"}
                id={"linkedinChange"}
                type={"url"}
                userValue={props.currentUser.linkedin}
              />
            </div>

            <div className="attributeSelection" id="introText">
              <div className="abelFont">Intro</div>
              <textarea
                id="aboutChange"
                defaultValue={props.currentUser.about}
                maxLength="300"
              />
            </div>

            <div id="resumeActions">
              {props.currentUser.type == 0 ? (
                <div className="attributeSelection" id="resumeAlign">
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
              )}{" "}
            </div>
          </div>

          <h2 className="abelFont whiteAbel othersHeader">Other Images</h2>
          <div id="editProfileImages" className="parameterGrid">
            {[...Array(6).keys()].map((index) => {
              return (
                <div key={"imageDiv" + index} className="imageContainer">
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
                      className="addImageInput"
                      accept=".png, .jpeg, .jpg"
                      onChange={(e) =>
                        props.EditFunctions.handleChangeImage(
                          e,
                          "editPicture" + index
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}{" "}
          </div>

          <h2 className="abelFont whiteAbel othersHeader">Interests</h2>

          <div id="interestFlex">
            <div className="interestGrid">
              {["sectors", "positions", "locations"].map((element, index) => {
                const firstUppercase =
                  element.charAt(0).toUpperCase() + element.slice(1);
                const baseInterest = props.currentUser;
                const parameterArray = [
                  baseInterest.interested_sectors,
                  baseInterest.interested_positions,
                  baseInterest.interested_locations,
                ];
                return (
                  <div key={"interestWrapper" + index}>
                    <div className="attributeSelection interestDiv">
                      <div className="abelFont">
                        {firstUppercase}
                        &nbsp;of Interest
                      </div>
                      <div className="chosenInterest">
                        {parameterArray[index].map((interest, idx) => {
                          return (
                            <p
                              key={"chosen" + firstUppercase + idx}
                              className="chosenInterestBox"
                              onClick={() => {
                                props.EditFunctions.handleRemove(
                                  idx,
                                  "interested_" + element,
                                  props.currentUser
                                );
                              }}
                            >
                              {interest}{" "}
                            </p>
                          );
                        })}{" "}
                      </div>
                    </div>
                  </div>
                );
              })}{" "}
            </div>
            <div className="interestGrid">
              {["sectors", "positions", "locations"].map((element, index) => {
                const firstUppercase =
                  element.charAt(0).toUpperCase() + element.slice(1);
                const basicInterest = element.slice(0, -1);
                return (
                  <div
                    className="attributeSelection"
                    key={"attributeSelect" + index}
                  >
                    <div className="abelFont">Add a new {basicInterest}:</div>
                    <div id="buttonSelection">
                      <input
                        id={"new" + firstUppercase}
                        className="textInput"
                        type="text"
                        placeholder={`Enter ${basicInterest}...`}
                      />
                      <span>
                        <AddIcon
                          onClick={() => {
                            props.EditFunctions.handleAdd(
                              "new" + firstUppercase,
                              "interested_" + element,
                              props.currentUser
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
              })}{" "}
            </div>
          </div>
        </div>

        <div id="actionButtons">
          <ThemeProvider theme={props.blueTheme}>
            <Button
              variant="contained"
              onClick={async () => {
                props.AppFunctions.changeMessage("Loading...", "white");
                await props.EditFunctions.handleSave(props.currentUser);
              }}
              className="editProfileButton"
            >
              Save Changes
            </Button>
          </ThemeProvider>

          <ThemeProvider theme={props.redTheme}>
            <Button
              variant="contained"
              onClick={() => {
                window.location.replace("/profile");
              }}
              className="editProfileButton"
            >
              Discard Changes
            </Button>
          </ThemeProvider>
        </div>
        <div id="returnResult"></div>
      </div>
    );
  }
}
