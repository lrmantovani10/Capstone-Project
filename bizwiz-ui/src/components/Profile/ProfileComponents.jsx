export default function ProfileComponents(props) {
  return (
    <div className="interestsDiv">
      <h3 className="abelFont whiteAbel">{props.title}</h3>
      <div className="currentInterests">
        {props.userArray.map((element, index) => {
          return (
            <p className="interestElement" key={props.parameter + index}>
              {element}{" "}
            </p>
          );
        })}{" "}
      </div>
    </div>
  );
}
