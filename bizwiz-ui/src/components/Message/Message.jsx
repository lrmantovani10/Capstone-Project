import "./Message.css";
export default function Message(props) {
  return (
    <div className="mainMessage">
      {props.message
        ? props.message
        : "There was an error loading the page. Please try again!"}
    </div>
  );
}
