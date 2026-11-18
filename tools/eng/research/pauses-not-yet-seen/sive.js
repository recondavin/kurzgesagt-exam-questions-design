// DRAFT, NOT LIVE. Pauses with labels for Sive scenes 5, 7, 8, 9, 11 and 12 (abuse of power), written as entries for
// the CLIPS map in eng/eng.js. Seconds and lines come from the recording's captions; WHERE PEOPLE ARE was read off
// YouTube's 160-pixel seek previews (one every 10 seconds), never off the real video, which will not play in a cloud
// session. The user's process for an accurate pause: "pause it first, look at the pause and then do the tracking".
// So before any of this goes into eng.js: play the scene in a real browser, let it pause at `at`, LOOK at the frame,
// and only then set each x, y, rx, ry (and move `at` if the shot is wrong). Until then these scenes play the film
// with no pause and no labels.
    // SIVE 5, 7, 8, 9, 11, 12, placed by rule 13. The same recording as sive-2 and sive-6 (Vql0MTCXTiY), whose seek
    // previews come every 10 seconds, with the camera cutting between them. So every pause here sits within a second
    // of a preview (most within half a second) AND between two previews that show the same shot, and inside a silence
    // found from the captions' word-by-word times. Positions were read off the enlarged previews with a 10% grid and
    // each pause's shapes were then drawn on its preview and looked at (scratchpad ell.py, ell-a.jpg, ell-b.jpg).
    // Lines are quoted only where the captions give the words plainly.
    //
    // sive-5, the travelling men: the part where Nanna, who has stood up for Sive, is turned on (56:20 to 1:00:04).
    // 56:49.5: Thomasheen bent over the seated Nanna, the same shot at 56:40 and 56:50; a three-second silence after
    // Mena's two lines from out of shot. 59:49.5: Mena standing over Nanna, the same close shot at 59:30, 59:40 and
    // 59:50 (the camera settles between the last two; shapes are for 59:50); the gap after "the queen of the land".
    'sive-5': { yt: 'Vql0MTCXTiY', start: 3380, end: 3604.6, pauses: [
      { at: 3409.5, spots: [{ x: 54, y: 55, rx: 12, ry: 38, label: 'Thomasheen' }, { x: 81, y: 68, rx: 10, ry: 27, label: 'Nanna' }],
        themes: { power: { ask: 'What do these threats show about abuse of power in Sive?', title: 'Bullying the weak into silence',
          note: 'Nanna is the one person in the house who says the match is wrong, so she is the one who has to be shut up. She is old, widowed and living under her son’s roof, and Mena and Thomasheen use exactly that against her. In Sive the powerful do not answer an argument: they threaten whoever has least.',
          say: [['Nanna has spoken up for Sive. He stands over her:', '“You are a lone woman with your husband feeding worms in his trench.”'],
            ['Mena joins in, to the old woman who lives under her roof:', '“…with the county home staring you in the face.”']] } } },
      { at: 3589.5, spots: [{ x: 40, y: 55, rx: 20, ry: 45, label: 'Mena' }, { x: 85, y: 68, rx: 12, ry: 30, label: 'Nanna' }],
        themes: { power: { ask: 'What do Mena’s words show about how she keeps power over Nanna?', title: 'Fear keeps people quiet',
          note: 'Mena runs the house, and she reminds Nanna that every bite she eats comes from Mena’s work. An old woman with nothing of her own is told she has no right to an opinion. This is how the one voice raised for Sive is silenced: by the fear of losing her place by the fire.',
          say: [['Standing over her husband’s mother, who dared to speak for Sive:', '“You sit there day in, day out, taking all you can get without a word of thanks, with a puss on you like a child in the cradle, feeding yourself up on the fruits of our labour.”'],
            ['Old, widowed, and with nowhere else to go.']] } } }
    ] },
    // sive-7, Liam's plea and Mena's lie (1:12:23 to 1:15:39). 1:13:09.4: the wide shot of the whole kitchen, the same
    // at 1:13:00 and 1:13:10 (and at every preview from 1:12:40 to 1:13:50), Mena at the table, Liam behind it, Mike
    // in his cap at the right; the one-second gap after "this terrible auction". 1:15:29.7: the wide shot again, the
    // same at 1:15:00, :10, :20 and :30, Sive (pale blue) and Mena together at the left, Mike sitting at the right;
    // after Mena's "off with him" and before Sive's "Gone."
    'sive-7': { yt: 'Vql0MTCXTiY', start: 4343, end: 4539, pauses: [
      { at: 4389.4, spots: [{ x: 31, y: 57, rx: 4.5, ry: 18, label: 'Mena' }, { x: 52, y: 45, rx: 4.5, ry: 16, label: 'Liam' }, { x: 76, y: 58, rx: 4.5, ry: 21, label: 'Mike' }],
        themes: { power: { ask: 'What do Liam’s words show about abuse of power in Sive?', title: 'Money decides everything',
          note: 'Liam says out loud what the match is: an auction, with Sive as the thing being sold. He has no money and no standing in this house, so all he can do is beg, and he goes on to offer to give Sive up himself if they will only not hand her to Seán Dóta. Mike and Mena have the power to decide, and they answer him with threats.',
          say: [['The match is her doing, and she means to see it through.'],
            ['Has heard of the match and come to the house to stop it:', '“If I’ve upset you, I’m sorry. But surely, if ye know God, you must think of this terrible auction.”'],
            ['Sive’s uncle, the one man with the right to stop it. His answer to Liam:', '“Get out of this house before I’ll be tempted to take a weapon in my hands.”']] } } },
      { at: 4529.7, spots: [{ x: 32, y: 52, rx: 4, ry: 20, label: 'Sive' }, { x: 43, y: 48, rx: 4, ry: 15, label: 'Mena' }, { x: 86.5, y: 61, rx: 5, ry: 15, label: 'Mike' }],
        themes: { power: { ask: 'What does Mena’s lie show about how power is kept over Sive?', title: 'Lies and burned words',
          note: 'Liam came to fight for Sive, and Mena tells her he came to wish her joy and has gone away for good. Sive cannot check a word of it: everything she knows about her own life comes through the people who are marrying her off. Whoever controls what the powerless are told controls them, and Mike sits there and lets the lie stand.',
          say: [['Heard Liam’s voice from her room, and asks what he wanted.'],
            ['Minutes after driving him out:', '“He came wishing you joy.”', '“And he’s gone away now altogether to foreign places.”'],
            ['Heard every word Liam said, and says nothing.']] } } }
    ] },
    // sive-8, Nanna pleads with Mike (1:16:52 to 1:18:40). 1:17:19.8: the wide shot, the same from 1:17:10 to 1:18:10,
    // Mike at the far left where he has been shaving, Nanna coming towards him (shapes are for 1:17:20); the second
    // of silence after "curse it from her grave". 1:18:30.8: the two of them close, one camera at 1:18:20, :30 and
    // :40 (shapes are for 1:18:30: they move apart after it); straight after "Won't you look me in the face?".
    'sive-8': { yt: 'Vql0MTCXTiY', start: 4612, end: 4720.6, pauses: [
      { at: 4639.8, spots: [{ x: 11, y: 53, rx: 4.5, ry: 19, label: 'Mike' }, { x: 36.5, y: 50, rx: 4.5, ry: 16, label: 'Nanna' }],
        themes: { power: { ask: 'What does Nanna’s warning show about standing up to power in Sive?', title: 'Standing up to power',
          note: 'Nanna is the only one in the house who says to Mike’s face that the match is wrong. She has no money and no say, so all she has to fight with is words: a mother’s plea and a curse. In Sive the powerless can protest, but they cannot stop anything.',
          say: [['Shaving, on his way to see the priest about the wedding of his dead sister’s child.'],
            ['To her son:', '“There’s a curse of evil in this house. Your dead sister and my dead daughter will curse it from her grave.”']] } } },
      { at: 4710.8, spots: [{ x: 18, y: 58, rx: 12, ry: 40, label: 'Mike' }, { x: 48, y: 64, rx: 10, ry: 34, label: 'Nanna' }],
        themes: { power: { ask: 'What does Mike’s answer show about why the abuse of power goes on?', title: 'Good people stay silent',
          note: 'Mike knows the match is wrong: he cannot look his own mother in the face and say it is for the best. He is the one person with the right to stop it, and he chooses his wife, the money and a quiet life over Sive. The abuse goes on because a decent man will not stand in its way.',
          say: [['All he can say for marrying Sive to Seán Dóta:', '“It’s for the best, I tell you.”'],
            ['She does not let him away with it:', '“You will not look me in the face and say it’s for the best.”', '“Won’t you look me in the face?”']] } } }
    ] },
    // sive-9, the letter: from Mike reading out Liam's plan to Thomasheen's orders after burning it (1:36:52 to
    // 1:38:56). The wide shot holds at every preview from 1:36:40 to 1:39:20. 1:38:09.8: the two men together at the
    // hearth (1:38:10; ten seconds earlier Thomasheen was still at the table), in the five-second silence after Mike's
    // "What are you doing?"; they are on top of one another there, so they share one shape. 1:38:40: the two standing
    // apart at the right, the same at 1:38:30, :40 and :50; Thomasheen's "Forget about the letter..." has ended three
    // seconds before and Mike is part-way through a reply the captions do not catch.
    'sive-9': { yt: 'Vql0MTCXTiY', start: 5812, end: 5936, pauses: [
      { at: 5889.8, spots: [{ x: 86.5, y: 60, rx: 9, ry: 24, label: 'Thomasheen and Mike' }],
        themes: { power: { ask: 'What does burning the letter show about abuse of power in Sive?', title: 'Every way out is blocked',
          note: 'The letter was Sive’s way out: Liam waiting for her that night, and a wedding of her own choosing in the morning. Thomasheen stands to lose his hundred pounds if she reads it, so he puts it in the fire, and she never learns there was a way out. Power here is not only threats: it is deciding what the powerless are allowed to know.',
          say: [['Thomasheen has made Mike open Liam’s letter to Sive and read it out:', '“Tonight when they have all gone to bed, steal away quietly and come to my house. I will be waiting there for you.”', 'Thomasheen takes it to the fire. Mike:', '“What are you doing?”']] } } },
      { at: 5920, spots: [{ x: 74, y: 63, rx: 5, ry: 25, label: 'Mike' }, { x: 87, y: 64, rx: 6, ry: 25, label: 'Thomasheen' }],
        themes: { power: { ask: 'What do Thomasheen’s orders show about how the truth is kept from Sive?', title: 'Destroying the truth',
          note: 'Burning the letter is only half of it. Thomasheen then tells Mike to forget it and to act as if nothing had happened, and Mike, who gave his word that Sive would get the letter, does as he is told. The truth is destroyed twice: once in the fire and once by a decent man’s silence.',
          say: [['Gave his word that Sive would get the letter. Uneasy, he does nothing.'],
            ['With the letter in ashes, to her uncle:', '“Forget about the letter. You don’t know the harm you might cause.”']] } } }
    ] },
    // sive-11, Sive is found drowned: from Liam carrying her in to his turning on Mena (1:51:54 to 1:54:56).
    // 1:53:30: Liam in close-up, the same shot at 1:53:20, :30 and :40, in the five-second silence after "She would
    // not stop". 1:54:29.8: Mena, hand to her mouth, and Liam beside her, the same shot at 1:54:20, :30 and :40; the
    // silence after "strike you dead where you stand". The wide shots of this scene are not used: the small figures
    // standing round the table cannot be told apart for certain.
    'sive-11': { yt: 'Vql0MTCXTiY', start: 6714, end: 6896, pauses: [
      { at: 6810, spots: [{ x: 48, y: 50, rx: 21, ry: 45, label: 'Liam' }],
        themes: { power: { ask: 'What does Sive’s death show about the cost of abuse of power?', title: 'The cost to the powerless',
          note: 'Everyone with power over Sive used it against her, and every way out was closed: her schooling, Liam, the letter. The only choice left to her was to run into the bog at night. In Sive the price of the adults’ greed is paid by the one person who had no say in any of it.',
          say: [['Has carried Sive’s body in from the bog and laid it on the table. He saw her run:', '“She ran like the wind, letting cries out of her that would rend your heart.”', '“She would not stop.”']] } } },
      { at: 6869.8, spots: [{ x: 21, y: 55, rx: 15, ry: 42, label: 'Mena' }, { x: 62, y: 52, rx: 13, ry: 48, label: 'Liam' }],
        themes: { power: { ask: 'What does Liam’s accusation show about abuse of power in Sive?', title: 'Does anyone stop it?',
          note: 'Nobody stopped the match. Liam was driven off, Nanna was bullied into silence, Mike looked away, and Sive is dead. Liam can name who did it, but naming is all he can do: nobody is punished, and Thomasheen and Seán Dóta slip away. In Sive the abuse of power is never stopped, and the powerful walk away from it.',
          say: [['She forced the match on Sive from the day the money was offered. Now she has nothing to say.'],
            ['Over Sive’s body, to her:', '“You killed her. You killed her.”']] } } }
    ] },
    // sive-12, holy ground and the lament (1:55:29 to 1:58:17, just before the lights go down). One pause, 1:57:39.8:
    // the empty stage with Sive's body on the table, the same at 1:57:30 and 1:57:40, in the silence after the song's
    // last line; Nanna comes in to her after it. The wide shot during Mike's "the priest" lines is not used: he and
    // Liam, both in shirt and waistcoat beside the table, cannot be told apart at that size.
    'sive-12': { yt: 'Vql0MTCXTiY', start: 6929, end: 7097, pauses: [
      { at: 7059.8, spots: [{ x: 50, y: 56, rx: 17, ry: 6, label: 'Sive' }],
        themes: { power: { ask: 'What does this ending show about abuse of power in Sive?', title: 'How it ends',
          note: 'The play ends with nobody punished and nothing put right. Mike’s first thought over his niece’s body is for the priest and a proper burial, for what is respectable, and it is left to the travelling men, the poorest people in the play, to say what was done to her. Sive closes on a lament, with the powerful unpunished.',
          say: [['Her uncle’s first thought:', '“We must go for the priest. She must have the priest.”', 'The last word is the travelling men’s song:', '“Oh, they murdered lovely Sive, for she would not be a bride, and they laid her dead to bury in the clay.”']] } } }
    ] },
