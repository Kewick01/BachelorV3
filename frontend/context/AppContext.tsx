import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';

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

  const toggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }

    Alert.prompt(
      'Admin PIN',
      'Skriv inn admin PIN for å aktivere admin-modus',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async (input) => {
            try {
              const response = await axios.post('http://192.168.11.224:3000/verify-pin', {
                pin: input },
                { withCredentials: true }
              );
              if (response.status === 200) {
                setIsAdmin(true);
               } else {
                Alert.alert('Feil', 'Ugyldig PIN. Prøv igjen.');
              }
            } catch (err) {
              Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
              console.error(err);
            }
          },
        },
      ],
      'secure-text'
    );
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
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
