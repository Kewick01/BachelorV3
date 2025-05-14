
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
  updateMember: (updatedMember: Member, silent?: boolean) => void; 
  deleteMember: (memberId: string) => void; 
  getCurrentAdminId: () => string | null; 
  refreshMember: (memberId: string) => Promise<void>;
  completeTask: (memberId: string, taskId: string) => Promise<void>;
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

  const updateMember = async (updatedMember: Member, silent: boolean = false) => {
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
          money: updatedMember.money,
          tasks: updatedMember.tasks,
          cosmetics: updatedMember.cosmetics,
          equippedCosmetics: updatedMember.equippedCosmetics,
          character: {
            type: updatedMember.character.type,
            color: updatedMember.character.color,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Oppdatering feilet:', data);
        Alert.alert('Feil', data.error || 'Klarte ikke oppdatere medlem.');
      } else {
        console.log('Oppdatering OK:', data);
        if (!silent) {
        Alert.alert("Suksess", "Medlem ble oppdatert!");
        }
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

  const refreshMember = async (memberId: string) => {
    const token = await authInstance.currentUser?.getIdToken();
    const res = await  fetch(`http://192.168.11.224:3000/member/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      data.id = memberId;
      setMembers((prev) => prev.map((m) => m.id === memberId ? data : m));
    }
  };

  const completeTask = async (memberId: string, taskId: string) => {
    try {
      const token = await authInstance.currentUser?.getIdToken();

      const res = await  fetch(`http://192.168.11.224:3000/complete-task/${memberId}/${taskId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setMembers(prev =>
          prev.map(m =>
            m.id === memberId ? {...m, tasks: data.UpdatedMember.tasks, money: data.UpdatedMember.money} : m 
      )
    );
  } else {
    console.error('Fullføring feilet:', data);
    Alert.alert('Feil', data.error || 'Klarte ikke fullføre oppgaven.')
  }
} catch (error) {
  console.error('Feil ved fullføring av oppgave:', error);
  Alert.alert('Feil', 'Noe gikk galt.');
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
        getCurrentAdminId,
        refreshMember,
        completeTask,
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
