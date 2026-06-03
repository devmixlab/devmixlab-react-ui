import { createContext, useContext } from 'react';

type GroupContextValue = {
    id: string;
    label?: string;
};

const GroupContext = createContext<GroupContextValue | null>(null);

const useGroupContext = () => {
    const ctx = useContext(GroupContext);

    // if (!ctx) {
    //     throw new Error('Group components must be used inside <Dropdown.Group />');
    // }

    return ctx;
};

export { GroupContext, useGroupContext };

export type { GroupContextValue };
