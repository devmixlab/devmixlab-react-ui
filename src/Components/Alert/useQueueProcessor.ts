import { useRef, useEffect } from 'react';

type OnTrigger = () => void;

export type ExecutionQueueItem = {
  id: string;
  onTrigger: OnTrigger;
  remainingTime: number;
};

export type QueueTask = {
  id: string;
  delay: number;
  onTrigger: OnTrigger;
};

export type DelayQueueItem = {
  id: string;
  delay: number;
  remainingDelay: number;
  onTrigger: OnTrigger;
};

export type QueueTaskHandle = {
  remove: () => void;
  reset: () => void;
};

const SCHEDULER_TICK = 300;

export const useQueueProcessor = (minTriggerInterval: number = 1000) => {
  const delayQueueRef = useRef<DelayQueueItem[]>([]);
  const executionQueueRef = useRef<ExecutionQueueItem[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const maxRemainingTimeRef = useRef(0);

  const clear = () => {
    delayQueueRef.current = [];
    executionQueueRef.current = [];
    stopQueueProcessor();
  };

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const enqueue = ({ id, onTrigger }: QueueTask) => {
    if (executionQueueRef.current.some((item) => item.id === id)) {
      return;
    }

    const remainingTime =
      executionQueueRef.current.length <= 0
        ? minTriggerInterval
        : maxRemainingTimeRef.current + minTriggerInterval;

    executionQueueRef.current.push({
      id,
      onTrigger,
      remainingTime,
    });
  };

  const add = ({ id, delay, onTrigger }: QueueTask): QueueTaskHandle | undefined => {
    if (delayQueueRef.current.some((item) => item.id === id)) {
      return;
    }

    startQueueProcessor();

    delayQueueRef.current.push({
      id,
      delay,
      remainingDelay: delay,
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
        removeExecution(id);
      },
    };
  };

  const remove = (id: string) => {
    removeExecution(id);
    removeDelay(id);
  };

  const removeExecution = (id: string) => {
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
        const updatedRemainingDelay = item.remainingDelay - SCHEDULER_TICK;

        if (updatedRemainingDelay <= 0) {
          idsToAdd.push(item.id);
        }

        return {
          ...item,
          remainingDelay: updatedRemainingDelay,
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

    const processExecutionQueue = () => {
      let maxRemainingTime = 0;
      const idsToTrigger: string[] = [];

      executionQueueRef.current = executionQueueRef.current.map((item) => {
        const updatedRemainingTime = item.remainingTime - SCHEDULER_TICK;

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
        removeExecution(id);
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

      if (delayQueueRef.current.length > 0) {
        processDelayQueue();
      }

      if (executionQueueRef.current.length > 0) {
        processExecutionQueue();
      }

      // process queue
    }, SCHEDULER_TICK);
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
