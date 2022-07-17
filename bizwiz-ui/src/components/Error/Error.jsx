import "./Error.css";
export default function Error(props) {
  return (
    <div className="errorMessage">
      {props.message
        ? props.message
        : "There was an error loading the page. Please try again!"}
    </div>
  );
}
