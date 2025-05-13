
import React, { createContext, useContext, useState, useEffect, ReactNode, } from 'react';
import { Alert } from 'react-native';
import AdminPinPrompt from '../components/AdminPinPrompt';
import { authInstance } from '../firebase';


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
  equippedCosmetics?: string[];
  character: {
    type: string;
    color: string;
  };
};

type AppContextType = {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  members: Member[];
  addMember: (member: Member) => void;
  updateMember: (updatedMember: Member) => void; 
  deleteMember: (memberId: string) => void; 
  getCurrentAdminId: () => string | null; 
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

  const updateMember = async (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );

    try {
      const token = await authInstance.currentUser?.getIdToken();
      const res = await fetch(`http://192.168.11.224:3000/update-member/${updatedMember.id}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedMember.name,
          color: updatedMember.character.color,
          money: updatedMember.money,
          character: updatedMember.character,
          cosmetics: updatedMember.cosmetics,
          equippedCosmetics: updatedMember.equippedCosmetics,
          tasks: updatedMember.tasks,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Oppdatering feilet:', data);
        Alert.alert('Feil', data.error || 'Klarte ikke oppdatere medlem.');
      } else {
        console.log('Oppdatering OK:', data);
        Alert.alert("Suksess", "Medlem ble oppdatert!");
      }
    } catch (error) {
      console.error('Feil ved oppdatering:', error);
      Alert.alert('Feil', 'Noe gikk galt ved oppdatering.');
    }
  };

  const deleteMember = async (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    try {
      const token = await authInstance.currentUser?.getIdToken();

      const res = await fetch(`http://192.168.11.224:3000/delete-member/${memberId}`,{
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Sletting feilet:', data);
        Alert.alert('Feil', data.error || 'Klarte ikke slette medlem.');
      } else {
        console.log('Medlem slettet:', memberId);
      }

      } catch (error) {
        console.error('Feil ved sletting av medlem:', error);
        Alert.alert('Feil', 'Noe gikk galt ved sletting.');
    }
  };

  const getCurrentAdminId = () => {
    return authInstance.currentUser ? authInstance.currentUser.uid : null;
  };

  const toggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPinPrompt(true);
    }
  };

  const fetchMembersForAdmin = async (adminId: string) => {
    try {
      const token = await authInstance.currentUser?.getIdToken();
      const res = await fetch(`http://192.168.11.224:3000/members`, {
        headers: {
          Autorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Feil ved henting av medlemmer:', data);
        Alert.alert('Feil', data.error || 'Kunne ikke hente medlemmer');
        return;
      }

      setMembers(data);
    } catch (error) {
      console.error('Feil ved henting:', error);
      Alert.alert('Feil', 'Noe gikk galt ved henting av medlemmer');
    }
  };

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async(user) => {
      if (user) {
        setIsLoggedIn(true);
        await fetchMembersForAdmin(user.uid);
      } else {
        setIsLoggedIn(false);
        setMembers([]);
      }
    });

    return () => unsubscribe();
  }, []);

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
        deleteMember,
        getCurrentAdminId
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
      ></AdminPinPrompt>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
