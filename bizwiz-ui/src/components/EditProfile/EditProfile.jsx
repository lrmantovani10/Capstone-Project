import "./EditProfile.css";
import { useEffect } from "react";
import Message from "../Message/Message";
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
      props.setCurrentUser("Loading");
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) {
        const headers = {
          headers: {
            authorization: userToken,
            type:1,
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

  if (props.currentUser == "Loading") {
    return <Message message={"Loading..."} />;
  } else if (props.currentUser == "error") {
    return <Message />;
  } else if (props.currentUser !== "") {
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
                  onChange={(event) =>
                    props.handleChangeImage(event, "profilePicPreview")
                  }
                />
              </div>
            </div>
          </div>
          <h2 className="abelFont whiteAbel othersHeader">Basic Info</h2>

          <div id="editProfileParameters">
            <div className="parameterGrid">
              <div className="attributeSelection">
                <div className="abelFont">Email</div>
                <input
                  id="emailChange"
                  className="textInput"
                  type="email"
                  maxLength="50"
                  defaultValue={props.currentUser.email}
                />
              </div>

              <div className="attributeSelection">
                <div className="abelFont">Password</div>
                <input
                  id="passwordChange"
                  className="textInput"
                  type="password"
                  maxLength="50"
                  defaultValue={props.currentUser.password}
                />
              </div>

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
                    onChange={calibrateValue}
                  />
                </div>
              ) : (
                <></>
              )}

              <div className="attributeSelection">
                <div className="abelFont">Sector</div>
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
                  <div className="abelFont">Position</div>
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
                <div className="abelFont">Years of Experience</div>
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

              <div className="attributeSelection">
                <div className="abelFont">LinkedIn URL</div>
                <input
                  id="linkedinChange"
                  className="textInput"
                  type="url"
                  maxLength="50"
                  defaultValue={props.currentUser.linkedin}
                />
              </div>
            </div>

            <div className="attributeSelection">
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
                      onChange={(event) =>
                        props.handleChangeImage(event, "editPicture" + index)
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
                        of Interest
                      </div>
                      <div className="chosenInterest">
                        {parameterArray[index].map((interest, idx) => {
                          return (
                            <p
                              key={"chosen" + firstUppercase + idx}
                              className="chosenInterestBox"
                              onClick={() => {
                                props.handleRemove(
                                  idx,
                                  "interested_" + element
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
                const baseInterest = props.currentUser;
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
              })}{" "}
            </div>
          </div>
        </div>

        <div id="actionButtons">
          <ThemeProvider theme={props.blueTheme}>
            <Button
              variant="contained"
              onClick={async () => {
                props.changeMessage("Loading...", "white");
                await props.handleSave();
              }}
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
        <div id="returnResult"></div>
      </div>
    );
  }
}
