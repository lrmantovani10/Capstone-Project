export default class Apping {
  constructor(setProfileImage, setResume, setExtras) {
    this.setProfileImage = setProfileImage;
    this.setResume = setResume;
    this.setExtras = setExtras;
  }
  updateParameters(user, setFunction) {
    if (user) {
      if (user.profile_picture.length > 0) {
        this.setProfileImage(user.profile_picture);
      } else {
        this.setProfileImage(process.env.REACT_APP_PROFILES + "default.png");
      }
      if (user.type == 0 && user.resume.length > 0) {
        this.setResume(user.resume);
      } else {
        this.setResume({});
      }
      let newExtras = [];

      for (let i = 0; i < 6; i++) {
        if (user["other_pictures"][i]) {
          newExtras.push(user["other_pictures"][i]);
        } else {
          newExtras.push(process.env.REACT_APP_OTHERS + "default.png");
        }
      }

      this.setExtras(newExtras);
      setFunction(user);
    }
  }

  changeMessage(newMessage, newColor) {
    const messageElement = document.getElementById("returnResult");
    if (newMessage) messageElement.innerHTML = newMessage;
    if (newColor) messageElement.style.color = newColor;
  }
}
