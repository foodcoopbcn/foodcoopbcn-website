# Guia editorial

Qui manté el web és una comissió de voluntàries, no una agència. Aquesta guia és
perquè mantenir-lo no depengui de recordar coses.

## El calendari mínim

Un web de projecte que no es toca en sis mesos deixa de semblar viu, i el
cercador ho nota abans que les persones. Amb **quatre peces al mes** n'hi ha
prou, i tres es poden preparar en una tarda:

| Cada mes | Què | On |
|---|---|---|
| 1 | **Una notícia del projecte**: una decisió d'assemblea, una millora al local, un acord nou | Actualitat |
| 2 | **Una recepta de temporada** amb producte que tingueu a la lleixa | Actualitat › Receptes |
| 3 | **Una productora**: qui és, on és, què us porta | Actualitat |
| 4 | **El butlletí**, amb aquestes tres coses i res més | Newsletter |

El butlletí no necessita text nou: és el resum de les tres peces anteriors.
Aquesta és tota la gràcia de fer-ho en aquest ordre.

## Què no s'ha de tocar mai a mà

Hi ha xifres que surten soles perquè es queden obsoletes sense que ningú se
n'adoni. **No les escriguis dins d'un text:**

- **Nombre de sòcies** — surt de l'Odoo. A la portada s'escriu `{socies}`.
- **Preus i imports** — surten de `src/config/site.ts`. A les FAQ pots escriure
  `{capital}`, `{discount}`, `{quotaReduced}`, `{hours}` i companyia.
- **Horari** — surt de la configuració, i la franja d'«obert ara» el calcula sola.
- **Preus comparats** — es recullen cada dia de les botigues en línia.

Si has d'actualitzar un preu, es canvia **un cop** a la configuració i canvia a
tot el web alhora. Si el copies dins d'una frase, el dia que canviï tindreu dues
xifres diferents al mateix web.

## Escriure per a aquest web

- **Femení genèric**: sòcia, totes, productores, copropietària. És una decisió
  del projecte i és consistent a tot arreu.
- **Digues la xifra.** «Una aportació retornable» no respon res; «40 €, que et
  tornem si pleges» sí. La versió anterior del web no deia mai cap preu, i era
  el motiu principal pel qual no convertia.
- **Primera frase, la resposta.** Sobretot a les FAQ: els cercadors i els
  assistents d'IA citen la primera frase. Elabora després.
- **No prometis el que no ensenyes.** Si dius «marges transparents», ha d'haver-hi
  un enllaç als marges.

## Publicar una notícia o una recepta

1. `pnpm run cms` i obre `/keystatic`.
2. Escriu-la en un idioma, i després l'altra versió.
3. **Posa la mateixa clau de traducció** a totes dues. Si no, el botó d'idioma
   d'aquell article portarà a una pàgina que no existeix.
4. Puja una portada i **escriu-hi el text alternatiu**: què s'hi veu, per a qui
   fa servir lector de pantalla.
5. Obre una pull request. Netlify en fa una previsualització abans de publicar.

## Cada tres mesos

- **Repassa les FAQ** amb els missatges que hagin arribat pel formulari de
  contacte i amb el que us pregunti la gent a caixa. Si una pregunta es repeteix,
  hi falta.
- **Mira el recull de premsa** i afegeix-hi el que hagi sortit.
- **Comprova les fotos**: si encara n'hi ha de marcador de posició, mira
  `docs/brief-fotografia.md`.
