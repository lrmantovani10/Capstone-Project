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
  static async getMatches(matches) {
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
              if (userMatches.length == 0)
                this.setTemporaryMessage("No matches so far! Keep swiping!");

              for (const element of userMatches) {
                this.setMatches([...matches, element]);
              }
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

  static async handleEndMatch(secondId, firstId) {
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

  static async handleChat(firstId, secondId, firstName, secondName) {
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
