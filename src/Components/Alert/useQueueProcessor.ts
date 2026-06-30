import { useRef, useEffect } from 'react';

type OnTrigger = () => void;

export type Pending = {
  id: string;
  onTrigger: OnTrigger;
  remainingTime: number;
};

export type AddQueueProps = {
  id: string;
  delay: number;
  onTrigger: OnTrigger;
};

export type DelayQueueProps = {
  id: string;
  delay: number;
  remainingDelay: number;
  isPaused: boolean;
  onTrigger: OnTrigger;
};

// export type DelayPending = {
//   id: string;
//   onTrigger: OnTrigger;
//   remainingTime: number;
// };

// export type QueueProcessorProps = {
//   minTriggerInterval?: number;
// };

export type AddQueueReturn = {
  remove: () => void;
  reset: () => void;
};

const QUEUE_PROCESSOR_INTERVAL = 300;

export const useQueueProcessor = (minTriggerInterval: number = 1000) => {
  const delayQueueRef = useRef<DelayQueueProps[]>([]);
  const executionQueueRef = useRef<Pending[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const maxRemainingTimeRef = useRef(0);

  const clear = () => {
    executionQueueRef.current = [];
    stopQueueProcessor();
  };

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const enqueue = ({ id, onTrigger }: AddQueueProps) => {
    if (executionQueueRef.current.some((item) => item.id === id)) {
      return;
    }

    // startQueueProcessor();

    // console.log(maxRemainingTimeRef.current);

    const remainingTime =
      executionQueueRef.current.length <= 0
        ? minTriggerInterval
        : maxRemainingTimeRef.current + minTriggerInterval;

    console.log(remainingTime);

    executionQueueRef.current.push({
      id,
      onTrigger,
      remainingTime,
    });
  };

  const add = ({ id, delay, onTrigger }: AddQueueProps): AddQueueReturn | undefined => {
    if (delayQueueRef.current.some((item) => item.id === id)) {
      return;
    }

    startQueueProcessor();

    delayQueueRef.current.push({
      id,
      delay,
      remainingDelay: delay,
      isPaused: false,
      onTrigger,
    });

    return {
      remove: () => remove(id),
      reset: () => {
        delayQueueRef.current = delayQueueRef.current.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              remainingDelay: item.delay,
            };
          }

          return item;
        });
        removeQueue(id);
      },
    };
  };

  const remove = (id: string) => {
    removeQueue(id);
    removeDelay(id);
  };

  const removeQueue = (id: string) => {
    executionQueueRef.current = executionQueueRef.current.filter((item) => item.id !== id);

    if (executionQueueRef.current.length === 0 && delayQueueRef.current.length === 0) {
      stopQueueProcessor();
    }
  };

  const removeDelay = (id: string) => {
    delayQueueRef.current = delayQueueRef.current.filter((item) => item.id !== id);

    if (executionQueueRef.current.length === 0 && delayQueueRef.current.length === 0) {
      stopQueueProcessor();
    }
  };

  const stopQueueProcessor = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      maxRemainingTimeRef.current = 0;
    }
  };

  const startQueueProcessor = () => {
    if (intervalRef.current !== null) {
      return;
    }

    const processDelayQueue = () => {
      const idsToAdd: string[] = [];

      delayQueueRef.current = delayQueueRef.current.map((item) => {
        const updatedTrackDelay = item.remainingDelay - QUEUE_PROCESSOR_INTERVAL;

        if (updatedTrackDelay <= 0) {
          idsToAdd.push(item.id);
        }

        return {
          ...item,
          trackDelay: updatedTrackDelay,
        };
      });

      if (idsToAdd.length <= 0) {
        return;
      }

      idsToAdd.forEach((id) => {
        const itemToAdd = delayQueueRef.current.find((item) => item.id === id);
        if (!itemToAdd) return;

        enqueue(itemToAdd);
      });
    };

    const processQueue = () => {
      let maxRemainingTime = 0;
      const idsToTrigger: string[] = [];

      executionQueueRef.current = executionQueueRef.current.map((item) => {
        const updatedRemainingTime = item.remainingTime - QUEUE_PROCESSOR_INTERVAL;

        if (updatedRemainingTime <= 0) {
          idsToTrigger.push(item.id);
        }

        if (updatedRemainingTime > maxRemainingTime) {
          maxRemainingTime = updatedRemainingTime;
        }

        return {
          ...item,
          remainingTime: updatedRemainingTime,
        };
      });

      maxRemainingTimeRef.current = maxRemainingTime;

      if (idsToTrigger.length <= 0) {
        return;
      }

      idsToTrigger.forEach((id) => {
        const itemToTrigger = executionQueueRef.current.find((item) => item.id === id);
        itemToTrigger?.onTrigger?.();
        removeQueue(id);
        removeDelay(id);
      });
    };

    intervalRef.current = window.setInterval(() => {
      if (executionQueueRef.current.length === 0 && delayQueueRef.current.length === 0) {
        stopQueueProcessor();
        return;
      }

      if (isPausedRef.current) {
        return;
      }

      console.log(1234123);

      if (delayQueueRef.current.length > 0) {
        processDelayQueue();
      }

      if (executionQueueRef.current.length > 0) {
        processQueue();
      }

      // process queue
    }, QUEUE_PROCESSOR_INTERVAL);
  };

  useEffect(() => {
    return () => stopQueueProcessor();
  }, []);

  return {
    add,
    pause,
    resume,
    clear,
    remove,
  };
};
