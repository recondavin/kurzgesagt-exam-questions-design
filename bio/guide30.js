// Chapter 30, the digestive system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2).
// Each concept: keys (words that mark a question as being about it), the diagram it shows (pic: a BioArt id and the
// anchors to ring), and three bullets [bold, on screen, what the narrator says]. questions: concept for a question
// when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[30] = {
  concepts: [
    { id: 'tube', title: 'The gut: one long tube', summary: 'From mouth to anus, with glands along the way.',
      say: 'Your gut is really one long tube running right through you, about nine metres of it.',
      keys: ['oesophag', 'alimentary canal', 'digestive system', 'rectum', 'appendix', 'caecum', 'colon', 'small intestine', 'large intestine', 'duodenum', 'ileum', 'anus', 'tube a', 'organ b', 'gland c'],
      pic: { base: 'digestive', hi: ['oesophagus', 'stomach', 'ileum', 'colon'] },
      bullets: [
        ['The tube', 'mouth, oesophagus, stomach.', 'Food goes in at the mouth, down the oesophagus and into the stomach, a stretchy bag that churns it.'],
        ['Small, then large', 'the intestines.', 'Next comes the small intestine: first the duodenum, then the long, coiled ileum. The large intestine, the colon, frames it, and ends at the rectum and anus.'],
        ['The glands', 'salivary glands, liver, pancreas.', 'Along the way, glands pour in their juices: the salivary glands in the mouth, and the liver and pancreas into the duodenum.']] },
    { id: 'why', title: 'Why we digest food', summary: 'Big molecules in, small soluble ones out.',
      say: 'The food on your plate is made of molecules far too big to get into your blood.',
      keys: ['meant by the term digestion', 'digestion necessary', 'digestion is necessary', 'soluble', 'mechanical', 'chemical', 'tongue', 'breakdown of food', 'breaking down food', 'ingest'],
      pic: { base: 'digestive', hi: ['mouth', 'stomach', 'ileum'] },
      bullets: [
        ['Digestion', 'breaking food down.', 'Digestion is the breakdown of food into small, soluble molecules, small enough to pass into the blood and be carried around the body.'],
        ['Mechanical', 'teeth, churning, bile.', 'Mechanical digestion breaks food into smaller pieces without changing the molecules: chewing, the stomach churning, and bile breaking up fat.'],
        ['Chemical', 'enzymes change the molecules.', 'Chemical digestion is done by enzymes, which break the big molecules themselves into smaller ones, like starch into maltose.']] },
    { id: 'teeth', title: 'Teeth: the first tools', summary: 'Cut, tear, then grind.',
      say: 'Digestion starts with a set of tools you carry around in your mouth.',
      keys: ['teeth', 'tooth', 'dental', 'incisor', 'canine', 'molar', 'carnivor', 'meat'],
      pic: { base: 'teeth', hi: ['incisors', 'canine', 'premolars', 'molars'] },
      bullets: [
        ['Four kinds', 'incisors, canines, premolars, molars.', 'On each side of each jaw, an adult has two incisors, one canine, two premolars and three molars. That\'s the dental formula, and 32 teeth in all.'],
        ['Jobs', 'cut, tear, grind.', 'Incisors cut, canines tear, and premolars and molars grind and crush, giving the enzymes a bigger surface to work on.'],
        ['Meat eaters', 'long, pointed canines.', 'A meat-eating animal has much longer, sharper canines than we do, for gripping and tearing flesh.']] },
    { id: 'enzymes', title: 'The digestive enzymes', summary: 'Each one has its own food, place and pH.',
      say: 'Enzymes are the real workers of digestion, and each one is picky.',
      keys: ['amylase', 'protease', 'pepsin', 'lipase', 'maltose', 'peptide', 'amino acid', 'glycerol', 'fatty acid', 'optimum', 'enzyme', ' ph', 'starch', 'carbohydrate-digesting', 'protein molecule'],
      pic: { base: 'digestive', hi: ['salivary', 'stomach', 'pancreas', 'duodenum'] },
      bullets: [
        ['Amylase', 'starch to maltose, pH 7.', 'Amylase from the salivary glands and the pancreas breaks starch into maltose. It works best at about pH 7, in the mouth and the duodenum.'],
        ['Protease', 'protein to peptides, pH 2.', 'Pepsin, a protease made in the stomach, breaks proteins into peptides, and later amino acids. It works best in the stomach\'s acid, at about pH 2.'],
        ['Lipase', 'fat to fatty acids and glycerol.', 'Lipase from the pancreas breaks fats into fatty acids and glycerol, in the slightly alkaline duodenum, at about pH 8.']] },
    { id: 'acid', title: 'The stomach: an acid bath', summary: 'Churning, acid and pepsin.',
      say: 'Your stomach is one of the most acidic places in your body.',
      keys: ['hydrochloric', 'gastric', 'acid produced', 'low ph', 'kills', 'germs', 'ulcer', 'helicobacter', 'ph of the stomach', 'churn'],
      pic: { base: 'duodenum', hi: ['stomach', 'pylorus'] },
      bullets: [
        ['Hydrochloric acid', 'about pH 2.', 'The stomach wall makes hydrochloric acid, which keeps the pH at about 2.'],
        ['Kills bacteria', 'and suits pepsin.', 'The acid kills most of the bacteria in your food, and it\'s just right for pepsin, the stomach\'s protein-digesting enzyme.'],
        ['Churning', 'muscles mix it all.', 'Strong muscles in the stomach wall churn the food with the juice into a thick liquid, before it moves on to the duodenum.']] },
    { id: 'bile', title: 'Bile: breaking up fat', summary: 'Made in the liver, stored in the gall bladder.',
      say: 'Fat doesn\'t mix with water, so your body has a clever trick for it.',
      keys: ['bile', 'emulsif', 'gall', 'lipid', 'neutralis', 'hydrogencarbonate', 'fat digestion', 'fats'],
      pic: { base: 'duodenum', hi: ['liver', 'gallBladder', 'bileDuct'] },
      bullets: [
        ['Made and stored', 'liver, then gall bladder.', 'Bile is made in the liver and stored in the gall bladder, which squeezes it down the bile duct into the duodenum.'],
        ['Emulsifies', 'big drops into tiny droplets.', 'Bile salts emulsify fat: they break big globules into tiny droplets, giving lipase a much bigger surface area to work on.'],
        ['Neutralises', 'the stomach acid.', 'Bile is alkaline too, so it neutralises the acid coming from the stomach, giving the enzymes in the duodenum their best pH.']] },
    { id: 'pancreas', title: 'The pancreas: a gland with two jobs', summary: 'Enzymes for the gut, hormones for the blood.',
      say: 'The pancreas is a quiet organ tucked behind the stomach, but it does two very different jobs.',
      keys: ['pancrea', 'dual', 'exocrine', 'endocrine', 'insulin', 'hormone', 'glands that pass'],
      pic: { base: 'duodenum', hi: ['pancreas', 'pancreaticDuct'] },
      bullets: [
        ['Pancreatic juice', 'amylase, protease, lipase.', 'It makes pancreatic juice, full of enzymes: amylase, a protease and lipase. Its duct carries the juice into the duodenum.'],
        ['Alkaline', 'neutralises the acid.', 'The juice is alkaline, so like bile it helps neutralise the acid from the stomach.'],
        ['Hormones too', 'insulin, into the blood.', 'It also makes the hormone insulin, straight into the blood. Enzymes through a duct and hormones into the blood: that\'s why it\'s called a dual-function gland.']] },
    { id: 'villus', title: 'Villi: absorbing digested food', summary: 'A huge surface, packed with vessels.',
      say: 'Once food is digested, it has to get from your gut into your blood. That happens in the villi.',
      keys: ['villus', 'villi', 'lacteal', 'microvill', 'absorb', 'absorption', 'surface area', 'diffusion', 'one cell thick', 'blood supply'],
      pic: { base: 'villus', hi: ['villus', 'lacteal', 'capillaries', 'microvilli'] },
      bullets: [
        ['Huge surface', 'villi and microvilli.', 'The ileum is lined with millions of tiny finger-like villi, and their cells are covered in microvilli. Together they give a huge surface area for absorbing food.'],
        ['Thin and rich', 'one cell thick, many capillaries.', 'Each villus has a wall just one cell thick and a rich network of blood capillaries. Glucose and amino acids pass into them by diffusion and active transport.'],
        ['Lacteal', 'for the fats.', 'Up the middle runs a lacteal, a lymph vessel, which takes in the fatty acids and glycerol.']] },
    { id: 'liver', title: 'The liver and the hepatic portal vein', summary: 'Digested food goes to the liver first.',
      say: 'Everything you absorb from your gut makes a stop at the liver before it goes anywhere else.',
      keys: ['hepatic', 'portal', 'liver', 'glycogen', 'deamin', 'urea', 'detox', 'capillaries at both ends', 'highest in nutrients'],
      pic: { base: 'liver', hi: ['portal', 'liver', 'hepaticArtery', 'hepaticVein'] },
      bullets: [
        ['Hepatic portal vein', 'from the gut to the liver.', 'Blood rich in digested food leaves the intestine in the hepatic portal vein, which goes straight to the liver. It\'s a vein with capillaries at both ends.'],
        ['Storing and sorting', 'glycogen and urea.', 'The liver stores spare glucose as glycogen, and breaks down spare amino acids, deamination, which makes urea.'],
        ['Other jobs', 'bile, poisons, heat.', 'It also makes bile, breaks down poisons like alcohol, stores vitamins and iron, and makes heat. Oxygen comes in by the hepatic artery, and blood leaves by the hepatic vein.']] },
    { id: 'large', title: 'The large intestine and its bacteria', summary: 'Water out, faeces formed, helpful bacteria.',
      say: 'By the time food reaches the large intestine, almost everything useful has been taken out. Almost.',
      keys: ['symbiotic', 'bacteria', 'vitamin', 'egestion', 'egest', 'faeces', 'water absorbed', 'most water', 'large intestine', 'colon', 'beneficial'],
      pic: { base: 'digestive', hi: ['colon', 'caecum', 'rectum', 'anus'] },
      bullets: [
        ['Water back', 'absorbed in the colon.', 'The colon absorbs most of the remaining water back into the blood, turning what\'s left into faeces.'],
        ['Helpful bacteria', 'vitamins B and K.', 'Billions of symbiotic bacteria live here. They make vitamins like B and K, help digest some food, and crowd out harmful microbes.'],
        ['Egestion', 'out through the anus.', 'Faeces are stored in the rectum and leave through the anus. That\'s egestion: getting rid of food that was never digested.']] },
    { id: 'move', title: 'Peristalsis and fibre', summary: 'Waves of muscle push food along.',
      say: 'Food doesn\'t just fall through your gut. It\'s pushed, every step of the way.',
      keys: ['peristalsis', 'muscular contraction', 'muscle', 'fibre', 'wholegrain', 'constipation', 'food is passed', 'food is moved', 'travels through'],
      pic: { base: 'villus', hi: ['muscle'] },
      bullets: [
        ['Peristalsis', 'waves of muscle.', 'Rings of muscle in the gut wall contract behind the food and relax in front of it. These waves, called peristalsis, push the food along, even if you\'re upside down.'],
        ['Fibre', 'bulk to push against.', 'We can\'t digest fibre, but it adds bulk and soaks up water, so the muscles have something to push against.'],
        ['No constipation', 'food moves faster.', 'That keeps food moving faster through the gut, which is why wholegrain foods help to prevent constipation.']] },
    { id: 'diet', title: 'A balanced diet', summary: 'The right amounts of everything.',
      say: 'What you eat shapes your health in ways you can\'t always see.',
      keys: ['diet', 'balanced', 'heterotroph', 'omnivor', 'obes', 'cholesterol', 'circulatory'],
      pic: { base: 'digestive', hi: ['mouth', 'stomach'] },
      bullets: [
        ['Balanced', 'the right amounts of each food.', 'A balanced diet has the correct amounts of each type of food, plus fibre and enough water. What\'s right depends on your age, your size and how active you are.'],
        ['Too much', 'fat, sugar and salt.', 'Too much saturated fat and salt can block arteries and raise blood pressure. Too much sugar can lead to obesity and type 2 diabetes.'],
        ['Heterotrophs', 'we have to eat.', 'We\'re heterotrophs: we can\'t make our own food, so we eat other organisms. As omnivores, we eat both plants and animals.']] }
  ],
  questions: {
    'S1-Q1a': 'bile',       // the liver's role in digestion: making bile
    '2022-Q6': 'bile',      // lipase with and without bile salts
    '2012-Q15a': 'villus',  // a section through the small intestine, villi first
    '2012-Q15c': 'liver'    // the liver in homeostasis
  }
};
// For each exam question, the concept each part is about (null: none fits), chosen by reading every part and its
// marking scheme. The guide teaches a concept on the first part that needs it (bio/guide.js).
window.BioGuide.chapters[30].parts = {"S1-Q1a":["tube","bile"],"S1-Q6c":["acid","acid"],"S2-Q7c":["tube"],"2026-Q17a":["diet"],"2026-Q7c":["bile"],"2025-Q17a":["liver"],"2025-Q6":["tube","move","acid","enzymes","villus"],"2024-Q17a":["enzymes","enzymes","enzymes","enzymes"],"2024-Q3":["tube","tube","bile","pancreas","villus","large"],"2023-Q17c":["liver"],"2022-Q6":["bile","enzymes","enzymes","enzymes","bile","villus"],"2021-Q14a":["why","why","large"],"2021-Q14b":["villus","villus","villus","liver","liver","liver","move"],"2020-Q13b":["liver","liver"],"2019-Q15b":["why","why","move","enzymes","enzymes","enzymes","enzymes","liver"],"2018-Q12b":["liver","liver"],"2018-Q15b":["bile"],"2017-Q14c":["villus"],"2016-Q12a":["large"],"2016-Q15a":["liver"],"2016-Q15c":["move"],"2015-Q11a":["diet","diet"],"2015-Q11b":["tube","enzymes","enzymes","enzymes"],"2015-Q11c":["teeth","teeth","teeth","large","large"],"2014-Q2a":["enzymes"],"2013-Q10a":["pancreas"],"2012-Q15a":["villus","move","enzymes","tube","large","large","large"],"2012-Q15c":["liver"],"2011-Q5":["why","why","why","tube","bile","tube","pancreas"],"2010-Q15b":["liver","liver","liver",null,"bile","bile","liver"],"2010-Q15c":["move"],"2009-Q13b":["diet"],"2008-Q12a":["why","why"],"2008-Q12b":["tube","bile","pancreas","enzymes","enzymes"],"2008-Q12c":["large","large","villus","large","villus","villus"],"2006-Q1f":["enzymes"],"2006-Q3":["enzymes","enzymes","enzymes","enzymes","enzymes"],"2006-Q5":["liver","liver",null,"bile"],"2005-Q6":["villus","villus","villus","villus"],"2004-Q6":["move","acid","move","enzymes","enzymes","bile","large"]};
