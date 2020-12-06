'use strict';

import React from 'react';

/**
 * ReactのCommentPosterエリア部品定義
 */
export default class CommentPoster extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const input = document.getElementById('comment-poster-input');
    const button = document.getElementById('comment-poster-button');
    const video = document.getElementById(this.props.videoPlayerId);
    const videoId = this.props.videoId;
    const apiToken = this.props.apiToken;
    const commentListenerContainer = this.props.commentListenerContainer;

    function postComment() {
      const content = input.value;
      if (!content) return;

      const videoPosition = video.currentTime * 100;
      const comment = {
        videoId: videoId,
        content: content,
        videoPosition: videoPosition
      };
      fetch('/v1/videos/' + videoId + '/comments', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      })
        .then(res => res.json())
        .then(json => {
          input.value = '';
          console.log(json);
          commentListenerContainer.listeners.forEach(listener => {
            json.comment.isSelfPosted = true;
            listener([json.comment], 'commentpost');
          });
        })
        .catch(e => {
          console.error(e);
        });
    }

    button.addEventListener('click', postComment);
    input.addEventListener('keypress', event => {
      const keyName = event.key;
      if (keyName === 'Enter') {
        postComment();
      }
    });
  }

  render() {
    return (
      <div className="input-group">
        <input
          id="comment-poster-input"
          className="form-control"
          type="text"
          placeholder="コメント"
        />
        <span className="input-group-btn">
          <button
            id="comment-poster-button"
            className="btn btn-secondary"
            type="button"
          >
            コメントする
          </button>
        </span>
      </div>
    );
  }
}