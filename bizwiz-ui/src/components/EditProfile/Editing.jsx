import * as imageConversion from "image-conversion";
import axios from "axios";
import { changeMessage } from "../App/Apping";
export default class Editing {
  constructor(setCurrentUser) {
    this.setCurrentUser = setCurrentUser;
  }
  static handleChangeImage(event, targetId) {
    const picturePreview = document.getElementById(targetId);
    picturePreview.src = URL.createObjectURL(event.target.files[0]);
  }

  static calibrateValue(e, currentUser) {
    let years = e.value;
    {
      years < 0 ? (years = 0) : years > 40 ? (years = 40) : years;
    }
    let newUser = {
      ...currentUser,
    };
    newUser["interested_years"] = years;
    this.setCurrentUser(newUser);
  }

  static handleRemove(index, field, currentUser) {
    let user = { ...currentUser };
    user[field].splice(index, 1);
    this.setCurrentUser(user);
  }

  static handleAdd(itemId, field, currentUser) {
    const newItem = document.getElementById(itemId).value;
    let user = { ...currentUser };
    if (!user[field].includes(newItem.toLowerCase()))
      user[field].push(newItem.toLowerCase());
    this.setCurrentUser(user);
  }

  static async storeFile(file, headers, destination, category, currentUser) {
    if (file) {
      let newForm = new FormData();
      const extension = "." + file.name.split(".")[1];
      const body = {
        userId: currentUser._id,
        userEmail: currentUser.email,
        destination: destination,
        extension: extension,
        category: category,
      };

      if (file.size / 1000 > 60 && category != "resume") {
        const filename = file.name;
        file = await imageConversion.compressAccurately(file, 60);
        file = new File([file], filename);
        changeMessage(
          "Image size can't be over 60KB! Using image compression...",
          "yellow"
        );
      } else if (category == "resume" && file.size / 1000 > 60) {
        changeMessage(
          "Resume size can't be over 60KB! Please try again!",
          "red"
        );
        throw new Error("Resume size is too large!");
      }
      newForm.append("data", JSON.stringify(body));
      newForm.append("file", file);

      await axios
        .post(`${process.env.REACT_APP_APIURL}/upload_single`, newForm, headers)
        .catch((error) => {
          changeMessage("Account update failed. Please try again!", "red");
          throw new Error(error);
        });
    }
  }

  static async checkUser(email, headers) {
    await axios
      .post(
        `${process.env.REACT_APP_APIURL}/check_user`,
        { email: email },
        headers
      )
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          changeMessage(error.response.data.error.message, "red");
        else changeMessage("Error updating profile. Please try again!", "red");
        throw new Error(error);
      });
  }

  static async changeProfile(body, headers) {
    await axios
      .post(`${process.env.REACT_APP_APIURL}/change_profile`, body, headers)
      .then((response) => {
        localStorage.setItem("userToken", response.data);
      })
      .catch((error) => {
        changeMessage("Account update failed. Please try again!", "red");
        throw new Error(error);
      });
  }

  static async storeExtraPictures(files, headers, currentUser) {
    let index = 0;
    for (const file of files) {
      await this.storeFile(
        file,
        headers,
        process.env.REACT_APP_OTHERS,
        "other_pictures_" + index,
        currentUser
      );
      index++;
    }
  }

  static async handleSave(currentUser) {
    const email = document.getElementById("emailChange").value;
    const password = document.getElementById("passwordChange").value;
    const sector = document.getElementById("sectorChange").value;
    const about = document.getElementById("aboutChange").value;
    const site = document.getElementById("websiteChange").value;
    const linkedin = document.getElementById("linkedinChange").value;
    const profilePicture = document.getElementById("profilePicChange").files[0];
    const interested_years = document.getElementById("experienceChange").value;
    let location;

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            location = pos;
            resolve();
          },
          () => {
            alert("Currently not setting location.");
            resolve();
          }
        );
      });
    } else {
      alert("Your browser doesn't support geolocation. Not setting location.");
    }

    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };

    let other_pictures = [];
    for (let index = 0; index < 6; index++) {
      const currentPictureFile = document.getElementById("imageInput" + index)
        .files[0];
      other_pictures.push(currentPictureFile);
    }

    let body = {
      email: email,
      password: password,
      sector: sector,
      about: about,
      other_link: site,
      linkedin: linkedin,
      interested_years: interested_years,
      interested_sectors: currentUser.interested_sectors,
      interested_locations: currentUser.interested_locations,
      interested_positions: currentUser.interested_positions,
    };

    if (location) {
      body.location = location;
    }

    let userResume;
    if (currentUser.type == 0) {
      body["age"] = document.getElementById("ageChange").value;
      body["occupation"] = document.getElementById("occupationChange").value;
      userResume = document.getElementById("resumeChange").files[0];
    }

    if (password.length < 10) {
      changeMessage("Password is less than 10 characters!", "red");
    } else {
      await Promise.all([
        this.checkUser(email, headers),
        this.storeFile(
          profilePicture,
          headers,
          process.env.REACT_APP_PROFILES,
          "profile_picture",
          currentUser
        ),
        this.storeFile(
          userResume,
          headers,
          process.env.REACT_APP_RESUMES,
          "resume",
          currentUser
        ),
        this.storeExtraPictures(other_pictures, headers, currentUser),
      ]).then(async () => {
        await this.changeProfile(body, headers).then(() => {
          changeMessage("Account successfully updated!", "green");
          window.location.replace("profile");
        });
      });
    }
  }
}
