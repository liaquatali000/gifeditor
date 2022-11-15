import React, { useState } from 'react';
import { Button, Popover, Select, Upload, Icon, message } from 'antd';
import { SketchPicker } from 'react-color';
import { fabric } from 'fabric';
import { connect } from 'dva';
import _ from 'lodash';
import { setCanvasText } from '../../utils/helper';
import { setTimeoutSync } from '../../utils/utils';
import styles from './Text.less';

const { util: fabricUtil } = fabric;

const defaultFont: any[] = [
  {
    name: 'Default',
    fontFamily: 'default',
  },
  {
    name: 'Song style',
    fontFamily: 'serif',
  },
  {
    name: 'Regular',
    fontFamily: 'cursive',
  },
  {
    name: 'monospace',
    fontFamily: 'monospace',
  },
  {
    name: 'Lucida Console',
    fontFamily: '"Lucida Console"',
  },
  {
    name: 'sans-serif',
    fontFamily: 'sans-serif',
  },
];

const fontStyles: any[] = [
  {
    name: 'normal',
    fontStyle: 'normal',
  },
  {
    name: 'Oblique bodylique body',
    fontStyle: 'italic',
  },
  {
    name: 'Boldld',
    fontStyle: 'bold',
  },
];

const effects: any[] = [
  {
    title: 'none',
    animate: undefined,
  },
  {
    title: 'Scaling',
    animate: 'scale',
  },
  {
    title: 'Flickering',
    animate: 'flash',
  },
  {
    title: 'jitter',
    animate: 'shake',
  },
  {
    title: 'Gradient',
    animate: 'gradient',
  },
];

export default connect(({ global }: any) => ({
  ...global,
}))(
  ({ activeObject, dispatch }: Props): JSX.Element => {
    const [color, setColor] = useState('#f00');
    const [customFont, setCustomFont]: any = useState([]);
    // TODO: 解决dispatch后不重新渲染问题
    const [updated, shouldUpdate] = useState(false);

    function handleChangeColor({ hex }: any) {
      setColor(hex);
      if (activeObject?.oldFill) setCanvasText({ oldFill: hex });
      else setCanvasText({ fill: hex });
    }

    function handleAddText() {
      dispatch({
        type: 'global/addText',
        payload: {
          content: 'Add text',
          options: {},
        },
      });
    }

    function handleRemoveText() {
      setCanvasText();
      dispatch({
        type: 'global/saveActiveObject',
        payload: null,
      });
    }

    function handleSelectFontFamily(fontFamily: string) {
      setCanvasText({ fontFamily });
      dispatch({
        type: 'global/saveActiveObject',
        payload: { ...activeObject, fontFamily },
      });
    }

    function handleUploadFont(file: File) {
      const newStyle: Element = document.createElement('style');
      const fontFamily: string = file.name.split('.')[0];
      if (!/(\.*.ttf$)/i.test(file.name)) {
        message.error({
          content: 'Only supports ttf format',
        });
        return false;
      }
      newStyle.appendChild(
        document.createTextNode(`
            @font-face {
                font-family: "${fontFamily}";
                src: url("${URL.createObjectURL(file)}") format("truetype");
            }`),
      );
      document.head.appendChild(newStyle);

      setCustomFont([...customFont, { name: fontFamily, fontFamily }]);
      // 选中字体
      handleSelectFontFamily(fontFamily);
      message.success({ content: '加载成功' });
      return false;
    }

    function SelectOption(fontFamily: string, name: string): JSX.Element {
      return (
        <Select.Option style={{ fontFamily }} value={fontFamily} key={name}>
          {name}
        </Select.Option>
      );
    }

    // TODO: 字体动效 待重构
    async function handleTextEffectClick(animateType: any) {
      const [textObject]: any[] = window.canvas
        .getObjects()
        .filter((e: any) => e.type === 'textbox' && _.isEqual(activeObject, e));

      if (!textObject) return;
      // 清除遗留定时器
      clearInterval(textObject?.animateInterval);
      textObject.animateType = animateType;
      shouldUpdate(!updated);
      dispatch({
        type: 'global/saveActiveObject',
        payload: textObject,
      });

      if (textObject.oldFill) {
        // ? 防止颜色恢复
        await setTimeoutSync(500);
        textObject.set('fill', textObject.oldFill);
        textObject.oldFill = null;
      }

      switch (animateType) {
        case undefined:
          return;
        case 'scale':
          animateScale();
          textObject.animateInterval = setInterval(animateScale, 800);
          break;
        case 'flash':
          animateFlash();
          textObject.animateInterval = setInterval(animateFlash, 700);
          break;
        case 'shake':
          animateShake();
          textObject.animateInterval = setInterval(animateShake, 700);
          break;
        case 'gradient':
          textObject.oldFill = textObject.fill;
          window.canvas.renderAll();
          animateGradient();
          textObject.animateInterval = setInterval(animateGradient, 700);
        default:
          return;
      }

      function animate(startProperties: any, endProperties: any) {
        textObject?.animate(startProperties, {
          duration: 300,
          onChange: window.canvas.renderAll.bind(window.canvas),
          onComplete: () => {
            textObject?.animate(endProperties, {
              duration: 300,
              onChange: window.canvas.renderAll.bind(window.canvas),
            });
          },
        });
      }

      function animateScale() {
        animate({ scaleX: '+=0.3', scaleY: '+=0.3' }, { scaleX: '-=0.3', scaleY: '-=0.3' });
      }

      function animateShake() {
        animate({ top: '-=7' }, { top: '+=7' });
      }

      function animateFlash() {
        animate({ opacity: 0 }, { opacity: 1 });
      }

      function animateGradient() {
        textObject.setGradient('fill', {
          x1: 0,
          x2: textObject.width,
          colorStops: {
            0: '#1e5799',
            0.2: '#2ce0bf',
            0.4: '#76dd2c',
            0.6: '#dba62b',
            0.8: '#e02cbf',
            1: '#1e5799',
          },
        });
        textObject?.animate(
          { opacity: 1 },
          {
            duration: 300,
            onChange: window.canvas.renderAll.bind(window.canvas),
            onComplete: () => {
              textObject.setGradient('fill', {
                x1: 0,
                x2: 500,
                colorStops: {
                  0: '#1e5799',
                  0.2: '#2ce0bf',
                  0.4: '#76dd2c',
                  0.6: '#dba62b',
                  0.8: '#e02cbf',
                  1: '#1e5799',
                },
              });
              textObject?.animate(
                { opacity: 1 },
                {
                  duration: 300,
                  onChange: window.canvas.renderAll.bind(window.canvas),
                },
              );
            },
          },
        );
      }
    }

    function handleSelectFontStyle(fontStyle: string) {
      let options: any = { fontWeight: 400, fontStyle };

      if (fontStyle === 'bold') options = { fontWeight: 600, fontStyle: 'normal' };

      setCanvasText(options);
      dispatch({
        type: 'global/saveActiveObject',
        payload: { ...activeObject, ...options },
      });
    }

    return (
      <div className={styles.textWrapper}>
        <Button onClick={handleAddText} type="primary" icon="plus">
          add text
        </Button>
        <Button
          style={{ marginLeft: 20 }}
          onClick={handleRemoveText}
          disabled={activeObject?.type !== 'textbox'}
          type="danger"
          icon="delete"
        >
          delete
        </Button>

        <div className={styles.text__style}>
          <div className={styles.text__color}>
            <h3>color</h3>
            <div>
              <Popover
                placement="rightTop"
                trigger="click"
                content={
                  <SketchPicker
                    color={color || activeObject?.oldFill || activeObject?.fill}
                    onSwatchHover={handleChangeColor}
                    onChangeComplete={handleChangeColor}
                  />
                }
              >
                <Button
                  className={styles.colorPicker}
                  style={{ backgroundColor: activeObject?.oldFill || activeObject?.fill || '#f00' }}
                />
              </Popover>
            </div>
          </div>
          <div>
            <h3>style</h3>
            <div>
              <Select
                className={styles.font__select}
                style={{ width: 100 }}
                onSelect={handleSelectFontStyle}
                value={
                  activeObject?.fontWeight === 600 ? 'bold' : activeObject?.fontStyle || 'normal'
                }
              >
                {fontStyles.map(({ fontStyle, name }: any) => (
                  <Select.Option
                    style={{ fontStyle, fontWeight: fontStyle === 'bold' ? 700 : 400 }}
                    value={fontStyle}
                    key={name}
                  >
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className={styles.text__font}>
          <h3>font</h3>
          <Select
            className={styles.font__select}
            style={{ width: 180 }}
            onSelect={handleSelectFontFamily}
            value={activeObject?.fontFamily || 'default'}
          >
            <Select.OptGroup label="custom font">
              {customFont.map((font: any) => SelectOption(font.fontFamily, font.name))}
            </Select.OptGroup>
            <Select.OptGroup label="Built-in fonts">
              {defaultFont.map(font => SelectOption(font.fontFamily, font.name))}
            </Select.OptGroup>
          </Select>
          <Upload
            beforeUpload={handleUploadFont}
            multiple={false}
            showUploadList={false}
            accept=".ttf"
          >
            <Button className={styles.uploadLine} type="primary">
              <Icon type="upload" />
              local font
            </Button>
          </Upload>
        </div>
        <div className={styles.text__effect}>
          <h3>Font animation</h3>
          <ul className={styles.effect__list}>
            {effects.map((item, index) => (
              <li
                className={styles.effect__item}
                style={{
                  backgroundColor:
                    activeObject?.animateType === item.animate
                      ? 'var(--antd-wave-shadow-color)'
                      : '',
                }}
                onClick={() => handleTextEffectClick(item.animate)}
                key={index}
              >
                <p>{item.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);
