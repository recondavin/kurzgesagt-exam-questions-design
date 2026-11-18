// DRAFT, NOT LIVE. Pauses with labels for Shawshank scenes 1, 2, 5, 6, 8, 9, 10 and 12 (abuse of power), written as
// replacement lines for the CLIPS map in eng/eng.js. Seconds and lines come from each clip's captions; WHERE PEOPLE
// ARE was read off YouTube's 160-pixel seek previews, never off the real video, which will not play in a cloud
// session. The user's process for an accurate pause: "pause it first, look at the pause and then do the tracking".
// So before any of this goes into eng.js: play the clip in a real browser, let it pause at `at`, LOOK at the frame,
// and only then set each x, y, rx, ry (and move `at` if the shot is wrong). Until then these scenes play the clip
// whole with no pause and no labels.
    // SHAWSHANK 1, 2, 5, 6, 8, 9, 10, 12 for abuse of power, placed by rule 13: every seek preview around each pause
    // laid out, a pause only where the previews on both sides show the same shot, positions read off the enlarged
    // preview with a 10% grid, and every shape then drawn on the previews either side and looked at (scratchpad
    // ellchk.py; sheets ell-a/b/c.jpg). All seven wired uploads DO give previews (the old note that 1 and 6 give none
    // was false). Two pauses are not bracketed by two previews of their own upload and are marked CROSS-CHECKED.
    //
    // "The Conviction of Andy Dufresne", 5:09; previews only every 5 seconds, so the shots were also read from another
    // upload of the same scene with previews every 2 (dsLSE5mOKh4; this one runs 23.2 s later, from five caption lines
    // and four cuts). 3:08.2, CROSS-CHECKED: Andy's close-up (this upload's preview at 3:05; in the other upload the
    // same shot holds for five previews up to the equivalent of 3:09.2, then the falling bullets), his line ending at
    // about 3:08. 5:04.6: Andy standing for sentence, the same shot in this upload's previews at 4:55, 5:00 and 5:05;
    // "So be it" and the cut to black come after the pause.
    'shawshank-1': { yt: 'nbo7A03c_A0', pauses: [
      { at: 188.2, spots: [{ x: 40, y: 46, rx: 19, ry: 42, label: 'Andy' }],
        themes: { power: { ask: 'What does this exchange show about the power the court has over Andy?', title: 'The system’s power over an innocent man',
          note: 'Andy tells the truth and it does him no good. The prosecutor has a story, the missing gun fits it, and an innocent man cannot prove what he did not do. The court does not have to be right about Andy: it only has to be believed.',
          say: [['On trial for the murder of his wife and her lover. The prosecutor has just called it very convenient that his gun was never found. Andy:', '“Since I am innocent of this crime, sir, I find it decidedly inconvenient that the gun was never found.”']] } } },
      { at: 304.6, spots: [{ x: 51, y: 45, rx: 14, ry: 42, label: 'Andy' }],
        themes: { power: { ask: 'What do the judge’s words show about the system’s power over Andy?', title: 'A life decided in one verdict',
          note: 'The judge condemns Andy on how he seems, icy and remorseless, and one sentence takes the rest of his life. Andy is innocent, and the court’s power over him is total all the same: there is nobody he can make look again.',
          say: [['Standing to be sentenced. The judge, to him:', '“You strike me as a particularly icy and remorseless man, Mr Dufresne. It chills my blood just to look at you.”', 'Then the sentence:', '“By the power vested in me by the State of Maine, I hereby order you to serve two life sentences, back to back, one for each of your victims.”']] } } }
    ] },
    // Red's first parole hearing: a NEW clip, I5Gumyh1nmo ("Red gets rejected from parole", 0:51, previews every
    // second, captions timed word by word). One pause, 0:44.8: Red's close-up is one held shot from 0:23 to 0:48 (26
    // previews) and "That's God's honest truth" ends at about 0:44.2. The REJECTED stamp is the clip's last second
    // (preview at 0:51), too close to the end for a pause of its own, so the note names it.
    'shawshank-2': { yt: 'I5Gumyh1nmo', pauses: [
      { at: 44.8, spots: [{ x: 55, y: 42, rx: 15, ry: 40, label: 'Red' }],
        themes: { power: { ask: 'What do Red’s words show about the power the parole board has over him?', title: 'Power makes people perform',
          note: 'Twenty years in, Red’s freedom depends on a few men behind a table, so he says what he thinks they want to hear. Under that kind of power, honesty seems pointless. The stamp that follows, REJECTED, is the board’s whole answer.',
          say: [['Twenty years into a life sentence, asked if he feels he has been rehabilitated:', '“Oh, yes, sir. Absolutely, sir. I mean, I learned my lesson. I can honestly say that I’m a changed man. I’m no longer a danger to society. That’s God’s honest truth.”']] } } }
    ] },
    // "Brooks was here" scene, 4:18 (previews every 2 seconds). 3:10.9: Brooks's close-up in his suit, the same shot
    // at 3:10 and 3:12, after "I've decided not to stay" (ends about 2:57) and before "Not for an old crook like me".
    // 3:45: his face seen up through the rafters as he finishes carving, the same shot from 3:40 to 3:48. The carved
    // words cannot be read on a preview, so the label is on Brooks, not on the beam.
    'shawshank-5': { yt: 'LU7SIVHZda4', pauses: [
      { at: 190.9, spots: [{ x: 44, y: 38, rx: 17, ry: 38, label: 'Brooks' }],
        themes: { power: { ask: 'What do Brooks’s words show about what fifty years in Shawshank have done to him?', title: 'Power over the mind',
          note: 'Brooks is free and he wants to go back. After fifty years of being told when to eat, sleep and work, the prison is the only place he knows how to live: he calls it home. Shawshank’s power did not end at the gate, because it had taken over his mind.',
          say: [['Paroled after fifty years, alone in a halfway house, writing to the men inside:', '“Maybe I should get me a gun and rob the Foodway, so they’d send me home.”', 'And at the end of the letter:', '“I don’t like it here. I’m tired of being afraid all the time. I’ve decided not to stay.”']] } } },
      { at: 225, spots: [{ x: 44, y: 44, rx: 15, ry: 34, label: 'Brooks' }],
        themes: { power: { ask: 'What does Brooks’s end show about the human cost of power in Shawshank?', title: 'The human cost of power',
          note: 'Nobody beats Brooks or locks him up at the end. The prison let him go, and that is what kills him: fifty years of control left him unable to live without it. The only mark he leaves on the outside world is a line cut into a beam.',
          say: [['In his suit, standing on the table in his room, he has just carved into the beam above him:', '“Brooks was here”']] } } }
    ] },
    // "The Marriage of Figaro" scene, 4:04 (previews every 2 seconds). 3:51: Andy's close-up after the glass is broken,
    // the same shot at 3:50 and 3:52; both of Red's lines are over by 3:08. 4:01.4: Norton standing in the doorway, the
    // same shot at 4:00 and 4:02 (already fading), as Red's "two weeks in the hole" ends. Norton's shouted order is
    // not quoted: the captions garble it.
    'shawshank-6': { yt: 'ScU1O_Xuoxo', pauses: [
      { at: 231, spots: [{ x: 40, y: 42, rx: 17, ry: 38, label: 'Andy' }],
        themes: { power: { ask: 'What do Red’s words show about the limits of the warden’s power?', title: 'Power can’t reach the inside',
          note: 'Norton controls every minute of these men’s days, and for a few minutes a record does what he cannot stop: every man in the yard feels free. Andy knows what it will cost him and turns the music up. Control has its limits, because it cannot reach what is inside a man.',
          say: [['Has locked himself in the office and played Mozart to the whole prison. Norton, at the door, orders him to turn it off, and he turns it up. Red, of the music:', '“It was like some beautiful bird flapped into our drab little cage and made those walls dissolve away, and for the briefest of moments, every last man at Shawshank felt free.”', '“It pissed the warden off something awful.”']] } } },
      { at: 241.4, spots: [{ x: 59, y: 45, rx: 16, ry: 42, label: 'Norton' }],
        themes: { power: { ask: 'What does Andy’s punishment show about abuse of power in Shawshank?', title: 'Punished for a moment of freedom',
          note: 'Nobody was hurt and nothing was stolen: Andy played a piece of music. For that he gets two weeks alone in the dark. In Shawshank the men in charge cannot stand anything they do not control, and the hole is how they answer it.',
          say: [['Walks into his own office once the guards have broken in. Red, of what it cost Andy:', '“Andy got two weeks in the hole for that little stunt.”']] } } }
    ] },
    // "Get Busy Living or Get Busy Dying", 3:28 (previews every 2 seconds). This upload's captions are rough, so the
    // words and their seconds are from the official TNT upload's own subtitles (T2bE_Abo0q0, which runs 128.6 s
    // later). 2:23.9: Andy's close-up, the same shot from 2:14 to 2:26, after "And then some". 3:06.1, CROSS-CHECKED:
    // "Get busy living or get busy dying" ends at 3:04.5; the two-shot is still there at 3:04 and by 3:06 the film
    // has cut to the two of them seen small against the yard wall, and the official upload's preview shows that
    // same wide shot 0.4 s later. So the pause is on the wide shot and the two share a label. `end`: from 3:08 this
    // upload tacks on Red's later repeat of the line, which belongs to the ending.
    'shawshank-8': { yt: 'XLZEdhU-gGs', end: 187.2, pauses: [
      { at: 143.9, spots: [{ x: 55, y: 44, rx: 18, ry: 40, label: 'Andy' }],
        themes: { power: { ask: 'What do Andy’s words show about what the system has done to him?', title: 'What power does to people',
          note: 'Andy has served nineteen years for a crime he did not commit, and Norton has just had the one witness who could clear him shot. The system has taken everything it can from him and will never admit it was wrong. All he has left to hold against it is a plan for a life outside.',
          say: [['Out of solitary after Tommy’s death, sitting in the yard with Red:', '“I didn’t shoot my wife, and I didn’t shoot her lover. Whatever mistakes I made, I paid for them. And then some.”']] } } },
      { at: 186.1, spots: [{ x: 67, y: 67, rx: 9, ry: 10, label: 'Andy and Red' }],
        themes: { power: { ask: 'What does Andy’s choice show about standing up to Norton’s power?', title: 'Hope as a way of resisting',
          note: 'Norton has killed Tommy and buried Andy’s last chance of a fair hearing, and expects that to break him. Andy’s answer is to choose: he will not spend the rest of his life dying slowly in Shawshank. Hope is the one thing in him the warden’s power has not reached.',
          say: [['Against the wall of the yard. Andy, to Red:', '“I guess it comes down to a simple choice, really. Get busy living, or get busy dying.”']] } } }
    ] },
    // "Norton Finds Out That Andy Has Escaped", 3:39 (previews every 2 seconds). Its captions are useless (the player
    // is given a Spanish reading of English speech), so NOTHING is quoted. 2:26: Norton's close-up as he questions
    // Red, the same shot at 2:24, 2:26 and 2:28. 3:35: Norton seen from inside the tunnel, one pull-back shot from
    // 3:32 to 3:38; the guard beside him is not labelled.
    'shawshank-9': { yt: 'NXM0p4kUcZU', pauses: [
      { at: 146, spots: [{ x: 52, y: 42, rx: 17, ry: 38, label: 'Norton' }],
        themes: { power: { ask: 'What does Norton’s rage show about his power over Shawshank?', title: 'Power outwitted',
          note: 'For nineteen years Norton has decided where every man in this prison sleeps, and one morning a cell is simply empty. He shouts at guards and at Red because there is nobody he can punish. His control was total only as long as everyone believed it was.',
          say: [['Andy’s cell is empty at the morning count. Norton has the guards and Red in front of him, and nobody can tell him where a prisoner has gone.']] } } },
      { at: 215, spots: [{ x: 52, y: 38, rx: 9, ry: 20, label: 'Norton' }],
        themes: { power: { ask: 'What does the tunnel show about the limits of the warden’s control?', title: 'Power outwitted',
          note: 'Behind a poster, with a rock hammer small enough to hide in a Bible, Andy has spent nearly twenty years digging through the wall of the cell Norton locked him in. Total control was never total: patience beat it.',
          say: [['Has just thrown a stone at the poster on Andy’s wall and seen it go straight through. He is looking down the tunnel Andy dug behind it.']] } } }
    ] },
    // "Uncovering the Corruption", 3:33 (previews every 2 seconds). 1:55: Norton's close-up with the Bible from his
    // safe, the same shot at 1:54 and 1:56; Red's line about the money ends at about 1:05. 3:31.8: Norton at his desk,
    // one slow shot from 3:24 to 3:32, as Red's last line ends. The sampler's words are not put on a label: the
    // preview at 1:26 reads "...and that Right Soon", where the site's notes say "right early".
    'shawshank-10': { yt: '-x0JaHI-dp8', pauses: [
      { at: 115, spots: [{ x: 42, y: 45, rx: 17, ry: 40, label: 'Norton' }],
        themes: { power: { ask: 'What does this moment show about how Norton’s power is turned against him?', title: 'Hypocrisy exposed',
          note: 'Norton hid his stolen money behind a Bible verse about judgement, and judgement is what comes. The false name he had Andy invent to hide the money is the name Andy uses to take it, and the newspaper has his account books. Everything he built to protect his power is what destroys it.',
          say: [['Red, of the man who existed only on paper until Andy walked into the bank as him:', '“All told, he blew town with better than 370 thousand dollars of Warden Norton’s money. Severance pay for nineteen years.”', 'Norton has opened the safe behind his sampler and found Andy’s Bible where his account books were.']] } } },
      { at: 211.8, spots: [{ x: 50, y: 45, rx: 10, ry: 12, label: 'Norton' }],
        themes: { power: { ask: 'What do Red’s words show about how abuse of power ends in Shawshank?', title: 'Power turned back on the powerful',
          note: 'Hadley is arrested and led away, and Norton shoots himself sooner than face the same. Neither is brought down by force. A prisoner did it with a false name and the warden’s own account books. The men nobody could hold to account are held to account at last.',
          say: [['With the police at his door, he has shot himself at his desk. Red:', '“I like to think the last thing that went through his head, other than that bullet, was to wonder how the hell Andy Dufresne ever got the best of him.”']] } } }
    ] },
    // "Ending scene", 4:33 (previews every 2 seconds). 2:14.4: Red reading the letter by the stone wall, the same shot
    // from 2:00 to 2:24, as "no good thing ever dies" ends. 4:21: Red walking up the beach, the same shot at 4:18,
    // 4:20 and 4:22; his lines on the bus are over by 4:01.
    'shawshank-12': { yt: 'CkxXGxa2JkU', pauses: [
      { at: 134.4, spots: [{ x: 45, y: 42, rx: 16, ry: 34, label: 'Red' }],
        themes: { power: { ask: 'What does Andy’s letter show about what the prison’s power could not destroy?', title: 'Hope defeats the system',
          note: 'Red once called hope a dangerous thing, because forty years of Shawshank had taught him to expect nothing. Andy’s letter says the opposite, and it is hope that gets Red off the path Brooks took. The system could hold these men for decades and still could not kill that.',
          say: [['Out on parole, he has kept his promise and found what Andy hid for him by the stone wall. Andy, in the letter:', '“Remember, Red, hope is a good thing, maybe the best of things, and no good thing ever dies.”']] } } },
      { at: 261, spots: [{ x: 58, y: 42, rx: 15, ry: 38, label: 'Red' }],
        themes: { power: { ask: 'What does this ending show about the limits of the system’s power?', title: 'Freedom beyond power’s reach',
          note: 'Red breaks his parole, the last hold the system has on him, and walks onto a beach no prison can reach. For forty years other men decided where he could go. The film ends with him choosing for himself, and with the friend the system tried to bury alive.',
          say: [['Has broken parole and crossed the border to find Andy. On the bus he said:', '“I think it’s the excitement only a free man can feel, a free man at the start of a long journey whose conclusion is uncertain.”', '“I hope to see my friend and shake his hand. I hope the Pacific is as blue as it has been in my dreams.”']] } } }
    ] },
