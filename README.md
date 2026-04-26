# Netparkoló – Frontend

Ez a könyvtár tartalmazza a Netparkoló alkalmazás kliensoldali felületét. A rendszer egy modern, egyoldalas webalkalmazás Angular keretrendszerre építve, amely gyors és interaktív felhasználói élményt nyújt a parkolóhelyek kereséséhez, foglalásához és kezeléséhez.

## Használt Technológiák

- Angular 21
- TypeScript
- Bootstrap
- MapLibre GL és MapTiler a térképes megjelenítéshez
- Stripe.js a biztonságos kártyás fizetéshez

## Főbb Funkciók

1. Térképes parkolókereső:
   - A felhasználók valós időben böngészhetnek a szabad parkolók és utcai zónák között egy interaktív térképen.
2. Felhasználói felület:
   - Regisztráció, bejelentkezés, profilkezelés, saját járművek hozzáadása és korábbi foglalások áttekintése.
3. Foglalási és fizetési folyamat:
   - Dinamikus árkalkuláció percalapon és zökkenőmentes bankkártyás fizetés a Stripe rendszerén keresztül.
4. Adminisztrációs felület:
   - Megfelelő jogosultsággal rendelkező felhasználók kezelhetik a parkolókat, zónákat, foglalásokat és a regisztrált ügyfeleket.
5. Reszponzív dizájn:
   - Az alkalmazás asztali számítógépeken, tableteken és mobiltelefonokon is hibátlanul használható.

## Telepítés és Futtatás Helyi Környezetben

### Előfeltételek
- Node.js
- npm csomagkezelő
- Angular CLI

### 1. Függőségek telepítése
Nyiss egy terminált a frontend projekt gyökérmappájában, és futtasd az alábbi parancsot a szükséges csomagok letöltéséhez:

```bash
npm install
