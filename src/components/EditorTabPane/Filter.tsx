import React, { useState } from 'react';
import { connect } from 'dva';
import { Tag, message } from 'antd';
import { fabric } from 'fabric';
import styles from './Filter.less';
import { setTimeoutSync } from '../../utils/utils';
import defaultImage from '../../assets/filter-2.jpg';

const filters = [
  {
    name: 'Original picture',
    filter: {
      filterObject: new fabric.Image.filters.Brightness({ brightness: 0 }),
      css: 'none',
    },
  },
  {
    name: 'Black and white',
    filter: {
      filterObject: new fabric.Image.filters.Grayscale(),
      css: 'grayscale(1)',
    },
  },
  {
    name: 'High contrast',
    filter: {
      filterObject: new fabric.Image.filters.Contrast({ contrast: 0.5 }),
      css: 'contrast(150%)',
    },
  },
  {
    name: 'Brighten',
    filter: {
      filterObject: new fabric.Image.filters.Brightness({ brightness: 0.5 }),
      css: 'brightness(1.5)',
    },
  },
  {
    name: 'darkenrken',
    filter: {
      filterObject: new fabric.Image.filters.Brightness({ brightness: -0.5 }),
      css: 'brightness(0.5)',
    },
  },
  {
    name: 'Anti -color',
    filter: {
      filterObject: new fabric.Image.filters.Invert(),
      css: 'invert(100%)',
    },
  },
  {
    name: 'Nostalgia',
    filter: {
      filterObject: new fabric.Image.filters.Sepia(),
      css: 'sepia(100%)',
    },
  },
  {
    name: 'Thresholdreshold',
    filter: {
      filterObject: new fabric.Image.filters.Contrast({ contrast: 1 }),
      css: 'contrast(1000%)',
    },
  },
  {
    name: 'Noise',
    filter: {
      filterObject: new fabric.Image.filters.Noise({ noise: 300 }),
      css: 'contrast(100%)',
    },
  },
  {
    name: 'mosaic',
    filter: {
      filterObject: new fabric.Image.filters.Pixelate({ blocksize: 4 }),
      css: 'grayscale(0)',
    },
  },
];

export default connect(({ global }: any) => ({ ...global }))(
  ({ GIFOptions, canvasImages, dispatch }: Props): JSX.Element => {
    async function handleSelectFilter(filter: any) {
      message.loading({ content: 'Apply a filter...', key: 'filterLoading', duration: 0 });
      dispatch({
        type: 'global/setGIFOptions',
        payload: {
          filter,
        },
      });
      // Application filterication filter
      for (const image of canvasImages) {
        image.filters = [filter.filterObject];
        image.applyFilters();
        await setTimeoutSync(8);
      }

      message.destroy();
    }

    return (
      <div>
        <h3>All filters</h3>
        <ul className={styles.filter__list}>
          {filters.map(item => (
            <li
              className={styles.filter__item}
              onClick={() => handleSelectFilter(item.filter)}
              key={item.name}
              title={item.name}
            >
              <img
                className={styles.filter__img}
                style={{ filter: item.filter.css }}
                src={canvasImages[canvasImages.length / 2]?._originalElement.src || defaultImage}
              />
              <Tag
                className={styles.filter__tag}
                color={GIFOptions.filter.css === item.filter.css ? '#108ee9' : 'blue'}
              >
                {item.name}
              </Tag>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
