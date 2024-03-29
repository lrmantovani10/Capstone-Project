import axios from "axios";
export default class Matching {
  constructor(
    setCurrentUser,
    setTemporaryMessage,
    setMatches,
    setChatting,
    setCurrentChannel
  ) {
    this.setCurrentUser = setCurrentUser;
    this.setTemporaryMessage = setTemporaryMessage;
    this.setMatches = setMatches;
    this.setChatting = setChatting;
    this.setCurrentChannel = setCurrentChannel;
  }

  // Send a request to retrieve all of the user's matches.
  async getMatches() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length > 0) {
      const headers = {
        headers: {
          authorization: userToken,
          type: 2,
        },
      };
      await axios
        .get(`${process.env.REACT_APP_APIURL}/get_user`, headers)
        .then(async (userResponse) => {
          this.setCurrentUser(userResponse.data);
          await axios
            .get(`${process.env.REACT_APP_APIURL}/matches`, headers)
            .then(async (response) => {
              let userMatches = response.data;
              if (userMatches.length == 0) this.setTemporaryMessage(2);
              this.setMatches(userMatches);
              this.setChatting(false);
            })
            .catch(() => {
              this.setMatches("error");
            });
        })
        .catch(() => {
          this.setMatches("error");
        });
    } else {
      window.location.replace("/login");
    }
  }

  // Send a request to remove a profile from the user's "matches" array and insert
  // it into the array of rejected profiles. Do the same for the matched profile in
  // relation to the current user.
  async handleEndMatch(secondId, firstId) {
    if (confirm("Are you sure you want to remove this match?")) {
      const body = {
        firstProfile: firstId,
        secondProfile: secondId,
      };
      const headers = {
        headers: {
          authorization: localStorage.getItem("userToken"),
        },
      };
      await axios
        .post(
          `${process.env.REACT_APP_APIURL}/matches/remove_match`,
          body,
          headers
        )
        .then(async (response) => {
          localStorage.setItem("userToken", response.data);
          window.location.replace("/matches");
        })
        .catch(() => {
          this.setMatches(["error"]);
        });
    }
  }

  // Send a request to the /manage_chat endpoint to create or retrieve a Sendbird
  // channel between the two users when either one of them clicks the "Message" button.
  async handleChat(firstId, secondId, firstName, secondName) {
    let ids = [firstId, secondId];
    ids.sort();
    let chatName, channelUrl;
    if (ids[0] == firstId) {
      chatName = firstName + " | " + secondName;
      channelUrl = firstId + secondId;
    } else {
      chatName = secondName + " | " + firstName;
      channelUrl = secondId + firstId;
    }
    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };
    const body = {
      name: chatName,
      channel_url: channelUrl,
      user_ids: ids,
    };

    await axios
      .post(
        `${process.env.REACT_APP_APIURL}/matches/manage_chat`,
        body,
        headers
      )
      .then((response) => {
        this.setCurrentChannel(response.data);
        this.setChatting(true);
      })
      .catch(() => {
        this.setMatches("error");
      });
  }
}
