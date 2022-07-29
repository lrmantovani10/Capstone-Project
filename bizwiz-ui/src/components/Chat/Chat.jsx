import "@sendbird/uikit-react/dist/index.css";
import withSendbird from "@sendbird/uikit-react/withSendbird";
import Channel from "@sendbird/uikit-react/Channel";
const MyChatUI = (props) => {
  return (
    <Channel
      channelUrl={props.currentChannel}
      replyType={"QUOTE_REPLY"}
      isReactionEnabled={true}
      onChatHeaderActionClick={() => {
        alert(
          "This is a space for you to chat with your matched " +
            (props.userType == 0 ? " employer" : " employee") +
            ". Make the most out of this opportunity!"
        );
      }}
    />
  );
};

export default withSendbird(MyChatUI);
