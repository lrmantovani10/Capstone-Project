import "./Message.css";
import Glasses from "./Glasses.png";
export default function Message(props) {
  let messageText;
  if (props.message) {
    if (props.message == 1) {
      messageText = "Loading...";
    } else if (props.message == 2) {
      messageText = "No matches so far! Keep swiping!";
    } else if (props.message == 3) {
      messageText =
        "No potential matches! Broaden filters or come back later for more!";
    }
  }
  return (
    <div className="mainMessage">
      {props.message ? messageText : "An error has occurred. Please try again!"}
      {props.message && props.message != 1 ? (
        <img id="glassImage" src={Glasses} />
      ) : (
        <></>
      )}
    </div>
  );
}
