import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AdminPinPrompt from '../components/AdminPinPrompt';

type Task = {
  id: string;
  title: string;
  price: number;
  completed: boolean;
};

type Member = {
  id: string;
  name: string;
  code: string;
  money: number;
  cosmetics?: string[]; // Ny: kosmetiske elementer brukeren har kjøpt
  tasks: Task[];
};

type AppContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  members: Member[];
  addMember: (member: Member) => void;
  updateMember: (updatedMember: Member) => void; // Ny
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const addMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);

    // Send til backend om ønskelig
    axios.post('http://localhost:8000/add_member', member).catch((err) =>
      console.error('Feil ved lagring av nytt medlem:', err)
    );
  };

  const updateMember = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );

    // Send til backend (eller bytt til Firestore her)
    axios.post('http://localhost:8000/update_member', updatedMember).catch((err) =>
      console.error('Feil ved oppdatering av medlem:', err)
    );
  };

  const toggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
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
        updateMember,
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
