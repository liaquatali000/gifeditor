import React from 'react';
import { Button, Upload, Icon, message } from 'antd';
import { connect } from 'dva';
import { setCanvasImage } from '../../utils/helper';
import styles from './Watermark.less';

const watermarks: Array<string> = [
 
  require('../../assets/1.png'),
  require('../../assets/2.png'),
  require('../../assets/3.png'),
  require('../../assets/4.png'),
  require('../../assets/5.png'),
  require('../../assets/6.png'),
  require('../../assets/7.png'),
  require('../../assets/8.png'),
  require('../../assets/9.png'),
  require('../../assets/10.png'),

];

export default connect(({ global }: any) => ({ ...global }))(
  ({ activeObject, dispatch }: Props): JSX.Element => {
    function handleSelectImg(src: string) {
      setCanvasImage(src);
    }

    function handleRemoveImage() {
      setCanvasImage();
      dispatch({
        type: 'global/saveActiveObject',
        payload: null,
      });
    }

    function handleUploadImage(file: File) {
      if (!/(\.*.jpg$)|(\.*.jpeg$)|(\.*.png$)|(\.*.bmp$)|(\.*.tif$)|(\.*.tiff$)/i.test(file.name)) {
        message.error({
          content: 'Only support JPG/JPEG/PNG/BMP/TIF/TIFF formatpng/bmp/tif/tiff Format',
        });
        return false;
      }

      setCanvasImage(URL.createObjectURL(file));
      message.success({ content: 'Load successfully' });
      return false;
    }

    return (
      <div className={styles.watermark}>
        <div>
          <Button
            style={{ marginBottom: 15 }}
            onClick={handleRemoveImage}
            disabled={activeObject?.type !== 'image'}
            type="danger"
            icon="delete"
          >
            delete
          </Button>
          <h3>Built -in sticker</h3>
          <ul className={styles.watermark_list}>
            {watermarks.map((item, index) => (
              <li
                className={styles.watermark__item}
                onClick={() => handleSelectImg(item)}
                key={index}
              >
                <img src={item} alt="stickericker" />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Custom stickerm Stickers</h3>
          <Upload
            showUploadList={false}
            beforeUpload={handleUploadImage}
            accept=".jpg, .jpeg, .png, .bmp, .tif, .tiff"
          >
            <Button className={styles.uploadLine} type="primary">
              <Icon type="upload" />
              Local sticker
            </Button>
          </Upload>
        </div>
      </div>
    );
  },
);
