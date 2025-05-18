// AppContext.tsx - Global kontekst for applikasjonen.
// Håndterer innloggingssatus, medlemshåndtering, API-kall og admin-PIN.
// Tilgjengelig i hele appen gjennom useAppContext().

import React, { createContext, useContext, useState, useEffect, ReactNode, } from 'react';
import { Alert } from 'react-native';
import AdminPinPrompt from '../components/AdminPinPrompt';
import { authInstance } from '../firebase';


// Type for en oppgave knyttet til et medlem.
type Task = {
  id: string;
  title: string;
  price: number;
  completed: boolean;
};

// Type for et medlem.
type Member = {
  id: string;
  name: string;
  code: string;
  money: number;
  cosmetics?: string[]; // Nye kosmetiske elementer brukeren har kjøpt.
  tasks: Task[];
  equippedCosmetics?: string[]; // Valgte kosmetiske elementer.
  character: {
    type: string;
    color: string;
  };
};

// Typer for verdiene som gjøres tilgjengelig i applikasjonen via AppContext.
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

// Oppretter en React-kontekst med en udefinert startverdi.
const AppContext = createContext<AppContextType | undefined>(undefined);

// Kontekst-Provider: Her settes verdiene som gjøres tilgjengelig via AppContext.
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  
  // Henter token fra Firebase og bygger header med autorisasjon.
  const getAuthHeader = async () => {
    const token = await authInstance.currentUser?.getIdToken(true);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };
  
  // Legger til nytt medlem lokalt.
  const addMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);
  };
  
  // Oppdaterer medlem lokalt og sender PUT-kall til backend.
  // Dette er en HTTP-forespørsel som oppdaterer eller erstatter en eksisterende ressurs.
  const updateMember = async (updatedMember: Member, silent: boolean = false) => {
    setMembers((prev) =>
      prev.map((m) => m.id === updatedMember.id ? JSON.parse(JSON.stringify(updatedMember)) : m)
    );

    try {
      const res = await fetch(`http://<DIN-IP-ELLER-HOST>/update-member/${updatedMember.id}`,{ // Her skal din private IP-adresse inn, har byttet den ut med tekst i henhold til personvern.
        method: 'PUT',
        headers: await getAuthHeader(),
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

   // Sletter et medlem lokalt og i backend.
  const deleteMember = async (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    try {
      const token = await authInstance.currentUser?.getIdToken(true);

      const res = await fetch(`http://<DIN-IP-ELLER-HOST>:3000/delete-member/${memberId}`,{
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

   // Henter inn oppdatert informasjon om et medlem.
  const refreshMember = async (memberId: string) => {
    const token = await authInstance.currentUser?.getIdToken(true);
    const res = await  fetch(`http://<DIN_IP_ELLER_HOST>:3000/member/${memberId}`, {
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

  // Markerer en oppgave som fullført og oppdaterer pengene og oppgavelista knyttet til det spesifikke medlemmet.
  const completeTask = async (memberId: string, taskId: string) => {
    try {
      const token = await authInstance.currentUser?.getIdToken(true);

      const res = await  fetch(`http://<DIN-IP-ELLER-HOST>:3000/complete-task/${memberId}/${taskId}`, {
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

  // Henter nåværende admin UID fra Firebase Auth.
  const getCurrentAdminId = () => {
    return authInstance.currentUser ? authInstance.currentUser.uid : null;
  };

  // Veksler mellom admin og bruker gjennom PIN-popupen.
  const toggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPinPrompt(true);
    }
  };

  // Henter opp alle medlemmene som er knyttet til den innloggede adminen.
  const fetchMembersForAdmin = async (adminId: string) => {
    try {
      const token = await authInstance.currentUser?.getIdToken(true);
      const res = await fetch(`http://<DIN-IP-ELLER-HOST>:3000/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  // Setter innlogget status og henter medlemmer hvis brukeren er logget inn.
  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async(user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const token = await user.getIdToken(true);
          if (token) {
            await fetchMembersForAdmin(user.uid);
          }
        } catch (e) {
          console.warn("Kunne ikke hente token:", e);
        }
        
      } else {
        setIsLoggedIn(false);
        setMembers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Returnerer selve konteksten.
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

// Henter konteksten i ulike komponenter.
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
