import { useRef, useEffect } from 'react';

type OnTrigger = () => void;

export type Pending = {
  id: string;
  onTrigger: OnTrigger;
  remainingTime: number;
};

export type AddQueueProps = {
  id: string;
  onTrigger: OnTrigger;
};

// export type QueueProcessorProps = {
//   minTriggerInterval?: number;
// };

export type AddQueueReturn = {
  remove: () => void;
};

const QUEUE_PROCESSOR_INTERVAL = 300;

export const useQueueProcessor = (minTriggerInterval: number = 1000) => {
  const queueRef = useRef<Pending[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const maxRemainingTimeRef = useRef(0);

  const clear = () => {
    queueRef.current = [];
    stopQueueProcessor();
  };

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const add = ({ id, onTrigger }: AddQueueProps) => {
    if (queueRef.current.some((item) => item.id === id)) {
      return;
    }

    startQueueProcessor();

    // console.log(maxRemainingTimeRef.current);

    const remainingTime =
      queueRef.current.length <= 0
        ? minTriggerInterval
        : maxRemainingTimeRef.current + minTriggerInterval;

    console.log(remainingTime);

    queueRef.current.push({
      id,
      onTrigger,
      remainingTime,
    });
  };

  const remove = (id: string) => {
    queueRef.current = queueRef.current.filter((item) => item.id !== id);

    if (queueRef.current.length === 0) {
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

    intervalRef.current = window.setInterval(() => {
      if (queueRef.current.length === 0) {
        stopQueueProcessor();
        return;
      }

      if (isPausedRef.current) {
        return;
      }

      let maxRemainingTime = 0;
      const idsToTrigger: string[] = [];

      queueRef.current = queueRef.current.map((item) => {
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
        const itemToTrigger = queueRef.current.find((item) => item.id === id);
        itemToTrigger?.onTrigger?.();
        remove(id);
      });

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
  };
};
