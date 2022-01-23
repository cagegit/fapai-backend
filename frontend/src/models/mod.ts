import { useState, useCallback  } from 'react';

import {ModelItem} from '@/constant-type'

export default () => {
  const [model, setModel] = useState<ModelItem|null>(null);
  const setMd = useCallback((x:ModelItem|null) => setModel(x), []);
  return { model, setMd };
};