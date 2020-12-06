'use strict';

import React from 'react';

/**
 * ReactのMylistTableエリア部品定義
 */
export default class MylistTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mylistitems: [] };
  }

  componentDidMount() {
    this.updateMylistitems();
  }

  updateMylistitems() {
    fetch('/v1/my/mylist', {
      headers: { Authorization: 'Bearer ' + this.props.apiToken }
    })
      .then(res => res.json())
      .then(json => {
        this.setState((prevState, props) => ({
          mylistitems: json
        }));
      })
      .catch(e => {
        console.error(e);
      });
  }

  render() {
    const mylistitems = this.state.mylistitems.map(mylistitem => (
      <tr key={mylistitem.videoId}>
        <td>
          <a href={'/watch/' + mylistitem.videoId}>{mylistitem.videoId}</a>
        </td>
        <td>{mylistitem.title}</td>
        <td>{mylistitem.description}</td>
        <td>
          <MylistDeleteButton
            videoId={mylistitem.videoId}
            apiToken={this.props.apiToken}
            updateMylistitems={this.updateMylistitems.bind(this)}
          />
        </td>
      </tr>
    ));
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">タイトル</th>
            <th scope="col">説明文</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>{mylistitems}</tbody>
      </table>
    );
  }
}

/**
 * ReactのMylistDeleteButtonエリア部品定義
 */
class MylistDeleteButton extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const videoId = this.props.videoId;
    const button = document.getElementById(
      'mylistitem-delete-button-' + videoId
    );
    const apiToken = this.props.apiToken;
    const updateMylistitems = this.props.updateMylistitems;
    const mylist = {
      videoId: videoId
    };

    function deleteMylistVideo() {
      fetch('/v1/my/mylist', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + apiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mylist)
      })
        .then(res => res.json())
        .then(json => {
          updateMylistitems();
          console.log(json);
        })
        .catch(e => {
          console.error(e);
        });
    }

    button.addEventListener('click', deleteMylistVideo);
  }

  render() {
    return (
      <button
        id={'mylistitem-delete-button-' + this.props.videoId}
        className="btn btn-danger btn-sm"
        type="button"
      >
        解除
      </button>
    );
  }
}