import React, { createContext, useContext, useState, ReactNode } from 'react';

type Member = {
  id: string;
  name: string;
  code: string;
  money: number;
  tasks: { id: string; title: string; price: number; completed: boolean }[];
};

type AppContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  members: Member[];
  addMember: (member: Member) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const addMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setLoggedIn: setIsLoggedIn,
        isAdmin,
        toggleAdmin: () => setIsAdmin((prev) => !prev),
        members,
        addMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
