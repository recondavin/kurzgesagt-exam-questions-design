// The Scene board's content (eng/eng-board.js, english.html#board): every key scene of The Shawshank Redemption, Sive
// and Small Things Like These against eight themes. The user: "take all scenes from shawshank and small things and
// sive, and how they match the theme/topic like abuse of power is ONE example ... this scene is connected to education
// in this way and it also could be connected to something else ... and then it gives an explenation WHY it does, say
// the rooftop scene connects education and abuse of power but doesnt connect to role of women (well it kind of does
// but theres nothing to write about there)". The standing rule (AGENTS.md, English): a scene's fixed part (where,
// who, what's said and done) never changes; what it's used to say depends on the theme.
//   who: who is there (the rest of the fixed part, where and what happens, is the scene's own data in eng-data.js).
//   t:   theme id -> [verdict, one sentence, quote?]
//        'yes'  it works: what it shows about that theme, in one sentence; the quote, if any, is for that theme
//        'thin' it touches the theme but there's nothing to write (says why, and what to use instead)
//        a theme not listed is 'no' (the board says what the scene is about instead).
// Quotes are given whole and only where the wording is sure.
window.EngThemes = {
  texts: ['shawshank', 'sive', 'stlt'],
  themes: [
    { id: 'power', name: 'Abuse of power', ask: 'Who has power, and how do they use it on people who have none?' },
    { id: 'education', name: 'Education', ask: 'Who gets to learn, what learning does for them, and who takes it away?' },
    { id: 'women', name: 'Role of women', ask: 'What a woman\'s life is worth, and who decides it.' },
    { id: 'hope', name: 'Hope and despair', ask: 'What keeps people going, and what happens when hope runs out?' },
    { id: 'freedom', name: 'Freedom and entrapment', ask: 'Who is trapped, by what, and is there a way out?' },
    { id: 'money', name: 'Money and greed', ask: 'What people will do for money, and who pays the price?' },
    { id: 'religion', name: 'Religion and the Church', ask: 'What the Church says, what it does, and the gap between them.' },
    { id: 'courage', name: 'Courage and silence', ask: 'Who speaks up, who stays silent, and what silence costs.' }
  ],
  scenes: {
    // ---------------------------------------------------------------- The Shawshank Redemption (film, Frank Darabont, 1994)
    'shawshank-1': { who: 'Andy Dufresne; the district attorney; the judge (his wife and her lover in the flashback)', t: {
      hope: ['yes', 'The film starts at its lowest point: an innocent man is given two life sentences, the despair the rest of the film climbs out of.'],
      freedom: ['yes', 'Andy loses his freedom for a crime he didn\'t commit, and two life sentences seem to take it away for good.'],
      power: ['thin', 'Kind of: the court has power over Andy, but it makes a mistake, it isn\'t cruel. Nothing to write until he reaches Shawshank.'],
      women: ['thin', 'Kind of: Andy\'s wife is in the scene, but only as the victim of the crime. She never speaks, so there\'s nothing to write about women.'],
      education: ['thin', 'Kind of: Andy is a banker, but his learning plays no part in the trial.'] } },
    'shawshank-2': { who: 'Red; the parole board', t: {
      hope: ['yes', 'Red says what he thinks the board wants to hear and his file is stamped REJECTED: after twenty years, a prisoner learns not to hope.'],
      freedom: ['yes', 'Freedom isn\'t Red\'s to win: a board hands it out, and after twenty years of a life sentence the answer is no.'],
      power: ['thin', 'Kind of: the board holds Red\'s future, but it\'s doing its job, not abusing it. For abuse of power use Hadley or Norton.'] } },
    'shawshank-3': { who: 'Warden Norton; Captain Hadley; Andy; Red; Heywood; the new prisoner who breaks down', t: {
      power: ['yes', 'Norton greets the new men with discipline and the Bible, and that night Hadley beats a frightened prisoner to death for crying; nobody is punished.', 'I believe in two things: discipline and the Bible. Here you\'ll receive both.'],
      religion: ['yes', 'Norton uses religion as a weapon: the Bible comes with discipline, and he hands it out while he takes everything else.', 'Put your trust in the Lord; your ass belongs to me.'],
      hope: ['yes', 'On the first night the new man\'s hope breaks and he cries, and for that he is beaten to death: Shawshank punishes anyone who falls apart.'],
      freedom: ['yes', 'The new men are stripped, hosed down and locked in: from the first minute, Shawshank takes away every bit of freedom.'],
      courage: ['yes', 'Nobody speaks up for the dead man; only Andy, who made no sound all night, asks his name the next morning.'] } },
    'shawshank-4': { who: 'Andy; Captain Hadley; Red and the tarring crew; the guards', t: {
      power: ['yes', 'Hadley finds out Andy\'s a banker and takes advantage of it: a guard who was about to throw him off the roof gets his tax advice for free.'],
      education: ['yes', 'Andy uses his education to free himself from a dangerous situation: his knowledge of tax law turns a guard about to kill him into a man who needs him.'],
      money: ['yes', 'Money is what makes the most violent guard listen to a prisoner: Hadley is moaning about the tax on an inheritance.'],
      freedom: ['yes', 'For a moment, with a beer in the sun, the men feel free: freedom is a feeling Andy can give even inside a prison.', 'We sat and drank with the sun on our shoulders and felt like free men.'],
      hope: ['yes', 'The beer gives the men a moment of feeling normal again, the first small hope Andy gives the others.', 'Me, I think he did it just to feel normal again, if only for a short while.'],
      courage: ['yes', 'Andy risks his life by speaking to Hadley, and asks nothing for himself: only three beers each for his workmates.'],
      women: ['thin', 'Kind of: Andy asks Hadley whether he trusts his wife, but she\'s only part of a tax trick, so there\'s nothing to write about women.'] } },
    'shawshank-5': { who: 'Brooks Hatlen; Heywood; Red; Andy', t: {
      power: ['yes', 'Shawshank\'s power reaches into the mind: after fifty years Brooks can\'t live outside, and he hangs himself.', 'These walls are funny. First you hate \'em, then you get used to \'em. Enough time passes, gets so you depend on \'em. That\'s institutionalized.'],
      hope: ['yes', 'Brooks is the film\'s warning about despair: with no hope left outside, he gives up.', 'I don\'t like it here. I\'m tired of being afraid all the time.'],
      freedom: ['yes', 'Freedom comes too late for Brooks: the world outside has changed and he can\'t live in it.', 'The world went and got itself in a big damn hurry.'],
      education: ['thin', 'Kind of: Brooks is the prison librarian, but the scene isn\'t about learning; it\'s about what prison has done to him.'] } },
    'shawshank-6': { who: 'Andy; Red and the prisoners in the yard; Warden Norton; Captain Hadley', t: {
      power: ['yes', 'Norton can throw Andy in solitary for two weeks, but he can\'t take the music in his head: there\'s a limit to what power can reach.', 'That\'s the beauty of music. They can\'t get that from you.'],
      education: ['yes', 'Andy\'s years of letters built the library, and the record he plays shows the men that art and learning can lift them out of the prison for a moment.'],
      hope: ['yes', 'Andy says music keeps something alive inside you, and Red warns that hope is dangerous: the argument the whole film settles at the end.', 'Hope is a dangerous thing. Hope can drive a man insane.'],
      freedom: ['yes', 'For two minutes of Mozart every man in the yard stands still and feels free.', 'It was like some beautiful bird flapped into our drab little cage and made those walls dissolve away, and for the briefest of moments, every last man in Shawshank felt free.'],
      courage: ['yes', 'Andy knows he\'ll be punished and plays the record anyway, to give the whole prison something beautiful.'],
      women: ['thin', 'Kind of: two women sing the duet, but no woman is in the scene, so there\'s nothing to write about women.'] } },
    'shawshank-7': { who: 'Tommy Williams; Andy; Red; Warden Norton; Captain Hadley', t: {
      power: ['yes', 'When Tommy could prove Andy innocent, Norton has him shot, because Andy is too useful at hiding the warden\'s money.'],
      education: ['yes', 'Andy teaches Tommy until he passes his exam, but when that education could set Andy free, Norton has the boy killed: learning is only allowed while it serves the warden.'],
      money: ['yes', 'Norton needs Andy to keep laundering his money, so the money matters more to him than a young man\'s life.'],
      hope: ['yes', 'Andy\'s best hope of freedom dies with Tommy, and he sinks into the despair of the next scene.'],
      freedom: ['yes', 'The law could free Andy, and the warden deliberately keeps him trapped.'],
      courage: ['yes', 'Andy stands up to the warden and is thrown into solitary; Tommy tells the truth and is shot for it.', 'How can you be so obtuse?'] } },
    'shawshank-8': { who: 'Andy; Red; Heywood (who tells Red about the rope)', t: {
      hope: ['yes', 'Andy puts the film\'s message into one choice: keep hoping or give up.', 'I guess it comes down to a simple choice, really. Get busy living or get busy dying.'],
      freedom: ['yes', 'Zihuatanejo is Andy\'s picture of freedom: a warm place with no memory of the past.', 'You know what the Mexicans say about the Pacific? They say it has no memory.'],
      women: ['thin', 'Kind of: Andy admits he drove his wife away, but it\'s about his own guilt, and she never speaks in the film.'] } },
    'shawshank-9': { who: 'Warden Norton; the guards; Red (voiceover); Andy (in the flashback)', t: {
      power: ['yes', 'The warden\'s power is made a fool of: in a rage he throws a stone at the poster and finds the tunnel a prisoner dug under his nose.'],
      education: ['yes', 'Andy\'s knowledge is his way out: he knows rocks, and pressure and time are all he needs.', 'Geology is the study of pressure and time. That\'s all it takes really, pressure and time.'],
      hope: ['yes', 'Nearly twenty years of quiet hope pay off: Andy digs, waits and crawls out.'],
      freedom: ['yes', 'The film\'s great image of freedom: Andy raises his arms in the rain after five hundred yards of sewer pipe.', 'Andy Dufresne, who crawled through a river of shit and came out clean on the other side.'],
      courage: ['thin', 'Kind of: it takes nerve, but it\'s a secret escape, not standing up to anyone. Write it under hope or freedom.'],
      women: ['thin', 'Kind of: a poster of Raquel Welch hides the tunnel, but she\'s a picture, not a woman in the story.'] } },
    'shawshank-10': { who: 'Andy (as Randall Stephens); the bank clerks; Warden Norton; Captain Hadley; the police', t: {
      power: ['yes', 'Corrupt power falls: Andy sends the warden\'s books to the newspaper, Hadley is arrested and Norton shoots himself.'],
      education: ['yes', 'Andy beats the warden with his brains: the false name he invented, Randall Stephens, lets him take the money and expose Norton.'],
      money: ['yes', 'Norton\'s greed destroys him: the dirty money he made Andy hide becomes the evidence against him.'],
      religion: ['yes', 'Norton\'s religion is shown up as hypocrisy: his safe hides behind a Bible verse, and the rock hammer was hidden in a Bible all along.', 'Dear Warden, You were right. Salvation lay within.'],
      courage: ['thin', 'Kind of: Andy exposes the warden, but he\'s already safe. For courage use the roof or Tommy\'s evidence.'],
      hope: ['thin', 'Kind of: justice is done, but the scene is about the warden\'s fall. Hope is better shown in the last scene.'] } },
    'shawshank-11': { who: 'Red; the parole board; the store manager', t: {
      power: ['yes', 'Even after he\'s freed, Shawshank\'s power stays in Red\'s head: he can\'t go to the toilet without asking.', 'Forty years I been asking permission to piss. I can\'t squeeze a drop without say-so.'],
      hope: ['yes', 'Red stops trying to please the board and is finally released, but outside he comes close to Brooks\'s despair.'],
      freedom: ['yes', 'Red is free but doesn\'t feel it: like Brooks, he thinks about breaking parole to be sent back.'],
      courage: ['thin', 'Kind of: Red is honest with the board at last, but it\'s about his regret, not standing up to anyone.'] } },
    'shawshank-12': { who: 'Red; Andy', t: {
      hope: ['yes', 'Hope wins: Red follows Andy\'s letter to Mexico and the film ends in sunlight.', 'Hope is a good thing, maybe the best of things, and no good thing ever dies.'],
      freedom: ['yes', 'Red chooses freedom instead of becoming another Brooks: he breaks parole, goes to Mexico and the film ends on the open Pacific.', 'I think it\'s the excitement only a free man can feel, a free man at the start of a long journey whose conclusion is uncertain.'],
      courage: ['yes', 'Red risks being sent back to prison to keep his promise to Andy.'],
      money: ['thin', 'Kind of: Andy leaves Red money in the box, but it\'s a gift of friendship, not greed.'] } },

    // ---------------------------------------------------------------- Sive (play, John B. Keane, 1959)
    'sive-1': { who: 'Nanna; Mena; Sive', t: {
      power: ['yes', 'Mena holds the power in the house and uses it on the weakest: Nanna, who has to hide her pipe, and Sive.'],
      education: ['yes', 'Mena resents that Sive is still at school instead of earning: in this house, a poor girl\'s education is seen as a waste.'],
      women: ['yes', 'Two women fight over the little status a woman can have in a farmhouse: Nanna mocks Mena for being poor and childless.'],
      money: ['yes', 'Poverty sours the house: Mena resents what it costs to keep Sive at school.'] } },
    'sive-2': { who: 'Thomasheen Seán Rua; Mena', t: {
      power: ['yes', 'Thomasheen and Mena plan Sive\'s future in secret: the adults decide, and Sive isn\'t even asked.'],
      women: ['yes', 'Marriage is a deal made by others: a young girl is traded to an old man, and Mena\'s only power is to strike the bargain.'],
      money: ['yes', 'Once £200 is offered, a girl\'s life has a price.'],
      education: ['thin', 'Kind of: the match will end Sive\'s schooling, but here it\'s all about the money.'] } },
    'sive-3': { who: 'Mike; Mena; Liam Scuab; Sive', t: {
      power: ['yes', 'Mike uses his power as head of the house to drive away the one young man who loves Sive.'],
      women: ['yes', 'Mike fears Sive will repeat her mother\'s "shame": a woman\'s past is held against her daughter.'],
      hope: ['thin', 'Kind of: Liam is Sive\'s hope, but this scene is about Mike\'s hatred of his family. Use Liam\'s plea or the letter.'],
      courage: ['thin', 'Kind of: Mike refuses the match at first, but it doesn\'t last; his silence comes later.'],
      money: ['thin', 'Kind of: Mike turns down the money at first, but the scene is about family hatred.'] } },
    'sive-4': { who: 'Thomasheen; Seán Dóta; Mike; Mena; Sive', t: {
      power: ['yes', 'The adults leave Sive alone with an old man who grabs at her: nobody with power protects her.'],
      women: ['yes', 'Sive is courted for the adults\' benefit, not hers, and when Seán Dóta grabs at her nobody protects her.'],
      money: ['yes', 'Thomasheen says people like them can\'t afford love: poverty turns marriage into a matter of money.'] } },
    'sive-5': { who: 'Pats Bocock; Carthalawn; Nanna; Mena; Thomasheen', t: {
      power: ['yes', 'When Nanna challenges the match, Mena and Thomasheen threaten her with the county home: the old and the poor have no power.'],
      money: ['yes', 'Mena and Thomasheen refuse the travellers food and money: meanness rules the house.'],
      courage: ['yes', 'The travellers tell the truth nobody else will: Carthalawn\'s songs mock the matchmaker, and Nanna speaks up and is bullied for it.'],
      women: ['thin', 'Kind of: Nanna and Mena clash again, but the scene is about the travellers and the threat to Nanna.'] } },
    'sive-6': { who: 'Mena; Sive', t: {
      power: ['yes', 'Mena uses the truth about Sive\'s birth as a weapon to push her into the match.'],
      education: ['yes', 'Mena tells Sive she will leave school: the match ends the education that could have given her a choice.'],
      women: ['yes', 'Sive is told a woman is nothing without a husband, and Mena admits that poverty forced her own marriage too.', 'You will have no name till you take a husband.'],
      freedom: ['yes', 'Sive is trapped by her birth: born outside marriage, she\'s told a husband is her only way to a name.'],
      money: ['yes', 'Mena tempts Sive with Seán Dóta\'s money, and admits it was poverty that drove her into her own marriage.'],
      hope: ['thin', 'Kind of: it crushes Sive, but the point is how girls are treated. Write it under role of women.'],
      religion: ['thin', 'Kind of: the "shame" of a birth outside marriage comes from the Church\'s rules, but there\'s no priest or prayer in the scene.'] } },
    'sive-7': { who: 'Liam; Mike; Mena; Sive', t: {
      power: ['yes', 'Liam begs and is sent away, and Mena lies to Sive about why he came: the powerful even control what Sive knows.'],
      hope: ['yes', 'Liam is Sive\'s hope, and Mena\'s lie cuts her off from it.'],
      courage: ['yes', 'Liam is the one person who speaks up openly against the match, even offering to stay away from her.'] } },
    'sive-8': { who: 'Nanna; Mike', t: {
      power: ['yes', 'Mike has the power to stop the match and chooses not to use it.'],
      money: ['yes', 'Mike chooses money and peace with his wife over his conscience.'],
      religion: ['yes', 'Mike is off to see the priest about the wedding: the Church\'s blessing is sought for a match everyone knows is wrong.'],
      courage: ['yes', 'Mike can\'t look his mother in the face: he knows it\'s wrong and still does nothing to stop it.'],
      women: ['thin', 'Kind of: Nanna speaks for Sive\'s dead mother, but the scene is about Mike\'s conscience.'] } },
    'sive-9': { who: 'Pats Bocock; Nanna; Mike; Thomasheen', t: {
      power: ['yes', 'Thomasheen burns Sive\'s last chance of escape, and Mike, who could save her, does nothing.'],
      hope: ['yes', 'Sive\'s last hope, Liam\'s letter, goes up in flames.'],
      freedom: ['yes', 'The letter was Sive\'s way out, and burning it closes the trap.'],
      money: ['yes', 'Thomasheen burns the letter to save the match he stands to profit from: greed destroys Sive\'s last chance.'],
      courage: ['yes', 'Mike\'s silence is the worst moment of the play: he watches the letter burn and says nothing.'],
      education: ['thin', 'Kind of: it\'s a letter, but reading isn\'t the point; the point is who destroys it.'] } },
    'sive-10': { who: 'Mena; Sive; Mike; Seán Dóta; Thomasheen; Pats Bocock; Carthalawn', t: {
      power: ['yes', 'Pats warns that men of money like Seán Dóta will be the new lords of the land: power now belongs to whoever has money.'],
      women: ['yes', 'Sive is dressed in clothes bought with an old man\'s money while the men drink: her wedding is something done to her.'],
      money: ['yes', 'The wedding clothes are bought with Seán Dóta\'s money, and the travellers mock the greed behind the match.'],
      courage: ['yes', 'The travellers dare to tell the truth to Seán Dóta\'s face, at his own celebration.'],
      hope: ['thin', 'Kind of: Carthalawn\'s hearse song warns of a death, but it\'s a warning, not hope or despair yet.'] } },
    'sive-11': { who: 'Mena; Pats; Liam; Mike; Thomasheen; Seán Dóta; Nanna', t: {
      power: ['yes', 'Those who profited run: Thomasheen and Seán Dóta slip away, and no one with power faces any consequence.'],
      women: ['yes', 'Sive\'s only way out of the match is death: a girl with no say in her own life.'],
      hope: ['yes', 'Despair wins: Sive\'s hope dies in a bog hole.'],
      freedom: ['yes', 'Sive\'s only escape from the trap is death.'],
      courage: ['yes', 'Liam turns on Mena: someone finally says out loud what everyone knew, but too late.'] } },
    'sive-12': { who: 'Mike; Nanna; Pats Bocock; Carthalawn', t: {
      religion: ['yes', 'Mike\'s first thought is whether Sive can be buried in holy ground: the Church\'s rules and respectability come before grief.'],
      hope: ['yes', 'The play ends in grief, with no hope and no justice: no one is punished.'],
      power: ['thin', 'Kind of: no one is punished, but the scene is grief, not power being used.'] } },

    // ---------------------------------------------------------------- Small Things Like These (novella, Claire Keegan, 2021)
    'stlt-1': { who: 'Bill Furlong (remembering); his mother, Sarah; Mrs Wilson', t: {
      women: ['yes', 'Bill\'s mother was sixteen and unmarried; her own family cast her off, and only Mrs Wilson\'s kindness saved her from the fate of the girls in the convent.'],
      religion: ['yes', 'A Protestant widow, not the Church, is the one who shows Bill\'s mother mercy.'],
      courage: ['yes', 'Mrs Wilson\'s quiet kindness, keeping on a pregnant girl when her own family wouldn\'t, is the courage Bill must later find.'],
      education: ['thin', 'Kind of: Bill was jeered at school for having no father, but the scene is about his mother and Mrs Wilson.'],
      power: ['thin', 'Kind of: the town cast out unmarried mothers, but here we see kindness, not power. For power use the convent scenes.'] } },
    'stlt-2': { who: 'Bill; Eileen; Mick Sinnott\'s son; a boy behind the priest\'s house', t: {
      money: ['yes', 'Hard times are everywhere, so Bill decides to keep his head down: money worries make the whole town careful.'],
      education: ['yes', 'Bill\'s plan is to see his girls through St Margaret\'s: their schooling is what he\'s protecting, and what the nuns could take away.'],
      courage: ['yes', 'The silence starts here: Bill decides to stay on the right side of people for his family\'s sake.'],
      religion: ['thin', 'Kind of: a boy drinks milk left for a cat behind the priest\'s house, but the point is poverty.'] } },
    'stlt-3': { who: 'Bill; Eileen; their five daughters; the nuns at the Christmas lights', t: {
      money: ['yes', 'At the Christmas lights the nuns speak only to the better-off parents: money buys respect.'],
      religion: ['yes', 'The nuns\' coldness at the Christmas lights shows a Church that favours the well-off.'],
      hope: ['thin', 'Kind of: Bill wonders what all his work is for, but it\'s restlessness, not hope or despair yet.'],
      power: ['thin', 'Kind of: the nuns\' snub hints at their standing, but nothing is done to anyone yet.'] } },
    'stlt-4': { who: 'Bill; the girls in grey shifts; a nun', t: {
      power: ['yes', 'Girls with no shoes scrub the floor behind padlocks and broken glass: the convent\'s power is total and hidden.'],
      women: ['yes', 'Young women are kept barefoot and working behind convent walls, hidden from the town.'],
      hope: ['yes', 'A girl begs to be taken as far as the river so she can drown herself: complete despair.'],
      freedom: ['yes', 'Padlocks and a wall topped with broken glass: the girls are prisoners.'],
      religion: ['yes', 'The cruelty happens in a chapel, in a convent run by nuns: the Church is the jailer.'],
      courage: ['yes', 'Bill\'s first silence: he holds out his empty hands, says it isn\'t up to him, and says nothing to the nun.'] } },
    'stlt-5': { who: 'Bill; an old man on the road', t: {
      freedom: ['yes', 'The old man tells Bill the road goes wherever he wants: he is free to choose his direction.', 'This road will take you wherever you want to go, son.'],
      courage: ['thin', 'Kind of: it hints that Bill can choose, but nothing is chosen yet.'] } },
    'stlt-6': { who: 'Bill; Eileen', t: {
      women: ['yes', 'Eileen, a mother of five daughters, chooses to look away from what is happening to other people\'s daughters.'],
      money: ['yes', 'Eileen says Mrs Wilson was rich enough to do as she pleased: kindness looks like something only money can afford.'],
      courage: ['yes', 'Eileen puts the town\'s silence into words.', 'There\'s things you have to ignore, so you can keep on.'],
      power: ['yes', 'The convent\'s power works through fear: the nuns always pay, their own girls are well minded, so keep out of it.'],
      education: ['thin', 'Kind of: Eileen is protecting their girls, but school isn\'t named here. Use Mrs Kehoe or the Mother Superior.'] } },
    'stlt-7': { who: 'Bill; the girl in the coal shed (Sarah)', t: {
      power: ['yes', 'A girl locked all night in a freezing coal shed, her baby taken: the convent\'s cruelty can\'t be denied any more.'],
      women: ['yes', 'Her baby has been taken from her: an unmarried mother loses everything, even her child.'],
      hope: ['yes', 'Her one hope is Bill: she asks him to find out about her baby.'],
      freedom: ['yes', 'Locked all night in the coal shed, she is literally a prisoner.'],
      religion: ['yes', 'A convent, a house of the Church, locks a girl in a coal shed overnight in winter.'],
      courage: ['yes', 'Her plea puts the question straight to Bill: will he act?'] } },
    'stlt-8': { who: 'Bill; the Mother Superior; Sarah', t: {
      power: ['yes', 'The Mother Superior controls the story: the shed was a game, school places are scarce, and an envelope buys his silence.'],
      education: ['yes', 'She reminds Bill that places at the school are scarce: his daughters\' education is the threat.'],
      money: ['yes', 'The Christmas card with money inside is a bribe: the Church buys silence.'],
      religion: ['yes', 'The Mother Superior hides cruelty behind tea and a Christmas card: the Church protects its image.'],
      courage: ['yes', 'Bill leaves without asking about the baby: for now, he goes along with it.'],
      women: ['thin', 'Kind of: Sarah is there, but she barely speaks; the scene is about the Mother Superior\'s control.'] } },
    'stlt-9': { who: 'Bill; the people at Mass; Ned, the Wilsons\' old farmhand', t: {
      religion: ['yes', 'Bill stays in his seat at Communion: he can\'t take it while Sarah is still in the convent.'],
      courage: ['yes', 'Bill\'s shame sharpens: he took the money, left Sarah there and never asked about her baby.'],
      women: ['thin', 'Kind of: it touches his mother\'s story, but the scene is about Ned and Bill\'s guilt.'] } },
    'stlt-10': { who: 'Bill; Mrs Kehoe', t: {
      power: ['yes', 'Mrs Kehoe warns him to be careful: the town knows what goes on, and stays quiet because the nuns have a hand in everything.'],
      education: ['yes', 'She reminds Bill his girls are at St Margaret\'s: the nuns could take his daughters\' education.'],
      religion: ['yes', 'The Church\'s reach goes into every business and school in the town.'],
      courage: ['yes', 'Bill asks whether the nuns only have as much power as people give them: silence is a choice the town makes.'] } },
    'stlt-11': { who: 'Bill; Sarah', t: {
      power: ['yes', 'One man walks into the convent and takes Sarah out: the nuns\' power only lasts while people obey it.'],
      women: ['yes', 'Bill gives Sarah what Mrs Wilson gave his mother: someone willing to take her in.'],
      hope: ['yes', 'Bill acts on hope instead of fear, and Sarah has a way out.'],
      freedom: ['yes', 'Sarah leaves the coal shed with Bill: freedom, at last, for one girl.'],
      religion: ['yes', 'Instead of going to midnight Mass, Bill does the Christian thing, and decides against taking her to the priest\'s house.'],
      courage: ['yes', 'Bill finally breaks his silence, choosing his conscience over his family\'s security.'],
      money: ['thin', 'Kind of: he is risking his business, but the scene is about the choice, not money.'],
      education: ['thin', 'Kind of: his girls\' school places are what he\'s risking, but the scene is about his choice.'] } },
    'stlt-12': { who: 'Bill; Sarah; the people of the town', t: {
      power: ['yes', 'People look away or cut their talk short: the convent\'s hold on the town hasn\'t changed.'],
      hope: ['yes', 'Bill is afraid but happier than he has ever been, and the novella ends at his door, before we see the cost.'],
      courage: ['yes', 'Bill asks the question at the heart of the novella, and answers it by walking Sarah home.', 'Was there any point in being alive without helping one another?'],
      religion: ['yes', 'Bill wonders whether you can call yourself a Christian without ever being brave enough to go against what\'s there.'],
      women: ['thin', 'Kind of: Sarah is with him, but the scene is about Bill\'s choice and the town\'s reaction.'],
      freedom: ['thin', 'Kind of: Sarah is out, but the ending is about Bill\'s courage and its cost.'] } }
  }
};
// The giveaways (the user: "in teh descriptions of the scenes pt highlights on important parts like "better off
// parents" kind of highlight the giveaways"): words in each scene's own description (its `tell` in eng-data.js, found
// as written, any case) and the themes they point to. Highlighted as clues; the theme is named once you've checked.
window.EngThemes.hl = {
  'shawshank-1': [['Two life sentences', 'freedom'], ['The jury doesn\'t believe him', 'hope']],
  'shawshank-2': [['Rejected', 'hope'], ['telling the parole board he\'s a changed man', 'freedom']],
  'shawshank-3': [['discipline and the Bible', 'religion'], ['breaks down in tears', 'hope'], ['Captain Hadley beats him, and he dies in the infirmary', 'power'], ['what was the dead man\'s name?', 'courage']],
  'shawshank-4': [['tax on an inheritance', 'money'], ['So he offers advice', 'education'], ['Hadley nearly throws him off the roof', 'power'], ['three beers each for his workmates', 'courage'], ['they feel like free men', 'freedom hope']],
  'shawshank-5': [['after fifty years', 'power'], ['\'institutionalized\'', 'power'], ['the world has moved on without him', 'freedom'], ['hangs himself', 'hope']],
  'shawshank-6': [['books and records for the library', 'education'], ['plays Mozart over the loudspeakers', 'courage'], ['two weeks in solitary', 'power'], ['something inside that they can\'t take from you', 'freedom'], ['Hope, he warns, is a dangerous thing', 'hope']],
  'shawshank-7': [['helping to study', 'education'], ['Someone else did it', 'freedom hope'], ['too useful to Warden Norton', 'power'], ['hide his illegal money', 'money'], ['has Hadley shoot Tommy dead', 'power']],
  'shawshank-8': [['a little hotel in Zihuatanejo, Mexico', 'freedom'], ['fears the worst', 'hope']],
  'shawshank-9': [['Behind it: a tunnel', 'power'], ['Less than twenty years', 'hope'], ['arms raised in the rain, free', 'freedom']],
  'shawshank-10': [['the person Andy invented', 'education'], ['empties the accounts', 'money'], ['Hadley is arrested', 'power'], ['Andy\'s Bible', 'religion']],
  'shawshank-11': [['he doesn\'t care what they decide', 'hope'], ['Released', 'freedom'], ['He asks permission to go to the toilet', 'power'], ['breaking parole, just to be sent back', 'freedom']],
  'shawshank-12': [['Red keeps his promise', 'courage'], ['a letter inviting him to Mexico', 'hope'], ['breaks parole', 'freedom courage'], ['the blue Pacific', 'freedom']],
  'sive-1': [['Not much money', 'money'], ['hides her pipe', 'power'], ['mocks Mena for being poor and childless', 'women'], ['still at her books when she could be earning', 'education']],
  'sive-2': [['in secret', 'power'], ['wants to marry Sive', 'women'], ['He\'ll pay £200', 'money']],
  'sive-3': [['he orders him away', 'power'], ['what happened to her mother', 'women']],
  'sive-4': [['he grabs at her', 'power women'], ['People like them can\'t afford it', 'money'], ['money decides who gets to love', 'money']],
  'sive-5': [['give them nothing', 'money'], ['mocking songs', 'courage'], ['she challenges them', 'courage'], ['keep quiet, or it\'s the county home', 'power']],
  'sive-6': [['everything Seán Dóta can give you', 'money'], ['the truth about her birth', 'power women freedom'], ['she\'ll leave school', 'education'], ['pushed her into her own marriage', 'women money']],
  'sive-7': [['comes to beg', 'courage'], ['Mike and Mena send him off', 'power'], ['Mena lies to Sive', 'power hope'], ['He\'s gone for good', 'hope']],
  'sive-8': [['see the priest about the wedding', 'religion'], ['Mike says it\'s for the best', 'power'], ['he can\'t look his mother in the face', 'courage']],
  'sive-9': [['a letter from Liam', 'hope'], ['Sive should slip out tonight', 'freedom'], ['then burns it', 'power'], ['Mike, uneasy, does nothing', 'courage'], ['One small silence', 'courage']],
  'sive-10': [['clothes bought with Seán Dóta\'s money', 'money women'], ['The men drink', 'women'], ['they haven\'t come to celebrate', 'courage'], ['men of money like Seán will be the new lords of the land', 'power money']],
  'sive-11': [['Sive has drowned in a bog hole', 'women hope freedom'], ['slip away', 'power'], ['Liam turns on Mena', 'courage']],
  'sive-12': [['buried in holy ground', 'religion'], ['No one is punished. No one is saved.', 'hope']],
  'stlt-1': [['sixteen, unmarried', 'women'], ['a Protestant widow', 'religion'], ['Her own family wanted nothing more to do with her', 'women'], ['Mrs Wilson kept her on', 'courage']],
  'stlt-2': [['Businesses closing. People emigrating.', 'money'], ['keep his head down', 'courage'], ['see his girls through St Margaret\'s', 'education']],
  'stlt-3': [['The nuns speak only to the better-off parents', 'money religion']],
  'stlt-4': [['a small chapel', 'religion'], ['girls in grey shifts and no shoes', 'power women'], ['take her as far as the river', 'hope'], ['He says nothing to the nun', 'courage'], ['the padlocks, and the high wall topped with broken glass', 'freedom power']],
  'stlt-5': [['wherever he wants to go', 'freedom']],
  'stlt-6': [['it\'s nothing to do with us', 'courage'], ['The nuns pay their bills', 'power'], ['our girls are well minded', 'women'], ['rich enough to do as she pleased', 'money']],
  'stlt-7': [['the convent\'s coal shed', 'religion'], ['locked in all night', 'freedom power'], ['Freezing. Filthy. Frightened.', 'power'], ['find out about her baby', 'hope courage'], ['taken from her', 'women']],
  'stlt-8': [['all smooth politeness', 'religion'], ['A game of hide and seek', 'power'], ['places at the school are scarce', 'education power'], ['a Christmas card, and money', 'money'], ['He leaves without asking about her baby', 'courage']],
  'stlt-9': [['Bill stays in his seat', 'religion'], ['the shame hits', 'courage']],
  'stlt-10': [['Be careful, she warns', 'power'], ['your girls are at St Margaret\'s', 'education'], ['do the nuns only have as much power as people give them?', 'courage religion power']],
  'stlt-11': [['get ready for midnight Mass', 'religion'], ['he walks on, to the convent', 'courage'], ['she\'s coming home with him', 'women hope freedom'], ['Not to the priest\'s house', 'religion'], ['barefoot, through the town', 'power']],
  'stlt-12': [['Some avoid him; some cut their talk short', 'power'], ['happier than he has ever felt', 'hope'], ['he\'ll pay for this', 'courage'], ['all the small things Mrs Wilson did', 'courage'], ['afraid, but hopeful', 'hope']]
};
