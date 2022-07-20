import "./Matches.css";
import { useEffect } from "react";
import "@fontsource/abel";
import CloseIcon from "@mui/icons-material/Close";
import Error from "../Error/Error";
import { Button } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
export default function Matches(props) {
  useEffect(() => {
    try {
      props.getMatches();
    } catch {
      window.location.replace("/login");
    }
  }, []);
  if (props.matches == "error") {
    return <Error />;
  } else if (props.matches.length > 0) {
    return (
      <div id="matchesDiv">
        {props.matches.map((element, index) => {
          return (
            <div key={"match" + index} className="card mb-3 matchIndividual">
              <div className="row no-gutters">
                <div className="col-md-4">
                  <img
                    src={
                      element.profile_picture.length > 0
                        ? props.profilePath +
                          element._id +
                          "." +
                          element.profile_picture
                        : props.profilePath + "default.png"
                    }
                    className="card-img matchPicture"
                    alt={"picture of " + element.name}
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <div className="matchHeader">
                      <CloseIcon
                        className="endMatch"
                        onClick={() => props.handleEndMatch(element._id)}
                      />
                    </div>
                    <h4 className="card-title matchName">
                      {element.name} |{" "}
                      {props.currentUser.type == 0
                        ? element.interested_years + "+ "
                        : element.age}
                    </h4>

                    <p className="card-text matchAbout">{element.about}</p>
                    <p className="card-text">
                      <span className="card-text">Email: {element.email}</span>
                    </p>
                    <p className="card-text">
                      <span className="card-text">
                        Location: {element.location}
                      </span>
                    </p>
                    <div id="messageButtonDiv">
                      <ThemeProvider theme={props.purpleTheme}>
                        <Button id="messageButton" variant="contained">
                          Message
                        </Button>
                      </ThemeProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    return <Error message={"No matches so far! Keep swiping!"} />;
  }
}
