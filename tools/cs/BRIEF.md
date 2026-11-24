# Leaving Cert Computer Science, Higher Level: extracting the exam questions on chapters 6 and 7

The student (Higher Level) asked for Computer Science on the revision site, "the same way you did biology", for two
chapters of their book (Computer Science for Leaving Certificate, Golden Key), with "all questions related to these
topics":

- **Chapter 6, Computer systems**: what a computer system is (hardware, software, data, user); computer architecture
  (von Neumann architecture, the CPU: control unit, ALU, registers (PC, MAR, MDR, CIR, accumulator), clock, cache;
  buses (address, data, control); primary memory (RAM, ROM), secondary storage; the fetch-decode-execute cycle;
  input/output devices; embedded systems); electricity, electrons and electronics (voltage, current, transistors,
  binary signals, logic gates AND, OR, NOT, NAND, NOR, XOR, truth tables, simple circuits); operating systems (what
  they do: managing memory, processes, files, devices, security, user interface); the Internet and the World Wide
  Web (networks, LAN/WAN, client-server, packets and packet switching, IP addresses, routers, DNS, protocols such as
  TCP/IP, HTTP/HTTPS, the web, browsers, URLs, the cloud).
- **Chapter 7, Computational thinking, algorithms and data representation**: computational thinking (pattern
  matching / recognition, abstraction, decomposition, algorithms); algorithms (what an algorithm is, sequences of
  steps, puzzles solved by a sequence of moves, pseudocode and flowcharts, tracing an algorithm, searching (linear,
  binary) and sorting (bubble, insertion, selection, quicksort...) algorithms and their efficiency); representing data
  (binary, denary, hexadecimal and conversions, bits and bytes and units, two's complement and negative numbers,
  ASCII and Unicode text, images (pixels, resolution, colour depth), sound (sampling rate, bit depth), file sizes,
  compression, lossy and lossless).

Not these chapters: questions mainly about writing or reading Python code (what does this code print, write a
function), Section C (programming), databases, testing, design and universal design, HCI, history of computing,
emerging technologies, ethics and society, AI. A question goes in only if at least one of its parts is on chapter 6
or 7; then every part of it is extracted, each tagged with its own chapter (6, 7 or null when it's another topic).

## Sources (do not fetch anything from the web)
Folder: /tmp/claude-0/-home-user-kurzgesagt-exam-questions-design/a22a37c4-8fad-50d4-b7ae-0316b30a57fd/scratchpad/cs/
- Papers: `pdf/YYYY-hl-qp.pdf` (Higher Level, Sections A, B, C, English), 2020 to 2025.
- Marking schemes: `pdf/YYYY-hl-ms.pdf`. Text of both: `txt/YYYY-hl-qp.txt`, `txt/YYYY-hl-ms.txt` (made with
  `pdftotext -layout`). Diagrams, tables, logic circuits and code are often garbled in the text, so look at the
  rendered page (`pdftoppm -f P -l P -r 90 -png pdf/YYYY-hl-qp.pdf <your folder>/p`, then the Read tool).
Keep your images and scripts in your own scratch folder (named in your task), never in the repository.

## Output
Write ONLY your own files (named in your task), UTF-8, 2-space indent: one per chapter,
`{"chapter": 6, "title": "Computer systems", "questions": [...]}` (chapter 7's title: "Computational thinking,
algorithms and data representation"). A question that has parts on both chapters goes in the file of the chapter
with most of its marks (its parts keep their own `chapter`). Do not touch any other file; do not commit.

```json
{
  "id": "2024-Q8",                 // year-Q<number> (one paper a year: Sections A and B number on from 1)
  "year": 2024, "q": 8, "section": "A",
  "total": 6,                      // the question's marks (Section A questions are 6 each; Section B 38... check)
  "pages": [5],                    // 1-based PDF pages it is printed on
  "topic": "RAM and ROM",          // short topic name
  "sub": "architecture",           // ch6: systems | architecture | electronics | os | internet
                                   // ch7: thinking | algorithms | data
  "stem": "Text before the first part, word for word ($...$ for any maths)",
  "fig": "one line on any figure, circuit, table or code shown, else null",
  "parts": [
    {
      "l": "(a)(i)",               // label as printed; "" for a question with no parts
      "q": "The part's question, word for word (code in a ```...``` block if the part shows code)",
      "ask": "One short plain line of what to do (at most 80 characters, not giving the answer away)",
      "marks": 3,
      "chapter": 6,                // this part's chapter: 6, 7 or null
      "answer": { ... },           // see Answers
      "scheme": "What the scheme gives the marks for, short and in its own words, with its accepted alternatives",
      "model": "A full-marks answer as a strong student would write it in the box (one to three sentences, or the value)",
      "idea": { "title": "...", "text": "1-3 sentences: how the concept works, plainly", "vis": null } | null,
      "steps": [                   // 2-6 steps, each one small idea: what you do and why
        { "say": "One or two short sentences to the student.", "math": [], "code": "", "vis": null }
      ],
      "tip": "Optional exam tip for this part, or null"
    }
  ]
}
```
- `math`: KaTeX lines for working (conversions, place values: e.g. `121 = 64 + 32 + 16 + 8 + 1`,
  `\texttt{01111001}`), may be []. `code`: a few lines of code or pseudocode the step talks about (plain text with
  newlines), or "". Leave every `vis` null (pictures are added later).
- Prompts printed in the answer box ("Data in RAM:", "Rule 1:", "Milestone:") are separate fields (see `fields`).

## Answers (what the student types, and how it is marked)
The site checks a typed answer against the marking scheme. Use the type that fits the part:
- `{"type": "text", "value": "01111001", "accept": ["1111001"]}`: one exact answer (a binary or hex number, a
  letter, a word); spaces and case don't matter; `accept` lists other forms the scheme takes.
- `{"type": "number", "value": 4096, "tol": 0.5, "unit": "bytes"}`: a numeric answer (file sizes, counts).
- `{"type": "choice", "options": ["A", "B", "C", "D"], "value": 2}`: pick one.
- `{"type": "keys", "need": 2, "points": [
     {"text": "The scheme's point in its words", "marks": 3, "alts": [["word1|synonym", "word2"], ["other way"]]}]}`:
  an explanation marked by its points. A point is earned when the answer contains every word group of one of its
  `alts` (a group is words or short phrases separated by `|`, matched at the start of the student's words, so
  "process" matches "processes" and "processing"). `need` is how many points make full marks. Write the alts from
  the scheme's accepted answers and alternatives, as tight as the scheme: the words that carry its meaning, not
  every word, and never a word that is in the question itself unless the scheme needs it.
- `{"type": "fields", "fields": [{"label": "Data in RAM:", "answer": {...}}, {"label": "Data in ROM:", "answer": {...}}]}`:
  the box has printed prompts; each gets its own answer (any of the types above).
- `{"type": "table", "head": [...], "rows": [[...]], "blank": [[r, c], ...]}`: fill in a table (the given rows with
  the answer in the blank cells, e.g. a truth table or logic-gate outputs); each blank is marked exactly.
- `{"type": "none"}`: a drawing or a long design answer that can't be checked; the model answer and scheme show.

Check every value (conversions, file sizes, gate outputs, algorithm traces) with python. Keep the scheme's marks.

When finished, reply in under 200 words: your files, the questions and parts per chapter, and anything you weren't
sure of (which chapter a question belongs to, a scheme you couldn't read).
