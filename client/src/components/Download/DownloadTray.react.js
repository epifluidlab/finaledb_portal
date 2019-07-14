import * as React from "react";
//import { Download } from "../";
import {
    Dropdown
} from "tabler-react";

import type { Props as DownloadProps } from "./Download.react";

export type Props = {|
  /**
   * Download components
   */
  +children?: React.ChildrenArray<React.Element<typeof Download>>,
  /**
   * An array containing objects of notification data
   */
  +downloadsObjects?: Array<DownloadProps>,
  /**
   * Display a small red circle to symbolize that there are unread notifications
   */
  +unread?: boolean,
  /**
   * Action to run when the 'Mark All As Read' button is activated
   */
  +markAllAsRead?: () => void,
|};

/**
 * An Icon triggered Dropdown containing Notifications
 */
function DownloadTray(props: Props): React.Node {
    console.log('in index');
  const { children, unread, downloadsObjects, markAllAsRead } = props;
  const downloads = children && React.Children.toArray(children);
  return (
    <Dropdown
      triggerContent={unread && <span className="nav-unread" />}
      toggle={false}
      icon="bell"
      isNavLink={true}
      position="bottom-end"
      arrow={true}
      arrowPosition="right"
      flex
      items={
        <React.Fragment>
          {(downloads &&
            downloads.map((n: React.Node, i) => (
              <Dropdown.Item className="d-flex" key={i}>
                {n}
              </Dropdown.Item>
            ))) ||
            (downloadsObjects &&
                downloadsObjects.map((n, i) => (
                <Dropdown.Item
                  className={`d-flex ${n.unread ? "bg-light" : ""}`}
                  key={i}
                >
                  <Download
                    unread={n.unread}
                    avatarURL={n.avatarURL}
                    message={n.message}
                    time={n.time}
                  />
                </Dropdown.Item>
              )))}
          {markAllAsRead && unread && (
            <React.Fragment>
              <Dropdown.ItemDivider />
              <Dropdown.Item
                className="text-center text-muted-dark"
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </Dropdown.Item>
            </React.Fragment>
          )}
        </React.Fragment>
      }
    />
  );
}

export default DownloadTray;