import { fabric } from 'fabric';

/**
 * Set text
 *
 * @param {*} [options=null] Configuration
 * @param {string} [content=''] content
 */
export function setCanvasText(options: any = null, content: string = '') {
  const defaultOptions = {
    left: 20,
    top: 20,
    fontSize: 18,
    fontFamily: 'default',
    fill: '#ff0000',
    editable: true,
    // lockUniScaling: true,
    borderColor: '#1890ff',
    cornerColor: '#1890ff',
  };

  const { canvas } = window;

  // Delete text
  if (!options && !content) {
    // Clear the retention timerhe retention timer
    clearInterval(canvas?.getActiveObject()?.animateInterval);
    canvas?.remove(canvas?.getActiveObject());
    return;
  }

  // New texttext
  if (content) {
    const text = new fabric.Textbox(content, {
      ...defaultOptions,
      ...options,
    });
    canvas?.add(text)?.setActiveObject(text);
  } else {
    // Modify the text
    canvas?.getActiveObject()?.setOptions(options);
    try {
      canvas?.renderAll();
    } catch (e) {}
  }
}

/**
 * Set picture
 *
 * @param {string} [src='']Picture resources
 */
export function setCanvasImage(src: string = '') {
  const { canvas, g_app } = window;
  if (src) {
    // New picture
    fabric.Image.fromURL(
      src,
      (oImg: any) => {
        canvas?.add(oImg)?.setActiveObject(oImg);
        g_app._store.dispatch({
          type: 'global/saveActiveObject',
          payload: canvas?.getActiveObject(),
        });
      },
      {
        left: 300,
        top: 20,
        scaleX: 0.3,
        scaleY: 0.3,
      },
    );

    // Delete pictures
  } else canvas?.remove(canvas?.getActiveObject());
}
