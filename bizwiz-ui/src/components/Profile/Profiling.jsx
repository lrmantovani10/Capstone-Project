import axios from "axios";
export default class Profiling {
  constructor(changeMessage) {
    this.changeMessage = changeMessage;
  }

  static async handleLogout() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length == 0) {
      window.location.replace("/login");
    }
    const headers = {
      headers: {
        authorization: userToken,
      },
    };
    await axios
      .post(`${process.env.REACT_APP_APIURL}/logout`, {}, headers)
      .then(() => {
        this.changeMessage("Logging out...", "green");
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/login");
      })
      .catch(() => {
        this.changeMessage("Error logging out. Please try again!", "red");
      });
  }

  static async handleDelete(currentUser) {
    if (confirm("Delete account?")) {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length == 0) {
        window.location.replace("/login");
      }
      const headers = {
        headers: {
          authorization: userToken,
        },
      };
      await axios
        .post(
          `${process.env.REACT_APP_APIURL}/delete`,
          { user: currentUser },
          headers
        )
        .then(() => {
          this.changeMessage("Deleting account...", "green");
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/welcome");
        })
        .catch(() => {
          this.changeMessage(
            "Error deleting account. Please try again!",
            "red"
          );
        });
    }
  }
}
