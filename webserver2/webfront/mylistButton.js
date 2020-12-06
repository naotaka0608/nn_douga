'use strict';

import React from 'react';

/**
 * ReactのMylistButtonエリア部品定義
 */
export default class MylistButton extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const button = document.getElementById('mylist-button');
    const videoId = this.props.videoId;
    const apiToken = this.props.apiToken;
    const mylist = {
      videoId: videoId
    };

    // 既にマイリスト済みかチェック
    fetch('/v1/my/mylist', {
      headers: {
        Authorization: 'Bearer ' + apiToken,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(mylistitems => {
        let isAlreadyMylisted = false;
        mylistitems.forEach(i => {
          if (i.videoId === videoId) {
            isAlreadyMylisted = true;
          }
        });

        if (!isAlreadyMylisted) {
          button.disabled = ''; // 有効化
        } else {
          button.innerText = 'マイリスト追加済み';
        }
      })
      .catch(e => {
        console.error(e);
      });

    function mylistVideo() {
      fetch('/v1/my/mylist', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mylist)
      })
        .then(res => res.json())
        .then(json => {
          button.disabled = 'true'; // 無効化
          button.innerText = 'マイリスト追加済み';
        })
        .catch(e => {
          console.error(e);
        });
    }

    button.addEventListener('click', mylistVideo);
  }

  render() {
    return (
      <button
        id="mylist-button"
        className="btn btn-primary btn-sm"
        type="button"
        disabled
      >
        マイリスト追加
      </button>
    );
  }
}