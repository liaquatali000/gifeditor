import gifshot from 'gifshot';

export function base64ToBlob(base64: string) {
  var arr = base64.split(',');
  let mime: any = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return URL.createObjectURL(new Blob([u8arr], { type: mime }));
}

export function canvasToFile(canvas: any, filename: string): File {
  const arr = canvas.toDataURL('image/png').split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export function createGIF(images: Array<string>, options: object): Promise<Function> {
  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images,
        ...options,
      },
      (res: any) => {
        if (!res.error) resolve(res.image);
        else reject(res.error);
      },
    );
  });
}

export function loadedImg(image: any) {
  return new Promise(resolve => {
    image.onload = (e: any) => {
      resolve(e);
    };
  });
}

/**
 * @param {Number} sxThe X coordinate of the fixed box, the Y left label of the SY fixed box
 * @param {Number} boxW The width of the fixed box, the height of the boxh fixed box
 * @param {Number} sourceW The width of the original pictureidth of the original picture, the high of the original picture
 * @return {Object} {DrawImage parameters, X coordinates, y coordinates, width and high} after zooming pictures, corresponding to DrawImage (ImageEsource, DX, DY, DWIDTHT, DHEIGHT)
 */

export function containImg(
  sx: number,
  sy: number,
  boxW: number,
  boxH: number,
  sourceW: number,
  sourceH: number,
) {
  let dx = sx,
    dy = sy,
    dWidth = boxW,
    dHeight = boxH;
  if (sourceW > sourceH || (sourceW === sourceH && boxW < boxH)) {
    dHeight = (sourceH * dWidth) / sourceW;
    dy = sy + (boxH - dHeight) / 2;
  } else if (sourceW < sourceH || (sourceW === sourceH && boxW > boxH)) {
    dWidth = (sourceW * dHeight) / sourceH;
    dx = sx + (boxW - dWidth) / 2;
  }
  return {
    dx,
    dy,
    dWidth,
    dHeight,
  };
}

/**
 * download file
 * @param {String} src Resource address
 * @param {String} fileName file name
 */
export function download(src: string, fileName: string) {
  const el = document.createElement('a');
  el.href = base64ToBlob(src);
  el.download = fileName;
  el.style.display = 'none';
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}

export function setTimeoutSync(time: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('done');
    }, time);
  });
}
