import React from 'react';
import { PageSubTitle, Paragraph, BlockQuote, Anchor, CustomDivider } from 'template/pageTypography';
import Link from '@mui/material/Link';
import Video from 'components/video';

const FinningContent = () => (
<React.Fragment>
    <Anchor index={0} />
    <PageSubTitle>A devastating practice</PageSubTitle>
    <Paragraph>This is a practice which consists of cutting off all the fins of a shark and then throwing it back into the sea, most of the time still alive.</Paragraph>
    <Paragraph>Unlike bony fish, the shark does not have a swim bladder and has slightly negative buoyancy that it cannot adjust (for most species). It is therefore impossible for him to maintain a stable level of immersion without swimming.</Paragraph>
    <Paragraph>Deprived of its fins and therefore no longer able to swim, it will irremediably sink to die slowly at the bottom and die of suffocation - most sharks absolutely must be moving to allow water to enter their gills - or of starvation, if it is not eaten alive by other fish...</Paragraph>
    <Paragraph>This practice is particularly profitable since shark meat is much less valuable than its fins. Under these conditions, it is better to fill your boat with 3 tons of fins than 3 tons of carcasses...</Paragraph>

    <Anchor index={1} />
    <PageSubTitle>Indiscriminate fishing</PageSubTitle>
    <Paragraph>Beyond this wild practice, sharks are fished without any discernment, ie whatever their age, size or species.</Paragraph>
    <Paragraph>They are indeed animals with slow growth and late sexual maturity. As we are talking about several years here (12 to 14 years for the white shark!), there is a good chance that the young individuals will be slaughtered before having reproduced. To make matters worse, the gestation period is also quite long, from 7 months to 2 years, and the number of individuals per litter very limited for most species.</Paragraph>
    <Paragraph>For these reasons, the fishing techniques used today on shark populations as well as their large-scale commercial exploitation can only lead this animal to extinction...</Paragraph>
    <Paragraph>Experts estimate that around 100 million sharks are massacred each year by increasingly efficient fishing techniques, against which countries wishing to protect them often cannot do much, due to a lack of sufficient resources.</Paragraph>

    <Anchor index={2} />
    <PageSubTitle>The balance of the oceans threatened</PageSubTitle>
    <Paragraph>Beyond the disappearance of sharks, the very health of our oceans is at stake as well as our own survival.</Paragraph>
    <Paragraph>Indeed, the shark is placed at the very top of the food chain - some more than others - and will on the one hand clean the oceans by feeding on the carcasses of dead or sick animals, and on the other hand regulate the population of other species.</Paragraph>
    <Paragraph>In some regions, we have already been able to observe a spectacular increase in the population of rays, generally on the menu of sharks, which in turn leads to an equally spectacular decrease in other species on the menu of rays - such as certain shellfish - and sometimes necessary healthy coral reefs or on which an entire local economy may depend.</Paragraph>
    <Paragraph>Another example: Turtles are quite often on the sharks' menu, but true to their reputation as "sea scavengers", the latter make do with injured or sick turtles. And so, no sharks mean more sick turtles. I'll let you imagine what happens next...</Paragraph>
    <Paragraph>And so, some turtle populations have been decimated due to the spread of disease.v</Paragraph>

    <Anchor index={3} />
    <PageSubTitle>A traditional dish now accessible to moore and moore people</PageSubTitle>
    <Paragraph>The shark fins are intended exclusively for the Asian market - of which Hong Kong is the hub - and will be sold dried individually or in the form of soups. At nearly $100 a bowl, it remains a relatively expensive dish, proof of social success - for example often served during wedding ceremonies - and whose demand is increasingly strong due to the growing number of Chinese families who access to the middle class.</Paragraph>
    <Paragraph>Indeed, this soup has been consumed in a traditional way for centuries, but now, from a few million consumers in the 80s, we have now grown to more than 300 million...</Paragraph>

    <Anchor index={4} />
    <PageSubTitle>Sharks, Elephants, Rhinos, the list goes on</PageSubTitle>
    <Paragraph>What if there were only sharks... but did you know that other large animals are in real danger of extinction and are the target of a real organized massacre?</Paragraph>
    <Paragraph>The elephants are exterminated with weapons of war by whole herds for their ivory, the rhinos for the alleged virtues of their horn - when it is in fact keratin, that is to say hair - tigers among others for their bones, and so on...</Paragraph>
    <Paragraph>The sad record for rhinoceroses killed in one year was broken again in 2014 to reach the staggering number of 1,215 (1,004 in 2013), with no less than 827 animals killed in the Kruger Park alone, which was forced to move them in an attempt to protect...</Paragraph>
    <Paragraph>In 2013, it was quite simply the last 15 rhinos in Limpopo Park in Mozambique that were exterminated by poachers, helped by gamekeepers from the same park (see this <Link href="https://www.maxisciences.com/rhinoceros/les-derniers-rhinoceros-du-parc-limpopo-du-mozambique-tues-par-leurs-propres-gardes_art29388.html" target="_blank">article</Link>).</Paragraph>
    <Paragraph>In any case, given the market value of fins, ivory and the rest, real mafias have been set up and will stop at nothing to fuel the exponential demand from Asian consumers and collectors.</Paragraph>
    <Paragraph>In this article entitled <Link href="https://www.lemonde.fr/idees/article/2013/07/02/il-est-urgent-de-proteger-les-elephants-de-foret_3440674_3232.html#xtor=AL-32280515" target="_blank">It is urgent to protect elephants</Link>, Nicolas Hulot quotes a passage from Romain Gary's Letter to the Elephant:</Paragraph>
    <BlockQuote>If the world can no longer afford the luxury of natural beauty, then it will soon be overcome and destroyed by its own ugliness.</BlockQuote>

    <Anchor index={5} />
    <PageSubTitle sx={{mb: 3}}>Some videos...</PageSubTitle>
    <Video src="https://www.youtube.com/embed/C2UKgLsOhRM" />

    <CustomDivider />
    <Paragraph>Here is a second video that I invite you to watch in its entirety - 7'35'' - and which shows how devastating finning can be for shark populations. Pregnant females are massacred, as well as very young individuals who have certainly not yet had the opportunity to reproduce.</Paragraph>
    <Paragraph>Be careful, the images are sometimes quite hard to look at...</Paragraph>
    <Video
        src="https://player.vimeo.com/video/9856912?h=af18379c73"
        legend={<Paragraph><Link href="https://vimeo.com/9856912" target="_blank">人鯊誌</Link> from <Link href="https://vimeo.com/alexhofford" target="_blank">alexhofford</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
    />

    <CustomDivider />
    <Paragraph>Here is another video by Alex Hofford on the Japanese capital of shark fin.</Paragraph>
    <Paragraph>But above all, go read his comment on Vimeo...</Paragraph>
    <Video
        src="https://player.vimeo.com/video/13416490?h=ac831148d0"
        legend={<Paragraph><Link href="https://vimeo.com/13416490" target="_blank">Japan&#039;s Shark Fin Capital</Link> from <Link href="https://vimeo.com/alexhofford" target="_blank">alexhofford</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
    />

    <CustomDivider />
    <Paragraph>Here is another video called <Link href="https://saveourseas.com/" target="_blank">Save Our Sharks</Link>, produced by the Save Our Seas foundation and awarded a "Panda Award" in the category of best environmental campaign at the festival <Link href="https://www.wildscreenfestival.org/" target="_blank">WildScreen 2010</Link>:</Paragraph>
    <Video
        src="https://player.vimeo.com/video/6910594?h=c9cf57aaaa&title=0&byline=0&portrait=0"
        legend={<Paragraph><Link href="https://vimeo.com/6910594" target="_blank">Save Our Sharks</Link> from <Link href="https://vimeo.com/saveourseascom" target="_blank">Save Our Seas Foundation</Link> on <Link href="https://vimeo.com" target="_blank">Vimeo</Link>.</Paragraph>}
    />

    <CustomDivider />
    <Paragraph>A report by Gordon Ramsay, starred British chef, on the reality of Finning, from Taiwan to Costa Rica...</Paragraph>
    <Paragraph>It was also in Puntarenas that he was doused with gasoline and held at gunpoint while he was filming illegal finning activities in 2011...</Paragraph>
    <Video src="https://www.youtube.com/embed/r65FgUYdBOc" />

</React.Fragment>
)

export default FinningContent;