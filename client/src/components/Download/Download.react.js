
import * as React from "react";
//import { Avatar, Text } from "../";

import {
    Avatar,
    Text,
} from "tabler-react";

import DownloadTray from "./DownloadTray.react";

export type Props = {|
  /**
   * The  avatar image URL
   */
  +avatarURL?: string,
  /**
   * The message displayed within the Notification
   */
  +message: React.Node,
  /**
   * The time displayed within the Notification
   */
  +time?: string,
  /**
   * Indicate the notification as unread
   */
  +unread?: boolean,
|};

/**
 * An individual Notification made up of an Avatar alongside some text and the time
 */
function Download({ avatarURL, message, time, unread }: Props): React.Node {
    console.log('in index');
  return (
    <React.Fragment>
      {avatarURL && (
        <Avatar className="mr-3 align-self-center" imageURL={avatarURL} />
      )}
      <div>
        {message}
        {time && (
          <Text color="muted" size="small">
            {time}
          </Text>
        )}
      </div>
    </React.Fragment>
  );
}

Download.Tray = DownloadTray;

export default Download;
