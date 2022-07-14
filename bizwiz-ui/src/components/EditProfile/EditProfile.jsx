import "./EditProfile.css";
import { useEffect } from "react";
import Error from "../Error/Error";
import axios from "axios";
import "@fontsource/abel";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material";

export default function EditProfile(props) {
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
      <div id="editProfile">
        <h1 id="editProfileHeader" className="abelFont">
          {props.currentUser.name}
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
            })}
          </div>

          <div id="editProfileParameters">
            <div className="attributeSelection">
              <div className="abelFont">Age:</div>
              <input
                id="ageChange"
                className="textInput"
                type="number"
                defaultValue={props.currentUser.age}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Email:</div>
              <input
                id="emailChange"
                className="textInput"
                type="email"
                defaultValue={props.currentUser.email}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Password:</div>
              <input
                id="passwordChange"
                className="textInput"
                type="password"
                defaultValue={props.currentUser.password}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Sector:</div>
              <input
                id="sectorChange"
                className="textInput"
                type="text"
                defaultValue={props.currentUser.sector}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Position:</div>
              <input
                id="occupationChange"
                className="textInput"
                type="text"
                defaultValue={props.currentUser.occupation}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Location:</div>
              <input
                id="locationChange"
                className="textInput"
                type="text"
                defaultValue={props.currentUser.location}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Intro:</div>
              <textarea
                id="aboutChange"
                defaultValue={props.currentUser.about}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Personal Website URL:</div>
              <input
                id="websiteChange"
                className="textInput"
                type="url"
                defaultValue={props.currentUser.other_link}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">LinkedIn URL:</div>
              <input
                id="linkedinChange"
                className="textInput"
                type="url"
                defaultValue={props.currentUser.linkedin}
              />
            </div>

            <div className="attributeSelection">
              <div className="abelFont">Resume:</div>
              <input
                id="resumeChange"
                type="file"
                accept=".docx, .txt, .pdf, .doc"
              />
            </div>
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
