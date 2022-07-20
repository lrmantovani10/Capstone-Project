import "./Message.css";
import Glasses from "./Glasses.png"
export default function Message(props) {
  return (
    <div className="mainMessage">
      {props.message
        ? props.message
        : "There was an error loading the page. Please try again!"}
      {(props.message && !props.message.includes("Loading..."))?
        <img id="glassImage" src={Glasses}/>:
        <></>}    
    </div>
  );
}
