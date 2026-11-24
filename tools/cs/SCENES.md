# Computer Science scenes: the animated pictures on each step

The CS desk (cs/cs-desk.js) shows each step's `vis` with the maths scene engine (maths/maths-scenes.js) plus the
Computer Science kinds in cs/cs-scenes.js. Read tools/maths/SCENES.md first: how a part's scenes build up (repeat
the spec and change one thing per step; `null` keeps the last picture), the rules (true to the question, uncluttered,
plain Unicode labels, `cap` for a caption), and the general kinds that also help here (`table`, `list`, `slots`,
`bars`, `pie`, `dots`, `tree`, `venn`, `graph`). See every CS kind: tools/cs/gallery.html (`?still=1` for end states).

## The CS kinds

**bits**: place values over a row of bits; the bits set one at a time and the sum is written underneath.
```json
{"t": "bits", "value": 121, "n": 8}
{"t": "bits", "value": -58, "n": 8, "signed": true}
{"t": "bits", "bits": "10110110", "hex": true, "show": false}
```
`value` (a number; negative with `signed` uses two's complement) or `bits` (a string of 0s and 1s). `n` bits
(default 8). `signed`: the leftmost place is negative (−128). `hex`: nibbles grouped, each one's value and hex digit
under it (over 8 bits each nibble's places read 8 4 2 1 and the line under it is short, e.g. `15→F`; use
`show: false` there). `show: false` hides the sum line; `sum` replaces it. `hl`: bit positions (from the left, 0
first) to ring.

**gates**: a logic circuit with its signals.
```json
{"t": "gates", "inputs": {"A": 1, "B": 0}, "gates": [{"id": "x", "type": "AND", "in": ["A", "B"]}, {"id": "y", "type": "NOT", "in": ["x"]}], "out": "y", "outName": "Q", "table": true}
```
`inputs`: names with values (0/1), or a list of names for no values. `gates`: `{id, type, in}` with types AND, OR,
NOT, NAND, NOR, XOR, XNOR; `in` names inputs or earlier gates. `out`: the output gate(s); `outName` their labels.
The 1s light yellow along the wires; `table: true` adds the truth table with the current row lit (for the first
output). Input and output names can be a few characters (`A·B̄`, `carry`): the picture makes room; outputs line up
on the right. Keep a circuit to about 6 inputs.

**cpu**: the von Neumann machine.
```json
{"t": "cpu", "step": "Fetch", "regs": {"PC": "0100", "MAR": "0100", "MDR": "LOAD 7", "CIR": "LOAD 7", "ACC": ""},
 "mem": [["0100", "LOAD 7"], ["0101", "ADD 8"]], "hl": ["pc", "mar", "mem0"],
 "flow": [["pc", "mar", null, "0100"], ["mar", "ram", "address", "0100"], ["ram", "mdr", "data", "LOAD 7"], ["mdr", "cir", null, "LOAD 7"]]}
```
Units: `cu`, `alu`, `pc`, `mar`, `mdr`, `cir`, `acc`, `ram` (with `mem` rows: [address, contents], up to 8), and with
`cache: true` a cache, with `io: true` input, output and storage. `regs`: values shown in the registers. `hl`: units
(and buses `address`, `data`, `control`, and RAM rows `mem0`, `mem1`...) to light. `flow`: values that travel, in
order, `[from, to, bus or null, label]`; the trail runs under the boxes and the value fades on arrival. `step`: a
heading beside "CPU" ("Fetch", "Decode", "Execute").

**network**: devices and links, packets travelling.
```json
{"t": "network", "nodes": [{"id": "pc", "kind": "laptop", "label": "Your laptop", "ip": "192.168.1.5", "x": 0, "y": 60},
   {"id": "r", "kind": "router", "label": "Router", "x": 30, "y": 60}, {"id": "dns", "kind": "dns", "label": "DNS server", "x": 60, "y": 0},
   {"id": "web", "kind": "server", "label": "Web server", "x": 100, "y": 60}],
 "links": [["pc", "r"], ["r", "dns"], ["r", "web"]],
 "send": [{"path": ["pc", "r", "dns"], "label": "example.com?"}, {"path": ["dns", "r", "pc"], "label": "93.184.216.34", "c": "blue"}]}
```
Kinds: pc, laptop, phone, router, switch, server, dns, cloud, and `node` (a plain circle, e.g. a city on a map, with
`name` written inside it). `x`, `y` from 0 to 100 (left/top); left out, the nodes go across in order. Labels and IPs
near an edge stay inside the picture. `links`: `["a", "b"]`; a third item `"wifi"` draws it dashed, any other third
(or fourth) item is a label on the link (a distance: `["1", "2", 12]`). `send`: packets along `path` one after
another (`c`: blue, pink, green); a packet fades on arrival unless `stay: true`, when it rides above the line and
stays over the device it reaches (an ACK, a reply). `hl`: nodes to light. `h`: the height (default 250).

**flow**: a flowchart, top to bottom.
```json
{"t": "flow", "nodes": [{"id": "s", "type": "start", "text": "Start"}, {"id": "i", "type": "io", "text": "Input n"},
   {"id": "d", "type": "decision", "text": "n mod 2 = 0?"}, {"id": "y", "type": "io", "text": "Output \"even\""}, {"id": "e", "type": "end", "text": "End"}],
 "edges": [["s", "i"], ["i", "d"], ["d", "y", "yes"], ["y", "e"], ["d", "e", "no"]], "path": ["s", "i", "d", "y", "e"], "hl": "d"}
```
Types: start, end, process, decision, io. Nodes stack in order; an edge to the next node goes straight down, any other
is routed round the right side (loops back up too). `path`: a token runs through it. `hl`: node(s) to light. Keep the
text short (about 18 characters; longer text shrinks, then goes on two lines). A loop back into a node enters
just above its middle, an exit out of it leaves just below, so they don't share a line. Up to about 8 boxes stay
readable; nodes go in one column (a box beside a decision isn't possible: use a `table` for such a chart).

**array**: a list in boxes, for searching and sorting.
```json
{"t": "array", "vals": [3, 5, 8, 9, 12], "cmp": [1, 2], "swap": [1, 2], "sorted": [4, 4], "label": "Pass 1: swap 8 and 5"}
{"t": "array", "vals": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "ptr": {"lo": 5, "mid": 7, "hi": 9}, "hl": [7], "find": 23}
```
`vals` (up to 16), `cmp` (being compared, ringed), `swap` (two indices that just swapped: they animate across from
each other's place; give `vals` after the swap), `sorted` [from, to] or `done` (indices in place, green), `hl` (lit),
`ptr` (named arrows under indices from 0: lo, mid, hi, i, j...; two on one box share an arrow, "lo = mid"), `find`
(the value searched for: lit green where it is also in `hl`, so give `hl` the found index on the step it's found),
`dim` (indices out of play, greyed: the half a binary search throws away), `bad` (indices that fail a rule, red),
`from: 1` (number the boxes from 1, as a question does; `ptr` and the rest stay 0-based), `label` (a line above).
Values up to about 7 characters shrink to fit their box. One step per comparison or swap shows an algorithm running.

## Choosing scenes
- Binary, hex, two's complement, units: `bits` (each step sets more bits, or changes `hl`), `table` for conversions
  tables, `slots` for counting combinations (2ⁿ values from n bits).
- Text (ASCII/Unicode): `table` of characters and codes, then `bits` for one code.
- Images and sound: `table` or `slots` for the sizes multiplied (pixels × bits per pixel), `bars` for sampling.
- Logic gates and truth tables: `gates` (inputs changing per step; `table: true` for the whole truth table).
- The CPU, registers, buses, the fetch-decode-execute cycle, RAM/ROM, cache: `cpu` (one step per stage).
- Networks, the Internet, DNS, packets, IP addresses, protocols, client-server: `network`.
- Algorithms: `flow` for flowcharts and decisions, `array` for searching and sorting traces, `list` or `table` for
  traces of variables, `slots` for counting moves.
- Computational thinking (decomposition, abstraction, pattern recognition): `list` (sub-problems as rows), `table`
  (what's kept and what's left out), `tree` for a problem broken into parts.
