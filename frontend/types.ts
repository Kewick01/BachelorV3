export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Admin: undefined;
    MemberDetail: { memberId: string};
    AddTask: { memberId: string};
}