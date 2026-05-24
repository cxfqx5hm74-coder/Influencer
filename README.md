# Influencer / Hrozek Studio

Hrozek Studio je webová aplikace pro správu sociálních sítí uživatele z jednoho místa.

## Cíl MVP

- Správa napojených sociálních sítí uživatele.
- Možnost přizvat další uživatele jako spolupracovníky.
- Dashboard s přehledem všech napojených sociálních sítí.
- Vytvoření jednoho obsahu typu story, reels nebo příspěvek na jednom místě.
- Po dokončení obsahu výběr, na které sítě se má odeslat.
- Možnost naplánovat termín publikace.
- Dashboard se statistikou posledního příspěvku.

## Aktuální stav

Repozitář obsahuje první funkční React frontend pro kontrolu UX. Aplikace má obrazovky Dnes, Vytvořit, Plán a Více.

Součástí první verze je režim Běžné sítě / Adult / Obojí, jednoduchý dashboard, inbox nápadů, osobní kalendář, tvorba obsahu, výběr cílových sítí, návrhy textů, plán obsahu a základní rozšířený režim pro AI, live a merch.

## Spuštění lokálně

Použij npm install a potom npm run dev. Pro produkční build použij npm run build a npm run preview.

## Další technické kroky

1. Doplnit reálné databázové údaje do lokální konfigurace.
2. Přidat přihlášení uživatele.
3. Napojit dashboard na databázi.
4. Přidat ukládání nápadů, kalendáře a plánovaných příspěvků.
5. Připravit staging deploy.

## Produktové pravidlo

Jednoduchý režim je výchozí. Rozšířený režim existuje pro profesionály, studio a agenturu, ale nesmí překážet běžnému člověku, který chce rychle postnout story.
