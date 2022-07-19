import "./Matches.css";
import { useEffect } from "react";
import axios from "axios";
export default function Matches(props) {
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
          .get(`${props.apiURL}/matches`, headers)
          .then((response) => {
            let rawMatches = response.data;
            let dataMatches = [];
            rawMatches.forEach(async (element) => {
              await axios
                .get(`${props.apiURL}/matches/` + element, headers)
                .then((response) => {
                  dataMatches.push(response.data.user);
                });
            });
            console.log(dataMatches);
            props.setMatches([...dataMatches]);
            console.log(props.matches);
          })
          .catch(() => {
            props.setMatches("error");
          });
      } else {
        window.location.replace("/login");
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);
  if (props.matches == "error") {
    return <Error />;
  } else if (props.matches.length > 0) {
    return (
      <div id="matchesDiv">
        {props.matches.map((element) => {
          return <div key={"match" + index}>element.name</div>;
        })}
      </div>
    );
  } else {
    <Error message={"No matches so far! Keep swiping!"} />;
  }
}
