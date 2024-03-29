import axios from "axios";
export default class Swiping {
  constructor(setProfiles, setTemporaryMessage, setProfile, setSwipeCount) {
    this.setProfiles = setProfiles;
    this.setTemporaryMessage = setTemporaryMessage;
    this.setProfile = setProfile;
    this.setSwipeCount = setSwipeCount;
  }

  // Function that compares two user objects by distance. Used for sorting.
  compareFunction(a, b) {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  }

  // Make a request to obtain the profiles of potential matches.
  async getSwipes(userLocation, updateClass) {
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
          updateClass.updateParameters(
            response.data[response.data.length - 1],
            this.setProfile
          );
        } else {
          this.setTemporaryMessage(3);
        }
      })
      .catch(() => {
        this.setProfiles([false]);
      });
  }

  // Send a notification email to the matched user whenever a match occurs.
  async sendEmail(body, headers, profileCopy, updateClass, swipeCount) {
    await axios
      .post(`${process.env.REACT_APP_APIURL}/send_email`, body, headers)
      .then(async () => {
        this.setProfiles(profileCopy);
        updateClass.updateParameters(
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
        this.setProfiles([false]);
      });
  }

  // Get more potential matches or render a notification message whenever the user
  // reaches 20 swipes or there are no more profiles that pass its filters.
  async swipeLimit(swipeCount, profileCopy, updateClass) {
    this.setProfiles(profileCopy);
    updateClass.updateParameters(
      profileCopy[profileCopy.length - 1],
      this.setProfile
    );
    if (swipeCount == 20 || profileCopy.length == 0) {
      await this.getSwipes();
      this.setSwipeCount(1);
    } else {
      this.setSwipeCount(swipeCount + 1);
    }
  }

  // Update the user's profile with the profiles that they liked/rejected whenever they swipe. Also
  // change the matched user's profile to add a match to its "matches" array whenever a match occurs.
  async handleSwipe(
    type,
    userEmail,
    profiles,
    profile,
    currentUser,
    swipeCount,
    updateClass
  ) {
    let profileCopy = [...profiles];
    let swipedProfile = profileCopy.pop();
    if (profileCopy.length == 0) {
      this.setTemporaryMessage(1);
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
          await this.sendEmail(
            body,
            headers,
            profileCopy,
            updateClass,
            swipeCount
          );
        } else {
          await this.swipeLimit(swipeCount, profileCopy, updateClass);
        }
      })
      .catch(() => {
        this.setProfiles([false]);
      });
  }
}
