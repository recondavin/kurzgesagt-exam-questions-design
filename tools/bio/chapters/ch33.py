"""Chapter 33, the nervous system: how its exam questions are marked and shown.

No drawn diagrams yet (MAKERS is empty): each question's picture is cut from the exam paper itself (OVERRIDES['dia']).
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is (none yet),
  ANCHOR_WORDS  the words that name each anchor on those diagrams (none yet),
  OVERRIDES     per-question corrections: the paper's pictures, answer types, counts and hand-written keys.
"""
from itertools import product

CHAPTER = 33
TOPIC = 'The Nervous System'

MAKERS = []
ANCHOR_WORDS = {}


def base_of(what):
    return None


def _keys(*groups):
    """Every way of saying a point: one word from each group (a group lists the ways to say that word)."""
    groups = [g if isinstance(g, (list, tuple)) else [g] for g in groups]
    return [{'w': list(c), 'n': len(c)} for c in product(*groups)]


def _said(*alts):
    """Hand-written keys: each string is one way of saying the point, every word of it needed."""
    return [{'w': a.split(), 'n': len(a.split())} for a in alts]


def _one(*words):
    """Each word is enough on its own."""
    return [{'w': [w], 'n': 1} for w in words]


def _together(*groups):
    """Like _keys, but said in one part of a sentence (no full stop, comma, colon or joining word between): "sensory
    neurons carry impulses to the CNS", not "sensory neurons ..., and ... to the CNS"."""
    return [dict(k, c=True) for k in _keys(*groups)]


def _in_order(*alts):
    """Each string's words in this order, with only small words between them: "to the CNS", not "to the effector from the CNS"."""
    return [{'w': a.split(), 'n': len(a.split()), 'o': True} for a in alts]


