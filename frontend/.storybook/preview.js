import '../src/index.css';

import React from 'react';
import { addDecorator } from '@storybook/react';

addDecorator(storyFn => (
  <>
    <div style={{ margin: '32px' }}>{storyFn()}</div>
  </>
))