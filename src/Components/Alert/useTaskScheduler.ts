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

export type EnqueueTask = {
  id: string;
  onTrigger: OnTrigger;
};

export type DelayQueueItem = {
  id: string;
  remainingDelay: number;
  onTrigger: OnTrigger;
};

export type QueueTaskHandle = {
  /**
   * Removes the task from the scheduler.
   *
   * If the task is waiting in the delay queue or
   * already queued for execution, it will be
   * cancelled and never triggered.
   */
  remove: () => void;

  /**
   * Restarts the task delay.
   *
   * The remaining delay is restored to its original
   * value. If the task has already entered the
   * execution queue, it is removed so it must wait
   * for the full delay again before becoming
   * eligible for execution.
   */
  reset: () => void;
};

const SCHEDULER_TICK = 300;

export const useTaskScheduler = (minTriggerInterval: number = 1000) => {
  const delayQueueKeeperRef = useRef(new Map<string, DelayQueueItem>());
  const delayQueueRef = useRef<DelayQueueItem[]>([]);
  const executionQueueRef = useRef<ExecutionQueueItem[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const maxRemainingTimeRef = useRef(0);

  const clear = () => {
    delayQueueRef.current = [];
    executionQueueRef.current = [];
    delayQueueKeeperRef.current.clear();
    stopScheduler();
  };

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const enqueue = ({ id, onTrigger }: EnqueueTask) => {
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

    startScheduler();

    const queue = {
      id,
      remainingDelay: delay,
      onTrigger,
    };

    delayQueueRef.current.push({ ...queue });
    delayQueueKeeperRef.current.set(id, { ...queue });

    return {
      remove: () => remove(id),
      reset: () => {
        const original = delayQueueKeeperRef.current.get(id);

        if (!original) {
          return;
        }

        removeExecution(id);

        delayQueueRef.current = delayQueueRef.current.filter((item) => item.id !== id);

        delayQueueRef.current.push({
          ...original,
        });
      },
    };
  };

  const stopSchedulerIfEmpty = () => {
    if (executionQueueRef.current.length === 0 && delayQueueRef.current.length === 0) {
      stopScheduler();
    }
  };

  const remove = (id: string) => {
    removeExecution(id);
    removeDelay(id);
    removeKeeper(id);
  };

  const removeExecution = (id: string) => {
    executionQueueRef.current = executionQueueRef.current.filter((item) => item.id !== id);

    stopSchedulerIfEmpty();
  };

  const removeDelay = (id: string) => {
    delayQueueRef.current = delayQueueRef.current.filter((item) => item.id !== id);

    stopSchedulerIfEmpty();
  };

  const removeKeeper = (id: string) => {
    delayQueueKeeperRef.current.delete(id);
  };

  const stopScheduler = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      maxRemainingTimeRef.current = 0;
    }
  };

  const startScheduler = () => {
    if (intervalRef.current !== null) {
      return;
    }

    const processDelayQueue = () => {
      const idsToEnqueue: string[] = [];

      delayQueueRef.current = delayQueueRef.current.map((item) => {
        const updatedRemainingDelay = item.remainingDelay - SCHEDULER_TICK;

        if (updatedRemainingDelay <= 0) {
          idsToEnqueue.push(item.id);
        }

        return {
          ...item,
          remainingDelay: updatedRemainingDelay,
        };
      });

      if (idsToEnqueue.length <= 0) {
        return;
      }

      idsToEnqueue.forEach((id) => {
        const itemToEnqueue = delayQueueRef.current.find((item) => item.id === id);
        if (!itemToEnqueue) return;

        enqueue({ id: itemToEnqueue.id, onTrigger: itemToEnqueue.onTrigger });
        removeDelay(id);
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
        removeKeeper(id);
      });
    };

    intervalRef.current = window.setInterval(() => {
      if (executionQueueRef.current.length === 0 && delayQueueRef.current.length === 0) {
        stopScheduler();
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
    return () => stopScheduler();
  }, []);

  return {
    add,
    pause,
    resume,
    clear,
    remove,
  };
};
