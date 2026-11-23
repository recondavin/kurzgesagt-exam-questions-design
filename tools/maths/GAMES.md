# Maths game cards: the exam questions as quick four-option questions for the games

The site's games (Mini Golf, Pool: `bio/bio-golf.js`, `bio/bio-pool.js`, through `bio/bio-board.js`) ask a question
before every shot: four options, one right. Maths gets them with its own real exam questions (the user: "maybe minigames
with exam questions also?"). The cards are written from the chapter files `tools/maths/questions/ch<N>.json`, which
hold every Ordinary Level question 2015–2025 on chapters 10–14 with its parts, answers and worked steps.

## A card

```json
{"id": "2018-P2-Q1:(a)(ii):1", "from": "2018-P2-Q1",
 "q": "Two fair dice are thrown and the scores added. What is the probability of a total of 7 or 11?",
 "right": "8/36 (= 2/9)",
 "wrong": ["6/36", "2/36", "8/12"],
 "why": "Six ways make 7 and two ways make 11: 8 of the 36 equally likely outcomes, so 8/36.",
 "hook": "Count outcomes, not totals: two dice give 6 × 6 = 36.",
 "keys": ["8 of the 36"]}
```
- `id`: `<question id>:<part label>:<n>`; `from`: the question id (the game shows the year).
- `q`: the question, standing on its own: put in the numbers, the function, the shape's sizes, the data or the
  situation the part needs from the question's stem, table or diagram (the player can't see the paper). Plain text,
  at most about 220 characters. Keep the exam's own wording where you can.
- `right`: the answer, exactly right and checked with python (sympy, fractions). `wrong`: three wrong options, each a
  **real mistake a student makes on this part**, worked out by doing that mistake (using the diameter as the radius,
  forgetting to square, adding instead of multiplying, counting with repeats when there are none, only counting one of
  the two cases, mixing up mean and median, the slope of the line instead of the y-intercept, forgetting the minus).
  Never silly or obviously wrong; never two options equal in value; all four in the same form (all with units, or all
  fractions...). Options at most about 40 characters.
- `why`: at most about 170 characters: the working or reason in one line, the way the marking scheme would accept it.
- `hook`: at most 90 characters: a way to remember the method (a rule of thumb, a picture, a mnemonic): it is shown
  on a yellow sticky note "Remember it".
- `keys`: 1–3 short phrases copied exactly from `why` (they get a highlighter).
- Plain Unicode maths everywhere: x², x³, √, π, −, ×, ÷, ≤, ≥, ≈, ½, °, cm³, €. No LaTeX, no `$`.

## Which cards

For every part of every question (in the parts' order):
- an **answer card** ("What is …?") whenever the part has a definite answer (a number, a point, an expression, a
  probability, an equation, a count);
- a **method card** where the method is the thing to learn: the first step, which formula, which rule, why the
  answer is what it is ("To find the turning point, what do you set equal to 0?", "Which formula gives the curved
  surface area of a cone?", "Why multiply here, not add?");
- for parts that are drawings or explanations (draw the graph, explain in context), a card on what the answer must
  contain or a reading from the graph, when one makes a fair question; otherwise none.
Two cards for most parts, one for small ones, three at most. Don't repeat the same card on the next part.

## Files and checks

Write `tools/maths/cards/<name>.json`: `{"chapter": 13, "cards": [...]}` (only cards for that chapter). Then
`python3 tools/maths/build_cards.py` checks every file (fields, lengths, four different options, plain text, ids
match real parts) and writes `maths/maths-cards.js` (`window.MathsCards[ch] = [...]`), which `maths/maths-deck.js`
gives to the games (maths-golf.html, maths-pool.html).
