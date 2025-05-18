// types.ts - Definerer typeinformasjon for navigasjonsruter i appen
// Brukes sammen med React Navigation for å sikre korrekt bruk av parametere.

// RootStackParamList beskriver alle ruter i navigasjonsstacken.
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Admin: undefined;
    MemberDetail: { memberId: string};
    AddTask: { memberId: string};
}