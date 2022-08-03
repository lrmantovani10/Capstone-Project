import axios from "axios";
export default class Swiping {
  constructor(setProfiles, setTemporaryMessage, setProfile, setSwipeCount) {
    this.setProfiles = setProfiles;
    this.setTemporaryMessage = setTemporaryMessage;
    this.setProfile = setProfile;
    this.setSwipeCount = setSwipeCount;
  }

  compareFunction(a, b) {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  }

  async getSwipes(userLocation) {
    const userToken = localStorage.getItem("userToken");
    const headers = {
      headers: {
        authorization: userToken,
      },
    };

    let body = {
      location: userLocation,
    };

    if (!userLocation) {
      body = {};
    }

    await axios
      .post(`${process.env.REACT_APP_APIURL}/get_profiles`, body, headers)
      .then((response) => {
        const sortedResults = response.data.sort(this.compareFunction);
        this.setProfiles(sortedResults);
        if (response.data.length > 0) {
          updateFunction(
            response.data[response.data.length - 1],
            this.setProfile
          );
        } else {
          this.setTemporaryMessage(
            "No potential matches! Broaden filters or come back later for more!"
          );
        }
      })
      .catch(() => {
        this.setProfiles(["error"]);
      });
  }

  async handleSwipe(
    type,
    userEmail,
    profiles,
    profile,
    currentUser,
    swipeCount,
    updateFunction
  ) {
    let profileCopy = [...profiles];
    let swipedProfile = profileCopy.pop();
    if (profileCopy.length == 0) {
      this.setTemporaryMessage("Loading...");
    }
    let body = {
      email: userEmail,
    };
    if (type == 0) {
      body["swipedProfile"] = swipedProfile._id;
    } else {
      body["likedProfile"] = swipedProfile._id;
      body["otherEmail"] = profile.email;
    }
    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };
    await axios
      .post(`${process.env.REACT_APP_APIURL}/change_profile`, body, headers)
      .then(async (response) => {
        localStorage.setItem("userToken", response.data);
        if (profile.profilesLiked.includes(currentUser._id)) {
          alert("You matched with " + profile.name + "! 🎉");
          let body = {
            matched_name: currentUser.name,
            match_name: profile.name,
            email: profile.email,
          };
          await axios
            .post(`${process.env.REACT_APP_APIURL}/send_email`, body, headers)
            .then(async () => {
              this.setProfiles(profileCopy);
              updateFunction(
                profileCopy[profileCopy.length - 1],
                this.setProfile
              );
              if (swipeCount == 20 || profileCopy.length == 0) {
                await this.getSwipes();
                this.setSwipeCount(1);
              } else {
                this.setSwipeCount(swipeCount + 1);
              }
            })
            .catch(() => {
              this.setProfiles(["error"]);
            });
        } else {
          this.setProfiles(profileCopy);
          updateFunction(profileCopy[profileCopy.length - 1], this.setProfile);
          if (swipeCount == 20 || profileCopy.length == 0) {
            await this.getSwipes();
            this.setSwipeCount(1);
          } else {
            this.setSwipeCount(swipeCount + 1);
          }
        }
      })
      .catch(() => {
        this.setProfiles(["error"]);
      });
  }
}
