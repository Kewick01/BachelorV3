import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AdminPinPrompt from '../components/AdminPinPrompt';  

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
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const addMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);
  };


  const toggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
    }  else {
      setShowPinPrompt(true);
    }

  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setLoggedIn: setIsLoggedIn,
        isAdmin,
        toggleAdmin,
        members,
        addMember,
      }}
    >
      {children}
      <AdminPinPrompt
       visible={showPinPrompt}
       onCancel={() => setShowPinPrompt(false)}
       onSuccess={() => {
         setIsAdmin(true);
         setShowPinPrompt(false);
       }}
      />
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
