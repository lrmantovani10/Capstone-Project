export default function EditComponents(props) {
  return (
    <div className="attributeSelection">
      <div className="abelFont">{props.field}</div>
      <input
        id={props.id}
        className="textInput"
        type={props.type}
        maxLength="50"
        defaultValue={props.userValue}
      />
    </div>
  );
}
