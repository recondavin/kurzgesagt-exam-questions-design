# Auditing a Geography bank for accuracy

The Geography section teaches Leaving Certificate (Ireland) Higher Level students to write 30-mark essays from points
(SRPs) a student will learn by heart and write in the exam. The student said: "it better have everything and better be
accurate". Your job is to check every point in your topics as an examiner and a geography teacher would, and fix what
is wrong. You did not write these banks: read them with fresh eyes and assume nothing is right until you have checked it.

Read `tools/geo/BANKS.md` (the format) first. Then for every SRP in your files check:

- `t` (the model sentence the student learns): is it TRUE, exam-accurate, and the way the Irish syllabus and
  textbooks (Planet Earth, Today's World, Essentials, Geography in Action) and the SEC marking schemes put it? Is the
  process explained correctly (cause and effect the right way round)? Are names, places, dates and numbers right?
  Is the named example really an example of that thing (e.g. a "sea stack" that really is a stack, a "rias" that really
  is a ria)? Is anything presented as fact that is disputed or a legend (say so in the sentence, or drop it)?
- `w` (the wrong version) must really be wrong, and `why` must correctly say why. `v` (vague) must be true but too
  vague to score. `c[0]` must ask for this point; `c[1]` must be its key words.
- `a` (the point's name) must match the point.
- Each essay's `ask`, `notes` and `head` labels must match the past questions and schemes in
  `tools/geo/research/questions.json` (read the ones for your essays).

Also check completeness: does each essay type have the points a full-marks answer to every past question on it needs
(every option the question allows, every aspect the scheme credits)? Add SRPs where a common, creditable point is
missing (same format, model sentence first, keys after).

When a fact is uncertain, check it with web search (load it with ToolSearch "select:WebSearch") rather than guessing,
and if it still can't be confirmed, rewrite the sentence without the uncertain detail. Never invent a statistic.

Fix things in place with small edits (keep ids stable; if a model sentence changes, make sure its keys `k` still fit).
After your edits, `node tools/geo/check.mjs <topic>` must print "all checks passed" for each of your topics (keep the
output short: `| tail -20`). Other reviewers are editing other topic files at the same time: edit only your files, do
not use git.

Report in under 200 words: how many SRPs you checked, every factual correction you made (old → new, one line each), the
points you added, and anything you could not confirm.
