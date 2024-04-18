import { expect, test } from 'vitest'
import useStore from '../store/store';
import { renderHook } from '@testing-library/react';

import App from '../App';

describe("useIncrementingStore", () => {
    it("value's initial value is 0", () => {
        console.log(useStore)
      const res = renderHook(() => useStore())
              
        //expect(res.result.current.isRunning).toEqual(false);
    });
  });