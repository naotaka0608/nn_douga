'use strict';

import Dropzone from 'dropzone';
import React from 'react';

/**
 * ReactのUploaderエリア部品定義
 */
export default class Uploader extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Dropzone.options.videoUploadDropzone = {
      paramName: 'file', // The name that will be used to transfer the file
      maxFilesize: 3000, // MB
      dictDefaultMessage:
        'このエリアに動画ファイルをドラッグ＆ドロップしてください。<br> 3GBまでの動画をアップロードできます。',
      init: function() {
        let hasError = false;

        this.on('addedfile', function(file) {
          hasError = false;
          $('.dz-details').remove();
          $('.dz-progress').remove();
          $('.dz-error-message').remove();
          $('.dz-success-mark').remove();
          $('.dz-error-mark').remove();
        });

        this.on('complete', function(file) {
          if (
            !hasError &&
            this.getUploadingFiles().length === 0 &&
            this.getQueuedFiles().length === 0
          ) {
            setTimeout(() => {
              window.location.href = 'my/videos';
            }, 300); // move after 300 msec.
          }
        });

        this.on('error', (file, response) => {
          hasError = true;
          alert(
            'アップロードに失敗しました。詳細はディベロッパーコンソールを確認下さい。'
          );
          console.error('Uploader Error:');
          console.error(file);
          console.error(response);
        });
      },
      accept: function(file, done) {
        done();
        $('.dz-details').remove();
        $('.dz-progress').remove();
        $('.dz-error-message').remove();
        $('.dz-success-mark').remove();
        $('.dz-error-mark').remove();
      }
    };
  }

  render() {
    const postUrl = this.props.mediaserverUrlRoot + 'v1/videos';
    return (
      <form
        className="dropzone"
        action={postUrl}
        method="post"
        id="videoUploadDropzone"
      >
        <input type="hidden" name="apiToken" value={this.props.apiToken} />
      </form>
    );
  }
}