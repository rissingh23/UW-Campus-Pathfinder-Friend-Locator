import React, { ChangeEvent, MouseEvent, Component } from 'react';
import { USERS } from "./users";
import { isRecord } from './record';
import { parseFriends, jsonifyFriends, Friends } from './friends';

type FriendsEditorProps = {
  user: string;
};

type FriendsEditorState = {
  friends?: Friends;
  allUsers: Array<string>;
};

export class FriendsEditor extends Component<FriendsEditorProps, FriendsEditorState> {
  constructor(props: FriendsEditorProps) {
    super(props);
    this.state = { allUsers: USERS };
  }

  componentDidMount = (): void => {
    fetch('/api/getFriends?user=' + encodeURIComponent(this.props.user))
      .then(this.doFriendsResp)
      .catch(this.doFriendsError);
  };

  render = (): JSX.Element => {
    if (!this.state.friends) {
      return <p>Loading friends...</p>;
    }
    return (
      <div>
        <h3>Friends List</h3>
        <ul>{this.state.friends.map(this.renderFriend)}</ul>
        <select onChange={this.doAddFriendChange}>
          <option value="">Add a Friend</option>
          {this.renderUserOptions()}
        </select>
      </div>
    );
  };

  renderFriend = (friend: string): JSX.Element => {
    return (
      <li key={friend}>
        {friend} <button onClick={(evt) => this.doRemoveFriendClick(evt, friend)}>Unfriend</button>
      </li>
    );
  };

  renderUserOptions = (): Array<JSX.Element> => {
    const options: Array<JSX.Element> = [];
    for (const user of this.state.allUsers) {
        if (!(this.state.friends ?? []).includes(user)) {
            options.push(<option key={user} value={user}>{user}</option>);
      }
    }
    return options;
  };

  doFriendsResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text().then((msg) => this.doFriendsError("bad status code " + res.status + ": " + msg));
      return;
    }
    res.json().then(this.doFriendsJson).catch(() => this.doFriendsError("Failed to parse JSON"));
  };

  doFriendsJson = (data: unknown): void => {
    if (isRecord(data) && data.friends !== undefined) {
      this.setState({ friends: parseFriends(data.friends) });
    } else {
      this.doFriendsError("Invalid response format");
    }
  };

  doFriendsError = (msg: string): void => {
    console.error("Error while fetching friends:", msg);
  };

  doAddFriendChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    const newFriend = evt.target.value;
    if (newFriend === "" || !this.state.friends) {
      return;
    }
    const updatedFriends = this.state.friends.concat([newFriend]);
    this.doUpdateFriendsChange(updatedFriends);
  };

  doRemoveFriendClick = (_evt: MouseEvent<HTMLButtonElement>, friend: string): void => {
    if (!this.state.friends) {
      return;
    }
    const updatedFriends = [];
    for (const f of this.state.friends) {
      if (f !== friend) {
        updatedFriends.push(f);
      }
    }
    this.doUpdateFriendsChange(updatedFriends);
  };

  doUpdateFriendsChange = (newFriends: Friends): void => {
    const body = { user: this.props.user, friends: jsonifyFriends(newFriends) };
    fetch("/api/setFriends", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then(this.doUpdateFriendsResp)
      .catch(this.doUpdateFriendsError);
  };

  doUpdateFriendsResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text().then((msg) => this.doUpdateFriendsError("bad status code " + res.status + ": " + msg));
      return;
    }
    res.json().then(this.doUpdateFriendsJson).catch(() => this.doUpdateFriendsError("Failed to parse JSON"));
  };

  doUpdateFriendsJson = (data: unknown): void => {
    if (isRecord(data) && data.saved === true) {
      this.setState({ friends: this.state.friends });
    } else {
      this.doUpdateFriendsError("Invalid response format");
    }
  };

  doUpdateFriendsError = (msg: string): void => {
    console.error("Error while updating friends:", msg);
  };
}
