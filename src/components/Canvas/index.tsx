import React, { useState, useEffect } from 'react';
import { Upload, Icon, Button, message, Modal } from 'antd';
import { connect } from 'dva';
import { fabric } from 'fabric';
import SuperGif from 'libgif';
import { canvasToFile, loadedImg } from '../../utils/utils';
import styles from './index.less';

const { CANVAS_WIDTH } = window;
let canvasHeight: number = window.CANVAS_WIDTH;

export default connect(({ global }: any) => ({ ...global }))(
  ({ canvasImages, GIFInfo, dispatch }: Props): JSX.Element => {
    const [file, setFile]: any = useState(null);
    const imgOptions: any = {
      selectable: false,
      visible: false,
      originX: 'left',
      originY: 'top',
    };
    let images: any[] = [];
    let i: number = 0;

    function drawerGIFInterval() {
      if (i >= canvasImages.length) i = 0;
      // TODO: Prevent flashing
      for (const index of canvasImages.keys()) {
        let visible: boolean = false;
        if (index === i) visible = true;
        canvasImages[index].setOptions({
          visible,
        });
      }
      i++;

      try {
        window.canvas?.renderAll();
      } catch (e) {}
    }

    async function drawerGIF() {
      message.success({ content: 'Loading completed!', key: 'updatable', duration: 2 });
      dispatch({
        type: 'global/saveGIFInfo',
        payload: { playEffect: 'normal' },
      });
      canvasImages = await Promise.all(
        images.map((image: any) => {
          return new Promise(resolve => {
            fabric.Image.fromURL(
              image,
              (oImg: any) => {
                window.canvas.add(oImg);
                resolve(oImg);
              },
              imgOptions,
            );
          });
        }),
      );

      dispatch({
        type: 'global/saveGIFImages',
        payload: { canvasImages },
      });
      images.splice(0);
      window.interval = setInterval(drawerGIFInterval, GIFInfo.interval);
    }

    function initCanvas(): void {
      window.canvas = new fabric.Canvas('canvas', {
        backgroundColor: 'rgb(43,45,55)',
        selection: false,
      });

      window.canvas
        .setWidth(CANVAS_WIDTH)
        .setHeight(canvasHeight)
        // Save the current active object
        .on('mouse:down', () => {
          dispatch({
            type: 'global/saveActiveObject',
            payload: window.canvas.getActiveObject(),
          });
        });
    }

    async function resolveGIF(source: File) {
      const imgEl = document.createElement('img');
      // gifThe library requires the IMG tag configuration to configure the following two attributes
      imgEl.setAttribute('rel:animated_src', URL.createObjectURL(source));
      imgEl.setAttribute('rel:auto_play', '0');
      const div = document.createElement('div');
      div.appendChild(imgEl); //prevent errors
      // Get the original information
      const image = new Image();
      image.src = URL.createObjectURL(source);
      await loadedImg(image);
      const { width, height } = image;
      const scale: number = CANVAS_WIDTH / width;
      canvasHeight = (height * CANVAS_WIDTH) / width;
      // TODO: Scaling pictures cannot modify width, height attributes
      Object.assign(imgOptions, { scaleX: scale, scaleY: scale });
      GIFInfo.width = width;
      GIFInfo.height = height;

      const gif = new SuperGif({ gif: imgEl });
      gif.load(() => {
        GIFInfo.interval = gif.get_duration_ms() / gif.get_length();
        dispatch({
          type: 'global/saveGIFInfo',
          payload: GIFInfo,
        });
        for (let i: number = 1; i <= gif.get_length(); i++) {
          // Each frame of the GIF instancer each frame of the gif instance
          gif.move_to(i);
          const file = canvasToFile(gif.get_canvas(), `gif-${i}`);
          // Convert the canvas of each frame into a file object
          images.push(URL.createObjectURL(file));
        }
        drawerGIF();
      });
    }

    function clear() {
      const { canvas, interval } = window;
      canvas?.getObjects().forEach((obj: any) => {
        if (obj.type === 'textbox') clearInterval(obj?.animateInterval);
      });
      clearInterval(interval);
      images.splice(0);
      canvas?.dispose();
      dispatch({
        type: 'global/clear',
      });
    }

    useEffect(() => {}, []);

    async function handleUploadGIF(file: File) {
      if (!/(\.*.gif$)/i.test(file.name)) {
        message.error({
          content: 'Only Supports GIF format',
        });
        return false;
      }
      message.loading({
        content: file.size >= 1024 * 5 * 1024 ? 'The file is large and loading is slow, please be patient...' : 'Loading...',
        key: 'updatable',
        duration: 0,
      });
      clear();
      await resolveGIF(file);
      setFile(file);
      initCanvas();
      GIFInfo.name = file.name.split('.')[0];
      return false;
    }

    const uploadProps = {
      multiple: false,
      showUploadList: false,
      accept: 'image/gif',
      beforeUpload: handleUploadGIF,
    };

    return (
      <div>
        {file ? (
          <div>
            <canvas id="canvas" width={CANVAS_WIDTH} height={CANVAS_WIDTH} />
            {/* export canvas not needed for now */}
            {/* <canvas id="hiddenCanvas" style={{ display: 'none' }} /> */}
            <Upload {...uploadProps}>
              <Button className={styles.uploadLine} type="primary" size="large">
                <Icon type="upload" />
                Change GIF
              </Button>
            </Upload>
          </div>
        ) : (
          <div className={styles.upload}>
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">Click or drag files to upload here</p>
            </Upload.Dragger>
          </div>
        )}
      </div>
    );
  },
);
