# Computer Science game cards: the exam parts as four-option questions for the games

The same rules as Maths (read tools/maths/GAMES.md: a card's fields, a question that stands on its own, the right
answer checked, three wrong options that are each a real mistake, a why, a "Remember it" hook, keys from the why,
plain Unicode), for the Higher Level Computer Science parts on chapters 6 and 7 in tools/cs/questions/ch6.json and
ch7.json. The games: Mini Golf, Pool, the Trivia board, Outrun the Examiner, Points Grid, Sea Battle, Cannon Duel and
Topple the Examiner (cs-golf.html, cs-pool.html, cs-play.html).

- `id`: `<question id>:<part label>:<n>` (a question with no parts has the label "": `2024-Q8::1`); `from`: the
  question id. Only parts whose `chapter` is 6 or 7 get cards.
- Wrong options for Computer Science are the real misconceptions: RAM and ROM swapped, the MAR and MDR mixed up,
  the PC holding the instruction instead of its address, bus directions reversed, AND/OR or NAND/NOR outputs swapped,
  a binary place value missed or doubled, hex digits past 9 wrong (B = 11), two's complement without adding 1, bits vs
  bytes (÷ 8), 1000 vs 1024, lossy vs lossless swapped, IP vs MAC addresses, DNS vs a router's job, TCP vs UDP, HTTP vs
  HTTPS, abstraction vs decomposition, a search that only works on sorted data, an off-by-one in a trace, best vs worst
  case.
- Code can appear in a question in `backticks` (one line) when the part is about a short algorithm.
- Each card goes in one of the games' five topics by its question's `sub` (28 systems and architecture,
  29 electronics, 30 operating systems and the Internet, 31 thinking and algorithms, 32 data).

Files: `tools/cs/cards/<name>.json` = `{"chapter": 6, "cards": [...]}`. Check with
`python3 tools/cs/build_cards.py --only tools/cs/cards/<name>.json`; `python3 tools/cs/build_cards.py` writes
cs/cs-cards.js.
