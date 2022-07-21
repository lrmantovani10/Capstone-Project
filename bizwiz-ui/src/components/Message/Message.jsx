import "./Message.css";
import Glasses from "./Glasses.png"
export default function Message(props) {
  return (
    <div className="mainMessage">
      {props.message
        ? props.message
        : "An error occurred. Please try again!"}
      {(props.message && !props.message.includes("Loading..."))?
        <img id="glassImage" src={Glasses}/>:
        <></>}    
    </div>
  );
}
