// Four contrast items and a typed retrieval item for each rule family.
const BANKS = {
  mo: ['After mo/do, lenite a consonant; mo becomes m’ before a vowel.', [['mo mháthair','mo máthair'],['do theaghlach','do teaghlach'],["m’athair",'mo athair'],['mo dheartháir','mo deartháir']]],
  numbers: ['Use the singular noun. Dhá and three to six lenite; seven to ten eclipse.', [['dhá dheartháir','dó deartháir'],['trí dheirfiúr','trí deirfiúracha'],['seacht n-ábhar','seacht ábhair'],['ocht nduine','ocht duine']]],
  in: ['I eclipses consonants; in precedes vowels; standard sa usually lenites.', [['i nGaillimh','i Gaillimh'],['in Éirinn','i Éirinn'],['sa bhaile','sa baile'],['i gCorcaigh','i Corcaigh']]],
  ar: ['After ar an, use eclipsis in the standard form; dialect lenition is also accepted.', [['ar an gcéad lá','ar an céad lá'],['ar an gcúigiú lá','ar an cúigiú lá'],['ar an gceathrú lá','ar an ceathrú lá'],['ar an ochtú lá','ar an t-ochtú lá']]],
  de: ['De lenites: de mhí. Before a vowel, use d’.', [['de mhí Iúil','de mí Iúil'],['de Mhárta','de Márta'],['de mhí Lúnasa','de mí Lúnasa'],["d’Aibreán",'de Aibreán']]],
  an: ['An- lenites, except before d, t and s.', [['an-mhaith','an-maith'],['an-chairdiúil','an-cairdiúil'],['an-ghreannmhar','an-greannmhar'],['an-deas','an-dheas']]],
  appearance: ['Gruaig is feminine singular; súile is plural. Match their adjectives.', [['gruaig dhonn','gruaig donn'],['gruaig fhionn','gruaig fionn'],['súile gorma','súile gorm'],['súile donna','súile donn']]],
  jobs: ['Use Is with a job and é/í for the person. Mar lenites a lenitable job name. Ina meaning in her adds h before a vowel.', [["Is múinteoir é m’athair", "Tá múinteoir é m’athair"],['Is altra í mo mháthair','Is altra é mo mháthair'],['mar mhúinteoir','mar múinteoir'],['Tá mo mháthair ina haltra','Tá mo mháthair ina altra']]],
  oldest: ['Use is sine/is óige for oldest/youngest; níos sine/níos óige means older/younger.', [['an duine is sine','an duine is sean'],['an duine is óige','an duine is óg'],['níos sine ná mé','níos sean ná mé'],['níos óige ná mé','níos óg ná mé']]],
  maith: ['Go maith means well. Before an- use go han-.', [['go maith','go mhaith'],['go han-mhaith','go an-mhaith'],['go han-deas','go an-deas'],['go hiontach','go iontach']]],
  liom: ['For I like/I would like, use liom: the combined form of le and mé.', [['Is maith liom peil','Is maith mé peil'],['Ba mhaith liom tae','Ba mhaith mé tae'],['Is breá liom ceol','Is breá le mé ceol'],['Taitníonn sé liom','Taitníonn sé le mé']]],
  leis: ['Before an or na, le becomes leis.', [['leis an múinteoir','le an múinteoir'],['leis na daltaí','le na daltaí'],['leis an scoil','le an scoil'],['leis na daoine','le na daoine']]],
};
export const DRILLS = Object.fromEntries(Object.entries(BANKS).map(([group, [reason, pairs]]) => [group, { group, reason, items: pairs.map(([right, wrong]) => ({ right, wrong, reason })), typed: pairs[0][0] }]));
export function ruleGroup(rule = '') {
  if (/^(mo-|do-lenition)/.test(rule)) return 'mo';
  if (/^(do-noun|dha-|num-|age-)/.test(rule)) return 'numbers';
  if (/^(i-|in-|sa-|san-)/.test(rule)) return 'in';
  if (/^ar-/.test(rule)) return 'ar';
  if (/^de-/.test(rule)) return 'de';
  if (/^an-/.test(rule)) return 'an';
  if (/hair|eyes|gruaig|suile/.test(rule)) return 'appearance';
  if (/job|ina-|mar-|copula|is-gender/.test(rule)) return 'jobs';
  if (/sine|oige|compar|superl/.test(rule)) return 'oldest';
  if (/maith|go-/.test(rule)) return 'maith';
  if (/liom/.test(rule)) return 'liom';
  if (/leis/.test(rule)) return 'leis';
  return null;
}
