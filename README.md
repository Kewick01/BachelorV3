# Bachelor i IT og ledelse
# Gamfifcation av Husoppgaver"

Et fullstack mobilprosjekt utviklet som en del av vår bacheloroppgave. Hensikten med appen er å gjøre husarbeid litt mer morsomt for de yngre i hustsanden.

## Funksjonalitet

- Barna/medlemmene kan:
  - Låse opp sin medlemsside gjennom en PIN.
  - Se på tildelte oppgaver og sin egen saldo.
  - Fullføre oppgaver og få belønning (Dette krever adminPIN).
  - Kjøpe kosmetiske elementer til sin figur med tjente penger.

- Foreldrene/admin kan:
  - Logge inn og få tilgang til adminverktøy.
  - Legge til, redigere og slette medlemmer.
  - Legge til nye oppgaver knyttet til hvert medlem.
  - Bekrefte at opphavene er fullført gjennom adminPIN.


## Brukte teknologier

Frontend:
- React Native
- TypeScript
- React Navigation
- react-native-svg

Backend:
- Flask (Python)
- REST API
- Python `uuid`
- Firebase Admin SDK

Andre teknologier:
- Firestore DB
- Firebase Auth
- Context API
- Lokal PIN-sjekk


## Hvordan Innstallere applikasjonen på din maskin

### Frontend
1. Naviger til frontend i terminalen (cd frontend)
2. Innstaller avhengigheter: 
   npm install

3. Start Metro i terminalen:
   npx react-native start

4. Start applikasjonen med android. Dette krever Android Studio eller en fysisk enhet(Vi har ikke fått testet på en fysisk enhet, da ingen av oss har android).
   npx react-native run-android

### Backend
1. Naviger til backend i terminalen:
   cd backend/src

2. Opprett virituelt miljø og aktiver:
   python -m venv venv
   source venv/bin/activate # Mac/Linux
   .\venv\Scripts\activate

3. Innstaller krav:
   pip install -r requirements.txt

4. Vi har brukt lokal IP-adresse for HTTP, så dette må evt byttes ut med din. Har endre det til: "<DIN-IP-ELLER-HOST>" (Dette blir litt jobb da det er en del steder som fetcher IP-adressen).

4. Start serveren:
   python app.py (Pass på at du er inne i src-mappa)


## Sikkerhet
- Firebase Authentification brukes til innlogging og verifisering av token.
- Tilgang til admin-funksjoner er beskyttet med en 4 sifret PIN.
- Alle API-kall fra frontend sender Bearer-token.

## Test/Demo
Vi har kun testet applikasjonen på en adnroid emulator gjennom Android Studio software.
Siden det kan være vanskelig å kjøre appen for sensor på sin egen maskin har vi laget
en Youtube-demo hvor applikasjonen blir gjennomgått. Lenke til videoen kan du finne her og i rapporten. Det skal også forekomme en live-demo
under muntlig presentasjon med sensor tilstedet.

## Utviklet i sammenheng med bacheloroppgave
Denne applikasjonen ble laget som en del av bacheloroppgaven vår i IT og ledelse.
Vi ønsket å lage en enkel og kul applikasjon som selvfølgelig er veldig skalerbar.
Vi begikk oss ut på dette uten noe særlig forkunnskap om hvordan en applikasjon lages.
Gjennom research, tidligere ferdigheter, AI og GitHub, så klarte vi å lage applikasjonen
i stor gard av det vi ønsket. Noen orginale planer falt vekk, som f.eks. Azure og at
den skulle være tilgjengelig for både ios og Android.

## Kontakt 
Spørsmål om prosjektet kan rettes til kandidatene og leses mer om i selve rapporten.


## Lenke til Youtube-demo:
https://youtu.be/vJCsznss_Gs
